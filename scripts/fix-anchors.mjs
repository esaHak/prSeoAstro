#!/usr/bin/env node
/**
 * Fix anchor ordering issues in anchors.json
 * Sorts all anchor arrays longest-first for priority matching
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');
const anchorsPath = join(dataDir, 'anchors.json');

console.log('🔧 Fixing anchor ordering...\n');

// Load anchors.json
const anchors = JSON.parse(readFileSync(anchorsPath, 'utf-8'));

let fixedCount = 0;

// Sort each anchor array by length (longest first)
for (const [id, phrases] of Object.entries(anchors)) {
  const sorted = [...phrases].sort((a, b) => b.length - a.length);

  // Check if order changed
  if (JSON.stringify(phrases) !== JSON.stringify(sorted)) {
    anchors[id] = sorted;
    fixedCount++;
    console.log(`✓ Fixed "${id}"`);
  }
}

// Write back to file with proper formatting
writeFileSync(anchorsPath, JSON.stringify(anchors, null, 2) + '\n', 'utf-8');

console.log(`\n✅ Fixed ${fixedCount} anchor arrays`);
console.log(`📝 Updated ${anchorsPath}`);
