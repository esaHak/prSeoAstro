/**
 * Image Library Type Definitions
 * Supports self-hosted and remote images for OG, hero, and inline placements
 */

export type ImageKind = 'og' | 'hero' | 'inline';
export type ImageSourceType = 'self' | 'remote';

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

export interface PageImageContext {
  categoryId?: string;
  subcategoryId?: string;
  pageType?: 'home' | 'category' | 'subcategory';
}
