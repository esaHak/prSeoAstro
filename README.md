# Programmatic SEO with Astro

A production-ready Astro project for programmatic SEO using a **pseudo-relational database** structure with automated internal linking. Generate hundreds or thousands of SEO-optimized pages from JSON data.

## ✨ Features

- 🗄️ **Pseudo-Relational Database** - Categories and subcategories with cross-references
- 🔗 **Automated Internal Linking** - Smart contextual links based on semantic relationships
- 🎯 **Hierarchy-Aware** - Excludes parent/child links, includes cross-category relations
- 📊 **Unlimited Depth** - Support for 2, 3, 4+ level hierarchies
- ⚡ **Static Generation** - All pages pre-rendered for maximum performance
- 🚀 **Cloudflare Pages Ready** - Deploy to Cloudflare Pages or GitHub Pages
- 🔍 **SEO Optimized** - Clean URLs, meta tags, breadcrumbs, internal linking

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd prSeoAstro
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:4321`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
├── src/
│   ├── data/
│   │   ├── categories.json         # Top-level categories
│   │   ├── subcategories.json      # All subcategories (2nd, 3rd+ levels)
│   │   └── anchors.json             # Synonyms for internal linking
│   ├── layouts/
│   │   └── BaseLayout.astro         # HTML wrapper
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   └── [...slug]/
│   │       └── index.astro          # Dynamic page template
│   └── utils/
│       ├── db.ts                    # Database query utilities
│       └── internalLinking/         # Internal linking engine
├── public/
│   ├── .nojekyll                    # Disable Jekyll on GitHub Pages
│   └── robots.txt
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions deployment
└── wrangler.toml                    # Cloudflare Pages config
```

## 📚 Documentation

- **[CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md)** - 📝 **START HERE!** Complete guide to adding and managing content
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Technical details of the relational database
- **[INTERNAL_LINKING.md](./INTERNAL_LINKING.md)** - How automated internal linking works

## 🎯 How It Works

### 1. Relational Database Structure

Content is organized in **three JSON files** that work together:

**`src/data/categories.json`** (Level 1):
```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "Customer Relationship Management software...",
  "subcategoryIds": ["crm-for-startups", "crm-for-small-businesses"]
}
```

**`src/data/subcategories.json`** (Levels 2, 3, 4...):
```json
{
  "id": "crm-for-startups",
  "slug": "crm-for-startups",
  "title": "CRM for Startups",
  "description": "CRM solutions for early-stage companies.",
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management", "email-marketing"],
  "childSubcategoryIds": ["free-crm-for-startups"]
}
```

**Key concept:** `relatedCategoryIds` creates **semantic cross-references** between different category trees.

### 2. Automated Internal Linking

The system **automatically inserts links** in paragraph content based on semantic relationships:

**Input text:**
```
Many startups integrate their CRM with project management tools
and email marketing platforms.
```

**Output:**
```html
Many startups integrate their CRM with <a href="/project-management/">project management tools</a>
and <a href="/email-marketing/">email marketing platforms</a>.
```

**Rules:**
- ✅ Links to entities in `relatedCategoryIds` (cross-category relations)
- ❌ Never links to parent, children, siblings, or ancestors (already in navigation)
- ✅ Only links in `<p>` paragraphs (never in headings, lists, nav)
- ✅ Respects link density (1 link per 100 words, max 5 per page)

### 3. URL Generation

URLs are built automatically from the hierarchy:

```
/crm-software/                                           (Level 1)
/crm-software/crm-for-startups/                         (Level 2)
/crm-software/crm-for-startups/free-crm-for-startups/  (Level 3)
```

## 📝 Adding Content

### Quick Example

**1. Add a category** in `src/data/categories.json`:
```json
{
  "id": "analytics-software",
  "slug": "analytics-software",
  "title": "Analytics Software",
  "description": "Analytics and data visualization tools.",
  "subcategoryIds": ["web-analytics"]
}
```

