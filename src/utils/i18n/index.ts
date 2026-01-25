/**
 * i18n Utilities
 * Helpers for working with localized content
 */

import { DB, type Category, type Subcategory, type ContentSection } from '../db';
import { supportedLocales, defaultLocale, type Locale } from './config';

export type { Locale } from './config';
export { supportedLocales, defaultLocale, localeLabels, isValidLocale } from './config';

/**
 * Type guard to check if a value is a localized content object
 */
export function isLocalizedContent<T>(value: T | Partial<Record<Locale, T>>): value is Partial<Record<Locale, T>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  // Check if the object has at least one valid locale key
  return supportedLocales.some(locale => locale in value);
}

/**
 * Get localized field from an entity
 * @param entity - The entity (category or subcategory)
 * @param fieldName - The field name to get
 * @param locale - The locale to get
 * @param strictMode - If true, returns undefined when locale doesn't exist (default: true)
 * @returns The localized value or undefined
 */
export function getLocalizedField<T>(
  entity: any,
  fieldName: string,
  locale: Locale,
  strictMode: boolean = true
): T | undefined {
  const field = entity[fieldName];

  if (field === undefined) {
    return undefined;
  }

  // Check if field is localized
  if (isLocalizedContent(field)) {
    const localized = field[locale] as T;
    if (localized === undefined && !strictMode) {
      return field[defaultLocale] as T;
    }
    return localized;
  }

  // Field is not localized, return as-is
  return field as T;
}

/**
 * Get all available locales for an entity based on its localized fields
 */
export function getAvailableLocalesForEntity(
  entity: Category | Subcategory
): Locale[] {
  const availableLocales = new Set<Locale>();

  // Check which locales have content
  const fieldsToCheck = ['title', 'description', 'content'];

  for (const fieldName of fieldsToCheck) {
    const field = (entity as any)[fieldName];

    if (isLocalizedContent(field)) {
      // Add all locales that exist for this field
      for (const locale of supportedLocales) {
        if (field[locale] !== undefined) {
          availableLocales.add(locale);
        }
      }
    } else if (field !== undefined) {
      // Non-localized field exists, add default locale
      availableLocales.add(defaultLocale);
    }
  }

  return Array.from(availableLocales).sort((a, b) =>
    supportedLocales.indexOf(a) - supportedLocales.indexOf(b)
  );
}

/**
 * Build localized URL for an entity
 */
export function buildLocalizedUrl(
  locale: Locale,
  entity: Category | Subcategory,
  base: string = ''
): string {
  const path = 'parentCategoryId' in entity
    ? DB.getFullPath(entity as Subcategory)
    : entity.slug;

  return `${base}/${locale}/${path}/`;
}

/**
 * Build hreflang link objects for SEO
 */
export interface HreflangLink {
  hreflang: string;
  href: string;
}

export function buildHreflangLinks(
  entity: Category | Subcategory,
  siteBase: string,
  base: string = ''
): HreflangLink[] {
  const availableLocales = getAvailableLocalesForEntity(entity);

  return availableLocales.map(locale => ({
    hreflang: locale,
    href: `${siteBase}${buildLocalizedUrl(locale, entity, base)}`
  }));
}

/**
 * Get localized content section
 */
export function getLocalizedContentSection(
  entity: Category | Subcategory,
  locale: Locale
): ContentSection | undefined {
  const content = entity.content;

  if (!content) {
    return undefined;
  }

  // Check if content is localized
  if (isLocalizedContent<ContentSection>(content)) {
    return content[locale];
  }

  // Content is not localized, return as-is for default locale
  return locale === defaultLocale ? (content as ContentSection) : undefined;
}

/**
 * Link policy configuration for missing locale targets
 */
export type LinkPolicy = 'skip' | 'fallbackToDefaultLocale';

export const linkPolicyConfig: { missingLocaleTarget: LinkPolicy } = {
  missingLocaleTarget: 'skip'
};
