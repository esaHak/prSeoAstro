/**
 * Detailed debugging
 */

// Test regex pattern building
const anchor = "project management";
const pattern1 = /\bproject management\b/gi;
const pattern2 = new RegExp(`\\b${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

const testText = "You might also be interested in project management tools for your team.";

console.log('Pattern 1:', pattern1);
console.log('Pattern 2:', pattern2);
console.log('Test text:', testText);
console.log('\nPattern 1 match:', pattern1.exec(testText));

pattern2.lastIndex = 0;
console.log('Pattern 2 match:', pattern2.exec(testText));

// Test with actual function
import { extractParagraphs } from './htmlParser';

const html = '<p>You might also be interested in project management tools.</p>';
const paragraphs = extractParagraphs(html);

console.log('\nParagraphs:', paragraphs.length);
if (paragraphs.length > 0) {
  console.log('First paragraph:', paragraphs[0]);
  console.log('Text nodes:', paragraphs[0].textNodes);

  if (paragraphs[0].textNodes.length > 0) {
    const textNode = paragraphs[0].textNodes[0];
    console.log('\nFirst text node:');
    console.log('  Text:', textNode.text);
    console.log('  Start:', textNode.startIndex);
    console.log('  End:', textNode.endIndex);

    const testPattern = /\bproject management\b/gi;
    testPattern.lastIndex = 0;
    const match = testPattern.exec(textNode.text);
    console.log('\nDirect regex test:', match);
  }
}
