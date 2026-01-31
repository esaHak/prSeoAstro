import fs from 'fs';

const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
let fixed = 0;

for (const img of images) {
  // Fix src from various legacy fields
  if (!img.src) {
    if (img.url) {
      img.src = img.url;
    } else if (img.filename) {
      let basePath = '/images/inline/';
      if (img.id.endsWith('-og')) basePath = '/images/og/';
      else if (img.id.endsWith('-hero')) basePath = '/images/hero/';
      img.src = basePath + img.filename;
    } else {
      // Generate from ID
      let basePath = '/images/inline/';
      if (img.id.endsWith('-og')) basePath = '/images/og/';
      else if (img.id.endsWith('-hero')) basePath = '/images/hero/';
      img.src = basePath + img.id + '.jpg';
    }
    fixed++;
  }

  // Fix alt from altText or generate from id
  if (!img.alt) {
    if (img.altText) {
      img.alt = img.altText;
    } else {
      img.alt = img.id
        .replace(/-og$/, '')
        .replace(/-hero$/, '')
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    fixed++;
  }

  // Ensure kind is set
  if (!img.kind) {
    if (img.imageType) {
      img.kind = img.imageType;
    } else if (img.id.endsWith('-og')) {
      img.kind = 'og';
    } else if (img.id.endsWith('-hero')) {
      img.kind = 'hero';
    } else {
      img.kind = 'inline';
    }
    fixed++;
  }

  // Ensure sourceType is set
  if (!img.sourceType) {
    img.sourceType = 'self';
    fixed++;
  }

  // Ensure width is set
  if (!img.width) {
    if (img.kind === 'og') img.width = 1200;
    else if (img.kind === 'hero') img.width = 1200;
    else img.width = 800;
    fixed++;
  }

  // Ensure height is set
  if (!img.height) {
    if (img.kind === 'og') img.height = 630;
    else if (img.kind === 'hero') img.height = 400;
    else img.height = 450;
    fixed++;
  }

  // Remove legacy fields
  delete img.url;
  delete img.filename;
  delete img.title;
  delete img.format;
  delete img.status;
  delete img.imageType;
  delete img.altText;
  delete img.description;
}

// Write back
fs.writeFileSync('src/data/images.json', JSON.stringify(images, null, 2));
console.log(`Fixed ${fixed} issues in image entries`);
console.log(`Total images: ${images.length}`);

// Verify all images have required fields
const incomplete = images.filter(img =>
  !img.id || !img.kind || !img.sourceType || !img.src || !img.alt || !img.width || !img.height
);
if (incomplete.length > 0) {
  console.log(`\n⚠️  ${incomplete.length} images still have issues:`);
  for (const img of incomplete.slice(0, 5)) {
    console.log(`  - ${img.id}`);
  }
} else {
  console.log(`\n✅ All images have required fields`);
}
