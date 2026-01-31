#!/usr/bin/env node
/**
 * Generate _redirects file for Cloudflare Pages
 *
 * Reads redirects.json and generates a Cloudflare Pages compatible _redirects file
 * Run: node scripts/generate-redirects.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');
const publicDir = join(__dirname, '../public');

function loadJson(filename) {
  const filePath = join(dataDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function generateRedirects() {
  console.log('📝 Generating _redirects file...\n');

  let redirects;
  try {
    redirects = loadJson('redirects.json');
  } catch (e) {
    console.log('⚠️  No redirects.json found, skipping redirect generation');
    return;
  }

  if (!Array.isArray(redirects) || redirects.length === 0) {
    console.log('⚠️  No redirects defined');
    return;
  }

  // Build _redirects content
  const lines = [
    '# Cloudflare Pages Redirects',
    '# Generated from src/data/redirects.json',
    '# Format: [source] [destination] [status]',
    ''
  ];

  for (const redirect of redirects) {
    const { from, to, status = 301 } = redirect;
    if (from && to) {
      lines.push(`${from} ${to} ${status}`);
    }
  }

  // Write to public/_redirects
  const outputPath = join(publicDir, '_redirects');
  writeFileSync(outputPath, lines.join('\n'), 'utf-8');

  console.log(`✅ Generated ${redirects.length} redirect(s) to public/_redirects\n`);
}

generateRedirects();
