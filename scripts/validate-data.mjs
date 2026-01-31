#!/usr/bin/env node
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
 * Run: node scripts/validate-data.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

function loadJson(filename) {
  const filePath = join(dataDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// Validation functions
function validateUniqueIds(categories, subcategories) {
  const errors = [];
  const allIds = new Set();

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

function validateParentReferences(categories, subcategories) {
  const errors = [];
  const categoryIds = new Set(categories.map(c => c.id));
  const subcategoryIds = new Set(subcategories.map(s => s.id));
  const allIds = new Set([...categoryIds, ...subcategoryIds]);

  for (const sub of subcategories) {
    if (!allIds.has(sub.parentCategoryId)) {
      errors.push(
        `Orphaned subcategory: "${sub.id}" references non-existent parent "${sub.parentCategoryId}"`
      );
    }
  }

  return errors;
}

function validateSubcategoryIds(categories, subcategories) {
  const errors = [];
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

function validateRelatedCategoryIds(categories, subcategories) {
  const errors = [];
  const categoryIds = new Set(categories.map(c => c.id));
  const subcategoryIds = new Set(subcategories.map(s => s.id));
  const allIds = new Set([...categoryIds, ...subcategoryIds]);

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

function detectCircularReferences(categories, subcategories) {
  const errors = [];
  const subcategoryMap = new Map(subcategories.map(s => [s.id, s]));
  const categoryIds = new Set(categories.map(c => c.id));

  for (const sub of subcategories) {
    const visited = new Set();
    let current = sub.id;

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

function validateAnchors(categories, subcategories, anchors) {
  const errors = [];
  const warnings = [];
  const allIds = [
    ...categories.map(c => c.id),
    ...subcategories.map(s => s.id)
  ];

  for (const id of allIds) {
    if (!anchors[id] || anchors[id].length === 0) {
      warnings.push(`Missing anchors: Entity "${id}" has no anchor synonyms defined`);
    } else if (anchors[id].length < 3) {
      warnings.push(
        `Insufficient anchors: Entity "${id}" has only ${anchors[id].length} anchor(s), recommend 3-5`
      );
    }
  }

  for (const anchorId of Object.keys(anchors)) {
    if (!allIds.includes(anchorId)) {
      warnings.push(`Orphaned anchor: "${anchorId}" defined in anchors.json but no entity exists`);
    }
  }

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

function validateUniqueSlugs(categories, subcategories) {
  const errors = [];

  // Check for duplicate slugs at category level
  const categorySlugs = new Map();
  for (const cat of categories) {
    if (categorySlugs.has(cat.slug)) {
      errors.push(
        `Duplicate slug: Categories "${cat.id}" and "${categorySlugs.get(cat.slug)}" both use slug "${cat.slug}"`
      );
    }
    categorySlugs.set(cat.slug, cat.id);
  }

  // Check for duplicate slugs within the same parent
  const slugsByParent = new Map();
  for (const sub of subcategories) {
    const parentKey = sub.parentCategoryId;
    if (!slugsByParent.has(parentKey)) {
      slugsByParent.set(parentKey, new Map());
    }

    const siblings = slugsByParent.get(parentKey);
    if (siblings.has(sub.slug)) {
      errors.push(
        `Duplicate slug: Subcategories "${sub.id}" and "${siblings.get(sub.slug)}" share parent "${parentKey}" and both use slug "${sub.slug}"`
      );
    }
    siblings.set(sub.slug, sub.id);
  }

  return errors;
}

function validateCitations(categories, subcategories) {
  const warnings = [];
  const citationPattern = /\[S\d+\]/;

  function getDescription(desc) {
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

/**
 * Validate minimum word count for content quality
 * Minimum 300 words recommended for SEO
 */
function validateWordCount(categories, subcategories) {
  const warnings = [];
  const MIN_WORDS = 300;

  function countWords(content) {
    if (!content) return 0;

    let totalWords = 0;

    // Content can be localized or not
    const sections = typeof content === 'object' && !Array.isArray(content)
      ? Object.values(content)
      : [content];

    for (const section of sections) {
      if (typeof section === 'object' && section !== null) {
        // Handle ContentSection (overview, keyBenefits, etc.)
        for (const items of Object.values(section)) {
          if (Array.isArray(items)) {
            for (const item of items) {
              if (typeof item === 'string') {
                totalWords += item.split(/\s+/).filter(Boolean).length;
              }
            }
          }
        }
      }
    }

    return totalWords;
  }

  for (const cat of categories) {
    const wordCount = countWords(cat.content);
    if (wordCount > 0 && wordCount < MIN_WORDS) {
      warnings.push(
        `Thin content: Category "${cat.id}" has only ${wordCount} words (minimum ${MIN_WORDS} recommended)`
      );
    }
  }

  for (const sub of subcategories) {
    const wordCount = countWords(sub.content);
    if (wordCount > 0 && wordCount < MIN_WORDS) {
      warnings.push(
        `Thin content: Subcategory "${sub.id}" has only ${wordCount} words (minimum ${MIN_WORDS} recommended)`
      );
    }
  }

  return warnings;
}

function validateImages(categories, subcategories, images) {
  const errors = [];
  const imageIds = new Set(images.map(i => i.id));

  function checkImageRef(entityId, imageId, field) {
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

function validateVideos(categories, subcategories, videos) {
  const errors = [];
  const videoIds = new Set(videos.map(v => v.id));

  function checkContentVideos(entityId, content) {
    if (!content) return;

    for (const [section, items] of Object.entries(content)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (typeof item === 'object' && item !== null && item.type === 'video') {
            if (item.videoId && !videoIds.has(item.videoId)) {
              errors.push(
                `Invalid video reference: "${entityId}" content.${section} references non-existent video "${item.videoId}"`
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
function validate() {
  console.log('🔍 Validating data integrity...\n');

  const errors = [];
  const warnings = [];

  let categories, subcategories, anchors, images, videos;

  try {
    categories = loadJson('categories.json');
    subcategories = loadJson('subcategories.json');
    anchors = loadJson('anchors.json');
    images = loadJson('images.json');
    videos = loadJson('videos.json');
  } catch (e) {
    errors.push(`Failed to load data files: ${e.message}`);
    return { valid: false, errors, warnings };
  }

  console.log(`📊 Found ${categories.length} categories, ${subcategories.length} subcategories\n`);

  errors.push(...validateUniqueIds(categories, subcategories));
  errors.push(...validateUniqueSlugs(categories, subcategories));
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
  warnings.push(...validateWordCount(categories, subcategories));

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Run validation
const result = validate();

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
