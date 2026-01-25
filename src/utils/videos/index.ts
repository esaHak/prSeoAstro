/**
 * Video Library Utilities
 * Handles video URL normalization, embed URL generation, and video record management
 */

import videosData from '../../data/videos.json';
import type { VideoRecord, NormalizedVideo, VideoPlatform } from './types';

// Type-safe data import
export const videos = videosData as VideoRecord[];

/**
 * Load video by ID from videos.json
 */
export function getVideoById(id: string): VideoRecord | undefined {
  return videos.find(video => video.id === id);
}

/**
 * Normalize various video URL formats to extract platform, video ID, and generate embed URL
 * Returns null for unknown/invalid URLs
 */
export function normalizeVideoUrl(url: string): NormalizedVideo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return normalizeYouTubeUrl(url, urlObj);
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      return normalizeVimeoUrl(url, urlObj);
    }

    // Loom
    if (hostname.includes('loom.com')) {
      return normalizeLoomUrl(url, urlObj);
    }

    // Wistia
    if (hostname.includes('wistia.com') || hostname.includes('wistia.net') || hostname.includes('wi.st')) {
      return normalizeWistiaUrl(url, urlObj);
    }

    // Vidyard
    if (hostname.includes('vidyard.com')) {
      return normalizeVidyardUrl(url, urlObj);
    }

    // Twitch
    if (hostname.includes('twitch.tv')) {
      return normalizeTwitchUrl(url, urlObj);
    }

    // Dailymotion
    if (hostname.includes('dailymotion.com') || hostname.includes('dai.ly')) {
      return normalizeDailymotionUrl(url, urlObj);
    }

    return null;
  } catch (e) {
    // Invalid URL
    return null;
  }
}

/**
 * YouTube URL normalization
 * Handles: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
function normalizeYouTubeUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.hostname.includes('youtu.be')) {
    // youtu.be/VIDEO_ID
    videoId = urlObj.pathname.slice(1).split('?')[0];
  } else if (urlObj.pathname.includes('/shorts/')) {
    // youtube.com/shorts/VIDEO_ID
    videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0];
  } else if (urlObj.pathname.includes('/embed/')) {
    // youtube.com/embed/VIDEO_ID
    videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
  } else {
    // youtube.com/watch?v=VIDEO_ID
    videoId = urlObj.searchParams.get('v');
  }

  if (!videoId) return null;

  return {
    platform: 'youtube',
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

/**
 * Vimeo URL normalization
 * Handles: vimeo.com/VIDEO_ID, vimeo.com/channels/CHANNEL/VIDEO_ID, player.vimeo.com/video/VIDEO_ID
 */
function normalizeVimeoUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.hostname.includes('player.vimeo.com')) {
    // player.vimeo.com/video/VIDEO_ID
    videoId = urlObj.pathname.split('/video/')[1]?.split('?')[0];
  } else {
    // vimeo.com/VIDEO_ID or vimeo.com/channels/*/VIDEO_ID
    const parts = urlObj.pathname.split('/').filter(Boolean);
    videoId = parts[parts.length - 1];
  }

  if (!videoId || !/^\d+$/.test(videoId)) return null;

  return {
    platform: 'vimeo',
    videoId,
    embedUrl: `https://player.vimeo.com/video/${videoId}`,
  };
}

/**
 * Loom URL normalization
 * Handles: loom.com/share/VIDEO_ID, loom.com/embed/VIDEO_ID
 */
function normalizeLoomUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.pathname.includes('/share/')) {
    videoId = urlObj.pathname.split('/share/')[1]?.split('?')[0];
  } else if (urlObj.pathname.includes('/embed/')) {
    videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  return {
    platform: 'loom',
    videoId,
    embedUrl: `https://www.loom.com/embed/${videoId}`,
  };
}

/**
 * Wistia URL normalization
 * Handles: *.wistia.com/medias/VIDEO_ID, fast.wistia.net/embed/iframe/VIDEO_ID
 */
function normalizeWistiaUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.pathname.includes('/medias/')) {
    videoId = urlObj.pathname.split('/medias/')[1]?.split('?')[0];
  } else if (urlObj.pathname.includes('/embed/iframe/')) {
    videoId = urlObj.pathname.split('/embed/iframe/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  return {
    platform: 'wistia',
    videoId,
    embedUrl: `https://fast.wistia.net/embed/iframe/${videoId}`,
  };
}

/**
 * Vidyard URL normalization
 * Handles: vidyard.com/watch/VIDEO_ID, share.vidyard.com/watch/VIDEO_ID, play.vidyard.com/VIDEO_ID
 */
function normalizeVidyardUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.pathname.includes('/watch/')) {
    videoId = urlObj.pathname.split('/watch/')[1]?.split('?')[0];
  } else if (urlObj.hostname.includes('play.vidyard.com')) {
    videoId = urlObj.pathname.slice(1).split('?')[0];
  }

  if (!videoId) return null;

  return {
    platform: 'vidyard',
    videoId,
    embedUrl: `https://play.vidyard.com/${videoId}`,
  };
}

/**
 * Twitch URL normalization
 * Handles: twitch.tv/videos/VIDEO_ID, clips.twitch.tv/CLIP_ID
 */
function normalizeTwitchUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;
  let isClip = false;

  if (urlObj.hostname.includes('clips.twitch.tv')) {
    // clips.twitch.tv/CLIP_ID
    videoId = urlObj.pathname.slice(1).split('?')[0];
    isClip = true;
  } else if (urlObj.pathname.includes('/videos/')) {
    // twitch.tv/videos/VIDEO_ID
    videoId = urlObj.pathname.split('/videos/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  const embedUrl = isClip
    ? `https://clips.twitch.tv/embed?clip=${videoId}&parent=${urlObj.hostname}`
    : `https://player.twitch.tv/?video=${videoId}&parent=${urlObj.hostname}`;

  return {
    platform: 'twitch',
    videoId,
    embedUrl,
  };
}

/**
 * Dailymotion URL normalization
 * Handles: dailymotion.com/video/VIDEO_ID, dai.ly/VIDEO_ID
 */
function normalizeDailymotionUrl(url: string, urlObj: URL): NormalizedVideo | null {
  let videoId: string | null = null;

  if (urlObj.hostname.includes('dai.ly')) {
    // dai.ly/VIDEO_ID
    videoId = urlObj.pathname.slice(1).split('?')[0];
  } else if (urlObj.pathname.includes('/video/')) {
    // dailymotion.com/video/VIDEO_ID
    videoId = urlObj.pathname.split('/video/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  return {
    platform: 'dailymotion',
    videoId,
    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
  };
}

/**
 * Build embed URL from a video record
 * Applies custom parameters like start time, autoplay, etc.
 */
export function buildEmbedUrl(video: VideoRecord): string {
  const normalized = normalizeVideoUrl(video.url);
  if (!normalized) {
    throw new Error(`Unable to normalize video URL: ${video.url}`);
  }

  let embedUrl = normalized.embedUrl;
  const params = new URLSearchParams();

  // Platform-specific parameter handling
  switch (video.platform) {
    case 'youtube':
      if (video.start) params.set('start', video.start.toString());
      if (video.params?.autoplay) params.set('autoplay', '1');
      if (video.params?.mute) params.set('mute', '1');
      if (video.params?.loop) {
        params.set('loop', '1');
        params.set('playlist', normalized.videoId);
      }
      if (video.params?.controls === false) params.set('controls', '0');
      // Privacy-enhanced mode
      if (video.privacy?.mode === 'lite') {
        embedUrl = embedUrl.replace('youtube.com', 'youtube-nocookie.com');
      }
      break;

    case 'vimeo':
      if (video.start) params.set('t', `${video.start}s`);
      if (video.params?.autoplay) params.set('autoplay', '1');
      if (video.params?.mute) params.set('muted', '1');
      if (video.params?.loop) params.set('loop', '1');
      break;

    case 'loom':
      if (video.params?.autoplay) params.set('autoplay', 'true');
      break;

    case 'wistia':
      // Wistia uses different parameter format
      if (video.params?.autoplay) params.set('autoPlay', 'true');
      if (video.params?.mute) params.set('muted', 'true');
      break;

    case 'dailymotion':
      if (video.start) params.set('start', video.start.toString());
      if (video.params?.autoplay) params.set('autoplay', '1');
      if (video.params?.mute) params.set('mute', '1');
      break;
  }

  const queryString = params.toString();
  return queryString ? `${embedUrl}?${queryString}` : embedUrl;
}

/**
 * Get video thumbnail URL
 * Returns custom thumbnail or platform default
 */
export function getVideoThumbnail(video: VideoRecord): string | undefined {
  if (video.thumbnail) {
    return video.thumbnail;
  }

  const normalized = normalizeVideoUrl(video.url);
  return normalized?.thumbnailUrl;
}

/**
 * Validate video record structure
 */
export function validateVideoRecord(video: VideoRecord): boolean {
  if (!video.id || !video.platform || !video.url || !video.title) {
    console.error('Invalid video record: missing required fields', video);
    return false;
  }

  const validPlatforms: VideoPlatform[] = [
    'youtube',
    'vimeo',
    'loom',
    'wistia',
    'vidyard',
    'twitch',
    'dailymotion',
  ];

  if (!validPlatforms.includes(video.platform)) {
    console.error(`Invalid video platform: ${video.platform}`, video);
    return false;
  }

  // Try to normalize URL
  const normalized = normalizeVideoUrl(video.url);
  if (!normalized) {
    console.error(`Unable to normalize video URL: ${video.url}`, video);
    return false;
  }

  return true;
}

/**
 * Validate all videos on startup
 */
export function validateAllVideos(): void {
  const errors: string[] = [];

  videos.forEach(video => {
    if (!validateVideoRecord(video)) {
      errors.push(`Invalid video: ${video.id}`);
    }
  });

  // Check for duplicate IDs
  const ids = new Set<string>();
  videos.forEach(video => {
    if (ids.has(video.id)) {
      errors.push(`Duplicate video ID: ${video.id}`);
    }
    ids.add(video.id);
  });

  if (errors.length > 0) {
    console.error('Video validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Video validation failed with ${errors.length} error(s)`);
  }
}

// Run validation on import (only if videos exist)
if (videos && videos.length > 0) {
  validateAllVideos();
}
