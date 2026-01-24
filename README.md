# Programmatic SEO with Astro

A minimal Astro project demonstrating programmatic SEO using a pillar → cluster page structure. This project generates static HTML pages from JSON data and deploys to GitHub Pages.

## What This Project Does

This project demonstrates:

- **Pillar pages**: Topic overview pages (e.g., "CRM Software")
- **Cluster pages**: Specific subtopic pages (e.g., "CRM for Startups")
- **Internal linking**: Homepage → pillars → clusters
- **Static generation**: All pages are pre-rendered HTML
- **GitHub Pages deployment**: Automated deployment via GitHub Actions

## Project Structure

```
├── src/
│   ├── data/
│   │   └── content.json          # All content data
│   ├── layouts/
│   │   └── BaseLayout.astro      # HTML wrapper for all pages
│   └── pages/
│       ├── index.astro            # Homepage
│       └── [...slug]/
│           └── index.astro        # Recursive page template (handles all depths)
├── public/
│   └── robots.txt                 # Search engine instructions
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Pages deployment
├── astro.config.mjs               # Astro configuration
└── package.json                   # Dependencies and scripts
```

## How the Pages Are Generated

1. Astro reads `src/data/content.json`
2. A recursive function walks through all items and their nested clusters
3. For each item at any depth, a page is created:
   - First level: `/[pillar]/`
   - Second level: `/[pillar]/[cluster]/`
   - Third level: `/[pillar]/[cluster]/[sub-cluster]/`
   - And so on, indefinitely
4. All pages are linked together via breadcrumbs and child cluster lists

## Running Locally

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:4321`

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## Deploying to GitHub Pages

### Initial Setup

1. Create a new GitHub repository

2. Update `astro.config.mjs`:
   ```js
   site: 'https://your-username.github.io',
   base: '/your-repo-name',
   ```

3. Update `public/robots.txt`:
   ```
   Sitemap: https://your-username.github.io/your-repo-name/sitemap-index.xml
   ```

4. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

5. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Under "Build and deployment":
     - Source: **GitHub Actions**

6. The GitHub Action will run automatically on push to `main` and deploy your site

7. Visit your site at:
   ```
   https://your-username.github.io/your-repo-name/
   ```

## Adding More Content

Edit `src/data/content.json` to add more pages at any depth. Clusters can be nested indefinitely:

```json
[
  {
    "slug": "new-pillar",
    "title": "New Pillar Topic",
    "description": "Description of the pillar topic.",
    "clusters": [
      {
        "slug": "cluster-one",
        "title": "Cluster One Title",
        "description": "Description of cluster one.",
        "clusters": [
          {
            "slug": "sub-cluster",
            "title": "Sub-Cluster Title",
            "description": "A nested page under cluster one."
          }
        ]
      },
      {
        "slug": "cluster-two",
        "title": "Cluster Two Title",
        "description": "Description of cluster two."
      }
    ]
  }
]
```

Then rebuild:
```bash
npm run build
```

## URL Structure

- Homepage: `/`
- First level: `/crm-software/`
- Second level: `/crm-software/crm-for-startups/`
- Third level: `/crm-software/crm-for-startups/free-crm-for-startups/`
- And so on, indefinitely

All URLs use trailing slashes for consistency.

## Internal Linking

- Homepage links to all top-level pages
- Each page (at any depth) links to:
  - All its child pages (if any)
  - Its parent page via breadcrumb navigation
  - Homepage via breadcrumb navigation

Anchor text is always the page title (e.g., "CRM Software", "CRM for Startups").

## SEO Features

- Clean URL structure
- Semantic HTML
- Meta descriptions on all pages
- robots.txt
- Automatic sitemap generation (by Astro)
- Static HTML (fast loading, easy to crawl)

## Scaling This Project

To scale this approach:

1. **More content**: Add more items to `content.json`
2. **Better styling**: Add CSS to `BaseLayout.astro` or create component-specific styles
3. **Rich content**: Add more fields to the JSON (e.g., `content`, `image`, `author`)
4. **Multiple data sources**: Split `content.json` into separate files per pillar
5. **Dynamic breadcrumbs**: Add breadcrumb navigation components
6. **Search**: Add client-side search using JSON data
7. **Analytics**: Add tracking scripts to `BaseLayout.astro`

## License

MIT
