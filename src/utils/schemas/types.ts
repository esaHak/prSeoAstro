/**
 * Rich Results Schema Types
 * Type definitions for structured data content blocks
 */

/**
 * FAQ Item for FAQPage schema
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * HowTo Step for HowTo schema
 */
export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

/**
 * HowTo Supply for HowTo schema
 */
export interface HowToSupply {
  name: string;
  url?: string;
}

/**
 * HowTo Tool for HowTo schema
 */
export interface HowToTool {
  name: string;
  url?: string;
}

/**
 * Complete HowTo content block
 */
export interface HowToContent {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M")
  estimatedCost?: {
    currency: string;
    value: string;
  };
  supply?: HowToSupply[];
  tool?: HowToTool[];
  image?: string;
}

/**
 * Software application offer (pricing)
 */
export interface SoftwareOffer {
  price: string | number;
  priceCurrency: string;
  priceValidUntil?: string; // ISO 8601 date
}

/**
 * Rating information for aggregate ratings
 */
export interface RatingInfo {
  ratingValue: number;
  ratingCount?: number;
  reviewCount?: number;
  bestRating?: number;
  worstRating?: number;
}

/**
 * Rated item type for AggregateRating schema
 */
export type RatedItemType =
  | 'Product'
  | 'Service'
  | 'Organization'
  | 'LocalBusiness'
  | 'Book'
  | 'Course'
  | 'Event'
  | 'Recipe'
  | 'CreativeWork'
  | 'Brand'
  | 'Place';

/**
 * Complete Software Application content block
 */
export interface SoftwareApplicationContent {
  name: string;
  description?: string;
  applicationCategory?: string; // e.g., "BusinessApplication", "GameApplication"
  operatingSystem?: string; // e.g., "Windows, macOS, Linux"
  offers?: SoftwareOffer;
  aggregateRating?: RatingInfo;
  screenshot?: string | string[];
  softwareVersion?: string;
  datePublished?: string;
  downloadUrl?: string;
  installUrl?: string;
  featureList?: string | string[];
  requirements?: string;
}

/**
 * Aggregate rating content block for any item type
 */
export interface AggregateRatingContent {
  itemType: RatedItemType;
  itemName: string;
  itemDescription?: string;
  itemUrl?: string;
  itemImage?: string;
  rating: RatingInfo;
}

/**
 * Rich results configuration for an entity
 * Can be attached to categories and subcategories
 */
export interface RichResultsConfig {
  faq?: FAQItem[];
  howTo?: HowToContent;
  softwareApplication?: SoftwareApplicationContent;
  aggregateRating?: AggregateRatingContent;
}
