#!/usr/bin/env node
/**
 * Add missing anchor synonyms for entities without anchors
 * Generates default anchor variations based on entity IDs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

console.log('🔧 Adding missing anchor synonyms...\n');

// Load data files
const categories = JSON.parse(readFileSync(join(dataDir, 'categories.json'), 'utf-8'));
const subcategories = JSON.parse(readFileSync(join(dataDir, 'subcategories.json'), 'utf-8'));
const anchors = JSON.parse(readFileSync(join(dataDir, 'anchors.json'), 'utf-8'));

// Get all entity IDs
const allIds = [
  ...categories.map(c => c.id),
  ...subcategories.map(s => s.id)
];

// Find missing entities
const missing = allIds.filter(id => !anchors[id] || anchors[id].length === 0);

console.log(`Found ${missing.length} entities without anchors\n`);

// Generate anchor variations from ID
function generateAnchors(id) {
  // Convert ID to readable text (e.g., "my-entity-id" -> "my entity id")
  const baseText = id.replace(/-/g, ' ');

  // Create variations
  const variations = [
    baseText,  // Basic conversion
    `${baseText} seo`,  // With SEO
    `${baseText} programmatic`,  // With programmatic
    `${baseText} guide`,  // With guide
  ];

  // Sort longest-first
  return variations.sort((a, b) => b.length - a.length);
}

// Add anchors for missing entities
let addedCount = 0;
for (const id of missing) {
  anchors[id] = generateAnchors(id);
  addedCount++;
  console.log(`✓ Added anchors for "${id}"`);
}

// Write back to file with proper formatting
writeFileSync(
  join(dataDir, 'anchors.json'),
  JSON.stringify(anchors, null, 2) + '\n',
  'utf-8'
);

console.log(`\n✅ Added anchors for ${addedCount} entities`);
console.log(`📝 Updated ${join(dataDir, 'anchors.json')}`);
