/**
 * Unit tests for Video Library utilities
 * Tests URL normalization for all supported platforms
 */

import { describe, it, expect } from 'vitest';
import { normalizeVideoUrl, buildEmbedUrl, validateVideoRecord } from './index';
import type { VideoRecord } from './types';

describe('normalizeVideoUrl', () => {
  describe('YouTube', () => {
    it('should normalize standard watch URL', () => {
      const result = normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });

    it('should normalize youtu.be short URL', () => {
      const result = normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });

    it('should normalize shorts URL', () => {
      const result = normalizeVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
      expect(result).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });

    it('should normalize embed URL', () => {
      const result = normalizeVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(result).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });

    it('should handle URL with query parameters', () => {
      const result = normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });
  });

  describe('Vimeo', () => {
    it('should normalize standard Vimeo URL', () => {
      const result = normalizeVideoUrl('https://vimeo.com/148751763');
      expect(result).toEqual({
        platform: 'vimeo',
        videoId: '148751763',
        embedUrl: 'https://player.vimeo.com/video/148751763',
      });
    });

    it('should normalize player.vimeo.com URL', () => {
      const result = normalizeVideoUrl('https://player.vimeo.com/video/148751763');
      expect(result).toEqual({
        platform: 'vimeo',
        videoId: '148751763',
        embedUrl: 'https://player.vimeo.com/video/148751763',
      });
    });

    it('should normalize Vimeo channel URL', () => {
      const result = normalizeVideoUrl('https://vimeo.com/channels/staffpicks/148751763');
      expect(result).toEqual({
        platform: 'vimeo',
        videoId: '148751763',
        embedUrl: 'https://player.vimeo.com/video/148751763',
      });
    });
  });

  describe('Loom', () => {
    it('should normalize Loom share URL', () => {
      const result = normalizeVideoUrl('https://www.loom.com/share/abc123def456');
      expect(result).toEqual({
        platform: 'loom',
        videoId: 'abc123def456',
        embedUrl: 'https://www.loom.com/embed/abc123def456',
      });
    });

    it('should normalize Loom embed URL', () => {
      const result = normalizeVideoUrl('https://www.loom.com/embed/abc123def456');
      expect(result).toEqual({
        platform: 'loom',
        videoId: 'abc123def456',
        embedUrl: 'https://www.loom.com/embed/abc123def456',
      });
    });
  });

  describe('Wistia', () => {
    it('should normalize Wistia medias URL', () => {
      const result = normalizeVideoUrl('https://company.wistia.com/medias/xyz123');
      expect(result).toEqual({
        platform: 'wistia',
        videoId: 'xyz123',
        embedUrl: 'https://fast.wistia.net/embed/iframe/xyz123',
      });
    });

    it('should normalize Wistia embed iframe URL', () => {
      const result = normalizeVideoUrl('https://fast.wistia.net/embed/iframe/xyz123');
      expect(result).toEqual({
        platform: 'wistia',
        videoId: 'xyz123',
        embedUrl: 'https://fast.wistia.net/embed/iframe/xyz123',
      });
    });
  });

  describe('Vidyard', () => {
    it('should normalize Vidyard watch URL', () => {
      const result = normalizeVideoUrl('https://vidyard.com/watch/abc123');
      expect(result).toEqual({
        platform: 'vidyard',
        videoId: 'abc123',
        embedUrl: 'https://play.vidyard.com/abc123',
      });
    });

    it('should normalize Vidyard play URL', () => {
      const result = normalizeVideoUrl('https://play.vidyard.com/abc123');
      expect(result).toEqual({
        platform: 'vidyard',
        videoId: 'abc123',
        embedUrl: 'https://play.vidyard.com/abc123',
      });
    });

    it('should normalize Vidyard share URL', () => {
      const result = normalizeVideoUrl('https://share.vidyard.com/watch/abc123');
      expect(result).toEqual({
        platform: 'vidyard',
        videoId: 'abc123',
        embedUrl: 'https://play.vidyard.com/abc123',
      });
    });
  });

  describe('Dailymotion', () => {
    it('should normalize Dailymotion video URL', () => {
      const result = normalizeVideoUrl('https://www.dailymotion.com/video/x8abc123');
      expect(result).toEqual({
        platform: 'dailymotion',
        videoId: 'x8abc123',
        embedUrl: 'https://www.dailymotion.com/embed/video/x8abc123',
      });
    });

    it('should normalize dai.ly short URL', () => {
      const result = normalizeVideoUrl('https://dai.ly/x8abc123');
      expect(result).toEqual({
        platform: 'dailymotion',
        videoId: 'x8abc123',
        embedUrl: 'https://www.dailymotion.com/embed/video/x8abc123',
      });
    });
  });

  describe('Twitch', () => {
    it('should normalize Twitch video URL', () => {
      const result = normalizeVideoUrl('https://www.twitch.tv/videos/123456789');
      expect(result?.platform).toBe('twitch');
      expect(result?.videoId).toBe('123456789');
      expect(result?.embedUrl).toContain('player.twitch.tv');
    });

    it('should normalize Twitch clips URL', () => {
      const result = normalizeVideoUrl('https://clips.twitch.tv/AwesomeClipName');
      expect(result?.platform).toBe('twitch');
      expect(result?.videoId).toBe('AwesomeClipName');
      expect(result?.embedUrl).toContain('clips.twitch.tv/embed');
    });
  });

  describe('Unknown/Invalid URLs', () => {
    it('should return null for unknown platform', () => {
      const result = normalizeVideoUrl('https://unknown-platform.com/video/123');
      expect(result).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const result = normalizeVideoUrl('not-a-url');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = normalizeVideoUrl('');
      expect(result).toBeNull();
    });
  });
});

