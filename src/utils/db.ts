import categoriesData from '../data/categories.json';
import subcategoriesData from '../data/subcategories.json';

export type ContentSection = {
  overview?: string[];
  keyBenefits?: string[];
  whyChoose?: string[];
  gettingStarted?: string[];
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  subcategoryIds: string[];
  content?: ContentSection;
};

export type Subcategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  parentCategoryId: string;
  relatedCategoryIds: string[];
  content?: ContentSection;
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
   */
  static getBreadcrumbs(subcategory: Subcategory): Array<{ title: string; slug: string; path: string }> {
    const breadcrumbs: Array<{ title: string; slug: string; path: string }> = [];
    let current: Subcategory | Category | undefined = subcategory;
    const pathSegments: string[] = [subcategory.slug];

    while (current) {
      if ('parentCategoryId' in current) {
        // It's a subcategory
        const parent: Subcategory | Category | undefined =
          this.getSubcategoryById(current.parentCategoryId) ||
          this.getCategoryById(current.parentCategoryId);

        breadcrumbs.unshift({
          title: current.title,
          slug: current.slug,
          path: pathSegments.join('/')
        });

        if (parent && 'parentCategoryId' in parent) {
          pathSegments.unshift(parent.slug);
        } else if (parent) {
          pathSegments.unshift(parent.slug);
        }

        current = parent;
      } else {
        // It's a category (root level)
        breadcrumbs.unshift({
          title: current.title,
          slug: current.slug,
          path: current.slug
        });
        current = undefined;
      }
    }

    return breadcrumbs;
  }
}
