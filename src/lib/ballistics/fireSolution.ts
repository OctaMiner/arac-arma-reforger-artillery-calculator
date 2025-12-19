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
  FireSolutionWithTerrain,
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
import {
  checkRange,
  findOptimalRingCount,
  findOptimalRingForHeight,
  checkTerrainCollision,
  calculateParabolaParams,
  getTrajectoryHeightAt,
  type TerrainPoint,
} from './range.js';
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

  // 1. Calculate distance (in meters) - coordinates are already in meters
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
 * Automatically selects the optimal charge for the given distance,
 * taking height difference into account.
 *
 * Height optimization:
 * - When shooting upward, energy is lost fighting gravity
 * - This reduces horizontal range compared to level terrain
 * - Function automatically selects higher charge when needed
 * - Provides safety margin to ensure reliable hits
 *
 * @param params - Fire solution parameters (without ringCount)
 * @returns Complete fire solution
 */
export function calculateFireSolutionAuto(
  params: Omit<FireSolutionParams, 'ringCount'>
): FireSolution {
  const { mortar, target, mortarType, ammoType } = params;

  // Calculate distance to determine optimal charge (coordinates are already in meters)
  const distance = calculateDistance(mortar, target);

  // Calculate height difference
  const heightDiff = target.height - mortar.height;

  // Find optimal charge considering height difference
  const optimalRingResult = findOptimalRingForHeight(
    distance,
    heightDiff,
    mortarType,
    ammoType
  );

  // Use the recommended charge
  const ringCount: RingCount = optimalRingResult.recommended;

  // Calculate with selected charge
  const solution = calculateFireSolution({
    mortar,
    target,
    mortarType,
    ammoType,
    ringCount,
  });

  // Add height optimization info to solution (if we extend FireSolution interface)
  // For now, the optimized ring is already selected
  // Future enhancement: Add optimalRingResult.reason to FireSolution interface

  return solution;
}

/**
 * Extended fire solution parameters with terrain data
 */
export interface FireSolutionWithTerrainParams extends FireSolutionParams {
  /** Terrain profile between mortar and target (from heightService.getTerrainProfile) */
  terrainProfile?: TerrainPoint[] | null;
}

/**
 * Find blockage point in terrain profile
 * Returns the point where trajectory hits terrain, or null if clear
 * Uses accurate parabola calculation that matches TrajectoryGraph visualization
 */
function findBlockagePoint(
  distance: number,
  elevation: number,
  _ringCount: RingCount,
  mortarHeight: number,
  terrainProfile: TerrainPoint[],
  targetHeight?: number,
  flightTime?: number
): {
  distance: number;
  terrainHeight: number;
  trajectoryHeight: number;
  minApexNeeded: number;
} | null {
  if (!terrainProfile || terrainProfile.length === 0) {
    return null;
  }

  // Get target height from last terrain point if not provided
  const actualTargetHeight =
    targetHeight ??
    terrainProfile[terrainProfile.length - 1]?.height ??
    mortarHeight;

  // Calculate parabola parameters (same as TrajectoryGraph)
  const params = calculateParabolaParams(
    distance,
    elevation,
    mortarHeight,
    actualTargetHeight,
    flightTime ?? 25
  );

  const SAFETY_MARGIN = 10; // meters - synchronized with TrajectoryGraph

  let blockagePoint = null;
  let minClearance = Infinity;

  for (const point of terrainProfile) {
    if (point.distance <= 10 || point.distance > distance) {
      continue;
    }

    // Skip first and last 5% of trajectory (similar to TrajectoryGraph)
    if (point.distance < distance * 0.05 || point.distance > distance * 0.95) {
      continue;
    }

    // Calculate trajectory height at this distance using accurate parabola
    const trajectoryHeight = getTrajectoryHeightAt(point.distance, params);
    const clearance = trajectoryHeight - point.height;

    // Track the closest approach
    if (clearance < minClearance) {
      minClearance = clearance;

      // If clearance is insufficient, this is a blockage
      if (clearance < SAFETY_MARGIN) {
        blockagePoint = {
          distance: point.distance,
          terrainHeight: point.height,
          trajectoryHeight: trajectoryHeight,
          minApexNeeded: params.apexHeight + (SAFETY_MARGIN - clearance),
        };
      }
    }
  }

  return blockagePoint;
}

