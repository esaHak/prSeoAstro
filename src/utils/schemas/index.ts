/**
 * Rich Results Schema Utilities
 * Re-exports types and provides helper functions
 */

export type {
  FAQItem,
  HowToStep,
  HowToSupply,
  HowToTool,
  HowToContent,
  SoftwareOffer,
  RatingInfo,
  RatedItemType,
  SoftwareApplicationContent,
  AggregateRatingContent,
  RichResultsConfig
} from './types';

import type { Localizable } from '../db';
import type { Locale } from '../i18n/config';
import type { RichResultsConfig } from './types';

/**
 * Extract localized rich results config
 */
export function getLocalizedRichResults(
  richResults: Localizable<RichResultsConfig> | undefined,
  locale: Locale
): RichResultsConfig | undefined {
  if (!richResults) return undefined;

  // Check if it's a localized object
  if (typeof richResults === 'object' && ('en' in richResults || 'fi' in richResults)) {
    return (richResults as Record<Locale, RichResultsConfig>)[locale];
  }

  // It's a non-localized config, return as-is
  return richResults as RichResultsConfig;
}
