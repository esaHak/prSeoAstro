const fs = require('fs');

const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
let fixed = 0;

for (const img of images) {
  // If image has 'url' instead of 'src', fix it
  if (img.url && !img.src) {
    img.src = img.url;
    delete img.url;
    fixed++;
  }

  // If image has 'title', remove it (not needed)
  if (img.title) {
    delete img.title;
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

  // Fix src path format if needed
  if (img.src && !img.src.includes('/images/')) {
    // Already has path, just ensure .jpg extension
  } else if (img.src) {
    // Normalize path based on kind
    const base = img.id.replace(/-og$/, '').replace(/-hero$/, '');
    if (img.kind === 'og') {
      img.src = `/images/og/${base}.jpg`;
    } else if (img.kind === 'hero') {
      img.src = `/images/hero/${base}.jpg`;
    }
  }
}

// Write back
fs.writeFileSync('src/data/images.json', JSON.stringify(images, null, 2));
console.log(`Fixed ${fixed} image entries`);
console.log(`Total images: ${images.length}`);