/**
 * Calculate coordinates of a point along the trajectory
 * @param mortar - Mortar position
 * @param azimuthMil - Azimuth in MIL (NATO)
 * @param distance - Distance from mortar in meters
 * @returns East/North coordinates
 */
function calculatePointAlongTrajectory(
  mortar: Coordinate,
  azimuthMil: number,
  distance: number
): { east: number; north: number } {
  const azimuthRad = (azimuthMil * 2 * Math.PI) / 6400;
  return {
    east: Math.round(mortar.east + distance * Math.sin(azimuthRad)),
    north: Math.round(mortar.north + distance * Math.cos(azimuthRad)),
  };
}

/**
 * Test if an azimuth correction helps avoid terrain collision
 * Tests small azimuth adjustments (+/- 5-10 MIL) to see if obstacle can be avoided
 */
function findAzimuthCorrection(
  params: FireSolutionWithTerrainParams,
  originalAzimuthMil: number,
  _ringCount: RingCount,
  _elevation: number
): number | undefined {
  const { mortar, target, terrainProfile } = params;

  if (!terrainProfile || terrainProfile.length === 0) {
    return undefined;
  }

  // Test corrections: ±5 MIL, ±10 MIL
  const testCorrections = [5, -5, 10, -10];

  for (const correction of testCorrections) {
    const testAzimuth = originalAzimuthMil + correction;

    // Calculate new target position with corrected azimuth
    const distance = calculateDistance(mortar, target);
    const azimuthRad = (testAzimuth * 2 * Math.PI) / 6400;

    // New target coordinates for this azimuth correction
    // newTargetEast = mortar.east + distance * Math.sin(azimuthRad)
    // newTargetNorth = mortar.north + distance * Math.cos(azimuthRad)
    void azimuthRad; // Suppress unused warning until terrain service is integrated
    void distance;

    // Create new terrain profile for this azimuth
    // Note: This would require terrain service integration
    // For now, we return undefined as this needs external terrain data

    // TODO: Implement with proper terrain service integration
    // const newProfile = getTerrainProfile(mapId, mortar.east, mortar.north, newTargetEast, newTargetNorth);
    // const hasCollision = checkTerrainCollision(distance, _elevation, _ringCount, mortar.height, newProfile);
    // if (!hasCollision) return correction;
  }

  return undefined;
}

/**
 * Calculate fire solution with automatic terrain collision detection and correction
 *
 * This function extends the standard fire solution with:
 * 1. Terrain collision detection along the trajectory
 * 2. Automatic ring count correction to clear obstacles
 * 3. Optional azimuth correction suggestions
 * 4. Detailed blockage information
 *
 * Strategy:
 * - If requested ring count has terrain collision:
 *   a) Try lower rings (steeper trajectory, higher apex)
 *   b) If no ring works, suggest alternatives with explanation
 * - Provide detailed blockage information for troubleshooting
 * - Never fabricate solutions - be explicit when no solution exists
 *
 * @param params - Fire solution parameters with optional terrain profile
 * @returns Fire solution with terrain analysis
 */
