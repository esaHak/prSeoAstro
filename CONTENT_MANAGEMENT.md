# Content Management Guide

This guide explains how to create, manage, and organize content in your programmatic SEO site.

## 📁 Content Structure Overview

Your content is managed through **three JSON files** that work together:

```
src/data/
├── categories.json       # Top-level categories (Level 1)
├── subcategories.json    # All deeper levels (Level 2, 3, 4...)
└── anchors.json          # Synonyms for internal linking
```

## 🎯 Quick Start: Adding New Content

### Step 1: Add a Top-Level Category

Edit `src/data/categories.json`:

```json
{
  "id": "analytics-software",
  "slug": "analytics-software",
  "title": "Analytics Software",
  "description": "Analytics and data visualization tools for business intelligence.",
  "subcategoryIds": ["web-analytics", "mobile-analytics", "analytics-reporting"]
}
```

**Field Guide:**
- `id`: Unique identifier (use kebab-case)
- `slug`: URL segment (appears in `/analytics-software/`)
- `title`: Display name (shown on page)
- `description`: Short description (used for meta tags and intro)
- `subcategoryIds`: Array of subcategory IDs that belong to this category

### Step 2: Add Subcategories

Edit `src/data/subcategories.json`:

```json
{
  "id": "web-analytics",
  "slug": "web-analytics",
  "title": "Web Analytics",
  "description": "Track and analyze website traffic and user behavior.",
  "parentCategoryId": "analytics-software",
  "relatedCategoryIds": ["crm-software", "email-marketing"],
  "childSubcategoryIds": ["google-analytics-alternatives", "privacy-focused-analytics"]
}
```

**Field Guide:**
- `id`: Unique identifier
- `slug`: URL segment (combined with parent: `/analytics-software/web-analytics/`)
- `title`: Display name
- `description`: Short description
- `parentCategoryId`: ID of parent (can be category or subcategory)
- `relatedCategoryIds`: **IMPORTANT!** Cross-references for internal linking
- `childSubcategoryIds`: IDs of child subcategories (for deeper hierarchy)

### Step 3: Add Synonyms for Internal Linking

Edit `src/data/anchors.json`:

```json
{
  "analytics-software": [
    "analytics software",
    "business analytics tools",
    "data analytics platforms",
    "analytics solutions"
  ],
  "web-analytics": [
    "web analytics tools",
    "website analytics",
    "web analytics platforms",
    "site analytics"
  ]
}
```

**Tips:**
- Put longer phrases first (matched before shorter ones)
- Include natural variations users might search for
- Limit to 3-5 phrases per entity
- Use lowercase for consistency

### Step 4: Build and Deploy

```bash
npm run build
```

✅ **Pages automatically generated!**
- `/analytics-software/` (category page)
- `/analytics-software/web-analytics/` (subcategory page)
- `/analytics-software/web-analytics/google-analytics-alternatives/` (deeper level)

## 📊 How the Database Works

### Hierarchical Structure

Your content forms a **tree structure** with unlimited depth:

```
Category (Level 1)
└── Subcategory (Level 2)
    └── Sub-subcategory (Level 3)
        └── Sub-sub-subcategory (Level 4)
            └── ... unlimited depth
```

**Example:**
```
CRM Software (category)
├── CRM for Startups (subcategory)
│   ├── Free CRM for Startups (sub-subcategory)
│   └── CRM with Funding Tracking (sub-subcategory)
├── CRM for Small Businesses (subcategory)
│   └── Affordable CRM for Small Businesses (sub-subcategory)
└── CRM for Enterprises (subcategory)
```

### Cross-Database Relations

The **magic** happens with `relatedCategoryIds`:

```json
{
  "id": "crm-for-startups",
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management", "email-marketing"]
}
```

This creates **semantic connections** across different category trees:
- CRM for Startups → Project Management
- CRM for Startups → Email Marketing

These relations power the **automated internal linking system**.

## 🔗 Internal Linking System

### How It Works

When you mention a related category in your page content, it **automatically becomes a link**:

**Text input:**
```
"Many startups integrate their CRM with project management tools and
email marketing platforms for better workflow."
```

**Rendered output:**
```html
Many startups integrate their CRM with <a href="/project-management/">project management tools</a> and
<a href="/email-marketing/">email marketing platforms</a> for better workflow.
```

### Rules for Internal Links

✅ **WILL link to:**
- Entities in `relatedCategoryIds`
- Cross-database semantic connections

❌ **WON'T link to:**
- Parent category (already in breadcrumbs)
- Child subcategories (already in listings)
- Siblings (same parent)
- Ancestors/descendants (in same tree)
- Current page (self)

### Setting Up Relations

**Strategy:** Think about what tools/topics users explore together.

