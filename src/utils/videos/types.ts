/**
 * Video Library Types
 * Type definitions for the video embedding system
 */

export type VideoPlatform =
  | 'youtube'
  | 'vimeo'
  | 'loom'
  | 'wistia'
  | 'vidyard'
  | 'twitch'
  | 'dailymotion';

export type VideoPrivacyMode = 'lite' | 'standard';

export type VideoParams = {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
};

/**
 * Video record stored in videos.json
 */
export interface VideoRecord {
  id: string;
  platform: VideoPlatform;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string; // Optional self-hosted or remote URL
  start?: number; // Optional start time in seconds
  aspectRatio?: string; // Default "16/9"
  privacy?: {
    mode?: VideoPrivacyMode; // Default "lite" for YouTube
  };
  params?: VideoParams;
}

/**
 * Normalized video data with embed URL
 */
export interface NormalizedVideo {
  platform: VideoPlatform;
  videoId: string;
  embedUrl: string;
  thumbnailUrl?: string;
}

/**
 * Video block for inline content
 */
export interface VideoBlock {
  type: 'video';
  videoId: string;
  caption?: string;
  variant?: 'inline' | 'hero';
  aspectRatio?: string;
  mode?: VideoPrivacyMode;
}

/**
 * Image block for inline content
 */
export interface ImageBlock {
  type: 'image';
  imageId: string;
  caption?: string;
  align?: 'left' | 'right' | 'center';
}

/**
 * Content item can be a string paragraph, video block, or image block
 */
export type ContentItem = string | VideoBlock | ImageBlock;
