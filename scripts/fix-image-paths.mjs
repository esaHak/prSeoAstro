import fs from 'fs';

const images = JSON.parse(fs.readFileSync('./src/data/images.json', 'utf8'));

let fixed = 0;
let stillMissing = [];

for (const img of images) {
  // Fix paths that have 'public/' prefix
  if (img.src.startsWith('public/')) {
    img.src = img.src.replace('public/', '/');
    fixed++;
  }

  // Verify file exists
  const fullPath = './public' + img.src;
  if (!fs.existsSync(fullPath)) {
    stillMissing.push(img.src);
  }
}

fs.writeFileSync('./src/data/images.json', JSON.stringify(images, null, 2) + '\n');
console.log('Fixed', fixed, 'paths with public/ prefix');
console.log('Still missing:', stillMissing.length);

if (stillMissing.length > 0) {
  console.log('\nSample missing:');
  stillMissing.slice(0, 10).forEach(p => console.log('  ' + p));
}
