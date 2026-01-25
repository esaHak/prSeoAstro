/**
 * Final comprehensive test demonstrating internal linking with multiple links
 */

import { addInternalLinks, defaultConfig } from './index';
import type { PageContext } from './targetResolver';

// Test HTML with plenty of content for multiple links (need ~300+ words for 3 links)
const testHtml = `
<h1>CRM for Startups</h1>
<p>Welcome to our comprehensive guide on customer relationship management for early-stage companies. This resource will help you understand everything you need to know about implementing the right CRM solution for your growing startup.</p>

<section>
  <h2>Overview</h2>
  <p>Choosing the right CRM software is crucial for startup success. As your business grows, managing customer relationships becomes increasingly complex. The best CRM platforms offer intuitive interfaces, powerful automation, and seamless integrations with other business tools you rely on daily.</p>

  <p>Many successful startups integrate their CRM with project management software to create efficient workflows. Project management tools help teams collaborate effectively, track tasks, and maintain visibility across all ongoing initiatives. When combined with CRM data, project management platforms enable better resource allocation and customer delivery.</p>

  <p>Email marketing is another essential component of modern customer engagement strategies. The most effective email marketing platforms integrate seamlessly with your CRM, enabling personalized communication at scale. By leveraging email marketing automation, startups can nurture leads, onboard new customers, and maintain engagement without overwhelming their small teams.</p>

  <p>As you evaluate different solutions, consider how well they integrate with your existing technology stack. The right combination of CRM software, project management tools, and email marketing platforms creates a powerful ecosystem that scales with your business growth and adapts to changing customer needs.</p>
</section>

<section>
  <h2>Key Features to Consider</h2>
  <p>Modern CRM systems for startups typically include contact management, deal tracking, pipeline visualization, and reporting capabilities. Look for solutions that offer mobile access, customization options, and strong data security measures to protect sensitive customer information.</p>
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

console.log('=== FINAL COMPREHENSIVE TEST ===\n');

// Count words
const plainText = testHtml.replace(/<[^>]+>/g, ' ');
const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
console.log(`Content: ~${wordCount} words`);
console.log(`Expected max links: ${Math.min(5, Math.floor(wordCount / 100))}\n`);

const result = addInternalLinks(testHtml, testContext, defaultConfig);

console.log('=== RESULTS ===');
console.log(`✓ Links inserted: ${result.linksInserted}`);
console.log(`✓ Target URLs: ${result.targetsUsed.join(', ')}\n`);

// Extract and display inserted links
const linkMatches = result.html.match(/<a href="[^"]*">[^<]*<\/a>/g);
if (linkMatches) {
  console.log('=== INSERTED LINKS ===');
  linkMatches.forEach((link, i) => {
    const urlMatch = link.match(/href="([^"]*)"/);
    const textMatch = link.match(/>([^<]*)</);
    if (urlMatch && textMatch) {
      console.log(`${i + 1}. "${textMatch[1]}" → ${urlMatch[1]}`);
    }
  });
}

// Success criteria
console.log('\n=== ACCEPTANCE CRITERIA ===');
console.log(`✓ Links only in <p> tags: ${!result.html.match(/<h[1-6][^>]*>.*?<a href/i) ? 'PASS' : 'FAIL'}`);
console.log(`✓ No nested <a> tags: ${!result.html.match(/<a[^>]*>.*?<a/i) ? 'PASS' : 'FAIL'}`);
console.log(`✓ No broken HTML: ${result.html.split('<').length === result.html.split('>').length ? 'PASS' : 'FAIL'}`);
console.log(`✓ Links inserted: ${result.linksInserted > 0 ? 'PASS' : 'FAIL'}`);
console.log(`✓ Hierarchy excluded: ${!result.targetsUsed.some(u => u.includes('crm-software') || u.includes('free-crm')) ? 'PASS' : 'FAIL'}`);
console.log(`✓ Cross-relations included: ${result.targetsUsed.some(u => u.includes('project-management') || u.includes('email-marketing')) ? 'PASS' : 'FAIL'}`);

if (result.linksInserted >= 2) {
  console.log('\n🎉 SUCCESS! Multiple internal links were inserted correctly.');
} else {
  console.log('\n⚠️  Fewer links than expected. Consider adding more content or adjusting config.');
}
