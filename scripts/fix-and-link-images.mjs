#!/usr/bin/env node
/**
 * Fixes images.json (removes duplicates, fixes paths) and links images to entities
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_JSON = './src/data/images.json';
const CATEGORIES_JSON = './src/data/categories.json';
const SUBCATEGORIES_JSON = './src/data/subcategories.json';
const PUBLIC_DIR = './public/images';

// Load data
let images = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
const categories = JSON.parse(fs.readFileSync(CATEGORIES_JSON, 'utf8'));
const subcategories = JSON.parse(fs.readFileSync(SUBCATEGORIES_JSON, 'utf8'));

console.log(`Loaded ${images.length} images\n`);

// Step 1: Fix paths and remove duplicates
console.log('Step 1: Fixing paths and removing duplicates...');

// Fix paths that have 'public' prefix
images = images.map(img => {
  if (img.src.startsWith('public/')) {
    img.src = img.src.replace('public', '');
  }
  return img;
});

// Remove duplicates - keep first occurrence (by src path)
const seenPaths = new Map();
const uniqueImages = [];
for (const img of images) {
  if (!seenPaths.has(img.src)) {
    seenPaths.set(img.src, img);
    uniqueImages.push(img);
  }
}

console.log(`Removed ${images.length - uniqueImages.length} duplicates`);
console.log(`Unique images: ${uniqueImages.length}\n`);

images = uniqueImages;

// Step 2: Build image lookup by various patterns
const ogImages = new Map();
const heroImages = new Map();

for (const img of images) {
  if (img.kind === 'og') {
    // Store by ID without -og suffix
    const baseId = img.id.replace(/-og(-\d+)?$/, '');
    if (!ogImages.has(baseId)) {
      ogImages.set(baseId, img.id);
    }
    ogImages.set(img.id, img.id);
  } else if (img.kind === 'hero') {
    const baseId = img.id.replace(/-hero(-\d+)?$/, '');
    if (!heroImages.has(baseId)) {
      heroImages.set(baseId, img.id);
    }
    heroImages.set(img.id, img.id);
  }
}

// Step 3: Create manual mapping for known patterns
// These are subcategories that have images with different naming
const manualMapping = {
  // Intent types
  'informational': { og: 'informational-intent-og', hero: 'informational-intent-hero' },
  'navigational': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },
  'commercial': { og: 'commercial-investigation-og', hero: 'commercial-investigation-hero' },

  // URL/indexation topics
  'index-noindex': { og: 'index-noindex-criteria-og', hero: 'index-noindex-criteria-hero' },
  'canonical': { og: 'canonicalization-og', hero: 'canonicalization-hero' },
  'pagination': { og: 'pagination-handling-og', hero: 'pagination-handling-hero' },
  'bloat-prevention': { og: 'index-bloat-prevention-og', hero: 'index-bloat-prevention-hero' },

  // Structure topics
  'structure-patterns': { og: 'url-structure-patterns-og', hero: 'url-structure-patterns-hero' },
  'hub-and-spoke': { og: 'hub-and-spoke-model-og', hero: 'hub-and-spoke-model-hero' },
  'pillar-pages': { og: 'pillar-page-design-og', hero: 'pillar-page-design-hero' },
  'cluster-pages': { og: 'cluster-page-design-og', hero: 'cluster-page-design-hero' },

  // Technical topics
  'json-ld': { og: 'json-ld-format-og', hero: 'json-ld-format-hero' },
  'sitemap': { og: 'sitemap-index-og', hero: 'sitemap-index-hero' },
  'core-web-vitals': { og: 'lcp-optimization-og', hero: 'lcp-optimization-hero' },
  'ssr-ssg-isr': { og: 'ssg-generation-og', hero: 'ssg-generation-hero' },

  // Featured snippets
  'featured-snippets': { og: 'featured-snippet-targeting-og', hero: 'featured-snippet-targeting-hero' },
};

// Step 4: Update subcategories
console.log('Step 3: Linking images to subcategories...');
let subUpdates = 0;

for (const sub of subcategories) {
  let updated = false;

  // Check manual mapping first
  if (manualMapping[sub.id]) {
    const mapping = manualMapping[sub.id];
    if (!sub.ogImageId && mapping.og && images.some(i => i.id === mapping.og)) {
      sub.ogImageId = mapping.og;
      updated = true;
    }
    if (!sub.heroImageId && mapping.hero && images.some(i => i.id === mapping.hero)) {
      sub.heroImageId = mapping.hero;
      updated = true;
    }
  }

  // Try automatic matching if still missing
  if (!sub.ogImageId) {
    // Try various patterns
    const patterns = [
      `${sub.id}-og`,
      `${sub.slug}-og`,
      ogImages.get(sub.id),
      ogImages.get(sub.slug),
    ].filter(Boolean);

    for (const pattern of patterns) {
      if (images.some(i => i.id === pattern)) {
        sub.ogImageId = pattern;
        updated = true;
        break;
      }
    }
  }

  if (!sub.heroImageId) {
    const patterns = [
      `${sub.id}-hero`,
      `${sub.slug}-hero`,
      heroImages.get(sub.id),
      heroImages.get(sub.slug),
    ].filter(Boolean);

    for (const pattern of patterns) {
      if (images.some(i => i.id === pattern)) {
        sub.heroImageId = pattern;
        updated = true;
        break;
      }
    }
  }

  if (updated) subUpdates++;
}

// Step 5: Update categories
console.log('Step 4: Linking images to categories...');
let catUpdates = 0;

for (const cat of categories) {
  let updated = false;

  if (!cat.ogImageId) {
    const ogId = `${cat.id}-og`;
    if (images.some(i => i.id === ogId)) {
      cat.ogImageId = ogId;
      updated = true;
    }
  }

  if (!cat.heroImageId) {
    const heroId = `${cat.id}-hero`;
    if (images.some(i => i.id === heroId)) {
      cat.heroImageId = heroId;
      updated = true;
    }
  }

  if (updated) catUpdates++;
}

// Step 6: Save files
console.log('\nSaving files...');
fs.writeFileSync(IMAGES_JSON, JSON.stringify(images, null, 2) + '\n');
fs.writeFileSync(SUBCATEGORIES_JSON, JSON.stringify(subcategories, null, 2) + '\n');
fs.writeFileSync(CATEGORIES_JSON, JSON.stringify(categories, null, 2) + '\n');

console.log(`\nResults:`);
console.log(`  Images: ${images.length}`);
console.log(`  Subcategories updated: ${subUpdates}`);
console.log(`  Categories updated: ${catUpdates}`);

// Step 7: Report missing
console.log('\n=== Still missing ogImageId ===');
const stillMissing = subcategories.filter(s => !s.ogImageId);
if (stillMissing.length > 0) {
  stillMissing.forEach(s => console.log(`  - ${s.id}`));
} else {
  console.log('  None! All subcategories have images.');
}

console.log('\nDone!');
