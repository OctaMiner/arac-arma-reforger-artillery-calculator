/**
 * Interpolation functions for ballistic table lookup
 * Linear interpolation and polynomial calculations
 */

import type { BallisticEntry } from '../../types/index.js'

/**
 * Interpolate elevation from ballistic table for a given distance
 *
 * Uses linear interpolation between two table entries:
 * - g = ELEV_lower - ELEV_upper (difference between entries)
 * - adjustment = g ÷ (range_diff) × (range - lower_range)
 * - ELEV = ELEV_lower - adjustment
 *
 * @param distance - Target distance in meters
 * @param entries - Ballistic table entries
 * @returns Elevation in mils
 */
export function interpolateElevation(
  distance: number,
  entries: BallisticEntry[]
): number {
  // Find surrounding entries
  let lower = entries[0]
  let upper = entries[entries.length - 1]

  // If distance is outside table bounds, use nearest value
  if (distance <= entries[0].range) {
    return entries[0].elevation
  }
  if (distance >= entries[entries.length - 1].range) {
    return entries[entries.length - 1].elevation
  }

  // Find bracketing entries
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].range <= distance && entries[i + 1].range >= distance) {
      lower = entries[i]
      upper = entries[i + 1]
      break
    }
  }

  // Linear interpolation
  const rangeDiff = upper.range - lower.range
  const elevDiff = lower.elevation - upper.elevation
  const ratio = (distance - lower.range) / rangeDiff

  return lower.elevation - elevDiff * ratio
}

/**
 * Interpolate flight time (Time of Flight) for a given distance
 *
 * Uses the same linear interpolation method as elevation
 *
 * @param distance - Target distance in meters
 * @param entries - Ballistic table entries
 * @returns Time of flight in seconds
 */
export function interpolateFlightTime(
  distance: number,
  entries: BallisticEntry[]
): number {
  // Find surrounding entries
  let lower = entries[0]
  let upper = entries[entries.length - 1]

  // If distance is outside table bounds, use nearest value
  if (distance <= entries[0].range) {
    return entries[0].timeOfFlight
  }
  if (distance >= entries[entries.length - 1].range) {
    return entries[entries.length - 1].timeOfFlight
  }

  // Find bracketing entries
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].range <= distance && entries[i + 1].range >= distance) {
      lower = entries[i]
      upper = entries[i + 1]
      break
    }
  }

  // Linear interpolation
  const rangeDiff = upper.range - lower.range
  const tofDiff = upper.timeOfFlight - lower.timeOfFlight
  const ratio = (distance - lower.range) / rangeDiff

  return lower.timeOfFlight + tofDiff * ratio
}

/**
 * Interpolate dElev (delta elevation per 100m) for a given distance
 *
 * Used for height corrections
 *
 * @param distance - Target distance in meters
 * @param entries - Ballistic table entries
 * @returns Delta elevation per 100m in mils
 */
export function interpolateDeltaElev(
  distance: number,
  entries: BallisticEntry[]
): number {
  // Find surrounding entries
  let lower = entries[0]
  let upper = entries[entries.length - 1]

  // If distance is outside table bounds, use nearest value
  if (distance <= entries[0].range) {
    return entries[0].dElevPer100m
  }
  if (distance >= entries[entries.length - 1].range) {
    return entries[entries.length - 1].dElevPer100m
  }

  // Find bracketing entries
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].range <= distance && entries[i + 1].range >= distance) {
      lower = entries[i]
      upper = entries[i + 1]
      break
    }
  }

  // Linear interpolation
  const rangeDiff = upper.range - lower.range
  const dElevDiff = upper.dElevPer100m - lower.dElevPer100m
  const ratio = (distance - lower.range) / rangeDiff

  return lower.dElevPer100m + dElevDiff * ratio
}

/**
 * Calculate elevation using polynomial approximation (5th degree)
 *
 * Formula: a0 + a1*x + a2*x² + a3*x³ + a4*x⁴ + a5*x⁵
 *
 * This is an alternative to table interpolation for smooth curves
 *
 * @param distance - Target distance in meters
 * @param coefficients - Polynomial coefficients [a0, a1, a2, a3, a4, a5]
 * @returns Elevation in mils
 */
export function polynomialElevation(
  distance: number,
  coefficients: number[]
): number {
  if (coefficients.length !== 6) {
    throw new Error('Polynomial requires exactly 6 coefficients (degree 5)')
  }

  const [a0, a1, a2, a3, a4, a5] = coefficients
  const x = distance

  return (
    a0 +
    a1 * x +
    a2 * x ** 2 +
    a3 * x ** 3 +
    a4 * x ** 4 +
    a5 * x ** 5
  )
}
