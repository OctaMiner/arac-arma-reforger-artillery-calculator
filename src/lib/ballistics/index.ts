/**
 * ARAC Ballistics Engine
 * Main barrel export for all ballistic calculations
 */

// Core calculations
export {
  calculateDistance,
  calculateDistanceMeters,
  calculateAzimuth,
  degToMil,
  milToDeg,
} from './calculator.js';

// Interpolation functions
export {
  interpolateElevation,
  interpolateFlightTime,
  interpolateDeltaElev,
  polynomialElevation,
} from './interpolation.js';

// Elevation and height corrections
export {
  getDeltaElevPer100m,
  calculateDeltaElevation,
  calculateDeltaElevationFromTable,
  applyHeightCorrection,
} from './elevation.js';

// Range checking and charge selection
export {
  checkRange,
  findOptimalRingCount,
  findOptimalRingForHeight,
  getValidRingCounts,
  getMaximumRange,
  getMinimumRange,
  calculateTrajectoryApex,
  checkTerrainCollision,
  findBestRing,
  type OptimalRingResult,
  type BestRingResult,
  type TerrainPoint,
  type RingIssue,
} from './range.js';

// Fire solution calculator
export {
  calculateFireSolution,
  calculateFireSolutionAuto,
  calculateFireSolutionWithTerrain,
  calculateFireSolutionWithTerrainAuto,
  type FireSolutionParams,
  type FireSolutionWithTerrainParams,
} from './fireSolution.js';

// Wind correction calculations
export {
  calculateWindComponents,
  calculateWindCorrection,
  applyWindToAzimuth,
  kmhToMs,
  msToKmh,
  getWindStrength,
  getWindDirectionName,
} from './wind.js';

// Table loader
export {
  loadBallisticTable,
  filterTableByRingCount,
  hasBallisticTable,
  type BallisticTableData,
} from './tableLoader.js';

// Re-export types
export type {
  BallisticEntry,
  WindData,
  WindCorrection,
  FireSolutionWithTerrain,
} from '../../types/index.js';
