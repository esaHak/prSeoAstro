# Media Library Documentation (Videos & Images)

## Overview

The Media Library system provides a unified, scalable approach to managing and embedding both videos and images inline within programmatic SEO content. It supports multiple video platforms with proper SEO optimization, performance features like YouTube lite mode, and seamless inline integration of both videos and images within content arrays.

## Supported Platforms

- **YouTube** (youtube.com, youtu.be, shorts)
- **Vimeo** (vimeo.com, player.vimeo.com)
- **Loom** (loom.com/share, loom.com/embed)
- **Wistia** (wistia.com, fast.wistia.net)
- **Vidyard** (vidyard.com, play.vidyard.com)
- **Twitch** (twitch.tv/videos, clips.twitch.tv)
- **Dailymotion** (dailymotion.com, dai.ly)

## Video Usage Types

### 1. Inline Videos (within content)
- **Primary use case**: Embedded within paragraph content arrays
- **Location**: Between paragraphs in content sections
- **Lazy loading**: Enabled by default
- **Supports**: Lite mode (YouTube only) and standard mode

### 2. Hero Videos (optional)
- **Use case**: Featured video at the top of a page
- **Placement**: Below page title/description
- **Loading**: Eager (above-the-fold)
- **Configuration**: Set via `heroVideoId` in category/subcategory data

### 3. Video Galleries (optional)
- **Use case**: Collection of related videos
- **Configuration**: Set via `videoIds` array in category/subcategory data

## Data Structure

### Video Record (`src/data/videos.json`)

```json
{
  "id": "unique-video-id",
  "platform": "youtube" | "vimeo" | "loom" | "wistia" | "vidyard" | "twitch" | "dailymotion",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Video title for accessibility",
  "description": "Optional description",
  "thumbnail": "/images/video-thumbs/custom.jpg",  // Optional override
  "start": 0,                                       // Optional start time (seconds)
  "aspectRatio": "16/9",                            // Default "16/9"
  "privacy": {
    "mode": "lite" | "standard"                     // Default "lite" for YouTube
  },
  "params": {
    "autoplay": false,
    "mute": false,
    "loop": false,
    "controls": true
  }
}
```

**Field Guide:**
- `id`: Unique identifier to reference this video
- `platform`: Video hosting platform
- `url`: Original video URL (any format supported by platform)
- `title`: Used for iframe title attribute (accessibility)
- `description`: Optional description shown below video
- `thumbnail`: Optional custom thumbnail URL (self-hosted or remote)
- `start`: Optional start time in seconds
- `aspectRatio`: Ratio for responsive container (e.g., "16/9", "4/3", "1/1")
- `privacy.mode`:
  - `lite`: YouTube only - thumbnail + click to load (recommended)
  - `standard`: Full iframe embed
- `params`: Platform-specific playback parameters

### Video Block (inline content)

```json
{
  "type": "video",
  "videoId": "unique-video-id",
  "caption": "Optional caption text",
  "variant": "inline" | "hero",
  "aspectRatio": "16/9",
  "mode": "lite" | "standard"
}
```

### Image Block (inline content)

```json
{
  "type": "image",
  "imageId": "unique-image-id",
  "caption": "Optional caption text",
  "align": "left" | "right" | "center"
}
```

**Field Guide:**
- `type`: Must be `"image"` for image blocks
- `imageId`: ID of image from `src/data/images.json`
- `caption`: Optional caption text (overrides image description)
- `align`: Alignment within content flow (default: "center")

## Adding Videos

### Step 1: Add Video Record to `src/data/videos.json`

```json
{
  "id": "crm-demo-youtube",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "CRM Software Demo - Getting Started",
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

### Step 2: Embed Video in Content Array

Edit `src/data/categories.json` or `src/data/subcategories.json`:

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "Customer Relationship Management software...",
  "content": {
    "overview": [
      "Customer Relationship Management (CRM) software has become essential for businesses of all sizes.",
      {
        "type": "video",
        "videoId": "crm-demo-youtube",
        "caption": "Watch our quick start guide",
        "variant": "inline",
        "mode": "lite"
      },
      "Modern CRM platforms combine contact management, sales automation, and analytics into unified systems."
    ],
    "whyChoose": [
      "Choosing the right CRM depends on your business size and requirements.",
      "The best CRM solutions offer flexible pricing and robust mobile access."
    ]
  }
}
```

