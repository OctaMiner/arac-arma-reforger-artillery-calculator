/**
 * Main fire solution calculator
 * Combines all ballistic calculations into a complete firing solution
 */

import type {
  Coordinate,
  MortarType,
  AmmoType,
  RingCount,
  FireSolution,
} from '../../types/index.js';
import { calculateDistance, calculateAzimuth } from './calculator.js';
import {
  interpolateElevation,
  interpolateFlightTime,
  interpolateDeltaElev,
} from './interpolation.js';
import {
  calculateDeltaElevationFromTable,
  applyHeightCorrection,
} from './elevation.js';
import { checkRange, findOptimalRingCount } from './range.js';
import { loadBallisticTable } from './tableLoader.js';

export interface FireSolutionParams {
  mortar: Coordinate;
  target: Coordinate;
  mortarType: MortarType;
  ammoType: AmmoType;
  ringCount: RingCount;
}

/**
 * Calculate complete fire solution for mortar engagement
 *
 * This is the main function that combines all ballistic calculations:
 * 1. Calculate distance and azimuth
 * 2. Load appropriate ballistic table
 * 3. Interpolate elevation and flight time
 * 4. Calculate height correction
 * 5. Apply corrections
 * 6. Validate range
 *
 * @param params - Fire solution parameters
 * @returns Complete fire solution with all ballistic data
 */
export function calculateFireSolution(
  params: FireSolutionParams
): FireSolution {
  const { mortar, target, mortarType, ammoType, ringCount } = params;

  // 1. Calculate distance (in meters)
  const distance = calculateDistance(mortar, target);

  // 2. Calculate azimuth (direction)
  const azimuth = calculateAzimuth(mortar, target);

  // 3. Load ballistic table for this configuration
  const table = loadBallisticTable(mortarType, ammoType, ringCount);

  // 4. Check if target is in range
  const rangeCheck = checkRange(distance, table.minRange, table.maxRange);

  // If out of range, return early with warning
  if (!rangeCheck.inRange) {
    return {
      azimuthDeg: azimuth.degrees,
      azimuthMil: azimuth.mils,
      elevationBase: 0,
      elevationAdj: 0,
      deltaElev: 0,
      distance: distance,
      flightTime: 0,
      ringCount: ringCount,
      inRange: false,
      recommendedCharge: findOptimalRingCount(
        distance,
        mortarType,
        ammoType
      ) as RingCount,
    };
  }

  // 5. Interpolate base elevation (without height correction)
  const elevationBase = interpolateElevation(distance, table.entries);

  // 6. Interpolate flight time
  const flightTime = interpolateFlightTime(distance, table.entries);

  // 7. Calculate height correction
  const heightDiff = target.height - mortar.height; // positive = target higher

  // Interpolate dElev for accurate correction
  const dElevPer100m = interpolateDeltaElev(distance, table.entries);

  // Calculate total elevation correction
  const deltaElev = calculateDeltaElevationFromTable(heightDiff, dElevPer100m);

  // 8. Apply height correction to get final elevation
  const elevationAdj = applyHeightCorrection(elevationBase, deltaElev);

  // 9. Find optimal charge for this distance
  const recommendedCharge = findOptimalRingCount(
    distance,
    mortarType,
    ammoType
  );

  // 10. Return complete fire solution
  return {
    azimuthDeg: azimuth.degrees,
    azimuthMil: azimuth.mils,
    elevationBase: Math.round(elevationBase),
    elevationAdj: Math.round(elevationAdj),
    deltaElev: Math.round(deltaElev),
    distance: Math.round(distance),
    flightTime: Math.round(flightTime * 10) / 10, // Round to 1 decimal
    ringCount: ringCount,
    inRange: true,
    recommendedCharge: recommendedCharge !== -1 ? recommendedCharge : undefined,
  };
}

/**
 * Calculate fire solution with automatic charge selection
 *
 * Automatically selects the optimal charge for the given distance
 *
 * @param params - Fire solution parameters (without ringCount)
 * @returns Complete fire solution
 */
export function calculateFireSolutionAuto(
  params: Omit<FireSolutionParams, 'ringCount'>
): FireSolution {
  const { mortar, target, mortarType, ammoType } = params;

  // Calculate distance to determine optimal charge
  const distance = calculateDistance(mortar, target);

  // Find optimal charge
  const optimalCharge = findOptimalRingCount(distance, mortarType, ammoType);

  // If no valid charge found, use ring 4 (maximum) to show error
  const ringCount: RingCount = optimalCharge !== -1 ? optimalCharge : 4;

  // Calculate with selected charge
  return calculateFireSolution({
    mortar,
    target,
    mortarType,
    ammoType,
    ringCount,
  });
}
