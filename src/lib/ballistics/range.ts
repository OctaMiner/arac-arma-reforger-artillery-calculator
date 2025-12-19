/**
 * Range checking and optimal charge selection
 * Validates if target is within mortar capabilities
 */

import type { AmmoType, MortarType, RingCount } from '../../types/index.js';
import ballisticTablesIndex from './data/ballistic-tables-index.json';
import { loadBallisticTable } from './tableLoader.js';
import { interpolateElevation } from './interpolation.js';

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

/**
 * Result of optimal ring selection considering height difference
 */
export interface OptimalRingResult {
  /** Recommended ring count that safely reaches the target */
  recommended: RingCount;
  /** Alternative ring counts that could also work */
  alternatives: RingCount[];
  /** Effective distance considering height penalty */
  effectiveDistance: number;
  /** Reason for recommendation */
  reason: string;
}

/**
 * Terrain profile point for collision detection
 */
export interface TerrainPoint {
  /** Distance from mortar in meters */
  distance: number;
  /** Height in meters */
  height: number;
}

/**
 * Issue detected with a specific ring count
 */
export interface RingIssue {
  /** Ring count that has an issue */
  ring: RingCount;
  /** Description of the issue */
  issue: string;
}

/**
 * Result of intelligent ring selection with terrain and height analysis
 */
export interface BestRingResult {
  /** Recommended ring count */
  recommended: RingCount;
  /** Reason for this recommendation */
  reason: string;
  /** Alternative rings with potential issues */
  alternatives: Array<{ ring: RingCount; issue?: string }>;
}

/**
 * Find optimal ring count considering height difference
 *
 * When target is significantly higher, we need more propellant (higher ring)
 * to compensate for energy loss during ascent.
 *
 * Physical basis:
 * - When shooting upward, the projectile loses kinetic energy fighting gravity
 * - This reduces the horizontal range compared to level terrain
 * - Rule of thumb: Every 100m height difference reduces effective range by ~5-8%
 * - We use a conservative 7% reduction factor
 *
 * Strategy:
 * 1. Calculate "effective distance" accounting for height penalty
 * 2. Find all rings that can cover this effective distance
 * 3. Choose the lowest ring that provides safe margin
 * 4. Suggest alternatives if available
 *
 * @param distance - Horizontal distance in meters
 * @param heightDiff - Height difference in meters (target.height - mortar.height)
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Optimal ring selection with alternatives
 */
export function findOptimalRingForHeight(
  distance: number,
  heightDiff: number,
  mortarType: MortarType,
  ammoType: AmmoType
): OptimalRingResult {
  // Height penalty factor: 0.07 means 7% range reduction per 100m altitude
  const HEIGHT_PENALTY_FACTOR = 0.07;

  // Safety margin: require 10% extra range to ensure reliable hit
  const SAFETY_MARGIN = 1.1;

  // Calculate effective distance with height penalty
  // Only apply penalty for positive height differences (shooting upward)
  let effectiveDistance = distance;
  let reason = 'Standard range calculation';

  if (heightDiff > 0) {
    // Shooting upward reduces horizontal range
    const heightPenalty = (heightDiff / 100) * HEIGHT_PENALTY_FACTOR * distance;
    effectiveDistance = distance + heightPenalty;
    reason = `Height penalty: +${Math.round(heightPenalty)}m for ${Math.round(heightDiff)}m altitude`;
  } else if (heightDiff < 0) {
    // Shooting downward increases range slightly, but we don't optimize for it
    // to maintain conservative fire solutions
    reason = 'Shooting downward - using standard calculation';
  }

  // Apply safety margin to required distance
  const requiredMaxRange = effectiveDistance * SAFETY_MARGIN;

  // Find all tables for this mortar and ammo type
  const tables = ballisticTablesIndex.tables.filter(
    (t) =>
      t.mortarType === mortarType &&
      t.ammoType === ammoType &&
      typeof t.ringCount === 'number'
  );

  // Sort by ring count (ascending)
  tables.sort((a, b) => {
    const ringA = typeof a.ringCount === 'number' ? a.ringCount : 0;
    const ringB = typeof b.ringCount === 'number' ? b.ringCount : 0;
    return ringA - ringB;
  });

  // Find all rings that can safely reach the effective distance
  const validRings: RingCount[] = [];

  for (const table of tables) {
    if (typeof table.ringCount === 'number') {
      // Ring must cover the effective distance and provide safety margin
      const canReach =
        effectiveDistance >= table.minRange &&
        effectiveDistance <= table.maxRange &&
        requiredMaxRange <= table.maxRange;

      if (canReach) {
        validRings.push(table.ringCount as RingCount);
      }
    }
  }

  // If no rings can reach with safety margin, try without safety margin
  if (validRings.length === 0) {
    for (const table of tables) {
      if (typeof table.ringCount === 'number') {
        const canReach =
          effectiveDistance >= table.minRange &&
          effectiveDistance <= table.maxRange;

        if (canReach) {
          validRings.push(table.ringCount as RingCount);
        }
      }
    }

    if (validRings.length > 0) {
      reason += ' (WARNING: No safety margin available)';
    }
  }

  // If still no valid rings, return maximum charge with error
  if (validRings.length === 0) {
    return {
      recommended: 4,
      alternatives: [],
      effectiveDistance: Math.round(effectiveDistance),
      reason: 'ERROR: Target out of range even at maximum charge',
    };
  }

  // Recommend the lowest ring count (fastest flight time, best accuracy)
  const recommended = validRings[0];

  // Return alternatives (higher charges)
  const alternatives = validRings.slice(1);

  return {
    recommended,
    alternatives,
    effectiveDistance: Math.round(effectiveDistance),
    reason,
  };
}

