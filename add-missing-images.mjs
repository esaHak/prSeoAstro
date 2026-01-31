import fs from 'fs';

const categories = JSON.parse(fs.readFileSync('src/data/categories.json', 'utf8'));
const subcategories = JSON.parse(fs.readFileSync('src/data/subcategories.json', 'utf8'));
const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));

// Get all existing image IDs
const existingIds = new Set(images.map(img => img.id));
console.log(`Existing images: ${existingIds.size}`);

// Collect all referenced image IDs
const referencedIds = new Set();

function collectImageRefs(entity) {
  if (entity.heroImageId) referencedIds.add(entity.heroImageId);
  if (entity.ogImageId) referencedIds.add(entity.ogImageId);

  if (entity.content) {
    for (const [key, items] of Object.entries(entity.content)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item === 'object' && item.type === 'image' && item.imageId) {
            referencedIds.add(item.imageId);
          }
        }
      }
    }
  }
}

for (const cat of categories) collectImageRefs(cat);
for (const sub of subcategories) collectImageRefs(sub);

console.log(`Referenced images: ${referencedIds.size}`);

// Find missing images
const missing = [...referencedIds].filter(id => !existingIds.has(id));
console.log(`Missing images: ${missing.length}`);

// Create entries for missing images
const newImages = [];
for (const id of missing) {
  let kind = 'inline';
  let src = `/images/inline/${id}.jpg`;
  let width = 800;
  let height = 450;

  if (id.endsWith('-og')) {
    kind = 'og';
    src = `/images/og/${id}.jpg`;
    width = 1200;
    height = 630;
  } else if (id.endsWith('-hero')) {
    kind = 'hero';
    src = `/images/hero/${id}.jpg`;
    width = 1200;
    height = 400;
  }

  const alt = id
    .replace(/-og$/, '')
    .replace(/-hero$/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  newImages.push({
    id,
    kind,
    sourceType: 'self',
    src,
    width,
    height,
    alt
  });
}

// Merge and write
const allImages = [...images, ...newImages];
fs.writeFileSync('src/data/images.json', JSON.stringify(allImages, null, 2));
console.log(`Added ${newImages.length} missing images`);
console.log(`Total images: ${allImages.length}`);