**Example: CRM for Startups**
```json
{
  "id": "crm-for-startups",
  "relatedCategoryIds": [
    "project-management",      // Startups need both CRM and PM
    "email-marketing",          // CRM integrates with email
    "startup-analytics",        // Track growth metrics
    "team-collaboration-tools"  // Startups need collaboration
  ]
}
```

**Example: Email Marketing**
```json
{
  "id": "email-marketing",
  "relatedCategoryIds": [
    "crm-software",            // Email integrates with CRM
    "marketing-automation",    // Related marketing tool
    "analytics-software"       // Track email performance
  ]
}
```

## 📝 Content Guidelines

### Current System: Template-Based

Currently, page content is **generated from templates** using the page title and description:

**Location:** `src/pages/[...slug]/index.astro`

**Example sections:**
1. **Overview** - Introduces the topic
2. **Key Features** - Bullet points
3. **Why Choose** - Detailed explanation

**Variables available:**
- `${title}` - Page title
- `${description}` - Page description
- `${title.toLowerCase()}` - Lowercase version

### Upgrading to Custom Content Per Page

For unique content on each page, you can add a `content` field to your entities.

#### Option A: Add Content to subcategories.json

```json
{
  "id": "crm-for-startups",
  "slug": "crm-for-startups",
  "title": "CRM for Startups",
  "description": "CRM solutions designed for early-stage companies.",
  "content": {
    "overview": [
      "Choosing the right CRM is crucial for startup success. As your business grows, managing customer relationships becomes complex. The best CRM platforms offer intuitive interfaces and seamless integrations with project management tools.",
      "Early-stage companies need affordable, scalable solutions. Look for platforms with free tiers or startup pricing, along with features that won't limit your growth."
    ],
    "whyChoose": [
      "The right CRM depends on your team size and growth trajectory. Whether using project management software or email marketing platforms, your CRM should be the central hub for customer data.",
      "Modern CRM systems integrate with hundreds of tools, enabling seamless data flow and reducing manual work."
    ]
  },
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management", "email-marketing"],
  "childSubcategoryIds": []
}
```

#### Option B: Separate Content Library

Create `src/data/content-library.json`:

```json
{
  "crm-for-startups": {
    "overview": ["Paragraph 1...", "Paragraph 2..."],
    "whyChoose": ["Paragraph 1...", "Paragraph 2..."],
    "keyFeatures": ["Feature 1...", "Feature 2..."]
  },
  "email-marketing": {
    "overview": ["Paragraph 1...", "Paragraph 2..."],
    "whyChoose": ["Paragraph 1...", "Paragraph 2..."]
  }
}
```

**Recommendation:** Use **Option A** (content in subcategories.json) for simplicity.

## 🎨 Content Best Practices

### 1. Write for Internal Linking

**Good example:**
```
"Modern businesses benefit from project management tools to organize
tasks and email marketing platforms to engage customers."
```

This naturally mentions related topics that will auto-link.

**Bad example:**
```
"Modern businesses need good software solutions."
```

Too generic - no linkable phrases.

### 2. Use Natural Anchor Phrases

In `anchors.json`, include variations users actually search for:

```json
{
  "crm-software": [
    "CRM software",          // Exact match
    "CRM platforms",         // Common variation
    "customer relationship management software",  // Full phrase
    "CRM solutions",         // Alternative
    "CRM systems"            // Another variation
  ]
}
```

### 3. Add Enough Content

For internal linking to work:
- **Minimum:** 80 words per page
- **Optimal:** 150-300 words per page
- **Formula:** 1 link per 100 words

Example:
- 150 words → max 1 link
- 250 words → max 2 links
- 350 words → max 3 links

### 4. Strategic Relations

Add `relatedCategoryIds` thoughtfully:

**Ask yourself:**
- Would a user interested in Topic A also want to learn about Topic B?
- Do these tools integrate together?
- Are they commonly used in the same workflow?

**Example mapping:**
```
CRM Software → Project Management (teams use both)
CRM Software → Email Marketing (integration common)
Email Marketing → Analytics (track campaign performance)
Project Management → Team Collaboration (related workflow)
```

## 🔧 Technical Details

### URL Generation

URLs are built automatically from the hierarchy:

```
Category:           /crm-software/
Subcategory:        /crm-software/crm-for-startups/
Sub-subcategory:    /crm-software/crm-for-startups/free-crm-for-startups/
```

### Breadcrumbs

Generated automatically from the path:
```
Home → CRM Software → CRM for Startups → Free CRM for Startups
```

### Dynamic Listings

Child items are listed automatically on parent pages:
```
CRM Software page shows:
  - CRM for Startups
  - CRM for Small Businesses
  - CRM for Enterprises
```

### Related Topics Section

