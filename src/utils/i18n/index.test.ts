/**
 * Tests for i18n utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isLocalizedContent,
  getLocalizedField,
  getAvailableLocalesForEntity,
  buildLocalizedUrl,
  buildHreflangLinks
} from './index';
import type { Category, Subcategory } from '../db';

describe('i18n utilities', () => {
  describe('isLocalizedContent', () => {
    it('should return true for localized content object', () => {
      const localized = {
        en: 'English content',
        fi: 'Finnish content'
      };
      expect(isLocalizedContent(localized)).toBe(true);
    });

    it('should return false for non-localized string', () => {
      const nonLocalized = 'Simple string';
      expect(isLocalizedContent(nonLocalized)).toBe(false);
    });

    it('should return false for array', () => {
      const array = ['item1', 'item2'];
      expect(isLocalizedContent(array)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLocalizedContent(null)).toBe(false);
    });
  });

  describe('getLocalizedField', () => {
    it('should get localized field value', () => {
      const entity = {
        id: 'test',
        title: {
          en: 'English Title',
          fi: 'Finnish Title'
        }
      };

      expect(getLocalizedField(entity, 'title', 'en')).toBe('English Title');
      expect(getLocalizedField(entity, 'title', 'fi')).toBe('Finnish Title');
    });

    it('should return non-localized field as-is', () => {
      const entity = {
        id: 'test',
        title: 'Simple Title'
      };

      expect(getLocalizedField(entity, 'title', 'en')).toBe('Simple Title');
      expect(getLocalizedField(entity, 'title', 'fi')).toBe('Simple Title');
    });

    it('should return undefined for missing locale in strict mode', () => {
      const entity = {
        id: 'test',
        title: {
          en: 'English Title'
        }
      };

      expect(getLocalizedField(entity, 'title', 'fi', true)).toBeUndefined();
    });

    it('should fallback to default locale in non-strict mode', () => {
      const entity = {
        id: 'test',
        title: {
          en: 'English Title'
        }
      };

      expect(getLocalizedField(entity, 'title', 'fi', false)).toBe('English Title');
    });
  });

  describe('getAvailableLocalesForEntity', () => {
    it('should return locales that have content', () => {
      const entity: Partial<Category> = {
        id: 'test',
        slug: 'test',
        title: {
          en: 'English Title',
          fi: 'Finnish Title'
        },
        description: {
          en: 'English Description',
          fi: 'Finnish Description'
        },
        content: {
          en: { overview: ['English content'] },
          fi: { overview: ['Finnish content'] }
        },
        subcategoryIds: []
      };

      const locales = getAvailableLocalesForEntity(entity as Category);
      expect(locales).toContain('en');
      expect(locales).toContain('fi');
      expect(locales.length).toBe(2);
    });

    it('should return only default locale for non-localized entity', () => {
      const entity: Partial<Category> = {
        id: 'test',
        slug: 'test',
        title: 'Simple Title',
        description: 'Simple Description',
        content: { overview: ['Simple content'] },
        subcategoryIds: []
      };

      const locales = getAvailableLocalesForEntity(entity as Category);
      expect(locales).toContain('en');
      expect(locales.length).toBe(1);
    });

    it('should return locales for any field that has content', () => {
      const entity: Partial<Category> = {
        id: 'test',
        slug: 'test',
        title: {
          en: 'English Title',
          fi: 'Finnish Title'
        },
        description: {
          en: 'English Description'
          // Missing fi description, but fi title exists
        },
        content: {
          en: { overview: ['English content'] }
        },
        subcategoryIds: []
      };

      const locales = getAvailableLocalesForEntity(entity as Category);
      expect(locales).toContain('en');
      // fi is included because title exists (even though description is missing)
      expect(locales).toContain('fi');
      expect(locales.length).toBe(2);
    });
  });

  describe('buildLocalizedUrl', () => {
    it('should build URL with locale prefix for category', () => {
      const category: Partial<Category> = {
        id: 'crm-software',
        slug: 'crm-software',
        title: 'CRM Software',
        description: 'CRM tools',
        subcategoryIds: []
      };

      const url = buildLocalizedUrl('en', category as Category);
      expect(url).toBe('/en/crm-software/');
    });

    it('should build URL with locale prefix for category with base', () => {
      const category: Partial<Category> = {
        id: 'crm-software',
        slug: 'crm-software',
        title: 'CRM Software',
        description: 'CRM tools',
        subcategoryIds: []
      };

      const url = buildLocalizedUrl('fi', category as Category, '/base');
      expect(url).toBe('/base/fi/crm-software/');
    });
  });

  describe('buildHreflangLinks', () => {
    it('should build hreflang links for available locales only', () => {
      const entity: Partial<Category> = {
        id: 'test',
        slug: 'test',
        title: {
          en: 'English Title',
          fi: 'Finnish Title'
        },
        description: {
          en: 'English Description',
          fi: 'Finnish Description'
        },
        content: {
          en: { overview: ['English'] },
          fi: { overview: ['Finnish'] }
        },
        subcategoryIds: []
      };

      const links = buildHreflangLinks(
        entity as Category,
        'https://example.com'
      );

      expect(links.length).toBe(2);
      expect(links.find(l => l.hreflang === 'en')).toBeDefined();
      expect(links.find(l => l.hreflang === 'fi')).toBeDefined();
      expect(links.find(l => l.hreflang === 'en')?.href).toBe('https://example.com/en/test/');
      expect(links.find(l => l.hreflang === 'fi')?.href).toBe('https://example.com/fi/test/');
    });

    it('should only include hreflang for locales with complete content', () => {
      const entity: Partial<Category> = {
        id: 'test',
        slug: 'test',
        title: {
          en: 'English Title'
          // Missing fi title
        },
        description: {
          en: 'English Description'
        },
        content: {
          en: { overview: ['English'] }
        },
        subcategoryIds: []
      };

      const links = buildHreflangLinks(
        entity as Category,
        'https://example.com'
      );

      expect(links.length).toBe(1);
      expect(links[0].hreflang).toBe('en');
    });
  });
});