### Step 3: Build and Test

```bash
npm run build
```

The video will appear inline at the exact position in the content array.

## URL Format Support

### YouTube
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

### Vimeo
- `https://vimeo.com/VIDEO_ID`
- `https://vimeo.com/channels/*/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`

### Loom
- `https://www.loom.com/share/VIDEO_ID`
- `https://www.loom.com/embed/VIDEO_ID`

### Wistia
- `https://*.wistia.com/medias/VIDEO_ID`
- `https://fast.wistia.net/embed/iframe/VIDEO_ID`

### Vidyard
- `https://vidyard.com/watch/VIDEO_ID`
- `https://share.vidyard.com/watch/VIDEO_ID`
- `https://play.vidyard.com/VIDEO_ID`

### Twitch
- `https://www.twitch.tv/videos/VIDEO_ID`
- `https://clips.twitch.tv/CLIP_ID`

### Dailymotion
- `https://www.dailymotion.com/video/VIDEO_ID`
- `https://dai.ly/VIDEO_ID`

## YouTube Lite Mode

YouTube lite mode provides significant performance benefits by only loading the video iframe when the user clicks the play button.

### Benefits:
- **Faster page load**: No iframe until user interaction
- **Reduced bandwidth**: Only thumbnail loaded initially
- **Better Core Web Vitals**: Improves LCP and CLS scores
- **Privacy-friendly**: Uses youtube-nocookie.com domain

### How it works:
1. Initially renders a clickable thumbnail with play button overlay
2. On click, swaps thumbnail for full iframe embed
3. Video begins playing immediately after swap
4. Works without JavaScript framework (vanilla JS inline)

### Example:

```json
{
  "id": "tutorial-video",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=ABC123",
  "title": "Tutorial Video",
  "privacy": {
    "mode": "lite"
  }
}
```

Renders as:
- Thumbnail image (from YouTube's CDN)
- Play button overlay
- Click → iframe loads and autoplays

## Content Item Types

Content arrays now support a union type `ContentItem = string | VideoBlock | ImageBlock`.

### String Paragraph (existing behavior)
```json
"This is a regular paragraph with internal linking support."
```

Renders as:
```html
<p>This is a regular paragraph with <a href="/project-management/">internal linking</a> support.</p>
```

### Video Block
```json
{
  "type": "video",
  "videoId": "example-video-1",
  "caption": "Optional caption",
  "variant": "inline",
  "mode": "lite"
}
```

Renders as responsive video embed with optional caption.

### Image Block
```json
{
  "type": "image",
  "imageId": "example-image-1",
  "caption": "Optional caption",
  "align": "center"
}
```

Renders as responsive image with optional caption and alignment.

## Internal Linking Compatibility

The media library is fully compatible with the existing internal linking system:

- ✅ **String paragraphs**: Internal linking applied as before
- ✅ **Media blocks** (video/image): Skipped by internal linker (no text to link)
- ✅ **Mixed arrays**: All types work together seamlessly

### Example: Mixed Content Array

```json
{
  "overview": [
    "Introduction paragraph mentioning project management tools.",
    {
      "type": "image",
      "imageId": "crm-dashboard-screenshot",
      "caption": "CRM dashboard overview",
      "align": "center"
    },
    "Middle paragraph explaining key features.",
    {
      "type": "video",
      "videoId": "crm-tutorial-video",
      "caption": "Watch the full tutorial",
      "mode": "lite"
    },
    "Conclusion paragraph about email marketing platforms."
  ]
}
```

**Result:**
- First paragraph: Internal link to "project management tools" ✅
- Image: Rendered inline with caption ✅
- Middle paragraph: Plain paragraph, no links ✅
- Video: YouTube lite embed with caption ✅
- Conclusion: Internal link to "email marketing platforms" ✅

## Advanced Example: Complete Category with Mixed Media

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "description": "Customer Relationship Management software...",
  "content": {
    "overview": [
      "Customer Relationship Management (CRM) software has become essential for businesses of all sizes. Modern CRM platforms integrate with project management software and email marketing platforms.",
      {
        "type": "image",
        "imageId": "crm-dashboard",
        "caption": "Modern CRM dashboard interface",
        "align": "center"
      },
      "The best CRM solutions offer flexible workflows and automation capabilities.",
      {
        "type": "video",
        "videoId": "crm-tutorial-intro",
        "caption": "Quick start guide (2 minutes)",
        "mode": "lite"
      },
      "Whether managing startups or enterprises, the right CRM transforms how your business operates."
    ],
    "whyChoose": [
      "Choosing the right CRM depends on your business size and integration needs.",
      {
        "type": "image",
        "imageId": "crm-comparison-chart",
        "caption": "Feature comparison across top platforms",
        "align": "right"
      },
      "Consider ease of use, mobile access, and compatibility with existing tools. Many platforms now provide AI-powered insights and extensive integration ecosystems.",
      {
        "type": "video",
        "videoId": "crm-advanced-features",
        "caption": "Advanced automation features demo"
      },
      "The investment in the right CRM platform pays dividends through improved efficiency and customer retention."
    ]
  },
  "ogImageId": "crm-og",
  "heroImageId": "crm-hero"
}
```

**This renders as:**
1. **Overview section:**
   - Paragraph with internal links → "project management software", "email marketing platforms"
   - Centered image with caption
   - Plain paragraph
   - YouTube lite video with caption
   - Conclusion paragraph

2. **Why Choose section:**
   - Introduction paragraph
   - Right-aligned image with caption
   - Paragraph with contextual flow
   - Video embed
   - Conclusion paragraph

All media is positioned exactly where specified in the array, maintaining natural reading flow.

## Components

### VideoEmbed Component

**Location:** `src/components/VideoEmbed.astro`

**Props:**
```typescript
interface Props {
  video: VideoRecord;
  variant?: 'inline' | 'hero';
  mode?: 'lite' | 'standard';
  aspectRatio?: string;
  caption?: string;
}
```

**Usage:**
```astro
---
import VideoEmbed from '../components/VideoEmbed.astro';
import { getVideoById } from '../utils/videos';

