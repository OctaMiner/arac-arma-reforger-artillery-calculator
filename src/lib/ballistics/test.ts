/**
 * Test script for ballistic calculations
 * Validates calculations against reference values from FORMULAS.md
 */

import { calculateFireSolution } from './fireSolution.js'
import type { Coordinate } from '../../types/index.js'

// Reference values from docs/FORMULAS.md
// Note: Coordinates are in METERS (1 unit = 1 meter)
// The old documentation used 10m units, so multiply by 10
const mortarPos: Coordinate = {
  east: 4810,   // 481 * 10
  north: 4730,  // 473 * 10
  height: 95
}

const targetPos: Coordinate = {
  east: 7070,   // 707 * 10
  north: 4280,  // 428 * 10
  height: 145
}

// Expected results:
// - Distance: ~2304m
// - Azimuth: ~101.26° / ~1800 MIL
// - Elevation (Ring 4): ~1134 MIL (before height correction)
// - Height diff: 50m (145-95), dElev ~36 mils/100m at 2300m
// - Delta ELEV: 50 * (36/100) = 18 MIL
// - Final ELEV: 1134 - 18 = 1116 MIL (target is higher)

console.log('=== ARAC Ballistics Test ===\n')
console.log('Reference Test Case from FORMULAS.md')
console.log('Mortar:', mortarPos)
console.log('Target:', targetPos)
console.log()

// Test US Ring 4
console.log('--- US Mortar, HE, Ring 4 ---')
const solution = calculateFireSolution({
  mortar: mortarPos,
  target: targetPos,
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 4
})

console.log('Distance:', solution.distance, 'm (expected ~2304m)')
console.log(
  'Azimuth:',
  solution.azimuthDeg.toFixed(2),
  '° /',
  solution.azimuthMil.toFixed(0),
  'MIL (expected ~101.26° / ~1800 MIL)'
)
console.log(
  'Elevation (base):',
  solution.elevationBase,
  'MIL (expected ~1134 MIL)'
)
console.log('Height diff:', targetPos.height - mortarPos.height, 'm')
console.log('Delta ELEV:', solution.deltaElev, 'MIL')
console.log('Elevation (adjusted):', solution.elevationAdj, 'MIL')
console.log('Flight time:', solution.flightTime, 's')
console.log('In range:', solution.inRange)
console.log('Recommended charge:', solution.recommendedCharge)
console.log()

// Validation
const tolerances = {
  distance: 10, // ±10m
  azimuthDeg: 1, // ±1°
  azimuthMil: 20, // ±20 MIL
  elevation: 20 // ±20 MIL
}

const errors = []

if (Math.abs(solution.distance - 2304) > tolerances.distance) {
  errors.push(
    `Distance error: ${solution.distance}m vs expected ~2304m (tolerance ±${tolerances.distance}m)`
  )
}

if (Math.abs(solution.azimuthDeg - 101.26) > tolerances.azimuthDeg) {
  errors.push(
    `Azimuth (deg) error: ${solution.azimuthDeg.toFixed(2)}° vs expected ~101.26° (tolerance ±${tolerances.azimuthDeg}°)`
  )
}

if (Math.abs(solution.azimuthMil - 1800) > tolerances.azimuthMil) {
  errors.push(
    `Azimuth (MIL) error: ${solution.azimuthMil.toFixed(0)} MIL vs expected ~1800 MIL (tolerance ±${tolerances.azimuthMil} MIL)`
  )
}

if (Math.abs(solution.elevationBase - 1134) > tolerances.elevation) {
  errors.push(
    `Elevation error: ${solution.elevationBase} MIL vs expected ~1134 MIL (tolerance ±${tolerances.elevation} MIL)`
  )
}

console.log('=== Validation Results ===')
if (errors.length === 0) {
  console.log('✓ All values within tolerance!')
} else {
  console.log('✗ Errors found:')
  errors.forEach((err) => console.log('  -', err))
}
