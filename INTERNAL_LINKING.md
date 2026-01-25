# Automated Internal Linking

This document explains the automated internal linking system for programmatic SEO. The system automatically inserts contextual internal links within paragraph (`<p>`) content while respecting hierarchical relationships and link density limits.

## Features

✅ **Smart Link Insertion** - Only links within `<p>` paragraph content, never in headings, lists, nav, or other elements
✅ **Hierarchy-Aware** - Excludes parent/child/ancestor/descendant relationships by default
✅ **Cross-Database Relations** - Links to semantically related categories via `relatedCategoryIds`
✅ **Configurable Density** - Control max links per page and per word count
✅ **Synonym Support** - Use custom anchor text phrases beyond just titles
✅ **Safe HTML Parsing** - Never breaks existing links or HTML structure
✅ **Deterministic** - Consistent results across builds

## How It Works

### 1. Eligible Link Targets

For each page, the system determines eligible link targets based on database relations:

**EXCLUDED by default:**
- Self (current page)
- Parent category/subcategory
- Child subcategories
- Ancestors (grandparent, great-grandparent, etc.)
- Descendants (grandchildren, great-grandchildren, etc.)
- Siblings (same parent)

**INCLUDED by default:**
- Related categories (via `relatedCategoryIds`)
- Cross-database semantic connections

**Example:**

```json
// CRM for Startups page (subcategory)
{
  "id": "crm-for-startups",
  "parentCategoryId": "crm-software",  // ❌ Won't link to parent
  "childSubcategoryIds": [...],         // ❌ Won't link to children
  "relatedCategoryIds": [
    "project-management",                // ✅ WILL link here!
    "email-marketing"                    // ✅ WILL link here!
  ]
}
```

### 2. Anchor Text Matching

The system tries to match anchor phrases in paragraph text:

**Sources:**
1. Entity title (e.g., "Project Management")
2. Synonyms from `src/data/anchors.json`

**Example anchors.json:**
```json
{
  "project-management": [
    "project management software",
    "project management tools",
    "project management",
    "PM tools"
  ]
}
```

**Matching rules:**
- Case-insensitive by default
- Whole-word/phrase boundaries (no partial matches)
- Longest anchors tried first (prevents overlaps)
- Each anchor used only once per page (deduplication)

### 3. Link Density Controls

**Max links per page:** `defaultConfig.maxLinksPerPage` (default: 5)

**Words-based limit:** `defaultConfig.linksPerWords` (default: 100)
- Formula: `Math.min(maxLinksPerPage, Math.floor(totalWords / linksPerWords))`
- Example: 250-word page → max 2 links (250/100 = 2.5, floored to 2)

**Minimum content threshold:** `defaultConfig.minWordsBeforeLinking` (default: 80)
- Pages with fewer words get NO automatic links

## Configuration

Edit `src/utils/internalLinking/config.ts`:

```typescript
export const defaultConfig: InternalLinkingConfig = {
  enabled: true,  // Toggle feature on/off

  // Density controls
  maxLinksPerPage: 5,
  linksPerWords: 100,  // 1 link per 100 words
  minWordsBeforeLinking: 80,

  // Deduplication
  dedupeAnchors: true,      // Don't link same anchor twice
  allowSelfLink: false,      // Never link to current page

  // Relation policy
  relationPolicy: {
    excludeHierarchyByDefault: true,
    includeRelations: ['relatedCategoryIds'],
    excludeRelations: ['parent', 'child', 'ancestor', 'descendant'],
  },

  // Anchor policy
  anchorPolicy: {
    source: 'both',  // Use both titles and synonyms
    synonymsFile: 'src/data/anchors.json',
    maxAnchorsPerTarget: 3,
    match: 'phrase',
    caseSensitive: false,
  },

  // Target policy
  targetPolicy: {
    preferSubcategoryOverCategory: true,
    disallowTargets: [],  // Manually exclude specific IDs
  },

  // Placement policy
  placementPolicy: {
    oneLinkPerParagraph: false,
    skipFirstParagraph: false,
    minParagraphWords: 15,
  },
};
```

## Adding Synonyms

Edit `src/data/anchors.json`:

```json
{
  "entity-id": [
    "primary anchor phrase",
    "alternative phrase",
    "another synonym"
  ]
}
```