/**
 * Parabola parameters for trajectory calculation
 */
export interface ParabolaParams {
  /** Coefficient a in y = a(x-h)² + k */
  a: number;
  /** X position of apex (distance from mortar) */
  apexX: number;
  /** Height of apex (absolute meters) */
  apexHeight: number;
  /** Mortar height (meters) */
  mortarHeight: number;
}

/**
 * Calculate parabola parameters for trajectory
 *
 * Uses vertex form: y = a(x - h)² + k where (h, k) is the apex
 * This formula ensures the parabola passes through both start and end points
 *
 * The apex X position is determined by the elevation angle:
 * - Higher elevation (steeper) = apex earlier in flight
 * - Lower elevation (flatter) = apex closer to midpoint
 *
 * @param distance - Target distance in meters
 * @param elevation - Elevation angle in mils
 * @param mortarHeight - Mortar altitude in meters
 * @param targetHeight - Target altitude in meters
 * @param flightTime - Estimated flight time in seconds (for apex height calculation)
 * @returns Parabola parameters for trajectory calculation
 */
export function calculateParabolaParams(
  distance: number,
  elevation: number,
  mortarHeight: number,
  targetHeight: number,
  flightTime: number = 25
): ParabolaParams {
  const d = distance;
  const startHeight = mortarHeight;
  const endHeight = targetHeight;
  const heightDiff = endHeight - startHeight;

  // Determine apex X position based on elevation
  // Higher elevation (steeper) = apex earlier in flight
  // Range: 800 MIL (flat, ~45°) → ratio 0.45
  //        1200 MIL (steep, ~67°) → ratio 0.35
  //        1500 MIL (very steep, ~84°) → ratio 0.25
  let apexXRatio: number;
  if (elevation === 0 || flightTime === 0) {
    apexXRatio = 0.45; // Default for max range
  } else {
    apexXRatio = Math.max(0.25, Math.min(0.48, 0.55 - (elevation - 800) / 2000));
  }

  // Clamp apex to before midpoint for downward-opening parabola
  let apexX = d * apexXRatio;
  apexX = Math.min(apexX, d * 0.48);

  // Calculate parabola parameters
  // From vertex form through two points:
  // a = heightDiff / [d × (d - 2h)]
  // k = startHeight - a × h²
  const denominator = d * (d - 2 * apexX);

  let parabolaA: number;
  let apexHeight: number;

  if (Math.abs(denominator) > 0.001) {
    parabolaA = heightDiff / denominator;
    apexHeight = startHeight - parabolaA * apexX * apexX;
  } else {
    // Fallback: apex at 40% of distance, estimate height from flight time
    apexX = d * 0.4;
    const g = 9.81;
    const timeToApex = flightTime * 0.4;
    apexHeight = startHeight + (timeToApex * timeToApex * g) / 2;
    parabolaA = (startHeight - apexHeight) / (apexX * apexX);
  }

  // Ensure apex is above both endpoints (sanity check)
  const minApexHeight = Math.max(startHeight, endHeight) + 30;
  if (apexHeight < minApexHeight) {
    apexHeight = minApexHeight;
    // Recalculate parabolaA to pass through start
    parabolaA = (startHeight - apexHeight) / (apexX * apexX);
  }

  return {
    a: parabolaA,
    apexX,
    apexHeight,
    mortarHeight,
  };
}

