/**
 * Basic ballistic calculations for Arma Reforger mortars
 * Distance, azimuth, and unit conversions
 */

import type { Coordinate } from '../../types/index.js';

/**
 * Calculate distance between two coordinates
 *
 * NOTE: In this application, coordinates are stored in METERS directly.
 * The Leaflet map uses a CRS where lat/lng correspond to meters on the map.
 *
 * Formula: Distance = √((Ost₁ - Ost₂)² + (Nord₁ - Nord₂)²)
 *
 * Example:
 * - mortar: { east: 4810, north: 4730 }
 * - target: { east: 7070, north: 4280 }
 * - result: 2304.3 meters
 *
 * @param mortar - Mortar position (in meters)
 * @param target - Target position (in meters)
 * @returns Distance in meters
 */
export function calculateDistance(
  mortar: Coordinate,
  target: Coordinate
): number {
  const dE = mortar.east - target.east;
  const dN = mortar.north - target.north;
  return Math.sqrt(dE * dE + dN * dN);
}

/**
 * Calculate distance in meters (convenience function)
 *
 * Converts grid units to meters automatically.
 *
 * @param mortar - Mortar position (in grid units)
 * @param target - Target position (in grid units)
 * @returns Distance in meters
 */
export function calculateDistanceMeters(
  mortar: Coordinate,
  target: Coordinate
): number {
  return calculateDistance(mortar, target) * 10;
}

/**
 * Calculate azimuth (direction) from mortar to target
 *
 * Uses atan2 for proper quadrant handling
 * - 0° = North
 * - 90° = East
 * - 180° = South
 * - 270° = West
 *
 * @param mortar - Mortar position
 * @param target - Target position
 * @returns Object with degrees (0-360°) and mils (0-6400)
 */
export function calculateAzimuth(
  mortar: Coordinate,
  target: Coordinate
): { degrees: number; mils: number } {
  const dE = target.east - mortar.east;
  const dN = target.north - mortar.north;

  // Use atan2 which handles all quadrants correctly
  // atan2(y, x) gives angle from positive x-axis
  // We need angle from north (positive y-axis), so we use atan2(dE, dN)
  let degrees = (Math.atan2(dE, dN) * 180) / Math.PI;

  // Normalize to 0-360 range
  if (degrees < 0) degrees += 360;

  const mils = degToMil(degrees);

  return { degrees, mils };
}

/**
 * Convert degrees to mils (NATO standard)
 *
 * @param degrees - Angle in degrees (0-360)
 * @returns Angle in mils (0-6400)
 */
export function degToMil(degrees: number): number {
  return (degrees / 360) * 6400;
}

/**
 * Convert mils to degrees
 *
 * @param mils - Angle in mils (0-6400)
 * @returns Angle in degrees (0-360)
 */
export function milToDeg(mils: number): number {
  return (mils / 6400) * 360;
}
