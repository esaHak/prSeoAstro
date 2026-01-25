/**
 * Link target resolver using database relations
 * Determines which entities are eligible for linking based on page context
 */

import { DB, type Category, type Subcategory } from '../db';
import type { InternalLinkingConfig, RelationType } from './config';
import { getSynonymsForEntity as loadSynonyms } from './synonymLoader';

export type Entity = Category | Subcategory;

export interface PageContext {
  type: 'category' | 'subcategory';
  entity: Entity;
  id: string;
  slug: string;
}

export interface LinkTarget {
  id: string;
  url: string;
  title: string;
  anchors: string[];
  relation: RelationType;
  priority: number; // higher = more relevant
}

/**
 * Get all eligible link targets for a page
 */
export function getEligibleTargets(
  context: PageContext,
  config: InternalLinkingConfig
): LinkTarget[] {
  const targets: LinkTarget[] = [];

  // Get excluded entity IDs (self + hierarchy)
  const excludedIds = getExcludedEntityIds(context, config);

  // Get all categories and subcategories
  const allCategories = DB.getAllCategories();
  const allSubcategories = DB.getAllSubcategories();

  // Process categories
  for (const category of allCategories) {
    if (excludedIds.has(category.id)) continue;
    if (config.targetPolicy.disallowTargets.includes(category.id)) continue;

    const relation = getRelation(context, category);
    if (!isRelationAllowed(relation, config)) continue;

    const target = createLinkTarget(category, 'category', relation, config);
    if (target) targets.push(target);
  }

  // Process subcategories
  for (const subcategory of allSubcategories) {
    if (excludedIds.has(subcategory.id)) continue;
    if (config.targetPolicy.disallowTargets.includes(subcategory.id)) continue;

    const relation = getRelation(context, subcategory);
    if (!isRelationAllowed(relation, config)) continue;

    const target = createLinkTarget(subcategory, 'subcategory', relation, config);
    if (target) targets.push(target);
  }

  // Sort by priority (higher first)
  targets.sort((a, b) => b.priority - a.priority);

  return targets;
}

/**
 * Get IDs of entities that should be excluded from linking
 */
function getExcludedEntityIds(context: PageContext, config: InternalLinkingConfig): Set<string> {
  const excluded = new Set<string>();

  // Exclude self
  if (!config.allowSelfLink) {
    excluded.add(context.id);
  }

  if (!config.relationPolicy.excludeHierarchyByDefault) {
    return excluded;
  }

  // Exclude hierarchical relations
  if (context.type === 'category') {
    const category = context.entity as Category;

    // Exclude direct subcategories
    for (const subId of category.subcategoryIds) {
      excluded.add(subId);
    }

    // Exclude all descendants
    const descendants = getAllDescendants(category.id);
    descendants.forEach(id => excluded.add(id));
  } else {
    const subcategory = context.entity as Subcategory;

    // Exclude parent
    excluded.add(subcategory.parentCategoryId);

    // Exclude children (computed from parentCategoryId relationships)
    const children = DB.getChildSubcategories(subcategory);
    for (const child of children) {
      excluded.add(child.id);
    }

    // Exclude all descendants
    const descendants = getAllDescendants(subcategory.id);
    descendants.forEach(id => excluded.add(id));

    // Exclude all ancestors
    const ancestors = getAllAncestors(subcategory);
    ancestors.forEach(id => excluded.add(id));

    // Exclude siblings (computed from shared parentCategoryId)
    const parent = DB.getSubcategoryById(subcategory.parentCategoryId) ||
                   DB.getCategoryById(subcategory.parentCategoryId);
    if (parent) {
      const siblingIds = 'subcategoryIds' in parent
        ? parent.subcategoryIds
        : DB.getChildSubcategories(parent as Subcategory).map(s => s.id);
      siblingIds.forEach(id => {
        if (id !== context.id) excluded.add(id);
      });
    }
  }

  return excluded;
}

/**
 * Get all descendant IDs of an entity
 */
function getAllDescendants(entityId: string): Set<string> {
  const descendants = new Set<string>();

  const entity = DB.getCategoryById(entityId) || DB.getSubcategoryById(entityId);
  if (!entity) return descendants;

  const childIds = 'subcategoryIds' in entity
    ? entity.subcategoryIds
    : DB.getChildSubcategories(entity as Subcategory).map(s => s.id);

  for (const childId of childIds) {
    descendants.add(childId);
    const childDescendants = getAllDescendants(childId);
    childDescendants.forEach(id => descendants.add(id));
  }

  return descendants;
}

/**
 * Get all ancestor IDs of a subcategory
 */
