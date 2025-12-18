/**
 * Elevation and height correction calculations
 * Handles altitude differences between mortar and target
 */

import type { RingCount } from '../../types/index.js'
import deltaElevCoefficients from './data/delta-elev-coefficients.json'

/**
 * Get the delta elevation coefficient per 100m for a given ring count
 *
 * These coefficients are used to calculate height corrections
 * Higher ring counts have lower coefficients (flatter trajectories)
 *
 * @param ringCount - Charge count (0-4)
 * @returns Delta elevation in mils per 100m altitude difference
 */
export function getDeltaElevPer100m(ringCount: RingCount): number {
  const ringKey = `ring${ringCount}` as keyof typeof deltaElevCoefficients.coefficients
  return deltaElevCoefficients.coefficients[ringKey].coefficient
}

/**
 * Calculate total elevation adjustment for height difference
 *
 * Formula from Steam Guide:
 * e = h × d
 * where:
 *   h = height difference (target - mortar) in meters
 *   d = delta ELEV per 100m from table (mils per 100m)
 *   e = elevation adjustment in mils
 *
 * Alternative method using interpolated dElev:
 * deltaElev = heightDiff × (dElevPer100m / 100)
 *
 * @param heightDiff - Height difference in meters (positive = target higher)
 * @param ringCount - Charge count (0-4)
 * @returns Elevation correction in mils
 */
export function calculateDeltaElevation(
  heightDiff: number,
  ringCount: RingCount
): number {
  // Get coefficient for this ring count
  const coefficient = getDeltaElevPer100m(ringCount)

  // Calculate adjustment
  // coefficient is in mils per 100m, so we divide by 100
  return heightDiff * (coefficient / 100)
}

/**
 * Alternative method: Calculate delta elevation using interpolated dElev from table
 *
 * This is more accurate as dElev varies with distance
 *
 * @param heightDiff - Height difference in meters (positive = target higher)
 * @param dElevPer100m - Interpolated dElev from ballistic table
 * @returns Elevation correction in mils
 */
export function calculateDeltaElevationFromTable(
  heightDiff: number,
  dElevPer100m: number
): number {
  return heightDiff * (dElevPer100m / 100)
}

/**
 * Apply height correction to base elevation
 *
 * Rules:
 * - Target HIGHER than mortar: SUBTRACT correction (less elevation needed)
 * - Target LOWER than mortar: ADD correction (more elevation needed)
 *
 * Example:
 * Mortar at 95m, Target at 145m, Base ELEV = 1134 mils
 * heightDiff = 145 - 95 = 50m (positive)
 * deltaElev = 18 mils
 * Final ELEV = 1134 - 18 = 1116 mils
 *
 * @param baseElevation - Elevation without height correction in mils
 * @param heightCorrection - Delta elevation in mils
 * @param targetHigher - True if target is higher than mortar
 * @returns Corrected elevation in mils
 */
export function applyHeightCorrection(
  baseElevation: number,
  heightCorrection: number
): number {
  // If heightCorrection is positive (target higher), subtract
  // If heightCorrection is negative (target lower), add (which is subtracting a negative)
  return baseElevation - heightCorrection
}
