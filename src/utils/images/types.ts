/**
 * Image Library Type Definitions
 * Supports self-hosted and remote images for OG, hero, and inline placements
 * Includes responsive image optimization types for WebP conversion and srcset
 */

export type ImageKind = 'og' | 'hero' | 'inline';
export type ImageSourceType = 'self' | 'remote';
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';

/** Responsive breakpoints for srcset generation */
export const RESPONSIVE_WIDTHS = [320, 640, 768, 1024, 1280, 1920] as const;
export type ResponsiveWidth = (typeof RESPONSIVE_WIDTHS)[number];

/** Default breakpoints for different image kinds */
export const IMAGE_KIND_BREAKPOINTS: Record<ImageKind, number[]> = {
  og: [1200], // OG images are fixed size
  hero: [640, 768, 1024, 1280, 1920], // Full-width hero images
  inline: [320, 640, 768, 1024], // Inline images typically smaller
};

export interface ImageRecord {
  id: string;
  kind: ImageKind;
  sourceType: ImageSourceType;
  src: string; // Relative path for self-hosted, absolute URL for remote
  width: number;
  height: number;
  alt: string;
  creditName?: string;
  creditUrl?: string;
  license?: string;
}

export interface ImageWithUrl extends ImageRecord {
  absoluteUrl: string;
}

/** Optimized image with responsive variants */
export interface OptimizedImage extends ImageWithUrl {
  /** WebP srcset string for picture source */
  webpSrcset: string;
  /** Original format srcset string for fallback */
  fallbackSrcset: string;
  /** Sizes attribute for responsive images */
  sizes: string;
  /** Whether this image supports lazy loading */
  supportsLazyLoad: boolean;
}

/** Configuration for image optimization */
export interface ImageOptimizationConfig {
  /** Generate WebP versions */
  webp: boolean;
  /** Generate responsive srcset */
  srcset: boolean;
  /** Custom widths to generate (overrides kind defaults) */
  widths?: number[];
  /** Quality setting (1-100) */
  quality?: number;
  /** Sizes attribute value */
  sizes?: string;
}

/** Default optimization config */
export const DEFAULT_OPTIMIZATION_CONFIG: ImageOptimizationConfig = {
  webp: true,
  srcset: true,
  quality: 80,
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
};

export interface PageImageContext {
  categoryId?: string;
  subcategoryId?: string;
  pageType?: 'home' | 'category' | 'subcategory';
}
