# AI Agent Content Output Instructions

This document provides comprehensive instructions for AI agents to output content that can be directly published to this programmatic SEO site. Follow these schemas exactly for proper rendering and site functionality.

---

## Table of Contents

1. [Quick Reference: File Locations](#quick-reference-file-locations)
2. [Categories Schema](#categories-schema)
3. [Subcategories Schema](#subcategories-schema)
4. [Content Arrays & Rich Content Types](#content-arrays--rich-content-types)
5. [Images Schema](#images-schema)
6. [Videos Schema](#videos-schema)
7. [Anchors (Internal Linking Synonyms)](#anchors-internal-linking-synonyms)
8. [Localization Support](#localization-support)
9. [Complete Output Examples](#complete-output-examples)
10. [Validation Checklist](#validation-checklist)

---

## Quick Reference: File Locations

| File | Purpose |
|------|---------|
| `src/data/categories.json` | Top-level categories (Level 1) |
| `src/data/subcategories.json` | All deeper levels (Level 2, 3, 4+) |
| `src/data/anchors.json` | Internal linking synonyms |
| `src/data/images.json` | Image library records |
| `src/data/videos.json` | Video library records |
| `src/data/redirects.json` | URL redirects |

---

## Categories Schema

Categories are top-level entities that appear at `/{locale}/{category-slug}/`.

### Required Fields

```json
{
  "id": "string (kebab-case, unique identifier)",
  "slug": "string (URL segment, typically same as id)",
  "title": "string | LocalizedObject",
  "description": "string | LocalizedObject",
  "subcategoryIds": ["array of subcategory id strings"]
}
```

### Optional Fields

```json
{
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "status": "published | draft",
  "content": "ContentSection | LocalizedContentSection",
  "ogImageId": "string (reference to images.json)",
  "heroImageId": "string (reference to images.json)"
}
```

### Category Example (Non-Localized)

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "Customer Relationship Management software helps businesses manage interactions with customers and prospects.",
  "subcategoryIds": [
    "crm-for-startups",
    "crm-for-small-businesses",
    "crm-for-enterprises"
  ],
  "datePublished": "2024-01-15",
  "dateModified": "2025-01-30",
  "status": "published",
  "content": {
    "overview": [
      "Customer Relationship Management (CRM) software has become essential for businesses of all sizes.",
      "Modern CRM platforms combine contact management, sales automation, and analytics."
    ],
    "keyBenefits": [
      "Centralize all customer data in one accessible platform.",
      "Automate repetitive tasks like data entry and follow-up reminders."
    ],
    "whyChoose": [
      "Choosing the right CRM software depends on your business size and requirements."
    ]
  },
  "ogImageId": "crm-og",
  "heroImageId": "crm-hero"
}
```

### Category Example (Localized)

```json
{
  "id": "analytics-software",
  "slug": "analytics-software",
  "title": {
    "en": "Analytics Software",
    "fi": "Analytiikkaohjelmistot"
  },
  "description": {
    "en": "Business analytics platforms help organizations transform data into actionable insights.",
    "fi": "Liiketoiminta-analytiikka-alustat auttavat organisaatioita muuttamaan datan oivalluksiksi."
  },
  "subcategoryIds": ["web-analytics", "business-intelligence"],
  "content": {
    "en": {
      "overview": [
        "Analytics software has become essential for modern businesses seeking data-driven decisions."
      ],
      "keyBenefits": [
        "Transform raw data into visual dashboards and reports."
      ]
    },
    "fi": {
      "overview": [
        "Analytiikkaohjelmistot ovat välttämättömiä nykyaikaisille yrityksille."
      ],
      "keyBenefits": [
        "Muunna raakadata visuaalisiksi koontinäytöiksi."
      ]
    }
  }
}
```

---

## Subcategories Schema

Subcategories can be nested to unlimited depth. They appear at `/{locale}/{parent-path}/{subcategory-slug}/`.

### Required Fields

```json
{
  "id": "string (kebab-case, unique identifier)",
  "slug": "string (URL segment)",
  "title": "string | LocalizedObject",
  "description": "string | LocalizedObject",
  "parentCategoryId": "string (id of parent category OR subcategory)"
}
```

### Optional Fields

```json
{
  "relatedCategoryIds": ["array of related category/subcategory ids for cross-linking"],
  "content": "ContentSection | LocalizedContentSection",
  "ogImageId": "string",
  "heroImageId": "string",
  "inlineImageIds": ["array of image ids"]
}
```

### Subcategory Example (Level 2 - Parent is Category)

```json
{
  "id": "crm-for-startups",
  "slug": "crm-for-startups",
  "title": "CRM for Startups",
  "description": "CRM solutions designed for early-stage companies.",
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management", "email-marketing"],
  "content": {
    "overview": [
      "Startups face unique challenges when choosing CRM software.",
      "The right CRM for startups combines affordability with powerful features."
    ],
    "keyBenefits": [
      "Start quickly with intuitive interfaces.",
      "Access affordable or free tiers designed for startups."
    ],
    "whyChoose": [
      "The best CRM for startups prioritizes ease of use and cost-effectiveness."
    ]
  }
}
```

### Subcategory Example (Level 3 - Parent is Subcategory)

```json
{
  "id": "free-crm-for-startups",
  "slug": "free-crm-for-startups",
  "title": "Free CRM for Startups",
  "description": "No-cost CRM options for bootstrapped startups.",
  "parentCategoryId": "crm-for-startups",
  "relatedCategoryIds": [],
  "content": {
    "overview": [
      "Free CRM platforms provide bootstrapped startups with professional capabilities."
    ]
  }
}
```

---

## Content Arrays & Rich Content Types

Content sections use arrays that support **three item types**: paragraphs (strings), video blocks, and image blocks. These can be mixed in any order.

### ContentSection Structure

```json
{
  "overview": [ContentItem, ContentItem, ...],
  "keyBenefits": [ContentItem, ContentItem, ...],
  "whyChoose": [ContentItem, ContentItem, ...],
  "customSectionName": [ContentItem, ContentItem, ...]
}
```

### ContentItem Union Type

A `ContentItem` can be:

1. **String** (paragraph text)
2. **VideoBlock** (embedded video)
3. **ImageBlock** (embedded image)

---

### 1. Paragraph (String)

Plain text paragraphs support automatic internal linking based on `relatedCategoryIds` and `anchors.json`.

```json
"This paragraph mentions project management tools and email marketing platforms, which will auto-link if those are in relatedCategoryIds."
```

**Best Practices:**
- Naturally mention related topics for internal links
- Minimum 80 words per page for internal linking
- Avoid generic text without linkable phrases

---

### 2. Video Block

Embed videos inline within content.

```json
{
  "type": "video",
  "videoId": "string (reference to videos.json)",
  "caption": "string (optional, shown below video)",
  "variant": "inline | hero (default: inline, controls placement context)",
  "mode": "lite | standard (default: uses video record setting, 'lite' recommended for YouTube)"
}
```

**Field Details:**
- `type` - Must be `"video"` for video blocks
- `videoId` - References a video ID from `videos.json`
- `caption` - Optional text displayed below the video
- `variant` - `"inline"` for content flow, `"hero"` for featured placement
- `mode` - Override privacy mode; `"lite"` recommended for YouTube (loads only on click)

**Example:**

```json
{
  "type": "video",
  "videoId": "crm-tutorial-intro",
  "caption": "Quick start guide (2 minutes)",
  "mode": "lite"
}
```

---

### 3. Image Block

Embed images inline within content.

```json
{
  "type": "image",
  "imageId": "string (reference to images.json)",
  "caption": "string (optional, shown below image)",
  "align": "left | right | center (default: center)"
}
```

**Example:**

```json
{
  "type": "image",
  "imageId": "crm-dashboard-screenshot",
  "caption": "Modern CRM dashboard interface",
  "align": "center"
}
```

---

### Mixed Content Array Example

```json
{
  "content": {
    "overview": [
      "Introduction paragraph about CRM software and its importance for businesses.",
      {
        "type": "image",
        "imageId": "crm-dashboard-screenshot",
        "caption": "Modern CRM dashboard interface",
        "align": "center"
      },
      "Middle paragraph explaining integration with project management tools and email marketing platforms.",
      {
        "type": "video",
        "videoId": "crm-tutorial-intro",
        "caption": "Watch our quick start guide",
        "mode": "lite"
      },
      "Conclusion paragraph about choosing the right CRM solution."
    ],
    "keyBenefits": [
      "Centralize all customer data in one accessible platform.",
      "Automate repetitive tasks like follow-ups and data entry.",
      {
        "type": "image",
        "imageId": "automation-workflow",
        "caption": "Example automation workflow"
      },
      "Gain actionable insights through analytics and reporting."
    ]
  }
}
```

**This renders as:**
1. Paragraph
2. Centered image with caption
3. Paragraph (with internal links to related topics)
4. YouTube lite video
5. Paragraph
6. Three benefit paragraphs with image between 2nd and 3rd

---

## Images Schema

Images are stored in `src/data/images.json` and referenced by ID.

### Image Record Structure

```json
{
  "id": "string (unique identifier)",
  "kind": "og | hero | inline",
  "sourceType": "self | remote",
  "src": "string (path or URL)",
  "width": "number (pixels)",
  "height": "number (pixels)",
  "alt": "string (accessibility description)",
  "creditName": "string (optional, attribution)",
  "creditUrl": "string (optional, attribution link)",
  "license": "string (optional, e.g., 'CC BY 2.0')"
}
```

### Image Kind Types

| Kind | Purpose | Recommended Size | Loading |
|------|---------|------------------|---------|
| `og` | Social sharing preview | 1200x630px | Eager |
| `hero` | Top of page feature | 1200x400px+ | Eager |
| `inline` | Within content | Various | Lazy |

### Self-Hosted Image Example

```json
{
  "id": "crm-og",
  "kind": "og",
  "sourceType": "self",
  "src": "/images/og/categories/crm-software.jpg",
  "width": 1200,
  "height": 630,
  "alt": "CRM Software - Customer Relationship Management Solutions"
}
```

### Remote Image Example (with Attribution)

```json
{
  "id": "example-inline-remote",
  "kind": "inline",
  "sourceType": "remote",
  "src": "https://example.com/image.jpg",
  "width": 800,
  "height": 450,
  "alt": "Example inline image from external source",
  "creditName": "Example.com",
  "creditUrl": "https://example.com/source",
  "license": "CC BY 2.0"
}
```

### Image Path Conventions

For self-hosted images:
```
/images/og/default-og.jpg                    # Global OG fallback (REQUIRED)
/images/og/categories/{category-slug}.jpg    # Category OG images
/images/hero/categories/{category-slug}.jpg  # Category hero images
/images/inline/{descriptive-name}.jpg        # Inline content images
```

---

## Videos Schema

Videos are stored in `src/data/videos.json` and referenced by ID.

### Video Record Structure

```json
{
  "id": "string (unique identifier)",
  "platform": "youtube | vimeo | loom | wistia | vidyard | twitch | dailymotion",
  "url": "string (original video URL)",
  "title": "string (accessibility title)",
  "description": "string (optional)",
  "thumbnail": "string (optional custom thumbnail path/URL)",
  "start": "number (optional start time in seconds)",
  "aspectRatio": "string (default: '16/9')",
  "privacy": {
    "mode": "lite | standard"
  },
  "params": {
    "autoplay": "boolean (default: false)",
    "mute": "boolean (default: false)",
    "loop": "boolean (default: false)",
    "controls": "boolean (default: true)"
  }
}
```

### YouTube Video Example (Lite Mode - Recommended)

**Privacy Mode Recommendation:** Always use `"mode": "lite"` for YouTube videos. This provides:
- Faster page loads (thumbnail only until clicked)
- Better Core Web Vitals scores
- Privacy-respecting youtube-nocookie.com domain
- No iframe until user interaction

```json
{
  "id": "crm-tutorial-intro",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=ABC123",
  "title": "CRM Software Tutorial - Getting Started",
  "description": "Learn how to set up your CRM in under 5 minutes",
  "aspectRatio": "16/9",
  "privacy": {
    "mode": "lite"
  },
  "params": {
    "autoplay": false,
    "mute": false
  }
}
```

### Vimeo Video Example

```json
{
  "id": "demo-vimeo",
  "platform": "vimeo",
  "url": "https://vimeo.com/123456789",
  "title": "Product Demo Video",
  "description": "Full product demonstration",
  "aspectRatio": "16/9",
  "params": {
    "autoplay": false
  }
}
```

### Supported URL Formats

**YouTube:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

**Vimeo:**
- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`

**Loom:**
- `https://www.loom.com/share/VIDEO_ID`
- `https://www.loom.com/embed/VIDEO_ID`

**Other platforms:** Standard URLs from wistia, vidyard, twitch, dailymotion

---

## Anchors (Internal Linking Synonyms)

Anchors define alternative phrases that trigger internal links. Stored in `src/data/anchors.json`.

### Structure

```json
{
  "entity-id": [
    "longest phrase first",
    "medium phrase",
    "short phrase",
    "acronym"
  ]
}
```

### Example

```json
{
  "crm-software": [
    "customer relationship management software",
    "CRM solutions",
    "CRM platforms",
    "CRM software"
  ],
  "email-marketing": [
    "email marketing platforms",
    "email marketing tools",
    "email campaign tools",
    "email marketing"
  ],
  "project-management": [
    "project management platforms",
    "project management software",
    "project management tools",
    "project management",
    "PM tools"
  ]
}
```

### Best Practices

1. **Longer phrases first** - They match before shorter ones
2. **3-5 phrases per entity** - Avoid over-optimization
3. **Lowercase** - System is case-insensitive but store lowercase
4. **Natural language** - Use phrases users actually search
5. **Match relatedCategoryIds** - Only entities in `relatedCategoryIds` will link

---

## Localization Support

The system supports optional per-page locale variants. Currently configured: `en` (English), `fi` (Finnish).

### Localized Field Format

Fields that support localization can be either:

**Non-localized (legacy):**
```json
"title": "CRM Software"
```

**Localized:**
```json
"title": {
  "en": "CRM Software",
  "fi": "CRM-ohjelmistot"
}
```

### Localizable Fields

- `title`
- `description`
- `content` (entire ContentSection object)

### Localized Content Example

```json
{
  "id": "web-analytics",
  "slug": "web-analytics",
  "title": {
    "en": "Web Analytics",
    "fi": "Verkkoanalytiikka"
  },
  "description": {
    "en": "Web analytics platforms track website visitor behavior.",
    "fi": "Verkkoanalytiikka-alustat seuraavat verkkosivuston kävijöiden käyttäytymistä."
  },
  "parentCategoryId": "analytics-software",
  "relatedCategoryIds": ["email-marketing", "crm-software"],
  "content": {
    "en": {
      "overview": [
        "Web analytics platforms provide essential insights into visitor behavior.",
        {
          "type": "video",
          "videoId": "analytics-intro-en",
          "caption": "Introduction to Web Analytics"
        },
        "Modern analytics goes beyond simple page counting."
      ],
      "keyBenefits": [
        "Understand visitor behavior with detailed reports.",
        "Track marketing campaign performance."
      ]
    },
    "fi": {
      "overview": [
        "Verkkoanalytiikka-alustat tarjoavat oivalluksia kävijöiden käyttäytymisestä.",
        {
          "type": "video",
          "videoId": "analytics-intro-fi",
          "caption": "Johdanto verkkoanalytiikkaan"
        },
        "Moderni analytiikka ulottuu yksinkertaisen sivulaskennan yli."
      ],
      "keyBenefits": [
        "Ymmärrä kävijöiden käyttäytymistä yksityiskohtaisilla raporteilla.",
        "Seuraa markkinointikampanjoiden suorituskykyä."
      ]
    }
  }
}
```

### URL Generation

- English: `/en/analytics-software/web-analytics/`
- Finnish: `/fi/analytics-software/web-analytics/`

Pages are only generated for locales that have content.

---

## Complete Output Examples

### Example 1: New Category with Rich Content

**Task:** Create a new "Marketing Automation" category with video and image content.

**Output Files:**

**1. Add to `src/data/categories.json`:**

```json
{
  "id": "marketing-automation",
  "slug": "marketing-automation",
  "title": "Marketing Automation",
  "description": "Marketing automation software helps businesses automate repetitive marketing tasks and nurture leads at scale.",
  "subcategoryIds": [
    "email-automation",
    "lead-scoring",
    "campaign-management"
  ],
  "datePublished": "2025-01-31",
  "status": "published",
  "content": {
    "overview": [
      "Marketing automation has revolutionized how businesses engage with prospects and customers throughout the buyer journey.",
      {
        "type": "image",
        "imageId": "marketing-automation-dashboard",
        "caption": "Marketing automation workflow dashboard",
        "align": "center"
      },
      "Modern platforms integrate seamlessly with CRM software and email marketing tools to create unified customer experiences.",
      {
        "type": "video",
        "videoId": "marketing-automation-intro",
        "caption": "Introduction to Marketing Automation (3 min)",
        "mode": "lite"
      },
      "From lead capture to conversion, automation enables personalized communication at scale."
    ],
    "keyBenefits": [
      "Automate repetitive tasks like email sequences, social posting, and lead nurturing.",
      "Score and qualify leads based on behavior and engagement patterns.",
      "Create personalized customer journeys that respond to individual actions.",
      "Track ROI across all marketing channels with unified analytics."
    ],
    "whyChoose": [
      "Selecting marketing automation software depends on your business complexity, integration requirements, and team capabilities.",
      "The best platforms balance powerful features with usability, offering intuitive interfaces alongside advanced customization options."
    ]
  },
  "ogImageId": "marketing-automation-og"
}
```

**2. Add to `src/data/images.json`:**

```json
{
  "id": "marketing-automation-og",
  "kind": "og",
  "sourceType": "self",
  "src": "/images/og/categories/marketing-automation.jpg",
  "width": 1200,
  "height": 630,
  "alt": "Marketing Automation Software - Automate Your Marketing"
},
{
  "id": "marketing-automation-dashboard",
  "kind": "inline",
  "sourceType": "self",
  "src": "/images/inline/marketing-automation-dashboard.jpg",
  "width": 800,
  "height": 450,
  "alt": "Marketing automation workflow dashboard showing campaign overview"
}
```

**3. Add to `src/data/videos.json`:**

```json
{
  "id": "marketing-automation-intro",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=EXAMPLE_ID",
  "title": "Introduction to Marketing Automation",
  "description": "Learn the fundamentals of marketing automation",
  "aspectRatio": "16/9",
  "privacy": {
    "mode": "lite"
  },
  "params": {
    "autoplay": false,
    "mute": false
  }
}
```

**4. Add to `src/data/anchors.json`:**

```json
{
  "marketing-automation": [
    "marketing automation platforms",
    "marketing automation software",
    "marketing automation tools",
    "marketing automation"
  ]
}
```

---

### Example 2: New Subcategory with Cross-References

**Task:** Create "Email Automation" subcategory under Marketing Automation.

**Add to `src/data/subcategories.json`:**

```json
{
  "id": "email-automation",
  "slug": "email-automation",
  "title": "Email Automation",
  "description": "Automated email marketing tools that trigger personalized messages based on user behavior and lifecycle stages.",
  "parentCategoryId": "marketing-automation",
  "relatedCategoryIds": ["crm-software", "email-marketing"],
  "content": {
    "overview": [
      "Email automation transforms how businesses communicate with subscribers by replacing manual sends with intelligent, behavior-triggered workflows.",
      {
        "type": "image",
        "imageId": "email-automation-workflow",
        "caption": "Visual email automation workflow builder",
        "align": "center"
      },
      "Modern platforms integrate with CRM software to leverage customer data for hyper-personalized messaging.",
      "From welcome sequences to abandoned cart recovery, automation ensures the right message reaches the right person at the right time."
    ],
    "keyBenefits": [
      "Create sophisticated drip campaigns with visual workflow builders.",
      "Trigger emails based on website behavior, purchases, or engagement signals.",
      "Personalize content dynamically using subscriber data and preferences.",
      "A/B test subject lines, content, and send times automatically."
    ],
    "whyChoose": [
      "The best email automation platforms balance ease of use with powerful capabilities, offering both pre-built templates and custom workflow options.",
      "Consider integration depth with your email marketing platforms and CRM software when evaluating solutions."
    ]
  }
}
```

**Add corresponding anchors:**

```json
{
  "email-automation": [
    "automated email marketing tools",
    "email automation platforms",
    "email automation software",
    "email automation"
  ]
}
```

---

### Example 3: Fully Localized Subcategory

**Add to `src/data/subcategories.json`:**

```json
{
  "id": "predictive-analytics",
  "slug": "predictive-analytics",
  "title": {
    "en": "Predictive Analytics",
    "fi": "Ennakoiva analytiikka"
  },
  "description": {
    "en": "Predictive analytics tools use machine learning to forecast future trends.",
    "fi": "Ennakoivan analytiikan työkalut käyttävät koneoppimista trendien ennustamiseen."
  },
  "parentCategoryId": "analytics-software",
  "relatedCategoryIds": ["crm-software", "email-marketing"],
  "content": {
    "en": {
      "overview": [
        "Predictive analytics leverages machine learning to forecast future outcomes.",
        {
          "type": "video",
          "videoId": "predictive-analytics-demo-en",
          "caption": "See predictive analytics in action",
          "mode": "lite"
        },
        "Integration with CRM software enables predictive lead scoring and churn prediction."
      ],
      "keyBenefits": [
        "Forecast customer behavior including purchase likelihood and churn risk.",
        "Optimize operations by predicting demand patterns.",
        "Identify high-value opportunities through lead scoring.",
        "Reduce risk with early warning anomaly detection."
      ]
    },
    "fi": {
      "overview": [
        "Ennakoiva analytiikka hyödyntää koneoppimista tulevien tulosten ennustamiseen.",
        {
          "type": "video",
          "videoId": "predictive-analytics-demo-fi",
          "caption": "Katso ennakoiva analytiikka toiminnassa",
          "mode": "lite"
        },
        "Integraatio CRM-ohjelmistojen kanssa mahdollistaa liidien pisteytyksen ja asiakaspoistuman ennustamisen."
      ],
      "keyBenefits": [
        "Ennusta asiakaskäyttäytymistä, mukaan lukien ostotodennäköisyys ja poistumariski.",
        "Optimoi toimintoja ennustamalla kysyntämalleja.",
        "Tunnista arvokkaat mahdollisuudet pisteyttämällä liidit.",
        "Vähennä riskejä ennakkovaroitusjärjestelmillä."
      ]
    }
  }
}
```

---

## Validation Checklist

Before outputting content, verify:

### IDs & References
- [ ] All `id` values are unique across both categories.json and subcategories.json
- [ ] All `subcategoryIds` in categories exist in subcategories.json
- [ ] All `parentCategoryId` references exist (in categories or subcategories)
- [ ] All `relatedCategoryIds` references exist
- [ ] All `imageId` references exist in images.json
- [ ] All `videoId` references exist in videos.json
- [ ] All anchor keys in anchors.json have corresponding entities

### Format & Syntax
- [ ] `id` and `slug` use kebab-case (lowercase, hyphens only)
- [ ] No trailing commas in JSON arrays/objects
- [ ] All strings properly quoted
- [ ] Content arrays contain only strings, video blocks, or image blocks
- [ ] Video blocks have `"type": "video"` and valid `videoId`
- [ ] Image blocks have `"type": "image"` and valid `imageId`

### Images
- [ ] All images have `id`, `kind`, `sourceType`, `src`, `width`, `height`, `alt`
- [ ] Self-hosted `src` starts with `/images/`
- [ ] Remote `src` starts with `http://` or `https://`
- [ ] Dimensions are positive integers
- [ ] `default-og` image exists (required fallback)

### Videos
- [ ] All videos have `id`, `platform`, `url`, `title`
- [ ] Platform is one of: youtube, vimeo, loom, wistia, vidyard, twitch, dailymotion
- [ ] URL format is valid for the specified platform

### Localization
- [ ] Localized objects have at least `en` locale
- [ ] All locale keys use valid codes (en, fi)
- [ ] Content structure matches between locales (same sections)

### Internal Linking
- [ ] Anchors listed longest-first
- [ ] 3-5 anchor phrases per entity
- [ ] Content has 80+ words for linking to work
- [ ] Related topics mentioned naturally in paragraph text

---

## AI Agent Output Format

When generating content, output in this format:

```markdown
## Files to Update

### src/data/categories.json
Add/modify the following entry:
\`\`\`json
{ ... }
\`\`\`

### src/data/subcategories.json
Add/modify the following entries:
\`\`\`json
{ ... }
\`\`\`

### src/data/images.json
Add the following entries:
\`\`\`json
{ ... }
\`\`\`

### src/data/videos.json
Add the following entries:
\`\`\`json
{ ... }
\`\`\`

### src/data/anchors.json
Add/modify the following entries:
\`\`\`json
{ ... }
\`\`\`

## Image Files Required
- /public/images/og/categories/new-category.jpg (1200x630)
- /public/images/inline/new-image.jpg (800x450)

## Validation
- [x] All IDs unique
- [x] All references valid
- [x] All required fields present
```

---

## Quick Copy Templates

### Minimal Category

```json
{
  "id": "CATEGORY_ID",
  "slug": "CATEGORY_SLUG",
  "title": "Category Title",
  "description": "Brief description of the category.",
  "subcategoryIds": []
}
```

### Minimal Subcategory

```json
{
  "id": "SUBCATEGORY_ID",
  "slug": "SUBCATEGORY_SLUG",
  "title": "Subcategory Title",
  "description": "Brief description.",
  "parentCategoryId": "PARENT_ID",
  "relatedCategoryIds": []
}
```

### Minimal Image

```json
{
  "id": "IMAGE_ID",
  "kind": "inline",
  "sourceType": "self",
  "src": "/images/inline/IMAGE_NAME.jpg",
  "width": 800,
  "height": 450,
  "alt": "Description of the image"
}
```

### Minimal Video

```json
{
  "id": "VIDEO_ID",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=VIDEO_CODE",
  "title": "Video Title",
  "privacy": { "mode": "lite" }
}
```

### Video Block in Content

```json
{
  "type": "video",
  "videoId": "VIDEO_ID",
  "caption": "Video caption",
  "mode": "lite"
}
```

### Image Block in Content

```json
{
  "type": "image",
  "imageId": "IMAGE_ID",
  "caption": "Image caption",
  "align": "center"
}
```

---

*Last updated: January 31, 2025*
