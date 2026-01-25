# Image Library Documentation

## Overview

The Image Library system provides a scalable, database-driven approach to managing images for programmatic SEO. It supports self-hosted and third-party images with proper SEO meta tags and credit attribution.

## Image Types

### 1. OG Images (Open Graph)
- **Required** for all indexable pages
- Dimensions: 1200x630px (recommended)
- Used for social sharing (Facebook, Twitter, LinkedIn, etc.)
- Automatically falls back through: subcategory → category → global default

### 2. Hero Images
- **Optional** feature image shown at the top of pages
- Recommended dimensions: 1200x400px or wider
- Loaded with `loading="eager"` for above-the-fold placement

### 3. Inline Images
- **Optional** images within page content
- Various dimensions supported
- Loaded with `loading="lazy"` for performance

## Directory Structure

All self-hosted images must be placed in `/public/images/`:

```
public/images/
├── og/
│   ├── default-og.jpg                    # Required: global fallback (1200x630)
│   └── categories/
│       ├── crm-software.jpg
│       ├── email-marketing.jpg
│       └── project-management.jpg
├── hero/
│   └── categories/
│       └── crm-software.jpg
├── inline/
│   └── [various inline images]
└── subcategories/
    └── [subcategory-specific images]
```

## Adding Images

### Step 1: Add Image Record to `src/data/images.json`

```json
{
  "id": "unique-image-id",
  "kind": "og" | "hero" | "inline",
  "sourceType": "self" | "remote",
  "src": "/images/og/default-og.jpg",  // or full URL for remote
  "width": 1200,
  "height": 630,
  "alt": "Descriptive alt text for accessibility",
  "creditName": "Optional credit name",
  "creditUrl": "https://optional-credit-url.com",
  "license": "Optional license info"
}
```

**Field Guide:**
- `id`: Unique identifier to reference this image
- `kind`: Image type (og/hero/inline)
- `sourceType`:
  - `self`: Image hosted in `/public/images/`
  - `remote`: Third-party URL
- `src`:
  - Self-hosted: Must start with `/images/`
  - Remote: Must start with `http://` or `https://`
- `width`, `height`: Actual image dimensions (required)
- `alt`: Alt text for accessibility (required)
- `creditName`, `creditUrl`: Optional attribution (see below)
- `license`: Optional license information

### Step 2: Upload Image Files (Self-Hosted Only)

For self-hosted images (`sourceType: "self"`):

1. Place image in appropriate `/public/images/` subdirectory
2. Use consistent naming: `{category-slug}.jpg` or descriptive names
3. Optimize images before uploading:
   - OG images: 1200x630px, <200KB
   - Hero images: 1200x400px or wider, <300KB
   - Inline images: appropriate size, <150KB

### Step 3: Reference Images in Database

Add image ID fields to `src/data/categories.json` or `src/data/subcategories.json`:

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "...",
  "ogImageId": "crm-og",           // Required or uses fallback
  "heroImageId": "crm-hero",       // Optional
  "inlineImageIds": ["crm-inline-1", "crm-inline-2"]  // Optional
}
```

## Image Resolution & Fallback Chain

### OG Image Fallback

The system automatically resolves OG images with this fallback chain:

1. **Subcategory's ogImageId** (if present)
2. **Parent category's ogImageId** (if present)
3. **Global default** (`default-og`)

This ensures **every page always has an OG image** for social sharing.

**Example:**
```
Page: /crm-software/crm-for-startups/
1. Check: crm-for-startups.ogImageId → not set
2. Check: crm-software.ogImageId → "crm-og" ✓ Use this
```

### Hero & Inline Images

Hero and inline images are **optional** and have no fallback:
- If `heroImageId` is set, the hero image displays
- If not set, no hero image is shown

## Third-Party Images & Attribution

### Using Remote Images

For third-party/remote images:

```json
{
  "id": "example-remote",
  "kind": "inline",
  "sourceType": "remote",
  "src": "https://example.com/image.jpg",
  "width": 800,
  "height": 450,
  "alt": "Example image",
  "creditName": "Example.com",
  "creditUrl": "https://example.com",
  "license": "CC BY 2.0"
}
```

### Attribution Rules

When `creditUrl` is provided, the system automatically renders a credit link with:
- `rel="nofollow noopener noreferrer"` (SEO best practice)
- `target="_blank"` (opens in new tab)

**Rendered HTML:**
```html
<p class="image-credit">
  Image: <a href="https://example.com"
            rel="nofollow noopener noreferrer"
            target="_blank">Example.com</a> (CC BY 2.0)
