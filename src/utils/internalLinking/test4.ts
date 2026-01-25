/**
 * Test with sufficient content
 */

import { addInternalLinks, defaultConfig } from './index';
import type { PageContext } from './targetResolver';

// Test HTML with enough words (need 120+)
const testHtml = `
<h1>CRM for Startups</h1>
<p>This comprehensive guide covers everything you need to know about CRM software for startups and early-stage companies. We'll explore the key features, benefits, and considerations when choosing the right customer relationship management solution for your growing business.</p>
<p>As your startup grows, you'll quickly realize the importance of project management tools to help your team stay organized and productive. Many successful startups integrate their CRM with project management software to create a seamless workflow.</p>
<p>Email marketing is another critical component of your growth strategy. The best CRM platforms offer robust email marketing integration, allowing you to nurture leads and engage with customers effectively. Consider how email marketing automation can save your team valuable time.</p>
<p>When evaluating CRM options, look for solutions that can scale with your business. The right CRM software will grow alongside your startup, adapting to your changing needs as you acquire more customers and expand your operations.</p>
<section>
  <h2>Key Features</h2>
  <p>Modern CRM systems offer a wide range of capabilities designed specifically for startup needs, including contact management, pipeline tracking, and detailed analytics.</p>
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
    relatedCategoryIds: ['project-management', 'email-marketing'],
    childSubcategoryIds: ['free-crm-for-startups', 'crm-with-funding-tracking'],
  },
  id: 'crm-for-startups',
  slug: 'crm-for-startups',
};

console.log('Testing internal linking with sufficient content...\n');

const result = addInternalLinks(testHtml, testContext, defaultConfig);

console.log('=== RESULT ===');
console.log('Links inserted:', result.linksInserted);
console.log('Targets used:', result.targetsUsed);
console.log('\nOutput HTML:\n', result.html);

// Check if links were actually inserted
if (result.linksInserted > 0) {
  console.log('\n✅ SUCCESS! Links were inserted.');
} else {
  console.log('\n❌ FAILED! No links were inserted.');
}