function getAllAncestors(subcategory: Subcategory): Set<string> {
  const ancestors = new Set<string>();
  let currentId = subcategory.parentCategoryId;

  while (currentId) {
    ancestors.add(currentId);

    const parent = DB.getSubcategoryById(currentId);
    if (parent && 'parentCategoryId' in parent) {
      currentId = parent.parentCategoryId;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Determine the relation type between page context and target entity
 */
function getRelation(context: PageContext, target: Entity): RelationType {
  if (context.type === 'category') {
    const category = context.entity as Category;

    // Check if target is a direct subcategory
    if ('parentCategoryId' in target && target.parentCategoryId === category.id) {
      return 'child';
    }

    // Check if target is a descendant
    const descendants = getAllDescendants(category.id);
    if (descendants.has(target.id)) {
      return 'descendant';
    }
  } else {
    const subcategory = context.entity as Subcategory;

    // Check if target is parent
    if (target.id === subcategory.parentCategoryId) {
      return 'parent';
    }

    // Check if target is child (computed from parentCategoryId)
    const children = DB.getChildSubcategories(subcategory);
    if (children.some(child => child.id === target.id)) {
      return 'child';
    }

    // Check if target is ancestor
    const ancestors = getAllAncestors(subcategory);
    if (ancestors.has(target.id)) {
      return 'ancestor';
    }

    // Check if target is descendant
    const descendants = getAllDescendants(subcategory.id);
    if (descendants.has(target.id)) {
      return 'descendant';
    }

    // Check if target is related via relatedCategoryIds
    if (subcategory.relatedCategoryIds.includes(target.id)) {
      return 'relatedCategoryIds';
    }

    // Check if target is a sibling (computed from shared parentCategoryId)
    const parent = DB.getSubcategoryById(subcategory.parentCategoryId) ||
                   DB.getCategoryById(subcategory.parentCategoryId);
    if (parent) {
      const siblingIds = 'subcategoryIds' in parent
        ? parent.subcategoryIds
        : DB.getChildSubcategories(parent as Subcategory).map(s => s.id);
      if (siblingIds.includes(target.id) && target.id !== context.id) {
        return 'sibling';
      }
    }
  }

  // Default: related (semantic connection)
  return 'relatedCategoryIds';
}

/**
 * Check if a relation type is allowed by config
 */
function isRelationAllowed(relation: RelationType, config: InternalLinkingConfig): boolean {
  // Check excludeRelations first
  if (config.relationPolicy.excludeRelations.includes(relation)) {
    return false;
  }

  // Check includeRelations
  if (config.relationPolicy.includeRelations.length > 0) {
    return config.relationPolicy.includeRelations.includes(relation);
  }

  return true;
}

/**
 * Create a link target from an entity
 */
function createLinkTarget(
  entity: Entity,
  type: 'category' | 'subcategory',
  relation: RelationType,
  config: InternalLinkingConfig
): LinkTarget | null {
  // Build URL
  const url = type === 'category'
    ? `/${entity.slug}/`
    : `/${DB.getFullPath(entity as Subcategory)}/`;

  // Get anchors
  const anchors = getAnchorsForEntity(entity, config);
  if (anchors.length === 0) return null;

  // Calculate priority
  const priority = calculatePriority(relation, type, config);

  return {
    id: entity.id,
    url,
    title: entity.title,
    anchors,
    relation,
    priority,
  };
}

/**
 * Get anchor phrases for an entity
 */
function getAnchorsForEntity(entity: Entity, config: InternalLinkingConfig): string[] {
  const anchors: string[] = [];

  // Add title
  if (config.anchorPolicy.source === 'title' || config.anchorPolicy.source === 'both') {
    anchors.push(entity.title);
  }

  // Add synonyms from file
  if ((config.anchorPolicy.source === 'synonyms' || config.anchorPolicy.source === 'both') &&
      config.anchorPolicy.synonymsFile) {
    try {
      // Note: In production, this would need to be loaded at build time
      // For now, we'll use a placeholder
      const synonyms = getSynonymsForEntity(entity.id);
      anchors.push(...synonyms);
    } catch (e) {
      // Synonyms file not available, continue with just title
    }
  }

  // Limit to maxAnchorsPerTarget and remove duplicates
  const unique = Array.from(new Set(anchors));
  return unique.slice(0, config.anchorPolicy.maxAnchorsPerTarget);
}

/**
 * Get synonyms for an entity
 */
function getSynonymsForEntity(entityId: string): string[] {
  return loadSynonyms(entityId);
}

/**
 * Calculate priority for a target
 * Higher priority = more relevant
 */
function calculatePriority(
  relation: RelationType,
  type: 'category' | 'subcategory',
  config: InternalLinkingConfig
): number {
  let priority = 0;

  // Relation-based priority
  if (relation === 'relatedCategoryIds') {
    priority += 100; // Highest priority for cross-references
  } else if (relation === 'sibling') {
    priority += 50;
  } else {
    priority += 10;
  }

  // Type-based priority
  if (config.targetPolicy.preferSubcategoryOverCategory && type === 'subcategory') {
    priority += 20;
  }

  return priority;
}
