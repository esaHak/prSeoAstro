#!/usr/bin/env node
/**
 * Registers all unregistered images in images.json
 * and updates subcategories with ogImageId/heroImageId references
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_JSON = './src/data/images.json';
const CATEGORIES_JSON = './src/data/categories.json';
const SUBCATEGORIES_JSON = './src/data/subcategories.json';
const PUBLIC_DIR = './public/images';

// Load existing data
const images = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
const categories = JSON.parse(fs.readFileSync(CATEGORIES_JSON, 'utf8'));
const subcategories = JSON.parse(fs.readFileSync(SUBCATEGORIES_JSON, 'utf8'));

// Get registered image paths
const registeredPaths = new Set(images.map(i => i.src));
const registeredIds = new Set(images.map(i => i.id));

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

// Generate image ID from path
function generateId(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename;
}

// Generate alt text from ID
function generateAlt(id, kind) {
  // Convert kebab-case to Title Case
  const words = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (kind === 'og') {
    return `${words} - Open Graph preview image`;
  } else if (kind === 'hero') {
    return `${words} - Hero banner illustration`;
  }
  return `${words} - Diagram`;
}

// Make ID unique
function makeUniqueId(baseId) {
  let id = baseId;
  let counter = 1;
  while (registeredIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }
  return id;
}

async function main() {
  console.log('Finding unregistered images...\n');

  const allFiles = walkDir(PUBLIC_DIR);
  const unregisteredFiles = allFiles.filter(f => {
    const relPath = f.replace('./public', '');
    return !registeredPaths.has(relPath);
  });

  console.log(`Found ${unregisteredFiles.length} unregistered images\n`);

  if (unregisteredFiles.length === 0) {
    console.log('All images are already registered!');
    return;
  }

  // Process each unregistered image
  const newImages = [];
  for (const filePath of unregisteredFiles) {
    try {
      const relPath = filePath.replace('./public', '');
      const kind = getImageKind(relPath);
      let baseId = generateId(filePath);
      const id = makeUniqueId(baseId);
      registeredIds.add(id);

      // Get dimensions
      const metadata = await sharp(filePath).metadata();

      const imageEntry = {
        id,
        kind,
        sourceType: 'self',
        src: relPath,
        width: metadata.width,
        height: metadata.height,
        alt: generateAlt(baseId, kind)
      };

      newImages.push(imageEntry);
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  }

  console.log(`Processed ${newImages.length} new images\n`);

  // Add new images to the array
  const allImages = [...images, ...newImages];

  // Sort by ID for consistency
  allImages.sort((a, b) => a.id.localeCompare(b.id));

  // Write updated images.json
  fs.writeFileSync(IMAGES_JSON, JSON.stringify(allImages, null, 2) + '\n');
  console.log(`Updated ${IMAGES_JSON} with ${allImages.length} total images\n`);

  // Build lookup for new images by base ID pattern
  const imageById = new Map();
  allImages.forEach(img => imageById.set(img.id, img));

  // Update subcategories with ogImageId and heroImageId
  let subUpdates = 0;
  for (const sub of subcategories) {
    let updated = false;

    // Try to find matching og image
    if (!sub.ogImageId) {
      const possibleOgIds = [
        `${sub.id}-og`,
        `${sub.slug}-og`,
      ];
      for (const ogId of possibleOgIds) {
        if (imageById.has(ogId)) {
          sub.ogImageId = ogId;
          updated = true;
          break;
        }
      }
    }

    // Try to find matching hero image
    if (!sub.heroImageId) {
      const possibleHeroIds = [
        `${sub.id}-hero`,
        `${sub.slug}-hero`,
      ];
      for (const heroId of possibleHeroIds) {
        if (imageById.has(heroId)) {
          sub.heroImageId = heroId;
          updated = true;
          break;
        }
      }
    }

    if (updated) subUpdates++;
  }

  // Update categories with ogImageId and heroImageId
  let catUpdates = 0;
  for (const cat of categories) {
    let updated = false;

    if (!cat.ogImageId) {
      const ogId = `${cat.id}-og`;
      if (imageById.has(ogId)) {
        cat.ogImageId = ogId;
        updated = true;
      }
    }

    if (!cat.heroImageId) {
      const heroId = `${cat.id}-hero`;
      if (imageById.has(heroId)) {
        cat.heroImageId = heroId;
        updated = true;
      }
    }

    if (updated) catUpdates++;
  }

  // Write updated JSON files
  fs.writeFileSync(SUBCATEGORIES_JSON, JSON.stringify(subcategories, null, 2) + '\n');
  fs.writeFileSync(CATEGORIES_JSON, JSON.stringify(categories, null, 2) + '\n');

  console.log(`Updated ${subUpdates} subcategories with image references`);
  console.log(`Updated ${catUpdates} categories with image references`);
  console.log('\nDone!');
}

main().catch(console.error);
