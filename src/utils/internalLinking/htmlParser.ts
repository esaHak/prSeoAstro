/**
 * Lightweight HTML parser for internal linking
 * Safe for Cloudflare Pages (no DOM dependencies)
 */

export interface TextNode {
  text: string;
  startIndex: number;
  endIndex: number;
  paragraphIndex: number;
}

export interface Paragraph {
  fullHtml: string;
  textNodes: TextNode[];
  startIndex: number;
  endIndex: number;
  index: number;
}

/**
 * Tags where we should NOT insert links
 */
const EXCLUDED_TAGS = new Set([
  'a', 'code', 'pre', 'kbd', 'samp', 'script', 'style',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'button', 'nav', 'header', 'footer'
]);

/**
 * Extract all <p> paragraphs from HTML and their text nodes
 * Returns paragraphs with safe text node positions for link insertion
 */
export function extractParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Find all <p> tags
  const pTagRegex = /<p(\s[^>]*)?>[\s\S]*?<\/p>/gi;
  let match;
  let paragraphIndex = 0;

  while ((match = pTagRegex.exec(html)) !== null) {
    const fullHtml = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + fullHtml.length;

    // Extract text nodes within this paragraph
    const textNodes = extractTextNodesFromParagraph(fullHtml, startIndex, paragraphIndex);

    paragraphs.push({
      fullHtml,
      textNodes,
      startIndex,
      endIndex,
      index: paragraphIndex,
    });

    paragraphIndex++;
  }

  return paragraphs;
}

/**
 * Extract safe text nodes from a paragraph HTML
 * Skips text inside excluded tags (a, code, etc.)
 */
function extractTextNodesFromParagraph(
  paragraphHtml: string,
  paragraphStartIndex: number,
  paragraphIndex: number
): TextNode[] {
  const textNodes: TextNode[] = [];

  // Remove opening <p> tag
  const content = paragraphHtml.replace(/^<p(\s[^>]*)?>/, '').replace(/<\/p>$/, '');
  const openTagLength = paragraphHtml.length - content.length - 4; // minus </p>

  // Track positions of excluded regions (inside <a>, <code>, etc.)
  const excludedRegions = findExcludedRegions(content);

  // Split by tags to get text segments
  const parts = content.split(/(<[^>]+>)/);
  let currentPos = 0;
  let insideExcludedTag = false;
  const tagStack: string[] = [];

  for (const part of parts) {
    if (part.startsWith('<')) {
      // It's a tag
      const tagMatch = part.match(/^<\/?(\w+)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();

        if (part.startsWith('</')) {
          // Closing tag
          if (tagStack[tagStack.length - 1] === tagName) {
            tagStack.pop();
          }
        } else if (!part.endsWith('/>')) {
          // Opening tag (not self-closing)
          tagStack.push(tagName);
        }

        // Update excluded status
        insideExcludedTag = tagStack.some(tag => EXCLUDED_TAGS.has(tag));
      }
    } else if (part.length > 0 && !insideExcludedTag) {
      // It's text content and we're not inside an excluded tag
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        // Find actual position of this text in content
        const textStartInContent = content.indexOf(part, currentPos);
        if (textStartInContent !== -1) {
          textNodes.push({
            text: part,
            startIndex: paragraphStartIndex + openTagLength + textStartInContent,
            endIndex: paragraphStartIndex + openTagLength + textStartInContent + part.length,
            paragraphIndex,
          });
        }
      }
    }

    currentPos += part.length;
  }

  return textNodes;
}

/**
 * Find regions inside excluded tags
 */
function findExcludedRegions(html: string): Array<{ start: number; end: number }> {
  const regions: Array<{ start: number; end: number }> = [];

  for (const tag of EXCLUDED_TAGS) {
    const regex = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    let match;

    while ((match = regex.exec(html)) !== null) {
      regions.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort and merge overlapping regions
  regions.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];

  for (const region of regions) {
    if (merged.length === 0 || merged[merged.length - 1].end < region.start) {
      merged.push(region);
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, region.end);
    }
  }

  return merged;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Check if a position is inside an excluded region
 */
export function isInExcludedRegion(
  position: number,
  regions: Array<{ start: number; end: number }>
): boolean {
  return regions.some(r => position >= r.start && position < r.end);
}

/**
 * Apply link insertions to HTML
 * Takes original HTML and sorted insertions, returns modified HTML
 */
export interface LinkInsertion {
  position: number; // position in original HTML
  length: number; // length of text to replace
  href: string;
  text: string; // original text (anchor text)
}

export function applyLinkInsertions(html: string, insertions: LinkInsertion[]): string {
  // Sort insertions by position (descending) to avoid offset issues
  const sorted = [...insertions].sort((a, b) => b.position - a.position);

  let result = html;

  for (const insertion of sorted) {
    const before = result.substring(0, insertion.position);
    const after = result.substring(insertion.position + insertion.length);
    const link = `<a href="${escapeHtml(insertion.href)}">${escapeHtml(insertion.text)}</a>`;

    result = before + link + after;
  }

  return result;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
