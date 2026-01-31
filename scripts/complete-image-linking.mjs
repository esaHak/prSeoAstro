#!/usr/bin/env node
/**
 * Completes image linking with best-match fallbacks
 */

import fs from 'fs';

const IMAGES_JSON = './src/data/images.json';
const SUBCATEGORIES_JSON = './src/data/subcategories.json';

const images = JSON.parse(fs.readFileSync(IMAGES_JSON, 'utf8'));
const subcategories = JSON.parse(fs.readFileSync(SUBCATEGORIES_JSON, 'utf8'));

// Create lookup
const imageById = new Map(images.map(i => [i.id, i]));

// Best-match mapping for remaining subcategories
// Note: Using actual IDs found in images.json (many use -1 suffix or different patterns)
const bestMatches = {
  // Use Case Pages
  'intent-modifiers': { og: 'search-intent-analysis-1', hero: 'search-intent-analysis-1' },
  'competitor-analysis': { og: 'serp-analysis-1', hero: 'serp-analysis-1' },
  'service-area-pages': { og: 'city-region-pages-og', hero: 'city-region-pages-hero' },
  'local-directory-pages': { og: 'local-intent-og', hero: 'local-intent-hero' },
  'category-pages': { og: 'category-hub-og', hero: 'category-hub-hero' },
  'filter-attribute-pages': { og: 'template-design-1', hero: 'template-design-1' },
  'comparison-pages': { og: 'comparison-og', hero: 'comparison-hero' },
  'tool-integration-pages': { og: 'integration-og', hero: 'integration-hero' },
  'api-documentation': { og: 'technical-implementation-1', hero: 'technical-implementation-1' },
  'workflow-pages': { og: 'template-design-1', hero: 'template-design-1' },
  'statistics-pages': { og: 'content-requirements-1', hero: 'content-requirements-1' },
  'research-aggregation': { og: 'keyword-research-1', hero: 'keyword-research-1' },
  'benchmark-pages': { og: 'monitoring-1', hero: 'monitoring-1' },
  'glossary-pages': { og: 'content-requirements-1', hero: 'content-requirements-1' },
  'how-to-pages': { og: 'template-design-1', hero: 'template-design-1' },
  'faq-aggregation': { og: 'faq-og', hero: 'faq-hero' },

  // Keyword Discovery
  'seed-keyword-brainstorming': { og: 'google-keyword-planner-og', hero: 'google-keyword-planner-hero' },
  'search-console-mining': { og: 'search-volume-og', hero: 'search-volume-hero' },
  'location-modifiers': { og: 'near-me-location-modifier-og', hero: 'near-me-location-modifier-hero' },
  'attribute-modifiers': { og: 'modifier-discovery-og', hero: 'modifier-discovery-hero' },
  'audience-modifiers': { og: 'for-audience-modifier-og', hero: 'for-audience-modifier-hero' },
  'temporal-modifiers': { og: 'year-modifier-og', hero: 'year-modifier-hero' },

  // Keyword Validation
  'search-volume-assessment': { og: 'search-volume-og', hero: 'search-volume-hero' },
  'scalability-testing': { og: 'pattern-validation-og', hero: 'pattern-validation-hero' },
  'competition-analysis': { og: 'keyword-difficulty-og', hero: 'keyword-difficulty-hero' },

  // Intent Queries (Informational)
  'definitional-queries': { og: 'search-intent-analysis-1', hero: 'search-intent-analysis-1' },
  'how-to-queries': { og: 'search-intent-analysis-1', hero: 'search-intent-analysis-1' },
  'explanatory-queries': { og: 'search-intent-analysis-1', hero: 'search-intent-analysis-1' },
  'research-queries': { og: 'keyword-research-1', hero: 'keyword-research-1' },

  // Intent Queries (Navigational)
  'brand-queries': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },
  'product-specific-queries': { og: 'product-entity-og', hero: 'product-entity-hero' },
  'website-feature-queries': { og: 'navigational-intent-og', hero: 'navigational-intent-hero' },

  // Intent Queries (Commercial)
  'comparison-queries': { og: 'comparison-og', hero: 'comparison-hero' },
  'review-queries': { og: 'review-rating-rich-results-og', hero: 'review-rating-rich-results-hero' },
  'best-queries': { og: 'best-top-modifier-og', hero: 'best-top-modifier-hero' },
  'alternative-queries': { og: 'alternative-to-modifier-og', hero: 'alternative-to-modifier-hero' },

  // Intent Queries (Transactional)
  'purchase-queries': { og: 'transactional-intent-og', hero: 'transactional-intent-hero' },
  'pricing-queries': { og: 'pricing-cost-modifier-og', hero: 'pricing-cost-modifier-hero' },
  'download-queries': { og: 'transactional-intent-og', hero: 'transactional-intent-hero' },

  // Core Principles & Tech
  'definition-core-principles': { og: 'foundational-concepts-1', hero: 'foundational-concepts-1' },
  'database-design': { og: 'content-database-og', hero: 'content-database-hero' },
  'cms-integration': { og: 'wordpress-integration-og', hero: 'wordpress-integration-hero' },
};

console.log('Completing image linking with best matches...\n');

let updated = 0;
for (const sub of subcategories) {
  if (!sub.ogImageId && bestMatches[sub.id]) {
    const match = bestMatches[sub.id];

    // Verify images exist
    if (imageById.has(match.og)) {
      sub.ogImageId = match.og;
      updated++;
    }
    if (imageById.has(match.hero)) {
      sub.heroImageId = match.hero;
    }
  }
}

// Save
fs.writeFileSync(SUBCATEGORIES_JSON, JSON.stringify(subcategories, null, 2) + '\n');

console.log(`Updated ${updated} subcategories\n`);

// Final report
const stillMissing = subcategories.filter(s => !s.ogImageId);
if (stillMissing.length > 0) {
  console.log('=== Still missing ogImageId ===');
  stillMissing.forEach(s => console.log(`  - ${s.id}`));
} else {
  console.log('All subcategories now have images!');
}

console.log('\nDone!');
