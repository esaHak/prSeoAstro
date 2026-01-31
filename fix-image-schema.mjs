import fs from 'fs';

const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
let fixed = 0;

for (const img of images) {
  // If image has 'url' instead of 'src', fix it
  if (img.url && !img.src) {
    img.src = img.url;
    delete img.url;
    fixed++;
  }

  // If image has 'filename' instead of 'src', fix it
  if (img.filename && !img.src) {
    // Determine path based on kind (inferred from ID)
    let basePath = '/images/inline/';
    if (img.id.endsWith('-og')) {
      basePath = '/images/og/';
    } else if (img.id.endsWith('-hero')) {
      basePath = '/images/hero/';
    }
    img.src = basePath + img.filename;
    delete img.filename;
    fixed++;
  }

  // If image has 'title', remove it (not needed)
  if (img.title) {
    delete img.title;
  }

  // Remove format field (not needed)
  if (img.format) {
    delete img.format;
  }

  // Remove status field (not needed)
  if (img.status) {
    delete img.status;
  }

  // Ensure kind is set based on ID suffix
  if (!img.kind) {
    if (img.id.endsWith('-og')) {
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

  // Ensure src is present - create from id if missing
  if (!img.src) {
    let basePath = '/images/inline/';
    let ext = '.jpg';
    if (img.kind === 'og') {
      basePath = '/images/og/';
    } else if (img.kind === 'hero') {
      basePath = '/images/hero/';
    }
    img.src = basePath + img.id + ext;
    fixed++;
  }
}

// Write back
fs.writeFileSync('src/data/images.json', JSON.stringify(images, null, 2));
console.log(`Fixed ${fixed} image entries`);
console.log(`Total images: ${images.length}`);

// Verify no issues remain
const issues = images.filter(img => !img.src || !img.kind || !img.sourceType);
if (issues.length > 0) {
  console.log(`\nImages with issues: ${issues.length}`);
  for (const img of issues.slice(0, 5)) {
    console.log(`  - ${img.id}: src=${!!img.src}, kind=${!!img.kind}, sourceType=${!!img.sourceType}`);
  }
}