describe('buildEmbedUrl', () => {
  it('should build YouTube embed URL with start time', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test',
      start: 30,
    };

    const embedUrl = buildEmbedUrl(video);
    expect(embedUrl).toContain('start=30');
  });

  it('should build YouTube embed URL with autoplay', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test',
      params: { autoplay: true },
    };

    const embedUrl = buildEmbedUrl(video);
    expect(embedUrl).toContain('autoplay=1');
  });

  it('should use youtube-nocookie.com for lite mode', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test',
      privacy: { mode: 'lite' },
    };

    const embedUrl = buildEmbedUrl(video);
    expect(embedUrl).toContain('youtube-nocookie.com');
  });

  it('should build Vimeo embed URL with start time', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'vimeo',
      url: 'https://vimeo.com/148751763',
      title: 'Test',
      start: 30,
    };

    const embedUrl = buildEmbedUrl(video);
    expect(embedUrl).toContain('t=30s');
  });

  it('should build embed URL without parameters', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test',
    };

    const embedUrl = buildEmbedUrl(video);
    expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });
});

describe('validateVideoRecord', () => {
  it('should validate correct video record', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test Video',
    };

    expect(validateVideoRecord(video)).toBe(true);
  });

  it('should fail validation for missing required fields', () => {
    const video = {
      id: 'test',
      platform: 'youtube',
      // missing url and title
    } as VideoRecord;

    expect(validateVideoRecord(video)).toBe(false);
  });

  it('should fail validation for invalid platform', () => {
    const video = {
      id: 'test',
      platform: 'invalid-platform',
      url: 'https://example.com/video',
      title: 'Test',
    } as any;

    expect(validateVideoRecord(video)).toBe(false);
  });

  it('should fail validation for non-normalizable URL', () => {
    const video: VideoRecord = {
      id: 'test',
      platform: 'youtube',
      url: 'https://invalid-youtube-url.com',
      title: 'Test',
    };

    expect(validateVideoRecord(video)).toBe(false);
  });
});
