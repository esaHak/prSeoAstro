/**
 * Debug script for internal linking
 */

import { getEligibleTargets } from './targetResolver';
import { defaultConfig } from './config';
import { extractParagraphs } from './htmlParser';
import type { PageContext } from './targetResolver';

// Test context (CRM for Startups page)
const testContext: PageContext = {
  type: 'subcategory',
  entity: {
    id: 'crm-for-startups',
    slug: 'crm-for-startups',
    title: 'CRM for Startups',
    description: 'CRM solutions designed for early-stage companies.',
    parentCategoryId: 'crm-software',
    relatedCategoryIds: ['project-management'],
    childSubcategoryIds: ['free-crm-for-startups', 'crm-with-funding-tracking'],
  },
  id: 'crm-for-startups',
  slug: 'crm-for-startups',
};

console.log('=== DEBUGGING INTERNAL LINKING ===\n');

// 1. Check eligible targets
console.log('1. Getting eligible targets...');
const targets = getEligibleTargets(testContext, defaultConfig);
console.log(`Found ${targets.length} targets:`);
targets.forEach(t => {
  console.log(`  - ${t.title} (${t.id})`);
  console.log(`    URL: ${t.url}`);
  console.log(`    Anchors: ${t.anchors.join(', ')}`);
  console.log(`    Relation: ${t.relation}`);
  console.log(`    Priority: ${t.priority}`);
});

// 2. Check HTML parsing
console.log('\n2. Testing HTML parsing...');
const testHtml = `
<p>This is a paragraph about project management.</p>
<p>Another paragraph about email marketing.</p>
`;
const paragraphs = extractParagraphs(testHtml);
console.log(`Found ${paragraphs.length} paragraphs`);
paragraphs.forEach((p, i) => {
  console.log(`  Paragraph ${i}:`, p.fullHtml.substring(0, 50));
  console.log(`  Text nodes:`, p.textNodes.length);
  p.textNodes.forEach((tn, j) => {
    console.log(`    Node ${j}:`, tn.text.substring(0, 40));
  });
});
