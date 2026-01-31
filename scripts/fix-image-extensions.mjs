import fs from 'fs';

const images = JSON.parse(fs.readFileSync('./src/data/images.json', 'utf8'));

let fixed = 0;
let stillMissing = [];

for (const img of images) {
  const fullPath = './public' + img.src;

  if (!fs.existsSync(fullPath)) {
    // Try .webp version
    const webpPath = img.src.replace(/\.(png|jpg)$/, '.webp');
    const webpFullPath = './public' + webpPath;

    if (fs.existsSync(webpFullPath)) {
      img.src = webpPath;
      fixed++;
    } else {
      stillMissing.push(img.src);
    }
  }
}

fs.writeFileSync('./src/data/images.json', JSON.stringify(images, null, 2) + '\n');
console.log('Fixed', fixed, 'image paths to .webp');
console.log('Still missing:', stillMissing.length);

if (stillMissing.length > 0) {
  console.log('\nSample missing:');
  stillMissing.slice(0, 15).forEach(p => console.log('  ' + p));
}