</p>
```

**Important:** The `<img>` tag itself does NOT include `rel="nofollow"` - only the credit/source hyperlink does.

## Components

### SEO Component
Automatically included in `BaseLayout`. Generates:
- Open Graph meta tags (og:image, og:title, og:description, etc.)
- Twitter Card tags
- Standard meta tags

### HeroImage Component
```astro
<HeroImage image={heroImage} />
```
Renders hero image with:
- Proper dimensions (width/height)
- `loading="eager"` (above-the-fold)
- Optional credit link with nofollow

### InlineImage Component
```astro
<InlineImage image={inlineImage} align="center" />
```
Renders inline image with:
- Lazy loading (`loading="lazy"`)
- Async decoding
- Optional alignment (left/right/center)
- Optional credit link with nofollow

## Validation

The system automatically validates all images on build:

**Checks:**
- All required fields present
- Valid `kind` values (og/hero/inline)
- Valid `sourceType` values (self/remote)
- Self-hosted paths start with `/`
- Remote URLs start with `http://` or `https://`
- Valid dimensions (width/height > 0)
- `default-og` image exists (critical)
- No duplicate IDs

**Build fails if validation fails**, ensuring data integrity.

## SEO Benefits

✅ **Every page has OG image** - Required for social sharing
✅ **Proper image dimensions** - Prevents layout shift, improves Core Web Vitals
✅ **Lazy loading** - Improves page load performance
✅ **Nofollow on third-party credits** - Protects your SEO juice
✅ **Descriptive alt text** - Accessibility and image SEO
✅ **Absolute URLs** - Social platforms require full URLs for OG images

## Performance

- **Build time:** Fast JSON lookups, no heavy processing
- **Runtime:** Zero - all URLs resolved at build time
- **Cloudflare Pages:** Fully compatible, no Node.js dependencies
- **Image optimization:** Use standard `<img>` with explicit dimensions

## Common Tasks

### Add a New Category with Images

1. Create OG image: `/public/images/og/categories/new-category.jpg` (1200x630)
2. Add to `src/data/images.json`:
```json
{
  "id": "new-category-og",
  "kind": "og",
  "sourceType": "self",
  "src": "/images/og/categories/new-category.jpg",
  "width": 1200,
  "height": 630,
  "alt": "New Category Description"
}
```
3. Update `src/data/categories.json`:
```json
{
  "id": "new-category",
  "ogImageId": "new-category-og",
  ...
}
```

### Use a Remote Image

1. Add to `src/data/images.json`:
```json
{
  "id": "remote-example",
  "kind": "inline",
  "sourceType": "remote",
  "src": "https://example.com/image.jpg",
  "width": 800,
  "height": 450,
  "alt": "Description",
  "creditName": "Example.com",
  "creditUrl": "https://example.com"
}
```
2. Reference in category/subcategory:
```json
{
  "inlineImageIds": ["remote-example"]
}
```

### Change Default OG Image

1. Replace `/public/images/og/default-og.jpg`
2. Update `src/data/images.json` entry for `default-og`
3. Rebuild

## Troubleshooting

### Build Fails: "default-og image must exist"
**Solution:** Ensure `src/data/images.json` contains an image with `id: "default-og"` and `kind: "og"`.

### OG Image Not Showing in Social Previews
**Check:**
1. Image dimensions are correct (1200x630)
2. File actually exists at the path specified
3. URL is absolute (includes https://yourdomain.com)
4. Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Hero Image Not Displaying
**Check:**
1. `heroImageId` is set in category/subcategory data
2. Image ID exists in `images.json`
3. Image file exists at the specified path

### Third-Party Image Not Loading
**Check:**
1. `sourceType` is set to `"remote"`
2. `src` starts with `http://` or `https://`
3. Remote server allows hotlinking (check CORS/referrer policies)

## Best Practices

✅ **Always provide alt text** for accessibility
✅ **Optimize images** before uploading (use tools like ImageOptim, TinyPNG)
✅ **Use descriptive IDs** (e.g., `crm-hero` not `img1`)
✅ **Keep OG images 1200x630** for best social platform support
✅ **Test social previews** with platform debugging tools
✅ **Credit third-party images** properly with license info
✅ **Use self-hosted for critical images** (OG images) for reliability
✅ **Lazy load inline images** (automatically handled)
✅ **Include dimensions** in JSON to prevent layout shift

❌ **Don't skip alt text** - bad for accessibility and SEO
❌ **Don't use random IDs** - makes maintenance hard
❌ **Don't forget default-og** - critical fallback
❌ **Don't inline large images** - impacts performance

## Related Files

- **Types:** `src/utils/images/types.ts`
- **Utilities:** `src/utils/images/index.ts`
- **Data:** `src/data/images.json`
- **Components:**
  - `src/components/SEO.astro`
  - `src/components/HeroImage.astro`
  - `src/components/InlineImage.astro`
- **Layout:** `src/layouts/BaseLayout.astro`
- **Database Types:** `src/utils/db.ts` (includes image fields)

---

**Need help?** Check the examples in `src/data/images.json` or review category/subcategory JSON files for reference implementations.
