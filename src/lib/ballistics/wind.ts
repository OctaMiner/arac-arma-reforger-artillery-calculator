/**
 * Wind correction calculations for mortar fire
 *
 * Wind affects mortar rounds in two ways:
 * 1. Crosswind (seitlich): Causes lateral drift → Azimuth correction
 * 2. Headwind/Tailwind (längs): Affects range → Elevation correction
 *
 * The correction depends on:
 * - Wind speed (m/s)
 * - Wind direction relative to firing direction
 * - Time of flight (longer flight = more drift)
 */

import type { WindData, WindCorrection } from './types.js';

/**
 * Wind drift coefficient for 82mm mortar (meters drift per m/s wind per second of flight)
 * This is an approximation based on typical mortar ballistics
 *
 * Actual value depends on:
 * - Projectile mass and drag coefficient
 * - Muzzle velocity
 * - Trajectory angle
 *
 * For 82mm HE at typical velocities: ~0.3-0.5m drift per m/s crosswind per second
 */
const CROSSWIND_DRIFT_COEFFICIENT = 0.4;

/**
 * Range effect coefficient (meters range change per m/s headwind per second of flight)
 * Headwind reduces range, tailwind increases it
 *
 * For high-angle mortar fire, this effect is less pronounced than crosswind
 */
const HEADWIND_RANGE_COEFFICIENT = 0.2;

/**
 * Calculate wind components relative to firing direction
 *
 * @param windDirection - Direction wind is coming FROM in degrees (0 = North)
 * @param firingAzimuth - Direction of fire in degrees (0 = North)
 * @param windSpeed - Wind speed in m/s
 * @returns Crosswind and headwind components
 */
export function calculateWindComponents(
  windDirection: number,
  firingAzimuth: number,
  windSpeed: number
): { crosswind: number; headwind: number } {
  // Calculate relative wind angle
  // Wind direction is where wind comes FROM
  // We need the angle between wind direction and firing direction

  // Wind vector points in opposite direction of where it comes from
  const windVectorDirection = (windDirection + 180) % 360;

  // Relative angle: positive = wind from left, negative = wind from right
  let relativeAngle = windVectorDirection - firingAzimuth;

  // Normalize to -180 to +180
  if (relativeAngle > 180) relativeAngle -= 360;
  if (relativeAngle < -180) relativeAngle += 360;

  const relativeAngleRad = (relativeAngle * Math.PI) / 180;

  // Crosswind: positive = wind pushing from left (aim right)
  // sin(0) = 0 (no crosswind when aligned)
  // sin(90) = 1 (full crosswind from left)
  // sin(-90) = -1 (full crosswind from right)
  const crosswind = windSpeed * Math.sin(relativeAngleRad);

  // Headwind: positive = wind against flight direction (reduces range)
  // cos(0) = 1 (full headwind)
  // cos(180) = -1 (full tailwind)
  const headwind = windSpeed * Math.cos(relativeAngleRad);

  return { crosswind, headwind };
}

/**
 * Calculate wind correction for a fire solution
 *
 * @param wind - Wind data (speed and direction)
 * @param firingAzimuthDeg - Firing direction in degrees
 * @param timeOfFlight - Time of flight in seconds
 * @param range - Target range in meters
 * @returns Wind correction values
 */
export function calculateWindCorrection(
  wind: WindData,
  firingAzimuthDeg: number,
  timeOfFlight: number,
  range: number
): WindCorrection {
  // No wind = no correction
  if (wind.speed === 0) {
    return {
      azimuthCorrection: 0,
      rangeCorrection: 0,
      crosswind: 0,
      headwind: 0,
    };
  }

  // Calculate wind components
  const { crosswind, headwind } = calculateWindComponents(
    wind.direction,
    firingAzimuthDeg,
    wind.speed
  );

  // Calculate lateral drift in meters
  // Drift = crosswind * coefficient * time of flight
  const lateralDrift = crosswind * CROSSWIND_DRIFT_COEFFICIENT * timeOfFlight;

  // Convert lateral drift to azimuth correction in mil
  // At range R, a lateral offset of D corresponds to an angle of atan(D/R)
  // For small angles: angle (rad) ≈ D/R
  // Convert to mil: angle (mil) = angle (rad) * 6400 / (2*PI) = D/R * 1018.6
  const azimuthCorrectionMil = (lateralDrift / range) * 1018.6;

  // Calculate range effect in meters
  // Headwind reduces range, tailwind increases it
  const rangeCorrection = headwind * HEADWIND_RANGE_COEFFICIENT * timeOfFlight;

  return {
    azimuthCorrection: Math.round(azimuthCorrectionMil * 10) / 10, // Round to 0.1 mil
    rangeCorrection: Math.round(rangeCorrection),
    crosswind: Math.round(crosswind * 10) / 10,
    headwind: Math.round(headwind * 10) / 10,
  };
}

/**
 * Apply wind correction to azimuth
 *
 * @param baseAzimuthMil - Base azimuth in mil
 * @param windCorrection - Wind correction data
 * @returns Corrected azimuth in mil
 */
export function applyWindToAzimuth(
  baseAzimuthMil: number,
  windCorrection: WindCorrection
): number {
  // Subtract correction because we aim opposite to drift
  // If wind pushes right, aim left (subtract from azimuth)
  let corrected = baseAzimuthMil - windCorrection.azimuthCorrection;

  // Normalize to 0-6400 mil
  if (corrected < 0) corrected += 6400;
  if (corrected >= 6400) corrected -= 6400;

  return Math.round(corrected);
}

/**
 * Convert wind speed from km/h to m/s
 */
export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

/**
 * Convert wind speed from m/s to km/h
 */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/**
 * Get wind strength description
 */
export function getWindStrength(speedMs: number): string {
  if (speedMs < 1) return 'Windstille';
  if (speedMs < 3) return 'Leicht';
  if (speedMs < 6) return 'Mäßig';
  if (speedMs < 10) return 'Frisch';
  if (speedMs < 15) return 'Stark';
  return 'Sturm';
}

/**
 * Get cardinal direction from degrees
 */
export function getWindDirectionName(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