const video = getVideoById('example-video-1');
---

<VideoEmbed video={video} variant="inline" mode="lite" caption="Watch the demo" />
```

### ContentRenderer Component

**Location:** `src/components/ContentRenderer.astro`

**Props:**
```typescript
interface Props {
  items: ContentItem[];
  linkContext: PageContext;
}
```

**Usage:**
```astro
---
import ContentRenderer from '../components/ContentRenderer.astro';

const overviewItems: ContentItem[] = [
  "First paragraph",
  { type: "video", videoId: "demo-1" },
  "Third paragraph"
];

const linkContext = {
  type: 'category',
  entity: category,
  id: category.id,
  slug: category.slug
};
---

<ContentRenderer items={overviewItems} linkContext={linkContext} />
```

## Utilities

### Video Utilities (`src/utils/videos/index.ts`)

**Functions:**

```typescript
// Load video by ID
getVideoById(id: string): VideoRecord | undefined

// Normalize any video URL to extract platform, videoId, embedUrl
normalizeVideoUrl(url: string): NormalizedVideo | null

// Build embed URL with parameters
buildEmbedUrl(video: VideoRecord): string

// Get thumbnail URL (custom or platform default)
getVideoThumbnail(video: VideoRecord): string | undefined

// Validate video record
validateVideoRecord(video: VideoRecord): boolean

// Validate all videos (runs on import)
validateAllVideos(): void
```

**Example:**
```typescript
import { normalizeVideoUrl } from '../utils/videos';

