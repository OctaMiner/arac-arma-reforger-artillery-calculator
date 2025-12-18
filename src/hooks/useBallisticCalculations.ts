/**
 * useBallisticCalculations Hook
 *
 * Provides memoized ballistic calculation results to prevent
 * expensive recalculations on every render.
 *
 * Performance optimizations:
 * - useMemo for range calculations
 * - useMemo for distance/azimuth calculations
 * - Only recalculates when inputs change
 */

import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  calculateDistance,
  calculateAzimuth,
} from '../lib/ballistics/calculator';
import { getMaximumRange, getMinimumRange } from '../lib/ballistics/range';
import type { MortarType, AmmoType } from '../types';

/**
 * Hook for memoized ballistic calculations
 *
 * @returns Memoized calculation results
 *
 * @example
 * ```tsx
 * const Results = () => {
 *   const { distance, azimuth, maxRange, minRange } = useBallisticCalculations();
 *
 *   return (
 *     <div>
 *       Distance: {distance}m
 *       Azimuth: {azimuth.degrees}°
 *       Range: {minRange}-{maxRange}m
 *     </div>
 *   );
 * };
 * ```
 */
export function useBallisticCalculations() {
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);

  // Memoize distance calculation
  const distance = useMemo(() => {
    if (!mortarPosition || !targetPosition) return null;
    return calculateDistance(mortarPosition, targetPosition);
  }, [mortarPosition, targetPosition]);

  // Memoize azimuth calculation
  const azimuth = useMemo(() => {
    if (!mortarPosition || !targetPosition) return null;
    return calculateAzimuth(mortarPosition, targetPosition);
  }, [mortarPosition, targetPosition]);

  // Memoize range calculations
  const ranges = useMemo(() => {
    const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo);
    const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo);
    return { maxRange, minRange };
  }, [mortarConfig.type, mortarConfig.ammo]);

  // Check if distance is in range
  const inRange = useMemo(() => {
    if (!distance) return false;
    return distance >= ranges.minRange && distance <= ranges.maxRange;
  }, [distance, ranges.minRange, ranges.maxRange]);

  return {
    distance,
    azimuth,
    maxRange: ranges.maxRange,
    minRange: ranges.minRange,
    inRange,
  };
}

/**
 * Hook for memoized range calculations only
 * Lighter version when you only need min/max range
 *
 * @param mortarType - Type of mortar
 * @param ammoType - Type of ammunition
 * @returns Memoized range limits
 */
export function useRangeLimits(mortarType: MortarType, ammoType: AmmoType) {
  return useMemo(() => {
    const maxRange = getMaximumRange(mortarType, ammoType);
    const minRange = getMinimumRange(mortarType, ammoType);
    return { maxRange, minRange };
  }, [mortarType, ammoType]);
}
