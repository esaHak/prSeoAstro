import fs from 'fs';

const images = JSON.parse(fs.readFileSync('src/data/images.json', 'utf8'));
let fixed = 0;

for (const img of images) {
  // Fix external URLs to local paths
  if (img.src && img.src.includes('example.com')) {
    let basePath = '/images/inline/';
    if (img.kind === 'og') basePath = '/images/og/';
    else if (img.kind === 'hero') basePath = '/images/hero/';

    // Generate local path from ID
    img.src = basePath + img.id + '.jpg';
    img.sourceType = 'self';
    fixed++;
  }
}

fs.writeFileSync('src/data/images.json', JSON.stringify(images, null, 2));
console.log(`Fixed ${fixed} external URLs`);
