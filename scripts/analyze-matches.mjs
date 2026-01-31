import fs from 'fs';

const images = JSON.parse(fs.readFileSync('./src/data/images.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync('./src/data/subcategories.json', 'utf8'));

const ogImages = images.filter(i => i.kind === 'og').map(i => i.id);
const heroImages = images.filter(i => i.kind === 'hero').map(i => i.id);
const missingSubs = subs.filter(s => !s.ogImageId);

console.log('=== Missing subcategories and potential OG image matches ===\n');

missingSubs.forEach(sub => {
  console.log(`Subcategory: ${sub.id}`);

  // Find images that contain the subcategory ID
  const ogMatches = ogImages.filter(id => id.includes(sub.id));
  const heroMatches = heroImages.filter(id => id.includes(sub.id));

  if (ogMatches.length > 0) {
    console.log(`  OG matches: ${ogMatches.slice(0, 3).join(', ')}`);
  }
  if (heroMatches.length > 0) {
    console.log(`  Hero matches: ${heroMatches.slice(0, 3).join(', ')}`);
  }
  if (ogMatches.length === 0 && heroMatches.length === 0) {
    console.log(`  No matches found`);
  }
  console.log('');
});
