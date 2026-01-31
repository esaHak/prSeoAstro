import categoriesData from '../data/categories.json';
import subcategoriesData from '../data/subcategories.json';
import type { ContentItem } from './videos/types';
import type { Locale } from './i18n/config';
import type { RichResultsConfig } from './schemas/types';

export type ContentSection = {
  overview?: ContentItem[];
  keyBenefits?: ContentItem[];
  whyChoose?: ContentItem[];
  gettingStarted?: ContentItem[];
};

/**
 * Localizable field type - can be either:
 * - A single value (legacy/non-localized)
 * - An object keyed by locale (new localized format)
 */
export type Localizable<T> = T | Partial<Record<Locale, T>>;

/**
 * Content status for workflow management
 */
export type ContentStatus = 'draft' | 'published' | 'archived';

export type Category = {
  id: string;
  slug: string;
  title: Localizable<string>;
  description: Localizable<string>;
  subcategoryIds: string[];
  content?: Localizable<ContentSection>;
  // Image fields for Image Library
  ogImageId?: string;      // OG image for social sharing
  heroImageId?: string;     // Optional hero image
  inlineImageIds?: string[]; // Optional inline content images
  // Video fields for Video Library
  heroVideoId?: string;    // Optional hero video
  videoIds?: string[];     // Optional video gallery
  // Content freshness fields
  datePublished?: string;  // ISO 8601 date (e.g., "2024-01-15")
  dateModified?: string;   // ISO 8601 date
  status?: ContentStatus;  // Workflow status (default: 'published')
  // Rich results for structured data
  richResults?: Localizable<RichResultsConfig>;
};

export type Subcategory = {
  id: string;
  slug: string;
  title: Localizable<string>;
  description: Localizable<string>;
  parentCategoryId: string;
  relatedCategoryIds: string[];
  content?: Localizable<ContentSection>;
  // Image fields for Image Library
  ogImageId?: string;      // OG image override
  heroImageId?: string;     // Optional hero image
  inlineImageIds?: string[]; // Optional inline content images
  // Video fields for Video Library
  heroVideoId?: string;    // Optional hero video
  videoIds?: string[];     // Optional video gallery
  // Content freshness fields
  datePublished?: string;  // ISO 8601 date (e.g., "2024-01-15")
  dateModified?: string;   // ISO 8601 date
  status?: ContentStatus;  // Workflow status (default: 'published')
  // Rich results for structured data
  richResults?: Localizable<RichResultsConfig>;
};

// Type-safe data imports
export const categories = categoriesData as Category[];
export const subcategories = subcategoriesData as Subcategory[];

/**
 * Database utility class for querying relational data
 */
export class DB {
  // Category queries
  static getAllCategories(): Category[] {
    return categories;
  }

  static getCategoryById(id: string): Category | undefined {
    return categories.find(cat => cat.id === id);
  }

  static getCategoryBySlug(slug: string): Category | undefined {
    return categories.find(cat => cat.slug === slug);
  }

  // Subcategory queries
  static getAllSubcategories(): Subcategory[] {
    return subcategories;
  }

  static getSubcategoryById(id: string): Subcategory | undefined {
    return subcategories.find(sub => sub.id === id);
  }

  static getSubcategoryBySlug(slug: string): Subcategory | undefined {
    return subcategories.find(sub => sub.slug === slug);
  }

  // Relational queries
  static getSubcategoriesByCategory(categoryId: string): Subcategory[] {
    return subcategories.filter(sub => sub.parentCategoryId === categoryId);
  }

  static getParentCategory(subcategory: Subcategory): Category | undefined {
    return this.getCategoryById(subcategory.parentCategoryId);
  }

  static getRelatedCategories(subcategory: Subcategory): Category[] {
    return subcategory.relatedCategoryIds
      .map(id => this.getCategoryById(id))
      .filter((cat): cat is Category => cat !== undefined);
  }

  static getChildSubcategories(subcategory: Subcategory): Subcategory[] {
    return subcategories.filter(sub => sub.parentCategoryId === subcategory.id);
  }

  /**
   * Build full path for a subcategory (e.g., "crm-software/crm-for-startups/free-crm-for-startups")
   */
  static getFullPath(subcategory: Subcategory): string {
    const path: string[] = [subcategory.slug];
    let current = subcategory;

    // Walk up the tree to find parent subcategories
    while (current.parentCategoryId) {
      const parent = this.getSubcategoryById(current.parentCategoryId);
      if (parent) {
        path.unshift(parent.slug);
        current = parent;
      } else {
        // Parent is a category, not a subcategory
        const category = this.getCategoryById(current.parentCategoryId);
        if (category) {
          path.unshift(category.slug);
        }
        break;
      }
    }

    return path.join('/');
  }

  /**
   * Find a subcategory by its full path
   */
  static findByPath(path: string): { category?: Category; subcategory?: Subcategory } {
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return {};
    }

    // First segment should be a category
    const category = this.getCategoryBySlug(segments[0]);
    if (!category) {
      return {};
    }

    if (segments.length === 1) {
      return { category };
    }

    // Try to find the deepest matching subcategory
    let currentParentId = category.id;
    let foundSubcategory: Subcategory | undefined;

    for (let i = 1; i < segments.length; i++) {
      const slug = segments[i];
      const subcategory = subcategories.find(
        sub => sub.slug === slug && sub.parentCategoryId === currentParentId
      );

      if (!subcategory) {
        break;
      }

      foundSubcategory = subcategory;
      currentParentId = subcategory.id;
    }

    return { category, subcategory: foundSubcategory };
  }

  /**
   * Get breadcrumb trail for a subcategory
   * Note: Returns raw entities with potentially localized titles.
   * Caller should use getLocalizedField() to extract the correct title for their locale.
   */
  static getBreadcrumbs(subcategory: Subcategory): Array<{ title: Localizable<string>; slug: string; path: string }> {
    // First, collect all entities in the chain from root to current
    const chain: Array<Category | Subcategory> = [];
    let current: Subcategory | Category | undefined = subcategory;

    while (current) {
      chain.unshift(current);
      if ('parentCategoryId' in current) {
        current = this.getSubcategoryById(current.parentCategoryId) ||
                  this.getCategoryById(current.parentCategoryId);
      } else {
        current = undefined;
      }
    }

    // Now build breadcrumbs with correct cumulative paths
    const breadcrumbs: Array<{ title: Localizable<string>; slug: string; path: string }> = [];
    const pathSegments: string[] = [];

    for (const entity of chain) {
      pathSegments.push(entity.slug);
      breadcrumbs.push({
        title: entity.title,
        slug: entity.slug,
        path: pathSegments.join('/')
      });
    }

    return breadcrumbs;
  }
}
