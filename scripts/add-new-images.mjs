#!/usr/bin/env node
/**
 * Adds NEW images to images.json without modifying existing entries
 * Then updates subcategories that are missing ogImageId/heroImageId
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_JSON = './src/data/images.json';
const SUBCATEGORIES_JSON = './src/data/subcategories.json';
const PUBLIC_DIR = './public/images';

// Load existing data
const existingImages = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
const subcategories = JSON.parse(fs.readFileSync(SUBCATEGORIES_JSON, 'utf8'));

console.log(`Loaded ${existingImages.length} existing images\n`);

// Get existing image paths and IDs
const existingPaths = new Set(existingImages.map(i => i.src));
const existingIds = new Set(existingImages.map(i => i.id));

// Find all image files on disk
function walkDir(dir, files = []) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, files);
    } else if (/\.(webp|jpg|png)$/i.test(entry) && stat.size > 100) {
      files.push(fullPath);
    }
  }
  return files;
}

// Determine image kind from path
function getImageKind(filePath) {
  if (filePath.includes('/og/') || filePath.includes('-og.')) return 'og';
  if (filePath.includes('/hero/') || filePath.includes('/heroes/') || filePath.includes('-hero.')) return 'hero';
  return 'inline';
}

// Generate unique ID
function generateUniqueId(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  let id = basename;
  let counter = 1;
  while (existingIds.has(id)) {
    id = `${basename}-${counter}`;
    counter++;
  }
  existingIds.add(id);
  return id;
}

// Generate alt text
function generateAlt(basename, kind) {
  const words = basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (kind === 'og') return `${words} - Open Graph preview image`;
  if (kind === 'hero') return `${words} - Hero banner illustration`;
  return `${words} - Diagram`;
}

async function main() {
  console.log('Finding unregistered images on disk...\n');

  const allFiles = walkDir(PUBLIC_DIR);
  const unregisteredFiles = allFiles.filter(f => {
    const relPath = f.replace('./public', '');
    return !existingPaths.has(relPath);
  });

  console.log(`Found ${unregisteredFiles.length} unregistered images\n`);

  if (unregisteredFiles.length === 0) {
    console.log('All images are already registered!');
  } else {
    // Process new images
    const newImages = [];
    for (const filePath of unregisteredFiles) {
      try {
        const relPath = filePath.replace('./public', '');
        const kind = getImageKind(relPath);
        const basename = path.basename(filePath, path.extname(filePath));
        const id = generateUniqueId(filePath);

        const metadata = await sharp(filePath).metadata();

        newImages.push({
          id,
          kind,
          sourceType: 'self',
          src: relPath,
          width: metadata.width,
          height: metadata.height,
          alt: generateAlt(basename, kind)
        });
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }

    console.log(`Adding ${newImages.length} new images\n`);

    // Merge and save
    const allImages = [...existingImages, ...newImages];
    fs.writeFileSync(IMAGES_JSON, JSON.stringify(allImages, null, 2) + '\n');
    console.log(`Saved ${allImages.length} total images to images.json\n`);
  }

  // Now update subcategories that are missing ogImageId/heroImageId
  const images = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
  const imageById = new Map(images.map(i => [i.id, i]));

  // Manual mapping for subcategories without direct matches
  const manualMapping = {
    'informational': { og: 'informational-intent-og', hero: 'informational-intent-hero' },
    'navigational': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },
    'commercial': { og: 'commercial-investigation-og', hero: 'commercial-investigation-hero' },
    'index-noindex': { og: 'index-noindex-criteria-og', hero: 'index-noindex-criteria-hero' },
    'canonical': { og: 'canonicalization-og', hero: 'canonicalization-hero' },
    'pagination': { og: 'pagination-handling-og', hero: 'pagination-handling-hero' },
    'bloat-prevention': { og: 'index-bloat-prevention-og', hero: 'index-bloat-prevention-hero' },
    'structure-patterns': { og: 'url-structure-patterns-og', hero: 'url-structure-patterns-hero' },
    'hub-and-spoke': { og: 'hub-and-spoke-model-og', hero: 'hub-and-spoke-model-hero' },
    'pillar-pages': { og: 'pillar-page-design-og', hero: 'pillar-page-design-hero' },
    'cluster-pages': { og: 'cluster-page-design-og', hero: 'cluster-page-design-hero' },
    'json-ld': { og: 'json-ld-format-og', hero: 'json-ld-format-hero' },
    'sitemap': { og: 'sitemap-index-og', hero: 'sitemap-index-hero' },
    'core-web-vitals': { og: 'lcp-optimization-og', hero: 'lcp-optimization-hero' },
    'ssr-ssg-isr': { og: 'ssg-generation-og', hero: 'ssg-generation-hero' },
    'featured-snippets': { og: 'featured-snippet-targeting-og', hero: 'featured-snippet-targeting-hero' },
    'definition-core-principles': { og: 'foundational-concepts-og', hero: 'foundational-concepts-hero' },
    'database-design': { og: 'content-database-og', hero: 'content-database-hero' },
    'cms-integration': { og: 'wordpress-integration-og', hero: 'wordpress-integration-hero' },
    // More fallbacks for pages without specific images
    'intent-modifiers': { og: 'search-intent-analysis-og', hero: 'search-intent-analysis-hero' },
    'competitor-analysis': { og: 'serp-analysis-og', hero: 'serp-analysis-hero' },
    'service-area-pages': { og: 'city-region-pages-og', hero: 'city-region-pages-hero' },
    'local-directory-pages': { og: 'local-intent-og', hero: 'local-intent-hero' },
    'category-pages': { og: 'category-hub-og', hero: 'category-hub-hero' },
    'filter-attribute-pages': { og: 'template-design-og', hero: 'template-design-hero' },
    'comparison-pages': { og: 'comparison-og', hero: 'comparison-hero' },
    'tool-integration-pages': { og: 'integration-og', hero: 'integration-hero' },
    'api-documentation': { og: 'technical-implementation-og', hero: 'technical-implementation-hero' },
    'workflow-pages': { og: 'template-design-og', hero: 'template-design-hero' },
    'statistics-pages': { og: 'content-requirements-og', hero: 'content-requirements-hero' },
    'research-aggregation': { og: 'keyword-research-og', hero: 'keyword-research-hero' },
    'benchmark-pages': { og: 'monitoring-og', hero: 'monitoring-hero' },
    'glossary-pages': { og: 'content-requirements-og', hero: 'content-requirements-hero' },
    'how-to-pages': { og: 'template-design-og', hero: 'template-design-hero' },
    'faq-aggregation': { og: 'faq-og', hero: 'faq-hero' },
    'seed-keyword-brainstorming': { og: 'google-keyword-planner-og', hero: 'google-keyword-planner-hero' },
    'search-console-mining': { og: 'search-volume-og', hero: 'search-volume-hero' },
    'location-modifiers': { og: 'near-me-location-modifier-og', hero: 'near-me-location-modifier-hero' },
    'attribute-modifiers': { og: 'modifier-discovery-og', hero: 'modifier-discovery-hero' },
    'audience-modifiers': { og: 'for-audience-modifier-og', hero: 'for-audience-modifier-hero' },
    'temporal-modifiers': { og: 'year-modifier-og', hero: 'year-modifier-hero' },
    'search-volume-assessment': { og: 'search-volume-og', hero: 'search-volume-hero' },
    'scalability-testing': { og: 'pattern-validation-og', hero: 'pattern-validation-hero' },
    'competition-analysis': { og: 'keyword-difficulty-og', hero: 'keyword-difficulty-hero' },
    'definitional-queries': { og: 'search-intent-analysis-og', hero: 'search-intent-analysis-hero' },
    'how-to-queries': { og: 'search-intent-analysis-og', hero: 'search-intent-analysis-hero' },
    'explanatory-queries': { og: 'search-intent-analysis-og', hero: 'search-intent-analysis-hero' },
    'research-queries': { og: 'keyword-research-og', hero: 'keyword-research-hero' },
    'brand-queries': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },
    'product-specific-queries': { og: 'product-entity-og', hero: 'product-entity-hero' },
    'website-feature-queries': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },
    'comparison-queries': { og: 'comparison-og', hero: 'comparison-hero' },
    'review-queries': { og: 'review-rating-rich-results-og', hero: 'review-rating-rich-results-hero' },
    'best-queries': { og: 'best-top-modifier-og', hero: 'best-top-modifier-hero' },
    'alternative-queries': { og: 'alternative-to-modifier-og', hero: 'alternative-to-modifier-hero' },
    'purchase-queries': { og: 'transactional-intent-og', hero: 'transactional-intent-hero' },
    'pricing-queries': { og: 'pricing-cost-modifier-og', hero: 'pricing-cost-modifier-hero' },
    'download-queries': { og: 'transactional-intent-og', hero: 'transactional-intent-hero' },
  };

  console.log('Updating subcategories with image references...\n');
  let updated = 0;

  for (const sub of subcategories) {
    let changed = false;

    // Try manual mapping first
    if (!sub.ogImageId && manualMapping[sub.id]) {
      const mapping = manualMapping[sub.id];
      if (imageById.has(mapping.og)) {
        sub.ogImageId = mapping.og;
        changed = true;
      }
      if (!sub.heroImageId && imageById.has(mapping.hero)) {
        sub.heroImageId = mapping.hero;
        changed = true;
      }
    }

    // Try standard naming patterns
    if (!sub.ogImageId) {
      const ogId = `${sub.id}-og`;
      if (imageById.has(ogId)) {
        sub.ogImageId = ogId;
        changed = true;
      }
    }

    if (!sub.heroImageId) {
      const heroId = `${sub.id}-hero`;
      if (imageById.has(heroId)) {
        sub.heroImageId = heroId;
        changed = true;
      }
    }

    if (changed) updated++;
  }

  fs.writeFileSync(SUBCATEGORIES_JSON, JSON.stringify(subcategories, null, 2) + '\n');
  console.log(`Updated ${updated} subcategories\n`);

  // Report still missing
  const stillMissing = subcategories.filter(s => !s.ogImageId);
  if (stillMissing.length > 0) {
    console.log('=== Still missing ogImageId ===');
    stillMissing.forEach(s => console.log(`  - ${s.id}`));
  } else {
    console.log('All subcategories now have ogImageId!');
  }

  console.log('\nDone!');
}

main().catch(console.error);
