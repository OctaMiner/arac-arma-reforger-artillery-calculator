/**
 * Ballistic Data Type Definitions
 *
 * Type-safe interfaces for all ballistic data extracted from Excel tables
 */

/**
 * Single ballistic entry with range, elevation, and time of flight
 */
export interface BallisticEntry {
  /** Target range in meters */
  range: number;
  /** Elevation angle in mil */
  elevation: number;
  /** Time of flight in seconds */
  tof: number;
  /** Delta elevation per 100m altitude difference in mil */
  dElev: number;
}

/**
 * Mortar type identifier
 */
export type MortarType = 'US' | 'RUS';

/**
 * Ammunition type identifier
 */
export type AmmoType = 'HE' | 'Smoke' | 'Illumination';

/**
 * Ring count (propellant charges)
 */
export type RingCount = 0 | 1 | 2 | 3 | 4;

/**
 * Ballistic table for a specific mortar/ammo/ring combination
 * Used for HE ammunition (one file per ring)
 */
export interface BallisticTable {
  /** Mortar system type */
  mortarType: MortarType;
  /** Ammunition type */
  ammoType: AmmoType;
  /** Number of propellant rings */
  ringCount: RingCount;
  /** Minimum effective range in meters */
  minRange: number;
  /** Maximum effective range in meters */
  maxRange: number;
  /** Sorted array of ballistic entries */
  entries: BallisticEntry[];
}

/**
 * Combined ballistic table with multiple rings
 * Used for Smoke and Illumination ammunition
 */
export interface CombinedBallisticTable {
  /** Mortar system type */
  mortarType: MortarType;
  /** Ammunition type */
  ammoType: AmmoType;
  /** Ballistic data organized by ring count */
  rings: {
    [key: string]: BallisticEntry[];
  };
  /** Minimum effective range across all rings in meters */
  minRange: number;
  /** Maximum effective range across all rings in meters */
  maxRange: number;
}

/**
 * Master index of all available ballistic tables
 */
export interface BallisticTableIndex {
  /** Data version */
  version: string;
  /** Source Excel file */
  source: string;
  /** List of all available tables */
  tables: Array<{
    /** JSON filename */
    file: string;
    /** Mortar type */
    mortarType: MortarType;
    /** Ammunition type */
    ammoType: AmmoType;
    /** Ring count or "all" for combined tables */
    ringCount: RingCount | 'all';
    /** Minimum range */
    minRange: number;
    /** Maximum range */
    maxRange: number;
    /** Number of entries in table */
    entryCount: number;
  }>;
}

/**
 * Delta elevation coefficient for altitude correction
 */
export interface DeltaElevCoefficient {
  /** Base distance for coefficient in meters */
  baseDistance: number;
  /** Coefficient value (mil per 100m altitude) */
  coefficient: number;
  /** Human-readable description */
  description: string;
}

/**
 * Collection of delta elevation coefficients
 */
export interface DeltaElevCoefficients {
  /** Description of coefficient usage */
  description: string;
  /** Source document */
  source: string;
  /** Unit of measurement */
  unit: string;
  /** Coefficients by ring count */
  coefficients: {
    ring0: DeltaElevCoefficient;
    ring1: DeltaElevCoefficient;
    ring2: DeltaElevCoefficient;
    ring3: DeltaElevCoefficient;
    ring4: DeltaElevCoefficient;
  };
  /** Usage instructions */
  usage: string;
  /** Additional notes */
  notes: string[];
}

// Re-export wind and fire solution types from main types
export type {
  WindData,
  WindCorrection,
  FireSolution,
} from '../../types/index.js';

/**
 * Interpolation result between two table entries
 */
export interface InterpolatedData {
  /** Interpolated elevation in mil */
  elevation: number;
  /** Interpolated time of flight in seconds */
  tof: number;
  /** Interpolated delta elevation in mil */
  dElev: number;
  /** Lower bound entry used for interpolation */
  lowerEntry: BallisticEntry;
  /** Upper bound entry used for interpolation */
  upperEntry: BallisticEntry;
  /** Interpolation factor (0-1) */
  factor: number;
}
