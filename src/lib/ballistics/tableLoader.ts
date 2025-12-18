/**
 * Ballistic table loader
 * Loads and caches ballistic data from JSON files
 */

import type {
  AmmoType,
  MortarType,
  RingCount,
  BallisticEntry,
} from '../../types/index.js';

// Import all ballistic tables
import rusHeRing0 from './data/rus-he-ring0.json';
import rusHeRing1 from './data/rus-he-ring1.json';
import rusHeRing2 from './data/rus-he-ring2.json';
import rusHeRing3 from './data/rus-he-ring3.json';
import rusHeRing4 from './data/rus-he-ring4.json';
import rusIllumination from './data/rus-illumination.json';
import rusSmoke from './data/rus-smoke.json';

import usHeRing0 from './data/us-he-ring0.json';
import usHeRing1 from './data/us-he-ring1.json';
import usHeRing2 from './data/us-he-ring2.json';
import usHeRing3 from './data/us-he-ring3.json';
import usHeRing4 from './data/us-he-ring4.json';
import usIllumination from './data/us-illumination.json';
import usSmoke from './data/us-smoke.json';

export interface BallisticTableData {
  mortarType: MortarType;
  ammoType: AmmoType;
  ringCount: RingCount | 'all';
  minRange: number;
  maxRange: number;
  entries: BallisticEntry[];
}

/**
 * Table registry mapping mortar/ammo/ring combinations to their data
 */
const tableRegistry: Map<string, BallisticTableData> = new Map();

/**
 * Convert raw JSON entry to BallisticEntry format
 * Maps the JSON property names to the TypeScript interface
 */
function convertEntry(raw: any): BallisticEntry {
  return {
    range: raw.range,
    elevation: raw.elevation,
    timeOfFlight: raw.tof,
    dElevPer100m: raw.dElev,
    tofPer100m: null, // Not provided in current JSON data
  };
}

/**
 * Convert raw JSON table to BallisticTableData format
 * Supports both HE structure (with entries array) and Smoke/Illumination structure (with rings object)
 */
function convertTable(raw: any, ringCount?: RingCount): BallisticTableData {
  // HE structure: { entries: [...], ringCount: 0-4 }
  if (raw.entries) {
    return {
      mortarType: raw.mortarType,
      ammoType: raw.ammoType,
      ringCount: raw.ringCount,
      minRange: raw.minRange,
      maxRange: raw.maxRange,
      entries: raw.entries.map(convertEntry),
    };
  }

  // Smoke/Illumination structure: { rings: { "1": [...], "2": [...] } }
  if (raw.rings && ringCount !== undefined) {
    const ringKey = ringCount.toString();
    const ringEntries = raw.rings[ringKey];

    if (!ringEntries) {
      throw new Error(
        `Ring ${ringCount} not found in ${raw.mortarType} ${raw.ammoType} table`
      );
    }

    return {
      mortarType: raw.mortarType,
      ammoType: raw.ammoType,
      ringCount: ringCount,
      minRange: raw.minRange,
      maxRange: raw.maxRange,
      entries: ringEntries.map(convertEntry),
    };
  }

  throw new Error(
    'Invalid table structure: missing both entries and rings properties'
  );
}

/**
 * Initialize the table registry with all imported tables
 */
function initializeRegistry(): void {
  if (tableRegistry.size > 0) return; // Already initialized

  // RUS HE tables (one file per ring)
  tableRegistry.set('RUS-HE-0', convertTable(rusHeRing0));
  tableRegistry.set('RUS-HE-1', convertTable(rusHeRing1));
  tableRegistry.set('RUS-HE-2', convertTable(rusHeRing2));
  tableRegistry.set('RUS-HE-3', convertTable(rusHeRing3));
  tableRegistry.set('RUS-HE-4', convertTable(rusHeRing4));

  // RUS Smoke/Illumination (one file with multiple rings, register each ring separately)
  const rusRings: RingCount[] = [1, 2, 3, 4];
  for (const ring of rusRings) {
    tableRegistry.set(
      `RUS-Illumination-${ring}`,
      convertTable(rusIllumination, ring)
    );
    tableRegistry.set(`RUS-Smoke-${ring}`, convertTable(rusSmoke, ring));
  }

  // US HE tables (one file per ring)
  tableRegistry.set('US-HE-0', convertTable(usHeRing0));
  tableRegistry.set('US-HE-1', convertTable(usHeRing1));
  tableRegistry.set('US-HE-2', convertTable(usHeRing2));
  tableRegistry.set('US-HE-3', convertTable(usHeRing3));
  tableRegistry.set('US-HE-4', convertTable(usHeRing4));

  // US Smoke/Illumination (one file with multiple rings, register each ring separately)
  const usRings: RingCount[] = [1, 2, 3, 4];
  for (const ring of usRings) {
    tableRegistry.set(
      `US-Illumination-${ring}`,
      convertTable(usIllumination, ring)
    );
    tableRegistry.set(`US-Smoke-${ring}`, convertTable(usSmoke, ring));
  }
}

/**
 * Generate registry key for table lookup
 */
function getTableKey(
  mortarType: MortarType,
  ammoType: AmmoType,
  ringCount?: RingCount
): string {
  // Ring count is required for all ammunition types
  if (ringCount === undefined) {
    throw new Error(`Ring count required for ${ammoType} ammunition`);
  }

  return `${mortarType}-${ammoType}-${ringCount}`;
}

/**
 * Load ballistic table for specific mortar configuration
 *
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @param ringCount - Charge count (0-4 for HE, 1-4 for Smoke/Illumination), required
 * @returns Ballistic table data
 * @throws Error if table not found or ringCount not provided
 */
export function loadBallisticTable(
  mortarType: MortarType,
  ammoType: AmmoType,
  ringCount?: RingCount
): BallisticTableData {
  // Initialize registry on first use
  initializeRegistry();

  const key = getTableKey(mortarType, ammoType, ringCount);
  const table = tableRegistry.get(key);

  if (!table) {
    throw new Error(
      `Ballistic table not found: ${mortarType} ${ammoType} Ring ${ringCount}`
    );
  }

  return table;
}

/**
 * Filter Smoke/Illumination table entries by ring count
 *
 * @deprecated No longer needed - tables are now loaded with specific ring counts
 * @param table - Ballistic table
 * @param _ringCount - Ring count (ignored)
 * @returns The same table (no filtering needed)
 */
export function filterTableByRingCount(
  table: BallisticTableData,
  _ringCount: RingCount
): BallisticTableData {
  // Tables are now pre-filtered by ring count during loading
  return table;
}

/**
 * Check if a ballistic table exists
 *
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @param ringCount - Charge count (0-4 for HE, 1-4 for Smoke/Illumination), required
 * @returns True if table exists
 */
export function hasBallisticTable(
  mortarType: MortarType,
  ammoType: AmmoType,
  ringCount?: RingCount
): boolean {
  initializeRegistry();

  try {
    const key = getTableKey(mortarType, ammoType, ringCount);
    return tableRegistry.has(key);
  } catch {
    return false;
  }
}
