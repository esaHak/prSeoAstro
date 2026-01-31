#!/usr/bin/env npx tsx
/**
 * Build-time Data Validation Script
 *
 * Validates the integrity of the JSON database before build:
 * - Checks for orphaned subcategories (missing parents)
 * - Validates all references exist (subcategoryIds, relatedCategoryIds)
 * - Detects circular parent references
 * - Ensures all entities have anchor synonyms
 * - Validates citation format in descriptions
 * - Checks for duplicate IDs
 *
 * Run: npx tsx scripts/validate-data.ts
 * Or add to package.json: "validate": "npx tsx scripts/validate-data.ts"
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface Category {
  id: string;
  slug: string;
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  subcategoryIds: string[];
  content?: Record<string, unknown>;
  ogImageId?: string;
  heroImageId?: string;
}

interface Subcategory {
  id: string;
  slug: string;
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  parentCategoryId: string;
  relatedCategoryIds: string[];
  content?: Record<string, unknown>;
  ogImageId?: string;
  heroImageId?: string;
}

interface ImageMeta {
  id: string;
  kind: string;
  src: string;
  alt: string;
}

interface VideoMeta {
  id: string;
  platform: string;
  videoId: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Load data files
const dataDir = path.join(__dirname, '../src/data');

function loadJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

// Validation functions
function validateUniqueIds(categories: Category[], subcategories: Subcategory[]): string[] {
  const errors: string[] = [];
  const allIds = new Set<string>();

  for (const cat of categories) {
    if (allIds.has(cat.id)) {
      errors.push(`Duplicate ID found: "${cat.id}" in categories`);
    }
    allIds.add(cat.id);
  }

  for (const sub of subcategories) {
    if (allIds.has(sub.id)) {
      errors.push(`Duplicate ID found: "${sub.id}" in subcategories`);
    }
    allIds.add(sub.id);
  }

  return errors;
}

function validateParentReferences(
  categories: Category[],
  subcategories: Subcategory[]
): string[] {
  const errors: string[] = [];
  const categoryIds = new Set(categories.map(c => c.id));
  const subcategoryIds = new Set(subcategories.map(s => s.id));
  const allIds = new Set(Array.from(categoryIds).concat(Array.from(subcategoryIds)));

  for (const sub of subcategories) {
    if (!allIds.has(sub.parentCategoryId)) {
      errors.push(
        `Orphaned subcategory: "${sub.id}" references non-existent parent "${sub.parentCategoryId}"`
      );
    }
  }

  return errors;
}

function validateSubcategoryIds(categories: Category[], subcategories: Subcategory[]): string[] {
  const errors: string[] = [];
  const subcategoryIds = new Set(subcategories.map(s => s.id));

  for (const cat of categories) {
    for (const subId of cat.subcategoryIds) {
      if (!subcategoryIds.has(subId)) {
        errors.push(
          `Category "${cat.id}" references non-existent subcategory "${subId}"`
        );
      }
    }
  }

  return errors;
}

function validateRelatedCategoryIds(
  categories: Category[],
  subcategories: Subcategory[]
): string[] {
  const errors: string[] = [];
  const categoryIds = new Set(categories.map(c => c.id));
  const subcategoryIds = new Set(subcategories.map(s => s.id));
  const allIds = new Set(Array.from(categoryIds).concat(Array.from(subcategoryIds)));

  for (const sub of subcategories) {
    for (const relatedId of sub.relatedCategoryIds) {
      if (!allIds.has(relatedId)) {
        errors.push(
          `Subcategory "${sub.id}" has invalid relatedCategoryId "${relatedId}"`
        );
      }
    }
  }

  return errors;
}

function detectCircularReferences(
  categories: Category[],
  subcategories: Subcategory[]
): string[] {
  const errors: string[] = [];
  const subcategoryMap = new Map(subcategories.map(s => [s.id, s]));
  const categoryIds = new Set(categories.map(c => c.id));

  for (const sub of subcategories) {
    const visited = new Set<string>();
    let current: string | undefined = sub.id;

    while (current) {
      if (visited.has(current)) {
        errors.push(
          `Circular reference detected: "${sub.id}" creates a cycle through "${current}"`
        );
        break;
      }
      visited.add(current);

      const entity = subcategoryMap.get(current);
      if (entity) {
        current = entity.parentCategoryId;
        // Stop if we hit a category (root)
        if (categoryIds.has(current)) {
          break;
        }
      } else {
        break;
      }
    }
  }

  return errors;
}

function validateAnchors(
  categories: Category[],
  subcategories: Subcategory[],
  anchors: Record<string, string[]>
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allIds = [
    ...categories.map(c => c.id),
    ...subcategories.map(s => s.id)
  ];

  // Check all entities have anchors
  for (const id of allIds) {
    if (!anchors[id] || anchors[id].length === 0) {
      warnings.push(`Missing anchors: Entity "${id}" has no anchor synonyms defined`);
    } else if (anchors[id].length < 3) {
      warnings.push(
        `Insufficient anchors: Entity "${id}" has only ${anchors[id].length} anchor(s), recommend 3-5`
      );
    }
  }

  // Check for orphaned anchors (defined but no entity exists)
  for (const anchorId of Object.keys(anchors)) {
    if (!allIds.includes(anchorId)) {
      warnings.push(`Orphaned anchor: "${anchorId}" defined in anchors.json but no entity exists`);
    }
  }

  // Validate anchor order (longest first)
  for (const [id, phrases] of Object.entries(anchors)) {
    if (phrases.length > 1) {
      const sorted = [...phrases].sort((a, b) => b.length - a.length);
      if (JSON.stringify(phrases) !== JSON.stringify(sorted)) {
        warnings.push(
          `Anchor order: "${id}" anchors should be sorted longest-first for priority matching`
        );
      }
    }
  }

  return { errors, warnings };
}

function validateCitations(
  categories: Category[],
  subcategories: Subcategory[]
): string[] {
  const warnings: string[] = [];
  const citationPattern = /\[S\d+\]/;

  function getDescription(desc: string | Record<string, string>): string {
    if (typeof desc === 'string') return desc;
    return Object.values(desc)[0] || '';
  }

  for (const cat of categories) {
    const desc = getDescription(cat.description);
    if (desc.length > 50 && !citationPattern.test(desc)) {
      warnings.push(
        `Missing citation: Category "${cat.id}" description lacks citation markers [S1], [S2], etc.`
      );
    }
  }

  for (const sub of subcategories) {
    const desc = getDescription(sub.description);
    if (desc.length > 50 && !citationPattern.test(desc)) {
      warnings.push(
        `Missing citation: Subcategory "${sub.id}" description lacks citation markers [S1], [S2], etc.`
      );
    }
  }

  return warnings;
}

function validateImages(
  categories: Category[],
  subcategories: Subcategory[],
  images: ImageMeta[]
): string[] {
  const errors: string[] = [];
  const imageIds = new Set(images.map(i => i.id));

  function checkImageRef(entityId: string, imageId: string | undefined, field: string) {
    if (imageId && !imageIds.has(imageId)) {
      errors.push(
        `Invalid image reference: "${entityId}" references non-existent image "${imageId}" in ${field}`
      );
    }
  }

  for (const cat of categories) {
    checkImageRef(cat.id, cat.ogImageId, 'ogImageId');
    checkImageRef(cat.id, cat.heroImageId, 'heroImageId');
  }

  for (const sub of subcategories) {
    checkImageRef(sub.id, sub.ogImageId, 'ogImageId');
    checkImageRef(sub.id, sub.heroImageId, 'heroImageId');
  }

  return errors;
}

function validateVideos(
  categories: Category[],
  subcategories: Subcategory[],
  videos: VideoMeta[]
): string[] {
  const errors: string[] = [];
  const videoIds = new Set(videos.map(v => v.id));

  // Check video references in content blocks
  function checkContentVideos(entityId: string, content: Record<string, unknown> | undefined) {
    if (!content) return;

    for (const [section, items] of Object.entries(content)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (typeof item === 'object' && item !== null && 'type' in item && item.type === 'video') {
            const videoItem = item as { videoId?: string };
            if (videoItem.videoId && !videoIds.has(videoItem.videoId)) {
              errors.push(
                `Invalid video reference: "${entityId}" content.${section} references non-existent video "${videoItem.videoId}"`
              );
            }
          }
        }
      }
    }
  }

  for (const cat of categories) {
    checkContentVideos(cat.id, cat.content);
  }

  for (const sub of subcategories) {
    checkContentVideos(sub.id, sub.content);
  }

  return errors;
}

// Main validation runner
function validate(): ValidationResult {
  console.log('🔍 Validating data integrity...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Load all data
  let categories: Category[];
  let subcategories: Subcategory[];
  let anchors: Record<string, string[]>;
  let images: ImageMeta[];
  let videos: VideoMeta[];

  try {
    categories = loadJson<Category[]>('categories.json');
    subcategories = loadJson<Subcategory[]>('subcategories.json');
    anchors = loadJson<Record<string, string[]>>('anchors.json');
    images = loadJson<ImageMeta[]>('images.json');
    videos = loadJson<VideoMeta[]>('videos.json');
  } catch (e) {
    const error = e as Error;
    errors.push(`Failed to load data files: ${error.message}`);
    return { valid: false, errors, warnings };
  }

  console.log(`📊 Found ${categories.length} categories, ${subcategories.length} subcategories\n`);

  // Run all validations
  errors.push(...validateUniqueIds(categories, subcategories));
  errors.push(...validateParentReferences(categories, subcategories));
  errors.push(...validateSubcategoryIds(categories, subcategories));
  errors.push(...validateRelatedCategoryIds(categories, subcategories));
  errors.push(...detectCircularReferences(categories, subcategories));
  errors.push(...validateImages(categories, subcategories, images));
  errors.push(...validateVideos(categories, subcategories, videos));

  const anchorResults = validateAnchors(categories, subcategories, anchors);
  errors.push(...anchorResults.errors);
  warnings.push(...anchorResults.warnings);

  warnings.push(...validateCitations(categories, subcategories));

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Run validation
const result = validate();

// Output results
if (result.errors.length > 0) {
  console.log('❌ ERRORS (must fix before build):\n');
  for (const error of result.errors) {
    console.log(`   • ${error}`);
  }
  console.log('');
}

if (result.warnings.length > 0) {
  console.log('⚠️  WARNINGS (recommended fixes):\n');
  for (const warning of result.warnings) {
    console.log(`   • ${warning}`);
  }
  console.log('');
}

if (result.valid && result.warnings.length === 0) {
  console.log('✅ All validations passed!\n');
} else if (result.valid) {
  console.log(`✅ Validation passed with ${result.warnings.length} warning(s)\n`);
} else {
  console.log(`❌ Validation failed with ${result.errors.length} error(s)\n`);
  process.exit(1);
}
