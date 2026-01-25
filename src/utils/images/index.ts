/**
 * Image Library Utilities
 * Handles image resolution, URL generation, and validation for programmatic SEO
 */

import imagesData from '../../data/images.json';
import type { ImageRecord, ImageWithUrl, PageImageContext } from './types';
import type { Category, Subcategory } from '../db';

// Type-safe data import
export const images = imagesData as ImageRecord[];

/**
 * Load image by ID
 */
export function loadImageById(id: string): ImageRecord | undefined {
  return images.find(img => img.id === id);
}

/**
 * Convert relative path or URL to absolute URL
 */
export function toAbsoluteUrl(pathOrUrl: string, siteBase: string): string {
  // Already absolute URL
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  // Relative path - make absolute
  const cleanBase = siteBase.replace(/\/$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Convert ImageRecord to ImageWithUrl by resolving absolute URL
 */
export function withAbsoluteUrl(image: ImageRecord, siteBase: string): ImageWithUrl {
  return {
    ...image,
    absoluteUrl: toAbsoluteUrl(image.src, siteBase)
  };
}

/**
 * Resolve OG image for a page with fallback chain:
 * 1. Subcategory ogImageId
 * 2. Parent category ogImageId
 * 3. Global default og image
 */
export function resolveOgImage(
  entity: { ogImageId?: string },
  parentCategory?: { ogImageId?: string },
  siteBase: string = ''
): ImageWithUrl {
  // Try entity's og image
  if (entity.ogImageId) {
    const img = loadImageById(entity.ogImageId);
    if (img) return withAbsoluteUrl(img, siteBase);
  }

  // Try parent category's og image
  if (parentCategory?.ogImageId) {
    const img = loadImageById(parentCategory.ogImageId);
    if (img) return withAbsoluteUrl(img, siteBase);
  }

  // Fallback to default
  const defaultImg = loadImageById('default-og');
  if (!defaultImg) {
    throw new Error('CRITICAL: default-og image must exist in images.json');
  }

  return withAbsoluteUrl(defaultImg, siteBase);
}

/**
 * Resolve hero image for a page (optional)
 */
export function resolveHeroImage(
  entity: { heroImageId?: string },
  siteBase: string = ''
): ImageWithUrl | null {
  if (!entity.heroImageId) return null;

  const img = loadImageById(entity.heroImageId);
  return img ? withAbsoluteUrl(img, siteBase) : null;
}

/**
 * Resolve inline images for a page (optional)
 */
export function resolveInlineImages(
  entity: { inlineImageIds?: string[] },
  siteBase: string = ''
): ImageWithUrl[] {
  if (!entity.inlineImageIds || entity.inlineImageIds.length === 0) {
    return [];
  }

  return entity.inlineImageIds
    .map(id => loadImageById(id))
    .filter((img): img is ImageRecord => img !== undefined)
    .map(img => withAbsoluteUrl(img, siteBase));
}

/**
 * Validate image record structure
 */
export function validateImageRecord(image: ImageRecord): boolean {
  if (!image.id || !image.kind || !image.sourceType || !image.src) {
    console.error(`Invalid image record: missing required fields`, image);
    return false;
  }

  if (!['og', 'hero', 'inline'].includes(image.kind)) {
    console.error(`Invalid image kind: ${image.kind}`, image);
    return false;
  }

  if (!['self', 'remote'].includes(image.sourceType)) {
    console.error(`Invalid sourceType: ${image.sourceType}`, image);
    return false;
  }

  if (image.sourceType === 'self' && !image.src.startsWith('/')) {
    console.error(`Self-hosted image must start with /: ${image.src}`, image);
    return false;
  }

  if (image.sourceType === 'remote' && !image.src.startsWith('http')) {
    console.error(`Remote image must start with http: ${image.src}`, image);
    return false;
  }

  if (!image.width || !image.height || image.width <= 0 || image.height <= 0) {
    console.error(`Invalid dimensions for image: ${image.id}`, image);
    return false;
  }

  return true;
}

/**
 * Validate all images on startup
 */
export function validateAllImages(): void {
  const errors: string[] = [];

  images.forEach(img => {
    if (!validateImageRecord(img)) {
      errors.push(`Invalid image: ${img.id}`);
    }
  });

  // Check for default-og
  if (!loadImageById('default-og')) {
    errors.push('CRITICAL: default-og image is required');
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  images.forEach(img => {
    if (ids.has(img.id)) {
      errors.push(`Duplicate image ID: ${img.id}`);
    }
    ids.add(img.id);
  });

  if (errors.length > 0) {
    console.error('Image validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Image validation failed with ${errors.length} error(s)`);
  }
}

// Run validation on import
validateAllImages();