**Best practices:**
- Put longer phrases first (they match before shorter ones)
- Include natural variations users might search for
- Don't stuff keywords - use natural language
- Limit to 3-5 anchors per entity

## Usage in Astro Pages

The system is already integrated in `/src/pages/[...slug]/index.astro`:

```astro
---
import { addInternalLinks, defaultConfig } from '../../utils/internalLinking';
import type { PageContext } from '../../utils/internalLinking/targetResolver';

// Build page context
const linkContext: PageContext = {
  type: type,  // 'category' or 'subcategory'
  entity: data,
  id: data.id,
  slug: data.slug,
};

// Helper to process HTML with internal links
function processWithLinks(htmlContent: string): string {
  const result = addInternalLinks(htmlContent, linkContext, defaultConfig);
  return result.html;
}
---

<!-- Use in template -->
<section>
  <h2>Overview</h2>
  <Fragment set:html={processWithLinks(`
    <p>Your paragraph content here...</p>
  `)} />
</section>
```

## Testing

### Manual Test

```bash
npx tsx src/utils/internalLinking/test4.ts
```

### Check Built Pages

```bash
npm run build
cat dist/crm-software/crm-for-startups/index.html | grep -o '<a href[^>]*>[^<]*</a>'
```

## Troubleshooting

### No Links Appearing

**Check 1: Word count**
```bash
# Your content must have at least minWordsBeforeLinking words (default: 80)
```

**Check 2: Eligible targets**
```bash
# Make sure the page has relatedCategoryIds in the database
cat src/data/subcategories.json | grep -A5 "your-page-id"
```

**Check 3: Anchor matches**
```bash
# Your paragraph text must contain an anchor phrase
# Check src/data/anchors.json for available anchors
```

**Check 4: Link density**
```bash
# With linksPerWords: 100, a 150-word page gets max 1 link
# Increase content or adjust config
```

### Links in Wrong Places

**Problem:** Links appearing in headings or lists

**Solution:** This shouldn't happen. The system only processes `<p>` tags. If you see this, please file a bug report.

### Too Many/Few Links

**Solution:** Adjust `maxLinksPerPage` and `linksPerWords` in config.

## Architecture

```
src/utils/internalLinking/
├── index.ts           # Main linking engine
├── config.ts          # Configuration & types
├── htmlParser.ts      # Safe HTML parsing (no DOM dependencies)
├── targetResolver.ts  # DB-based target resolution
└── synonymLoader.ts   # Load synonyms at build time

src/data/
└── anchors.json      # Synonym/anchor definitions

src/pages/[...slug]/index.astro  # Integration point
```

## Performance

- **Build time:** Adds ~10-30ms per page (negligible)
- **Runtime:** Zero - all processing happens at build time
- **Cloudflare Pages:** Fully compatible (no Node.js dependencies)

## SEO Best Practices

✅ **Do:**
- Use natural, contextual anchor text
- Link to genuinely related content
- Keep link density reasonable (1-5 per page)
- Add synonyms that users actually search for

❌ **Don't:**
- Keyword stuff anchor text
- Link to unrelated pages
- Over-optimize (too many links)
- Use exact-match anchors repeatedly

## Example Output

**Before:**
```html
<p>Modern businesses benefit from project management tools and email marketing platforms.</p>
```

**After:**
```html
<p>Modern businesses benefit from <a href="/project-management/">project management tools</a> and <a href="/email-marketing/">email marketing platforms</a>.</p>
```

## Disabling Per-Page

To disable internal linking for specific pages, pass a custom config:

```astro
---
const customConfig = {
  ...defaultConfig,
  enabled: false,  // Disable for this page
};

function processWithLinks(htmlContent: string): string {
  const result = addInternalLinks(htmlContent, linkContext, customConfig);
  return result.html;
}
---
```

## Future Enhancements

Potential improvements:
- [ ] Machine learning for anchor selection
- [ ] A/B testing different anchor strategies
- [ ] Analytics integration to track link performance
- [ ] Visual preview in development mode
- [ ] Automatic synonym generation from content

## Support

For issues or questions:
1. Check this documentation
2. Review `src/utils/internalLinking/config.ts`
3. Test with `src/utils/internalLinking/test4.ts`
4. Check GitHub issues
