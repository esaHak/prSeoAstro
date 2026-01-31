/**
 * Image Optimization Utilities
 * Generates srcset, WebP variants, and responsive image attributes
 * for optimal Core Web Vitals performance
 */

import type {
  ImageWithUrl,
  OptimizedImage,
  ImageOptimizationConfig,
  ImageKind,
} from './types';
import {
  IMAGE_KIND_BREAKPOINTS,
  DEFAULT_OPTIMIZATION_CONFIG,
  RESPONSIVE_WIDTHS,
} from './types';

/**
 * Calculate height maintaining aspect ratio
 */
export function calculateHeight(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): number {
  const aspectRatio = originalHeight / originalWidth;
  return Math.round(targetWidth * aspectRatio);
}

/**
 * Get appropriate widths for an image based on its kind and original size
 * Filters out widths larger than the original to avoid upscaling
 */
export function getResponsiveWidths(
  kind: ImageKind,
  originalWidth: number,
  customWidths?: number[]
): number[] {
  const baseWidths = customWidths || IMAGE_KIND_BREAKPOINTS[kind];

  // Filter out widths larger than original and ensure original is included
  const filteredWidths = baseWidths.filter(w => w <= originalWidth);

  // Always include the original width if not already present
  if (!filteredWidths.includes(originalWidth)) {
    filteredWidths.push(originalWidth);
  }

  return filteredWidths.sort((a, b) => a - b);
}

/**
 * Generate srcset string for an image
 * For remote images: Uses the original URL (CDNs typically handle responsive delivery)
 * For self-hosted: Uses the original image path (responsive variants not pre-generated)
 */
export function generateSrcset(
  image: ImageWithUrl,
  widths: number[],
  format?: 'webp' | 'original'
): string {
  // Use the original image path for all cases
  // Responsive image variants would need to be pre-generated
  // For now, just use the original image with its actual width
  return `${image.src} ${image.width}w`;
}

/**
 * Generate sizes attribute based on image kind
 */
export function generateSizes(kind: ImageKind, customSizes?: string): string {
  if (customSizes) return customSizes;

  switch (kind) {
    case 'hero':
      // Hero images are typically full-width
      return '100vw';
    case 'inline':
      // Inline images constrained by content width
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px';
    case 'og':
      // OG images are fixed size, sizes not needed
      return '1200px';
    default:
      return DEFAULT_OPTIMIZATION_CONFIG.sizes!;
  }
}

/**
 * Create an optimized image object with srcset and WebP support
 */
export function createOptimizedImage(
  image: ImageWithUrl,
  config: Partial<ImageOptimizationConfig> = {}
): OptimizedImage {
  const mergedConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  const widths = getResponsiveWidths(image.kind, image.width, mergedConfig.widths);

  // Generate srcset strings
  const webpSrcset = mergedConfig.webp
    ? generateSrcset(image, widths, 'webp')
    : '';
  const fallbackSrcset = mergedConfig.srcset
    ? generateSrcset(image, widths, 'original')
    : `${image.src} ${image.width}w`;

  // Generate sizes attribute
  const sizes = generateSizes(image.kind, mergedConfig.sizes);

  // Determine if lazy loading is appropriate
  // OG images are meta-only, hero images should be eager
  const supportsLazyLoad = image.kind === 'inline';

  return {
    ...image,
    webpSrcset,
    fallbackSrcset,
    sizes,
    supportsLazyLoad,
  };
}

/**
 * Get loading attribute value based on image priority
 */
export function getLoadingAttribute(
  isPriority: boolean,
  kind: ImageKind
): 'lazy' | 'eager' {
  // Priority images should load immediately
  if (isPriority) return 'eager';

  // Hero images are typically above the fold
  if (kind === 'hero') return 'eager';

  // All other images can be lazy loaded
  return 'lazy';
}

/**
 * Get fetchpriority attribute for resource prioritization
 */
export function getFetchPriority(
  isPriority: boolean,
  kind: ImageKind
): 'high' | 'low' | 'auto' {
  if (isPriority || kind === 'hero') return 'high';
  if (kind === 'inline') return 'low';
  return 'auto';
}

/**
 * Get decoding attribute based on image priority
 */
export function getDecodingAttribute(isPriority: boolean): 'async' | 'sync' | 'auto' {
  // Priority images should decode synchronously to avoid layout shift
  // Non-priority images can decode asynchronously
  return isPriority ? 'sync' : 'async';
}

/**
 * Generate all image attributes for an optimized image
 */
export interface OptimizedImageAttributes {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync' | 'auto';
  fetchpriority: 'high' | 'low' | 'auto';
}

export function getOptimizedImageAttributes(
  image: OptimizedImage,
  isPriority: boolean = false
): OptimizedImageAttributes {
  return {
    src: image.src,
    srcset: image.fallbackSrcset,
    sizes: image.sizes,
    width: image.width,
    height: image.height,
    alt: image.alt,
    loading: getLoadingAttribute(isPriority, image.kind),
    decoding: getDecodingAttribute(isPriority),
    fetchpriority: getFetchPriority(isPriority, image.kind),
  };
}