const result = normalizeVideoUrl('https://www.youtube.com/watch?v=ABC123');
// {
//   platform: 'youtube',
//   videoId: 'ABC123',
//   embedUrl: 'https://www.youtube.com/embed/ABC123',
//   thumbnailUrl: 'https://img.youtube.com/vi/ABC123/maxresdefault.jpg'
// }
```

## Database Integration

### Category/Subcategory Fields

Optional video fields in `src/data/categories.json` and `src/data/subcategories.json`:

```typescript
{
  heroVideoId?: string;    // Optional hero video
  videoIds?: string[];     // Optional video gallery
}
```

**Example:**
```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": "CRM Software",
  "heroVideoId": "crm-intro-video",
  "videoIds": ["crm-demo-1", "crm-demo-2", "crm-demo-3"]
}
```

## Validation

The system automatically validates all videos on build:

**Checks:**
- All required fields present (`id`, `platform`, `url`, `title`)
- Valid platform value
- URL can be normalized (format recognized)
- No duplicate IDs

**Build fails if validation fails**, ensuring data integrity.

## SEO Benefits

✅ **Proper iframe attributes** - title, allow, allowfullscreen, referrerpolicy
✅ **Lazy loading** - Improves page load performance
✅ **Responsive embeds** - Prevents layout shift with explicit aspect ratios
✅ **YouTube lite mode** - Significantly improves Core Web Vitals
✅ **Accessibility** - Proper title attributes and captions
✅ **Privacy-enhanced** - YouTube nocookie domain for lite mode

## Performance

- **Build time:** Fast JSON lookups, URL normalization at build time
- **Runtime:** Zero server dependencies - all processing at build time
- **Cloudflare Pages:** Fully compatible, no Node.js runtime needed
- **Lite mode:** Thumbnail-only until user interaction
- **Lazy loading:** Standard embeds load off-screen content lazily

## Common Tasks

### Add a YouTube Video with Lite Mode

1. Add to `videos.json`:
```json
{
  "id": "my-youtube-video",
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "My Tutorial Video",
  "privacy": { "mode": "lite" }
}
```

2. Add to content array:
```json
{
  "overview": [
    "Introduction paragraph",
    {
      "type": "video",
      "videoId": "my-youtube-video",
      "caption": "Watch the full tutorial"
    },
    "Conclusion paragraph"
  ]
}
```

### Use a Vimeo Video

1. Add to `videos.json`:
```json
{
  "id": "my-vimeo-video",
  "platform": "vimeo",
  "url": "https://vimeo.com/123456789",
  "title": "Vimeo Video",
  "aspectRatio": "16/9"
}
```

2. Embed inline:
```json
{
  "type": "video",
  "videoId": "my-vimeo-video"
}
```

### Add Hero Video to Category

1. Add video to `videos.json`

2. Reference in category:
```json
{
  "id": "crm-software",
  "heroVideoId": "crm-intro-video",
  ...
}
```

3. Render in page template (manual implementation needed)

## Troubleshooting

### Build Fails: "Video validation failed"

**Solution:** Check console output for specific errors:
- Missing required fields
- Invalid platform value
- URL format not recognized
- Duplicate video IDs

### Video Not Displaying

**Check:**
1. Video ID exists in `videos.json`
2. Video block syntax is correct: `{ "type": "video", "videoId": "..." }`
3. Content array is properly formatted JSON
4. Build succeeded without errors

### YouTube Video Not Using Lite Mode

**Check:**
1. `privacy.mode` is set to `"lite"` in video record
2. Platform is `"youtube"` (lite mode only works for YouTube)
3. Build succeeded (check browser dev tools for errors)

### Video Embed Not Responsive

**Check:**
1. `aspectRatio` is set correctly (e.g., "16/9", "4/3")
2. No custom CSS overriding the responsive container
3. Parent container doesn't have fixed width

## Best Practices

✅ **Use lite mode for YouTube** - Improves performance significantly
✅ **Add descriptive titles** - Important for accessibility
✅ **Optimize aspect ratios** - Prevents layout shift
✅ **Place videos strategically** - Between related paragraphs for context
✅ **Limit videos per page** - 1-3 videos recommended for performance
✅ **Use captions** - Helps users understand video context
✅ **Test on mobile** - Ensure responsive embeds work on all devices

❌ **Don't autoplay** - Bad UX and SEO
❌ **Don't use too many videos** - Slows page load
❌ **Don't skip titles** - Hurts accessibility
❌ **Don't use random IDs** - Makes maintenance hard

## Related Files

- **Types:** `src/utils/videos/types.ts`
- **Utilities:** `src/utils/videos/index.ts`
- **Data:** `src/data/videos.json`
- **Components:**
  - `src/components/VideoEmbed.astro`
  - `src/components/ContentRenderer.astro`
- **Database Types:** `src/utils/db.ts` (includes video fields)
- **Page Template:** `src/pages/[...slug]/index.astro`

## Related Documentation

- [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) - Content structure and management (media blocks)
- [IMAGE_LIBRARY.md](./IMAGE_LIBRARY.md) - Image management (inline blocks)
- [INTERNAL_LINKING.md](./INTERNAL_LINKING.md) - Automated internal linking
- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) - Technical database details

---

**Need help?** Check the examples in `src/data/videos.json` or review category/subcategory JSON files for reference implementations.