/**
 * Calculate trajectory height at a given distance using parabola parameters
 *
 * @param x - Distance from mortar in meters
 * @param params - Parabola parameters from calculateParabolaParams
 * @returns Absolute height at distance x in meters
 */
export function getTrajectoryHeightAt(x: number, params: ParabolaParams): number {
  return params.a * (x - params.apexX) * (x - params.apexX) + params.apexHeight;
}

/**
 * Calculate trajectory apex (maximum height) for a mortar round
 *
 * Ballistic trajectory physics:
 * - Mortar rounds follow a parabolic trajectory
 * - Apex height depends on elevation angle and muzzle velocity
 * - Higher ring counts = higher velocity = higher apex at same elevation
 * - Lower ring counts = lower velocity = steeper arc = higher apex at same range
 *
 * Approximation formula:
 * - For mortar with elevation θ (in mils) and initial velocity v:
 * - Apex height ≈ (v² × sin²θ) / (2g)
 * - Simplified: apex ≈ range × tan(θ/2) × correction_factor
 *
 * Empirical approximation (based on ballistic tables):
 * - Ring 0-1 (low velocity): apex ≈ distance × 0.3 to 0.5
 * - Ring 2-3 (medium velocity): apex ≈ distance × 0.2 to 0.3
 * - Ring 4 (high velocity): apex ≈ distance × 0.15 to 0.25
 *
 * @param distance - Target distance in meters
 * @param elevation - Elevation angle in mils
 * @param ringCount - Propellant ring count (0-4)
 * @returns Estimated apex height above mortar in meters
 * @deprecated Use calculateParabolaParams and getTrajectoryHeightAt instead
 */
export function calculateTrajectoryApex(
  distance: number,
  elevation: number,
  ringCount: RingCount
): number {
  // Convert mil to radians (1 mil = 2π/6400 rad)
  const elevationRad = (elevation * 2 * Math.PI) / 6400;

  // Empirical correction factors based on ring count
  // Lower rings = steeper trajectories = higher apex
  const apexFactors: Record<RingCount, number> = {
    0: 0.45, // Steepest trajectory
    1: 0.40,
    2: 0.30,
    3: 0.25,
    4: 0.20, // Flattest trajectory
  };

  const factor = apexFactors[ringCount];

  // Approximate apex using simplified ballistic formula
  // apex = distance × tan(θ/2) × factor
  const apex = distance * Math.tan(elevationRad / 2) * factor;

  return apex;
}

/**
 * Check if trajectory collides with terrain
 *
 * Uses accurate parabola calculation that matches TrajectoryGraph visualization
 * Samples the trajectory at regular intervals and checks against terrain profile
 * with safety margin
 *
 * @param distance - Target distance in meters
 * @param elevation - Elevation angle in mils
 * @param _ringCount - Propellant ring count (deprecated, kept for API compatibility)
 * @param mortarHeight - Mortar altitude in meters
 * @param terrainProfile - Array of terrain points between mortar and target
 * @param targetHeight - Target altitude in meters (optional, defaults to last terrain point or mortarHeight)
 * @param flightTime - Flight time in seconds (optional, for apex calculation)
 * @returns True if trajectory hits terrain, false if clear
 */