**2. Add a subcategory** in `src/data/subcategories.json`:
```json
{
  "id": "web-analytics",
  "slug": "web-analytics",
  "title": "Web Analytics",
  "description": "Track website traffic and user behavior.",
  "parentCategoryId": "analytics-software",
  "relatedCategoryIds": ["crm-software", "email-marketing"],
  "childSubcategoryIds": []
}
```

**3. Add synonyms** in `src/data/anchors.json`:
```json
{
  "web-analytics": [
    "web analytics tools",
    "website analytics",
    "web analytics platforms"
  ]
}
```

**4. Build:**
```bash
npm run build
```

✅ Pages automatically generated at:
- `/analytics-software/`
- `/analytics-software/web-analytics/`

📖 **See [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) for complete instructions.**

## 🚀 Deployment

### Option 1: Cloudflare Pages

1. **Connect repository** to Cloudflare Pages
2. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Deploy:** Automatic on push to `main`

### Option 2: GitHub Pages

1. **Update `astro.config.mjs`:**
   ```js
   site: 'https://your-username.github.io',
   base: '/your-repo-name',
   ```

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: **GitHub Actions**

3. **Push to main** - Deploys automatically via GitHub Actions

## 🔧 Configuration

### Internal Linking Config

Edit `src/utils/internalLinking/config.ts`:

```typescript
export const defaultConfig = {
  enabled: true,
  maxLinksPerPage: 5,
  linksPerWords: 100,  // 1 link per 100 words
  minWordsBeforeLinking: 80,
  // ... more options
};
```

See [INTERNAL_LINKING.md](./INTERNAL_LINKING.md) for all options.

## 🧪 Testing

### Test Internal Linking

```bash
npx tsx src/utils/internalLinking/test-final.ts
```

### Validate Build

```bash
npm run build  # Will fail if there are broken references
```

## 📊 Example Use Cases

- **SaaS Directory** - Categories by industry, features, pricing
- **Tool Comparisons** - "CRM for Startups", "CRM for Enterprises"
- **Location Pages** - State → City → Neighborhood
- **Product Categories** - Department → Category → Subcategory
- **Knowledge Base** - Topic → Subtopic → Article

## 🎨 SEO Features

- ✅ Clean, hierarchical URLs
- ✅ Semantic HTML structure
- ✅ Meta descriptions from database
- ✅ Automatic breadcrumbs
- ✅ Contextual internal linking
- ✅ robots.txt included
- ✅ Sitemap auto-generated by Astro
- ✅ Static HTML (fast, crawlable)

## 📈 Scaling

For large-scale programmatic SEO:

1. **Content at Scale:**
   - Add `content` field to subcategories.json
   - Use AI-generated content
   - Create content templates with variables

2. **Performance:**
   - Pages build in ~10-30ms each
   - Cloudflare Pages handles thousands of pages
   - Zero runtime overhead (all build-time)

3. **Management:**
   - Separate content from structure
   - Use CMS for non-technical editors
   - Automate synonym generation

## 🛠️ Tech Stack

- **[Astro](https://astro.build)** - Static site generator
- **TypeScript** - Type-safe database queries
- **Custom HTML Parser** - Safe link insertion
- **Cloudflare Pages / GitHub Pages** - Hosting

## 📖 Database API

Query utilities in `src/utils/db.ts`:

```typescript
import { DB } from './utils/db';

// Get all categories
const categories = DB.getAllCategories();

// Get subcategories for a category
const subs = DB.getSubcategoriesByCategory('crm-software');

// Get related categories
const related = DB.getRelatedCategories(subcategory);

// Build full URL path
const path = DB.getFullPath(subcategory);
// Returns: "crm-software/crm-for-startups/free-crm-for-startups"

// Get breadcrumbs
const breadcrumbs = DB.getBreadcrumbs(subcategory);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run build`
5. Submit a pull request

## 📄 License

MIT

## 🆘 Support

- Check [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) for content questions
- Check [INTERNAL_LINKING.md](./INTERNAL_LINKING.md) for linking issues
- Check [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) for technical details
- Open an issue on GitHub

---

**Ready to get started?** Read [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) to add your first content! 🚀
