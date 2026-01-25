# Localization Guide

This guide explains how to use the multi-language support feature in prSeoAstro. The localization system allows you to create optional per-page language variants with proper SEO support.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [URL Structure](#url-structure)
- [Data Model](#data-model)
- [Adding Locale Variants](#adding-locale-variants)
- [Language Switcher](#language-switcher)
- [SEO Features](#seo-features)
- [Internal Linking](#internal-linking)
- [Adding a New Locale](#adding-a-new-locale)
- [Build-Time Validation](#build-time-validation)
- [Best Practices](#best-practices)

## Overview

The localization feature supports:

- **Optional per-page variants** - Not all pages need translations
- **Subdirectory URLs** - `/en/...` and `/fi/...` structure
- **Backward compatibility** - Non-localized pages still work
- **SEO-compliant** - Proper hreflang, canonical, and lang tags
- **Locale-aware internal linking** - Links only to pages that exist in the current locale

**Default locales**: English (`en`) and Finnish (`fi`)

## Quick Start

### 1. Create a Localized Page

Edit `src/data/categories.json` to add locale variants:

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": {
    "en": "CRM Software",
    "fi": "CRM-ohjelmistot"
  },
  "description": {
    "en": "Customer Relationship Management software for businesses",
    "fi": "Asiakkuudenhallintaohjelmistot yrityksille"
  },
  "content": {
    "en": {
      "overview": [
        "CRM software helps manage customer relationships..."
      ]
    },
    "fi": {
      "overview": [
        "CRM-ohjelmistot auttavat hallitsemaan asiakassuhteita..."
      ]
    }
  },
  "subcategoryIds": []
}
```

### 2. Build and Deploy

```bash
npm run build
```

This generates:
- `/en/crm-software/` (English page)
- `/fi/crm-software/` (Finnish page)

Both pages include:
- Language switcher (since both locales exist)
- Proper hreflang tags
- Self-referential canonical URLs
- Correct `<html lang>` attribute

## URL Structure

All localized pages use subdirectory URLs:

```
/en/<categorySlug>/
/fi/<categorySlug>/
/en/<categoryPath>/<subcategorySlug>/
/fi/<categoryPath>/<subcategorySlug>/
```

**Examples:**
- `/en/crm-software/`
- `/fi/crm-software/`
- `/en/crm-software/crm-for-startups/`
- `/fi/crm-software/crm-for-startups/`

## Data Model

### Localizable Fields

The following fields support localization:

- `title` (string)
- `description` (string)
- `content` (ContentSection object)

### Two Formats Supported

**1. Legacy (non-localized):**
```json
{
  "title": "CRM Software",
  "description": "CRM tools for businesses"
}
```

**2. Localized (new):**
```json
{
  "title": {
    "en": "CRM Software",
    "fi": "CRM-ohjelmistot"
  },
  "description": {
    "en": "CRM tools for businesses",
    "fi": "CRM-työkalut yrityksille"
  }
}
```

### Content Structure

Content sections can also be localized:

```json
{
  "content": {
    "en": {
      "overview": [
        "English paragraph 1",
        "English paragraph 2"
      ],
      "keyBenefits": [
        "Benefit 1",
        "Benefit 2"
      ]
    },
    "fi": {
      "overview": [
        "Finnish paragraph 1",
        "Finnish paragraph 2"
      ],
      "keyBenefits": [
        "Etu 1",
        "Etu 2"
      ]
    }
  }
}
```

## Adding Locale Variants

### Step 1: Update Existing Entity

To add a Finnish variant to an existing English-only page:

**Before:**
```json
{
  "id": "email-marketing",
  "slug": "email-marketing",
  "title": "Email Marketing",
  "description": "Email marketing platforms"
}
```

**After:**
```json
{
  "id": "email-marketing",
  "slug": "email-marketing",
  "title": {
    "en": "Email Marketing",
    "fi": "Sähköpostimarkkinointi"
  },
  "description": {
    "en": "Email marketing platforms",
    "fi": "Sähköpostimarkkinointialustat"
  }
}
```

### Step 2: Add Content Variants

```json
{
  "content": {
    "en": {
      "overview": ["English content..."]
    },
    "fi": {
      "overview": ["Finnish content..."]
    }
  }
}
```

### Step 3: Build

```bash
npm run build
```

The system will now generate both `/en/email-marketing/` and `/fi/email-marketing/`.

## Language Switcher

The language switcher appears **only when a page has multiple locale variants**.

### Visibility Rules

- ✅ **Shows** when page exists in 2+ locales
- ❌ **Hidden** when page exists in only 1 locale
- No empty UI elements when not shown

### Location

The language switcher appears at the top of the page content, before the navigation breadcrumbs.

### Styling

Default styling includes:
- Simple button-style links
- Current locale highlighted
- Hover effects
- Accessible (uses `aria-current` and `hreflang`)

Customize in `src/components/LanguageSwitcher.astro`.

## SEO Features

### 1. HTML Lang Attribute

Each page has the correct `<html lang>` attribute:

```html
<html lang="en">  <!-- For English pages -->
<html lang="fi">  <!-- For Finnish pages -->
```

### 2. Self-Referential Canonical

Each locale has its own canonical URL:

```html
<!-- On /en/crm-software/ -->
<link rel="canonical" href="https://example.com/en/crm-software/" />

<!-- On /fi/crm-software/ -->
<link rel="canonical" href="https://example.com/fi/crm-software/" />
```

### 3. Hreflang Tags

Hreflang tags are **only emitted for locales that exist**:

```html
<!-- On both /en/crm-software/ and /fi/crm-software/ -->
<link rel="alternate" hreflang="en" href="https://example.com/en/crm-software/" />
<link rel="alternate" hreflang="fi" href="https://example.com/fi/crm-software/" />
```

If a page only has English content, **no hreflang tags** are emitted.

### 4. Open Graph Locale

```html
<meta property="og:locale" content="en" />
```

### 5. No x-default

Currently, `x-default` is not emitted. This can be added later if you create a language selection landing page.

## Internal Linking

Internal links are **locale-aware**:

### Default Behavior (Skip Missing Locales)

By default, internal links only target pages that exist in the current locale.

**Example:**
- You're on `/fi/crm-software/`
- The page mentions "email marketing"
- If "email-marketing" has a Finnish variant, link to `/fi/email-marketing/`
- If "email-marketing" does NOT have a Finnish variant, **don't create a link**

This prevents users from being unexpectedly redirected to a different language.

### Configuration

Change the link policy in `src/utils/i18n/index.ts`:

```typescript
export const linkPolicyConfig: { missingLocaleTarget: LinkPolicy } = {
  missingLocaleTarget: 'skip' // or 'fallbackToDefaultLocale'
};
```

Options:
- `'skip'` (default): Don't link to missing locale targets
- `'fallbackToDefaultLocale'`: Link to English version if locale is missing (not yet fully implemented)

## Adding a New Locale

To add a new locale (e.g., Swedish):

### 1. Update Config

Edit `src/utils/i18n/config.ts`:

```typescript
export const supportedLocales = ['en', 'fi', 'sv'] as const;

export const localeLabels: Record<Locale, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  fi: { short: 'FI', full: 'Suomi' },
  sv: { short: 'SV', full: 'Svenska' }
};
```

### 2. Add Content

Add Swedish variants to your content JSON files:

```json
{
  "title": {
    "en": "CRM Software",
    "fi": "CRM-ohjelmistot",
    "sv": "CRM-programvara"
  }
}
```

### 3. Build

```bash
npm run build
```

Swedish pages will be generated at `/sv/...` URLs.

## Build-Time Validation

The system includes build-time validation to ensure localization consistency.

### Running Validation

Validation runs automatically during `getStaticPaths()`, but you can also run it manually:

```typescript
import { runAllValidations, logValidationResults } from './utils/i18n/validation';

const result = runAllValidations();
logValidationResults(result);
```

### Validation Checks

1. **Required fields**: Ensures each locale has `title`, `description`
2. **Hreflang references**: Ensures hreflang only references existing pages
3. **Completeness warnings**: Warns if entities only have one locale

### Example Output

```
✅ Localization validation passed!
```

Or:

```
❌ Localization validation failed:
  - category "crm-software" [fi]: Missing localized description

⚠️  Localization warnings:
  - category "email-marketing": Only available in locale "en". Consider adding translations.
```

## Best Practices

### 1. Don't Force Complete Translation

Not every page needs to be translated. It's better to have:
- ✅ High-quality translations for important pages
- ❌ Machine-translated or incomplete content everywhere

### 2. Localize in Phases

Start with:
1. Top-level categories
2. High-traffic subcategories
3. Long-tail pages (as needed)

### 3. Consistent Field Localization

If you localize `title`, also localize `description` and `content` for that locale. Partial localization will cause that locale to not be generated.

### 4. Use Validation

Run validation during development to catch missing translations:

```bash
npm run build
```

Look for warnings about incomplete locales.

### 5. Internal Linking Considerations

- The default `skip` policy is safe but may reduce link density on translated pages
- Consider which entities to translate based on your internal linking strategy
- Translate related entities together to maintain link clusters

### 6. SEO Strategy

- **Self-referential canonicals** prevent duplicate content issues
- **hreflang tags** help search engines serve the right locale
- **No auto-redirect** - Let users and search engines choose their locale
- **Language switcher** allows users to manually change language

### 7. Content Organization

Group related entities and translate them together:

```
crm-software/         (en, fi)
  crm-for-startups/   (en, fi)
  crm-for-enterprises/ (en only)
```

This ensures translated pages have good internal linking within their locale.

## Troubleshooting

### Page Not Generated for Locale

**Check:**
1. Does the entity have `title` in that locale?
2. Does the entity have `description` in that locale?
3. Run validation to see specific errors

### Language Switcher Not Showing

**Reasons:**
- Page only exists in one locale (expected behavior)
- `alternateUrls` not passed to `BaseLayout`

### Internal Links Not Working in Translated Pages

**Reasons:**
- Target entity doesn't have a variant in the current locale
- Default `skip` policy is active (expected)
- Check `linkPolicyConfig.missingLocaleTarget` setting

### Hreflang Not Showing

**Reasons:**
- Page only has one locale (expected - no hreflang needed)
- Missing `hreflangLinks` prop in `BaseLayout`

## Examples

### Full Category with Localization

```json
{
  "id": "crm-software",
  "slug": "crm-software",
  "title": {
    "en": "CRM Software",
    "fi": "CRM-ohjelmistot"
  },
  "description": {
    "en": "Customer Relationship Management software helps businesses manage interactions with customers and prospects.",
    "fi": "Asiakkuudenhallintaohjelmistot auttavat yrityksiä hallitsemaan vuorovaikutusta asiakkaiden ja potentiaalisten asiakkaiden kanssa."
  },
  "content": {
    "en": {
      "overview": [
        "CRM software has become essential for businesses of all sizes..."
      ],
      "keyBenefits": [
        "Centralize all customer data",
        "Automate repetitive tasks"
      ],
      "whyChoose": [
        "Choosing the right CRM depends on your business needs..."
      ]
    },
    "fi": {
      "overview": [
        "CRM-ohjelmistot ovat tulleet välttämättömiksi kaikenkokoisille yrityksille..."
      ],
      "keyBenefits": [
        "Keskitä kaikki asiakastiedot",
        "Automatisoi toistuvat tehtävät"
      ],
      "whyChoose": [
        "Oikean CRM:n valinta riippuu yrityksesi tarpeista..."
      ]
    }
  },
  "subcategoryIds": ["crm-for-startups"],
  "ogImageId": "crm-og",
  "heroImageId": "crm-hero"
}
```

### Partial Localization (Subcategory)

```json
{
  "id": "crm-for-startups",
  "slug": "crm-for-startups",
  "title": {
    "en": "CRM for Startups",
    "fi": "CRM startup-yrityksille"
  },
  "description": {
    "en": "CRM solutions designed for early-stage companies",
    "fi": "CRM-ratkaisut alkuvaiheen yrityksille"
  },
  "parentCategoryId": "crm-software",
  "relatedCategoryIds": ["project-management"],
  "content": {
    "en": {
      "overview": ["Startup-specific content..."]
    },
    "fi": {
      "overview": ["Startup-kohtainen sisältö..."]
    }
  }
}
```

This will generate:
- `/en/crm-software/crm-for-startups/`
- `/fi/crm-software/crm-for-startups/`

Both pages will show the language switcher and have proper hreflang tags.

## Summary

The localization system provides:

✅ **Optional per-page variants** - Translate what matters
✅ **Clean subdirectory URLs** - `/en/` and `/fi/`
✅ **Backward compatible** - Existing non-localized content works
✅ **SEO-compliant** - hreflang, canonical, lang tags
✅ **Smart internal linking** - Locale-aware link targets
✅ **Build-time validation** - Catch missing translations
✅ **Language switcher** - Only shown when variants exist

Start by translating your most important pages, and expand gradually. The system handles the rest automatically!
