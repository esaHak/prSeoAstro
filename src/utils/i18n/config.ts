/**
 * i18n Configuration
 * Defines supported locales and locale labels
 */

export const supportedLocales = ['en', 'fi'] as const;
export type Locale = typeof supportedLocales[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  fi: { short: 'FI', full: 'Suomi' }
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}