export function checkTerrainCollision(
  distance: number,
  elevation: number,
  _ringCount: RingCount,
  mortarHeight: number,
  terrainProfile: TerrainPoint[],
  targetHeight?: number,
  flightTime?: number
): boolean {
  if (!terrainProfile || terrainProfile.length === 0) {
    return false; // No terrain data = assume clear
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

  // Safety margin: require 10m clearance above terrain
  const SAFETY_MARGIN = 10;

  // Check each terrain point
  for (const point of terrainProfile) {
    // Skip points beyond target
    if (point.distance > distance) {
      continue;
    }

    // Skip points at or before mortar position
    if (point.distance <= 10) {
      continue;
    }

    // Skip first and last 5% of trajectory (similar to TrajectoryGraph)
    if (point.distance < distance * 0.05 || point.distance > distance * 0.95) {
      continue;
    }

    // Calculate trajectory height at this distance using accurate parabola
    const trajectoryHeight = getTrajectoryHeightAt(point.distance, params);

    // Check collision with safety margin
    if (point.height + SAFETY_MARGIN > trajectoryHeight) {
      return true; // Terrain blocks trajectory (or too close)
    }
  }

  return false; // No collision
}

/**
 * Find best ring count considering BOTH terrain collision and height difference
 *
 * This function solves two problems:
 *
 * Problem 1: Terrain Collision
 * - Lower rings have steeper trajectories (higher apex)
 * - Use lower ring to clear obstacles between mortar and target
 *
 * Problem 2: Target Height Difference
 * - Higher targets require more energy to reach
 * - Use higher ring to compensate for altitude
 *
 * Strategy:
 * 1. Check all rings (0-4) for range validity
 * 2. For each valid ring:
 *    a) Calculate trajectory and check terrain collision
 *    b) Check if projectile can reach elevated target
 * 3. Select best ring that satisfies all constraints
 * 4. Prefer lower rings (faster flight time, better accuracy)
 *
 * @param distance - Target distance in meters
 * @param heightDiff - Height difference in meters (target - mortar, positive = uphill)
 * @param mortarHeight - Mortar altitude in meters
 * @param terrainProfile - Terrain points between mortar and target (optional)
 * @param mortarType - US or RUS mortar
 * @param ammoType - HE, Smoke, or Illumination
 * @returns Best ring selection with reasoning
 */
export function findBestRing(
  distance: number,
  heightDiff: number,
  mortarHeight: number,
  terrainProfile: TerrainPoint[] | null,
  mortarType: MortarType,
  ammoType: AmmoType
): BestRingResult {
  const allRings: RingCount[] = [0, 1, 2, 3, 4];
  const validRings: Array<{ ring: RingCount; issue?: string }> = [];
  const issueRings: Array<{ ring: RingCount; issue: string }> = [];

  // Test each ring
  for (const ring of allRings) {
    try {
      // Load ballistic table for this ring
      const table = loadBallisticTable(mortarType, ammoType, ring);

      // Check 1: Is distance in valid range?
      if (distance < table.minRange) {
        issueRings.push({
          ring,
          issue: `Below min range (${table.minRange}m)`,
        });
        continue;
      }

      if (distance > table.maxRange) {
        issueRings.push({
          ring,
          issue: `Beyond max range (${table.maxRange}m)`,
        });
        continue;
      }

      // Calculate elevation for this ring
      const elevation = interpolateElevation(distance, table.entries);

      // Check 2: Terrain collision?
      if (terrainProfile && terrainProfile.length > 0) {
        const targetHeight = mortarHeight + heightDiff;
        const hasCollision = checkTerrainCollision(
          distance,
          elevation,
          ring,
          mortarHeight,
          terrainProfile,
          targetHeight
        );

        if (hasCollision) {
          // Don't immediately exclude - mark as issue
          // Lower rings might still work due to steeper trajectory
          issueRings.push({
            ring,
            issue: 'Trajectory hits terrain - need steeper arc',
          });
          continue;
        }
      }

      // Check 3: Can reach elevated target?
      // For significant uphill shots (>50m), higher rings have better energy
      if (heightDiff > 50) {
        // Higher rings have more energy and can better handle altitude
        // Ring 0-1 may struggle with steep climbs
        if (ring < 2) {
          // Check if we're near max range (danger zone)
          const rangeMargin = (table.maxRange - distance) / table.maxRange;
          if (rangeMargin < 0.15) {
            // Less than 15% margin
            issueRings.push({
              ring,
              issue: `Low energy for +${Math.round(heightDiff)}m climb - recommend higher ring`,
            });
            continue;
          }
        }
      }

      // This ring is valid
      validRings.push({ ring });
    } catch (error) {
      // Table not found or other error
      issueRings.push({
        ring,
        issue: 'Ballistic data not available',
      });
    }
  }

  // No valid rings found
  if (validRings.length === 0) {
    return {
      recommended: 4, // Default to max charge
      reason: 'No valid solution found - target may be out of range',
      alternatives: issueRings,
    };
  }

  // Select best ring (lowest valid ring for best accuracy)
  const recommended = validRings[0].ring;

  // Build reason string
  let reason = '';

  if (terrainProfile && terrainProfile.length > 0) {
    reason += 'Terrain-aware: ';
  }

  if (heightDiff > 50) {
    reason += `Uphill +${Math.round(heightDiff)}m: `;
  } else if (heightDiff < -50) {
    reason += `Downhill ${Math.round(heightDiff)}m: `;
  }

  reason += `Ring ${recommended} optimal - `;

  if (validRings.length > 1) {
    reason += `${validRings.length} rings viable, chose lowest for accuracy`;
  } else {
    reason += 'only viable option';
  }

  // Return alternatives (other valid rings + issue rings)
  const alternatives = [
    ...validRings.slice(1), // Other valid rings
    ...issueRings, // Rings with issues
  ].sort((a, b) => a.ring - b.ring);

  return {
    recommended,
    reason,
    alternatives,
  };
}
