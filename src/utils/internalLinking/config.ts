/**
 * Internal linking configuration for programmatic SEO
 */

export type RelationType = 'parent' | 'child' | 'ancestor' | 'descendant' | 'relatedCategoryIds' | 'sibling';

export interface InternalLinkingConfig {
  // Feature toggle
  enabled: boolean;

  // Link density controls
  maxLinksPerPage: number;
  linksPerWords: number | null; // e.g., 1 link per 150 words
  minWordsBeforeLinking: number; // minimum words in content before any linking

  // Deduplication and self-linking
  dedupeAnchors: boolean; // don't link same anchor text multiple times
  allowSelfLink: boolean; // allow linking to the current page

  // Relation policy - which DB relations are eligible for linking
  relationPolicy: {
    excludeHierarchyByDefault: boolean; // exclude parent/child/ancestor/descendant
    includeRelations: RelationType[]; // which relation types to include
    excludeRelations: RelationType[]; // which relation types to exclude
  };

  // Anchor text policy
  anchorPolicy: {
    source: 'title' | 'synonyms' | 'both'; // where to get anchor text
    synonymsFile?: string; // path to synonyms JSON
    maxAnchorsPerTarget: number; // max different anchors to try per target
    match: 'wholeWord' | 'phrase'; // matching strategy
    caseSensitive: boolean;
  };

  // Target URL policy
  targetPolicy: {
    preferSubcategoryOverCategory: boolean;
    disallowTargets: string[]; // entity IDs to never link to
  };

  // Placement policy
  placementPolicy: {
    oneLinkPerParagraph: boolean; // max 1 link per <p>
    skipFirstParagraph: boolean; // skip the first <p> (often intro)
    minParagraphWords: number; // min words in a paragraph to be eligible
  };
}

export const defaultConfig: InternalLinkingConfig = {
  enabled: true,

  maxLinksPerPage: 5,
  linksPerWords: 100, // 1 link per 100 words (more permissive)
  minWordsBeforeLinking: 50, // Lower threshold for shorter pages

  dedupeAnchors: true,
  allowSelfLink: false,

  relationPolicy: {
    excludeHierarchyByDefault: false, // Allow more linking opportunities
    includeRelations: [], // Empty means all relations allowed (except excludeRelations)
    excludeRelations: ['parent', 'ancestor'], // Only exclude direct parents and ancestors
  },

  anchorPolicy: {
    source: 'both',
    synonymsFile: 'src/data/anchors.json',
    maxAnchorsPerTarget: 5,
    match: 'phrase',
    caseSensitive: false,
  },

  targetPolicy: {
    preferSubcategoryOverCategory: true,
    disallowTargets: [],
  },

  placementPolicy: {
    oneLinkPerParagraph: false,
    skipFirstParagraph: false,
    minParagraphWords: 10,
  },
};