export function calculateFireSolutionWithTerrain(
  params: FireSolutionWithTerrainParams
): FireSolutionWithTerrain {
  const { mortar, target, mortarType, ammoType, ringCount, terrainProfile } =
    params;

  // Calculate basic fire solution first
  const baseSolution = calculateFireSolution({
    mortar,
    target,
    mortarType,
    ammoType,
    ringCount,
  });

  // If out of range, add error message
  if (!baseSolution.inRange) {
    const targetDistance = baseSolution.distance;
    let errorMessage = `Ziel außerhalb der Reichweite (Ring ${ringCount}). Bitte ändern Sie die Position der Mörserstellung.`;
    try {
      // Try to get range info for better error message
      const table = loadBallisticTable(mortarType, ammoType, ringCount);
      errorMessage = `Ziel außerhalb der Reichweite. Entfernung: ${Math.round(targetDistance)}m, Gültige Reichweite für Ring ${ringCount}: ${table.minRange}-${table.maxRange}m. Bitte ändern Sie die Position der Mörserstellung.`;
    } catch {
      // Table might not exist, use basic message
      errorMessage = `Ziel außerhalb der Reichweite. Entfernung: ${Math.round(targetDistance)}m. Bitte ändern Sie die Position der Mörserstellung.`;
    }

    return {
      ...baseSolution,
      trajectoryBlocked: false,
      errorMessage,
    };
  }

  // If no terrain profile, return basic solution with no blockage
  if (!terrainProfile || terrainProfile.length === 0) {
    console.log('[Terrain] No terrain profile available');
    return {
      ...baseSolution,
      trajectoryBlocked: false,
    };
  }

  console.log('[Terrain] Profile loaded with', terrainProfile.length, 'points');

  // Check terrain collision with requested ring count
  const distance = baseSolution.distance;
  const hasCollision = checkTerrainCollision(
    distance,
    baseSolution.elevationAdj,
    ringCount,
    mortar.height,
    terrainProfile,
    target.height,
    baseSolution.flightTime
  );

  console.log('[Terrain] Collision check:', { hasCollision, distance, elevation: baseSolution.elevationAdj, ringCount });

  // If no collision, trajectory is clear
  if (!hasCollision) {
    return {
      ...baseSolution,
      trajectoryBlocked: false,
    };
  }

  // Collision detected - find blockage details
  const blockagePoint = findBlockagePoint(
    distance,
    baseSolution.elevationAdj,
    ringCount,
    mortar.height,
    terrainProfile,
    target.height,
    baseSolution.flightTime
  );

  // Try to find alternative ring count that clears the obstacle
  // Lower rings = steeper trajectory = higher apex
  const allRings: RingCount[] = [0, 1, 2, 3, 4];
  let bestAlternative: {
    ring: RingCount;
    elevation: number;
    flightTime: number;
    deltaElev: number;
  } | null = null;

  for (const testRing of allRings) {
    // Skip the original ring
    if (testRing === ringCount) {
      continue;
    }

    try {
      // Load table for this ring
      const table = loadBallisticTable(mortarType, ammoType, testRing);

      // Check if distance is in range
      if (distance < table.minRange || distance > table.maxRange) {
        continue;
      }

      // Calculate elevation
      const testElevation = interpolateElevation(distance, table.entries);
      const testFlightTime = interpolateFlightTime(distance, table.entries);
      const dElevPer100m = interpolateDeltaElev(distance, table.entries);

      const heightDiff = target.height - mortar.height;
      const testDeltaElev = calculateDeltaElevationFromTable(
        heightDiff,
        dElevPer100m
      );
      const testElevationAdj = applyHeightCorrection(
        testElevation,
        testDeltaElev
      );

      // Check terrain collision
      const testCollision = checkTerrainCollision(
        distance,
        testElevationAdj,
        testRing,
        mortar.height,
        terrainProfile,
        target.height,
        testFlightTime
      );

      if (!testCollision) {
        // Found a valid alternative!
        // Prefer lower rings (faster flight time, better accuracy)
        if (!bestAlternative || testRing < bestAlternative.ring) {
          bestAlternative = {
            ring: testRing,
            elevation: testElevationAdj,
            flightTime: testFlightTime,
            deltaElev: testDeltaElev,
          };
        }
      }
    } catch (error) {
      // Table not found or other error - skip this ring
      continue;
    }
  }

  // If we found a valid alternative, return it
  if (bestAlternative) {
    const azimuth = calculateAzimuth(mortar, target);

    return {
      azimuthDeg: azimuth.degrees,
      azimuthMil: azimuth.mils,
      elevationBase: Math.round(baseSolution.elevationBase),
      elevationAdj: Math.round(bestAlternative.elevation),
      deltaElev: Math.round(bestAlternative.deltaElev),
      distance: Math.round(distance),
      flightTime: Math.round(bestAlternative.flightTime * 10) / 10,
      ringCount: bestAlternative.ring,
      inRange: true,
      recommendedCharge: bestAlternative.ring,
      trajectoryBlocked: false,
      originalRingBlocked: true,
      suggestedAlternative: {
        ring: bestAlternative.ring,
        reason: `Ring ${ringCount} durch Gelände bei ${Math.round(blockagePoint?.distance || 0)}m blockiert. Automatisch auf Ring ${bestAlternative.ring} korrigiert (steilere Flugbahn).`,
      },
      blockageInfo: blockagePoint
        ? {
            distance: Math.round(blockagePoint.distance),
            terrainHeight: Math.round(blockagePoint.terrainHeight),
            trajectoryHeight: Math.round(blockagePoint.trajectoryHeight),
            minApexNeeded: Math.round(blockagePoint.minApexNeeded),
            ...calculatePointAlongTrajectory(mortar, azimuth.mils, blockagePoint.distance),
          }
        : undefined,
    };
  }

  // No valid alternative found - return error with detailed information
  const errorDetails: string[] = [
    `Aus dieser Stellung ist das Ziel nicht erreichbar (Entfernung: ${Math.round(distance)}m)`,
  ];

  if (blockagePoint) {
    errorDetails.push(
      `Geländehindernis bei ${Math.round(blockagePoint.distance)}m (Geländehöhe: ${Math.round(blockagePoint.terrainHeight)}m ü.M.)`
    );
    errorDetails.push(
      `Benötigte Scheitelhöhe: mind. ${Math.round(blockagePoint.minApexNeeded)}m über Mörserstellung`
    );
  }

  errorDetails.push('Das Gelände blockiert alle möglichen Flugbahnen. Bitte ändern Sie die Position der Mörserstellung.');

  // Try to suggest azimuth correction
  const azimuthCorrection = findAzimuthCorrection(
    params,
    baseSolution.azimuthMil,
    ringCount,
    baseSolution.elevationAdj
  );

  return {
    ...baseSolution,
    trajectoryBlocked: true,
    blockageInfo: blockagePoint
      ? {
          distance: Math.round(blockagePoint.distance),
          terrainHeight: Math.round(blockagePoint.terrainHeight),
          trajectoryHeight: Math.round(blockagePoint.trajectoryHeight),
          minApexNeeded: Math.round(blockagePoint.minApexNeeded),
          ...calculatePointAlongTrajectory(mortar, baseSolution.azimuthMil, blockagePoint.distance),
        }
      : undefined,
    suggestedAlternative: azimuthCorrection
      ? {
          ring: ringCount,
          azimuthCorrection,
          reason: `Azimut-Korrektur um ${azimuthCorrection > 0 ? '+' : ''}${azimuthCorrection} MIL könnte das Hindernis umgehen`,
        }
      : undefined,
    errorMessage: errorDetails.join('. '),
  };
}