Items from `relatedCategoryIds` appear in a special section:
```
Related Topics:
  - Project Management
  - Email Marketing
```

## 📋 Common Workflows

### Adding a New Category Tree

1. Add category to `categories.json`
2. Add 2-3 subcategories to `subcategories.json`
3. Link to related categories in `relatedCategoryIds`
4. Add synonyms to `anchors.json`
5. Build and test

### Expanding Existing Categories

1. Find parent category/subcategory ID
2. Add new subcategory with `parentCategoryId` = parent's ID
3. Add parent's ID to `subcategoryIds` or `childSubcategoryIds`
4. Add synonyms to `anchors.json`
5. Build and test

### Creating Deep Hierarchies (4+ levels)

```json
{
  "id": "advanced-crm-features",
  "parentCategoryId": "free-crm-for-startups",  // Parent is Level 3
  "relatedCategoryIds": ["automation-tools"],
  "childSubcategoryIds": []
}
```

URL: `/crm-software/crm-for-startups/free-crm-for-startups/advanced-crm-features/`

### Adding Cross-References

To link "CRM for Startups" with "Email Marketing":

**In `subcategories.json`:**
```json
{
  "id": "crm-for-startups",
  "relatedCategoryIds": ["email-marketing"]  // Add this
}
```

Now mentions of "email marketing" on the CRM page will auto-link!

## ✅ Validation Checklist

Before building, verify:

- [ ] All IDs are unique across both files
- [ ] Every `subcategoryIds` entry exists in `subcategories.json`
- [ ] Every `parentCategoryId` exists (in either file)
- [ ] Every `relatedCategoryIds` entry exists
- [ ] All `childSubcategoryIds` entries exist
- [ ] Slugs are URL-friendly (lowercase, hyphens only)
- [ ] No circular references (A→B→A)

**Quick validation:**
```bash
npm run build  # Will fail if there are broken references
```

## 🚀 Scaling to 100s-1000s of Pages

For large-scale programmatic SEO:

1. **Use AI-generated content** stored in the JSON
2. **Create templates** with variables: `${title}`, `${category}`, `${industry}`
3. **Separate concerns**:
   - Structure: `categories.json`, `subcategories.json`
   - Content: `content-library.json`
   - Relations: Computed or stored separately
4. **Automate synonym generation** from content analysis
5. **Consider a CMS** for non-technical content editors

## 📚 Examples

### Example 1: SaaS Tools Directory

```json
// categories.json
{
  "id": "marketing-tools",
  "subcategoryIds": ["seo-tools", "social-media-tools", "email-marketing"]
}

// subcategories.json
{
  "id": "seo-tools",
  "parentCategoryId": "marketing-tools",
  "relatedCategoryIds": ["analytics-software", "content-management"],
  "childSubcategoryIds": ["keyword-research", "backlink-analysis"]
}

// anchors.json
{
  "seo-tools": [
    "SEO tools",
    "search engine optimization tools",
    "SEO software",
    "SEO platforms"
  ]
}
```

### Example 2: Industry-Specific Categories

```json
// categories.json
{
  "id": "healthcare-software",
  "subcategoryIds": ["ehr-systems", "medical-billing", "telehealth"]
}

// subcategories.json
{
  "id": "ehr-systems",
  "parentCategoryId": "healthcare-software",
  "relatedCategoryIds": ["practice-management", "patient-engagement"],
  "childSubcategoryIds": ["cloud-ehr", "on-premise-ehr"]
}
```

## 🆘 Troubleshooting

### Pages Not Generating

**Check:**
1. ID exists in parent's `subcategoryIds` or `childSubcategoryIds`
2. `parentCategoryId` points to existing entity
3. JSON is valid (no trailing commas, quotes matched)

### Internal Links Not Appearing

**Check:**
1. Page has 80+ words of content
2. Related entity is in `relatedCategoryIds`
3. Anchor phrase exists in `anchors.json`
4. Anchor phrase appears in paragraph text (not headings/lists)

### Broken References

**Fix:**
```bash
# Run build to see errors
npm run build

# Common issues:
# - Typo in ID reference
# - Missing entity definition
# - Wrong file (category vs subcategory)
```

## 📖 Related Documentation

- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - Technical database details
- [INTERNAL_LINKING.md](./INTERNAL_LINKING.md) - Internal linking system
- [README.md](./README.md) - Project overview

## 💡 Tips for Success

1. **Start small** - Begin with 3-5 categories, expand gradually
2. **Think semantically** - Group related topics together
3. **Use relations wisely** - Connect topics users explore together
4. **Write naturally** - Mention related topics in content for auto-linking
5. **Test frequently** - Build after each major change
6. **Keep it organized** - Use consistent naming conventions

---

**Ready to add content?** Start with Step 1 above! 🚀
