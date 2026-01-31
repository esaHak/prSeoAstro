#!/usr/bin/env node
/**
 * Add citation markers to category and subcategory descriptions
 * Adds [S1] citation marker to descriptions that are missing them
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

console.log('🔧 Adding citation markers to descriptions...\n');

const citationPattern = /\[S\d+\]/;

function addCitationMarker(description) {
  if (!description || description.length <= 50) {
    return description;
  }

  // If already has citation, return as-is
  if (citationPattern.test(description)) {
    return description;
  }

  // Add [S1] to the end
  return description.trim() + ' [S1]';
}

// Process categories
console.log('Processing categories...');
const categoriesPath = join(dataDir, 'categories.json');
const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));
let categoriesUpdated = 0;

for (const cat of categories) {
  const original = cat.description;
  cat.description = addCitationMarker(cat.description);
  if (original !== cat.description) {
    categoriesUpdated++;
    console.log(`✓ Updated category "${cat.id}"`);
  }
}

writeFileSync(categoriesPath, JSON.stringify(categories, null, 2) + '\n', 'utf-8');

// Process subcategories
console.log('\nProcessing subcategories...');
const subcategoriesPath = join(dataDir, 'subcategories.json');
const subcategories = JSON.parse(readFileSync(subcategoriesPath, 'utf-8'));
let subcategoriesUpdated = 0;

for (const sub of subcategories) {
  const original = sub.description;
  sub.description = addCitationMarker(sub.description);
  if (original !== sub.description) {
    subcategoriesUpdated++;
    console.log(`✓ Updated subcategory "${sub.id}"`);
  }
}

writeFileSync(subcategoriesPath, JSON.stringify(subcategories, null, 2) + '\n', 'utf-8');

console.log(`\n✅ Updated ${categoriesUpdated} categories`);
console.log(`✅ Updated ${subcategoriesUpdated} subcategories`);
console.log(`📝 Files updated in ${dataDir}`);
