/**
 * Main internal linking engine
 * Transforms HTML by inserting internal links into <p> tags
 */

import type { InternalLinkingConfig } from './config';
import { defaultConfig } from './config';
import type { PageContext, LinkTarget } from './targetResolver';
import { getEligibleTargets } from './targetResolver';
import {
  extractParagraphs,
  countWords,
  applyLinkInsertions,
  type LinkInsertion,
  type Paragraph,
} from './htmlParser';

export interface LinkingResult {
  html: string;
  linksInserted: number;
  targetsUsed: string[];
}

/**
 * Main function: add internal links to HTML
 */
export function addInternalLinks(
  html: string,
  context: PageContext,
  config: InternalLinkingConfig = defaultConfig
): LinkingResult {
  if (!config.enabled) {
    return {
      html,
      linksInserted: 0,
      targetsUsed: [],
    };
  }

  // Count total words in content
  const plainText = html.replace(/<[^>]+>/g, ' ');
  const totalWords = countWords(plainText);

  // Check minimum word threshold
  if (totalWords < config.minWordsBeforeLinking) {
    return {
      html,
      linksInserted: 0,
      targetsUsed: [],
    };
  }

  // Calculate maximum links allowed
  const maxLinks = calculateMaxLinks(totalWords, config);

  // Get eligible link targets
  const targets = getEligibleTargets(context, config);
  if (targets.length === 0) {
    return {
      html,
      linksInserted: 0,
      targetsUsed: [],
    };
  }

  // Extract paragraphs
  const paragraphs = extractParagraphs(html);
  if (paragraphs.length === 0) {
    return {
      html,
      linksInserted: 0,
      targetsUsed: [],
    };
  }

  // Filter paragraphs based on placement policy
  const eligibleParagraphs = filterParagraphs(paragraphs, config);

  // Find and insert links
  const insertions = findLinkInsertions(
    html,
    eligibleParagraphs,
    targets,
    maxLinks,
    config
  );

  // Apply insertions
  const modifiedHtml = applyLinkInsertions(html, insertions);

  return {
    html: modifiedHtml,
    linksInserted: insertions.length,
    targetsUsed: Array.from(new Set(insertions.map(i => i.href))),
  };
}

/**
 * Calculate maximum number of links allowed
 */
function calculateMaxLinks(totalWords: number, config: InternalLinkingConfig): number {
  let max = config.maxLinksPerPage;

  if (config.linksPerWords !== null) {
    const wordsBasedMax = Math.floor(totalWords / config.linksPerWords);
    max = Math.min(max, wordsBasedMax);
  }

  return Math.max(0, max);
}

/**
 * Filter paragraphs based on placement policy
 */
function filterParagraphs(paragraphs: Paragraph[], config: InternalLinkingConfig): Paragraph[] {
  let filtered = paragraphs;

  // Skip first paragraph
  if (config.placementPolicy.skipFirstParagraph && paragraphs.length > 1) {
    filtered = paragraphs.slice(1);
  }

  // Filter by minimum words
  if (config.placementPolicy.minParagraphWords > 0) {
    filtered = filtered.filter(p => {
      const textContent = p.fullHtml.replace(/<[^>]+>/g, ' ');
      return countWords(textContent) >= config.placementPolicy.minParagraphWords;
    });
  }

  return filtered;
}

/**
 * Find all link insertion positions
 */
function findLinkInsertions(
  html: string,
  paragraphs: Paragraph[],
  targets: LinkTarget[],
  maxLinks: number,
  config: InternalLinkingConfig
): LinkInsertion[] {
  const insertions: LinkInsertion[] = [];
  const usedAnchors = new Set<string>();
  const linksPerParagraph = new Map<number, number>();

  // Sort targets by priority (already sorted from getEligibleTargets)
  // Sort anchors by length (descending) to match longest first
  const targetsWithSortedAnchors = targets.map(target => ({
    ...target,
    anchors: [...target.anchors].sort((a, b) => b.length - a.length),
  }));

  for (const target of targetsWithSortedAnchors) {
    if (insertions.length >= maxLinks) break;

    // Try each anchor for this target
    for (const anchor of target.anchors) {
      if (insertions.length >= maxLinks) break;

      // Skip if we've already used this anchor text (deduplication)
      const anchorKey = config.anchorPolicy.caseSensitive
        ? anchor
        : anchor.toLowerCase();

      if (config.dedupeAnchors && usedAnchors.has(anchorKey)) {
        continue;
      }

      // Find first occurrence in paragraphs
      const insertion = findFirstOccurrence(
        html,
        paragraphs,
        anchor,
        target.url,
        config,
        linksPerParagraph
      );

      if (insertion) {
        insertions.push(insertion);
        usedAnchors.add(anchorKey);

        // Update paragraph link count
        const paraIndex = paragraphs.findIndex(
          p => insertion.position >= p.startIndex && insertion.position < p.endIndex
        );
        if (paraIndex !== -1) {
          linksPerParagraph.set(
            paraIndex,
            (linksPerParagraph.get(paraIndex) || 0) + 1
          );
        }

        break; // Found a match for this target, move to next target
      }
    }
  }

  return insertions;
}

/**
 * Find first occurrence of anchor text in eligible paragraphs
 */
function findFirstOccurrence(
  html: string,
  paragraphs: Paragraph[],
  anchor: string,
  url: string,
  config: InternalLinkingConfig,
  linksPerParagraph: Map<number, number>
): LinkInsertion | null {
  // Build regex for matching
  const pattern = buildAnchorPattern(anchor, config);

  for (const paragraph of paragraphs) {
    // Check if paragraph already has max links
    if (config.placementPolicy.oneLinkPerParagraph) {
      const currentLinks = linksPerParagraph.get(paragraph.index) || 0;
      if (currentLinks >= 1) continue;
    }

    // Try to find match in text nodes
    for (const textNode of paragraph.textNodes) {
      // Reset regex lastIndex for global flag
      pattern.lastIndex = 0;
      const match = pattern.exec(textNode.text);

      if (match) {
        const matchText = match[0];
        const matchStart = match.index;
        const position = textNode.startIndex + matchStart;

        return {
          position,
          length: matchText.length,
          href: url,
          text: matchText,
        };
      }
    }
  }

  return null;
}

/**
 * Build regex pattern for anchor matching
 */
function buildAnchorPattern(anchor: string, config: InternalLinkingConfig): RegExp {
  // Escape special regex characters
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let pattern: string;

  if (config.anchorPolicy.match === 'wholeWord') {
    // Match whole words only with word boundaries
    pattern = `\\b${escaped}\\b`;
  } else {
    // Match as phrase with word boundaries
    pattern = `\\b${escaped}\\b`;
  }

  const flags = config.anchorPolicy.caseSensitive ? 'g' : 'gi';

  return new RegExp(pattern, flags);
}

/**
 * Export for use in Astro components
 */
export { defaultConfig } from './config';
export type { InternalLinkingConfig } from './config';
export type { PageContext } from './targetResolver';
