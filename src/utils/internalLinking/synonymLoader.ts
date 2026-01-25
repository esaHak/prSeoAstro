/**
 * Synonym loader for build-time data loading
 */

import anchorsData from '../../data/anchors.json';

export const synonyms: Record<string, string[]> = anchorsData;

/**
 * Get synonyms for an entity
 */
export function getSynonymsForEntity(entityId: string): string[] {
  return synonyms[entityId] || [];
}