/**
 * Calculate fire solution with automatic ring selection and terrain awareness
 *
 * This is the "smart" version that:
 * 1. Automatically selects optimal ring count for distance and height
 * 2. Checks terrain collision
 * 3. Auto-corrects to alternative ring if blocked
 * 4. Provides detailed feedback
 *
 * Use this when you want the system to make all decisions automatically.
 *
 * @param params - Fire solution parameters without ringCount (auto-selected)
 * @returns Fire solution with terrain analysis
 */
export function calculateFireSolutionWithTerrainAuto(
  params: Omit<FireSolutionWithTerrainParams, 'ringCount'>
): FireSolutionWithTerrain {
  const { mortar, target, mortarType, ammoType, terrainProfile } = params;

  // Calculate distance and height difference
  const distance = calculateDistance(mortar, target);
  const heightDiff = target.height - mortar.height;

  // Find optimal charge considering height difference
  const optimalRingResult = findOptimalRingForHeight(
    distance,
    heightDiff,
    mortarType,
    ammoType
  );

  const selectedRing = optimalRingResult.recommended;

  // Calculate fire solution with terrain check
  const solution = calculateFireSolutionWithTerrain({
    mortar,
    target,
    mortarType,
    ammoType,
    ringCount: selectedRing,
    terrainProfile,
  });

  return solution;
}
