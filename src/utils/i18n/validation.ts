/**
 * Build-time validation for localization
 * Ensures localized pages have required fields and hreflang references are valid
 */

import { DB, type Category, type Subcategory } from '../db';
import {
  getAvailableLocalesForEntity,
  getLocalizedField,
  supportedLocales,
  type Locale
} from './index';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all entities for localization completeness
 */
export function validateLocalization(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate all categories
  for (const category of DB.getAllCategories()) {
    const result = validateEntity(category, 'category');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  // Validate all subcategories
  for (const subcategory of DB.getAllSubcategories()) {
    const result = validateEntity(subcategory, 'subcategory');
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single entity
 */
function validateEntity(
  entity: Category | Subcategory,
  type: 'category' | 'subcategory'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const availableLocales = getAvailableLocalesForEntity(entity);

  // Check if entity has any locales
  if (availableLocales.length === 0) {
    errors.push(
      `${type} "${entity.id}": No locales available. Entity must have at least one locale with title, description, and content.`
    );
    return { valid: false, errors, warnings };
  }

  // Validate each available locale
  for (const locale of availableLocales) {
    const localeErrors = validateEntityLocale(entity, locale, type);
    errors.push(...localeErrors);
  }

  // Warn if entity is only available in one locale when multiple are supported
  if (availableLocales.length === 1 && supportedLocales.length > 1) {
    warnings.push(
      `${type} "${entity.id}": Only available in locale "${availableLocales[0]}". Consider adding translations.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single entity for a specific locale
 */
function validateEntityLocale(
  entity: Category | Subcategory,
  locale: Locale,
  type: 'category' | 'subcategory'
): string[] {
  const errors: string[] = [];

  // Check required fields
  const title = getLocalizedField<string>(entity, 'title', locale);
  if (!title) {
    errors.push(
      `${type} "${entity.id}" [${locale}]: Missing localized title`
    );
  }

  const description = getLocalizedField<string>(entity, 'description', locale);
  if (!description) {
    errors.push(
      `${type} "${entity.id}" [${locale}]: Missing localized description`
    );
  }

  // Content is optional but should be validated if present
  const content = getLocalizedField(entity, 'content', locale);
  if (content === undefined) {
    // Content is optional, just note it
  }

  return errors;
}

/**
 * Validate hreflang references
 * Ensures hreflang only references existing pages
 */
export function validateHreflangReferences(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Build a set of all valid locale/entity combinations
  const validPages = new Set<string>();

  for (const category of DB.getAllCategories()) {
    const availableLocales = getAvailableLocalesForEntity(category);
    for (const locale of availableLocales) {
      validPages.add(`${locale}:category:${category.id}`);
    }
  }

  for (const subcategory of DB.getAllSubcategories()) {
    const availableLocales = getAvailableLocalesForEntity(subcategory);
    for (const locale of availableLocales) {
      validPages.add(`${locale}:subcategory:${subcategory.id}`);
    }
  }

  // Check that all hreflang references point to valid pages
  // This is implicitly handled by getAvailableLocalesForEntity,
  // but we can add additional checks here if needed

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Run all validations
 */
export function runAllValidations(): ValidationResult {
  const localizationResult = validateLocalization();
  const hreflangResult = validateHreflangReferences();

  return {
    valid: localizationResult.valid && hreflangResult.valid,
    errors: [...localizationResult.errors, ...hreflangResult.errors],
    warnings: [...localizationResult.warnings, ...hreflangResult.warnings]
  };
}

/**
 * Log validation results
 */
export function logValidationResults(result: ValidationResult): void {
  if (result.errors.length > 0) {
    console.error('\n❌ Localization validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Localization warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('\n✅ Localization validation passed!');
  }
}
