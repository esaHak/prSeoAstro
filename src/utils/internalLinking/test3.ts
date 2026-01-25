/**
 * Test the full flow with logging
 */

import { countWords } from './htmlParser';

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

const plainText = testHtml.replace(/<[^>]+>/g, ' ');
const totalWords = countWords(plainText);

console.log('Total words:', totalWords);
console.log('Plain text:', plainText);
console.log('\nMin words threshold (from config): 120');
console.log('Passes threshold?', totalWords >= 120);
