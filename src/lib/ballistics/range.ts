/**
 * Range checking and optimal charge selection
 * Validates if target is within mortar capabilities
 */

import type { AmmoType, MortarType, RingCount } from '../../types/index.js';
import ballisticTablesIndex from './data/ballistic-tables-index.json';

interface RangeCheckResult {
  inRange: boolean;
  warning?: string;
  minRange?: number;
  maxRange?: number;
}

/**
 * Check if a distance is within the valid range for a ballistic table
 *
 * @param distance - Target distance in meters
 * @param minRange - Minimum range from table
 * @param maxRange - Maximum range from table
 * @returns Range check result with warning if applicable
 */
export function checkRange(
  distance: number,
  minRange: number,
  maxRange: number
): RangeCheckResult {
  if (distance < minRange) {
    return {
      inRange: false,
      warning: `Target too close (${distance}m). Minimum range: ${minRange}m`,
      minRange,
      maxRange,
    };
  }

  if (distance > maxRange) {
    return {
      inRange: false,
      warning: `Target too far (${distance}m). Maximum range: ${maxRange}m`,
      minRange,
      maxRange,
    };
  }

  return {
    inRange: true,
    minRange,
    maxRange,
  };
}

/**
 * Find the optimal (lowest) ring count that can reach the target distance
 *
 * Strategy:
 * - Lower ring counts = shorter flight time
 * - Better accuracy
 * - Better responsiveness
 * - Choose the lowest ring that covers the distance
 *
 * @param distance - Target distance in meters
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Recommended ring count (0-4) or -1 if out of range
 */
export function findOptimalRingCount(
  distance: number,
  mortarType: MortarType,
  ammoType: AmmoType
): RingCount | -1 {
  // Find all tables for this mortar and ammo type
  const tables = ballisticTablesIndex.tables.filter(
    (t) =>
      t.mortarType === mortarType &&
      t.ammoType === ammoType &&
      typeof t.ringCount === 'number' // HE has separate ring tables
  );

  // Sort by ring count (ascending)
  tables.sort((a, b) => {
    const ringA = typeof a.ringCount === 'number' ? a.ringCount : 0;
    const ringB = typeof b.ringCount === 'number' ? b.ringCount : 0;
    return ringA - ringB;
  });

  // Find first ring count that can reach the distance
  for (const table of tables) {
    if (
      typeof table.ringCount === 'number' &&
      distance >= table.minRange &&
      distance <= table.maxRange
    ) {
      return table.ringCount as RingCount;
    }
  }

  // No valid ring count found
  return -1;
}

/**
 * Get all valid ring counts for a given distance
 *
 * @param distance - Target distance in meters
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Array of valid ring counts
 */
export function getValidRingCounts(
  distance: number,
  mortarType: MortarType,
  ammoType: AmmoType
): RingCount[] {
  const tables = ballisticTablesIndex.tables.filter(
    (t) =>
      t.mortarType === mortarType &&
      t.ammoType === ammoType &&
      typeof t.ringCount === 'number'
  );

  const validRings: RingCount[] = [];

  for (const table of tables) {
    if (
      typeof table.ringCount === 'number' &&
      distance >= table.minRange &&
      distance <= table.maxRange
    ) {
      validRings.push(table.ringCount as RingCount);
    }
  }

  return validRings.sort((a, b) => a - b);
}

/**
 * Get the maximum range for a mortar/ammo combination
 *
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Maximum range in meters (at ring 4)
 */
export function getMaximumRange(
  mortarType: MortarType,
  ammoType: AmmoType
): number {
  const tables = ballisticTablesIndex.tables.filter(
    (t) => t.mortarType === mortarType && t.ammoType === ammoType
  );

  let maxRange = 0;
  for (const table of tables) {
    if (table.maxRange > maxRange) {
      maxRange = table.maxRange;
    }
  }

  return maxRange;
}

/**
 * Get the minimum range for a mortar/ammo combination
 *
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Minimum range in meters (at ring 0)
 */
export function getMinimumRange(
  mortarType: MortarType,
  ammoType: AmmoType
): number {
  const tables = ballisticTablesIndex.tables.filter(
    (t) => t.mortarType === mortarType && t.ammoType === ammoType
  );

  let minRange = Infinity;
  for (const table of tables) {
    if (table.minRange < minRange) {
      minRange = table.minRange;
    }
  }

  return minRange === Infinity ? 0 : minRange;
}

/**
 * Range information for a single ring/charge level
 */
export interface RingRange {
  ringCount: number;
  minRange: number;
  maxRange: number;
}

/**
 * Get range information for all ring counts
 *
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Array of ring ranges sorted by ring count (0-4)
 */
export function getAllRingRanges(
  mortarType: MortarType,
  ammoType: AmmoType
): RingRange[] {
  const tables = ballisticTablesIndex.tables.filter(
    (t) =>
      t.mortarType === mortarType &&
      t.ammoType === ammoType &&
      typeof t.ringCount === 'number'
  );

  return tables
    .map((t) => ({
      ringCount: t.ringCount as number,
      minRange: t.minRange,
      maxRange: t.maxRange,
    }))
    .sort((a, b) => a.ringCount - b.ringCount);
}
