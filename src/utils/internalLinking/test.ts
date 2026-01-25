/**
 * Simple test for internal linking
 */

import { addInternalLinks, defaultConfig } from './index';
import type { PageContext } from './targetResolver';

// Test HTML with linkable content
const testHtml = `
<h1>CRM for Startups</h1>
<p>This is a paragraph about CRM software and how it helps startups.</p>
<p>You might also be interested in project management tools for your team.</p>
<p>Email marketing is another important aspect of growing your business.</p>
<section>
  <h2>Features</h2>
  <p>Our CRM solution integrates with email marketing platforms.</p>
</section>
`;

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

console.log('Testing internal linking...\n');
console.log('Input HTML:', testHtml);
console.log('\nContext:', JSON.stringify(testContext, null, 2));

const result = addInternalLinks(testHtml, testContext, defaultConfig);

console.log('\n=== RESULT ===');
console.log('Links inserted:', result.linksInserted);
console.log('Targets used:', result.targetsUsed);
console.log('\nOutput HTML:', result.html);
