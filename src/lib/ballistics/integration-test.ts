/**
 * Integration test for all ballistic functions
 * Tests multiple scenarios and edge cases
 */

import {
  calculateDistance,
  calculateAzimuth,
  degToMil,
  milToDeg,
  calculateFireSolution,
  calculateFireSolutionAuto,
  findOptimalRingCount,
  getMaximumRange,
  getMinimumRange,
} from './index.js';
import type { Coordinate } from '../../types/index.js';

console.log('=== ARAC Ballistics Integration Test ===\n');

// Test 1: Basic calculations
console.log('TEST 1: Basic Calculations');
console.log('----------------------------');

const mortar: Coordinate = { east: 500, north: 500, height: 100 };
const target: Coordinate = { east: 600, north: 600, height: 100 };

const distance = calculateDistance(mortar, target);
console.log('Distance:', distance, 'm (expected ~1414m)');

const azimuth = calculateAzimuth(mortar, target);
console.log(
  'Azimuth:',
  azimuth.degrees.toFixed(2),
  '° /',
  azimuth.mils.toFixed(0),
  'MIL (expected 45° / 800 MIL)'
);

console.log('\nUnit conversions:');
console.log('90° =', degToMil(90), 'MIL (expected 1600)');
console.log('3200 MIL =', milToDeg(3200), '° (expected 180)');
console.log();

// Test 2: Cardinal directions
console.log('TEST 2: Cardinal Directions');
console.log('----------------------------');

const center: Coordinate = { east: 500, north: 500, height: 100 };

const north: Coordinate = { east: 500, north: 600, height: 100 };
const east: Coordinate = { east: 600, north: 500, height: 100 };
const south: Coordinate = { east: 500, north: 400, height: 100 };
const west: Coordinate = { east: 400, north: 500, height: 100 };

console.log(
  'North:',
  calculateAzimuth(center, north).degrees.toFixed(1),
  '° (expected 0)'
);
console.log(
  'East:',
  calculateAzimuth(center, east).degrees.toFixed(1),
  '° (expected 90)'
);
console.log(
  'South:',
  calculateAzimuth(center, south).degrees.toFixed(1),
  '° (expected 180)'
);
console.log(
  'West:',
  calculateAzimuth(center, west).degrees.toFixed(1),
  '° (expected 270)'
);
console.log();

// Test 3: Range checks
console.log('TEST 3: Range Checks');
console.log('----------------------------');

console.log('US HE Max Range:', getMaximumRange('US', 'HE'), 'm');
console.log('US HE Min Range:', getMinimumRange('US', 'HE'), 'm');
console.log('RUS HE Max Range:', getMaximumRange('RUS', 'HE'), 'm');
console.log('RUS HE Min Range:', getMinimumRange('RUS', 'HE'), 'm');

console.log(
  '\nOptimal ring for 1500m US HE:',
  findOptimalRingCount(1500, 'US', 'HE')
);
console.log(
  'Optimal ring for 2500m US HE:',
  findOptimalRingCount(2500, 'US', 'HE')
);
console.log(
  'Optimal ring for 500m RUS HE:',
  findOptimalRingCount(500, 'RUS', 'HE')
);
console.log();

// Test 4: Reference fire solution
console.log('TEST 4: Reference Fire Solution (from FORMULAS.md)');
console.log('---------------------------------------------------');

const refMortar: Coordinate = { east: 481, north: 473, height: 95 };
const refTarget: Coordinate = { east: 707, north: 428, height: 145 };

const solution = calculateFireSolution({
  mortar: refMortar,
  target: refTarget,
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 4,
});

console.log('Mortar:', refMortar);
console.log('Target:', refTarget);
console.log('\nResults:');
console.log('  Distance:', solution.distance, 'm');
console.log(
  '  Azimuth:',
  solution.azimuthDeg.toFixed(2),
  '° /',
  solution.azimuthMil,
  'MIL'
);
console.log('  Elevation (base):', solution.elevationBase, 'MIL');
console.log('  Height correction:', solution.deltaElev, 'MIL');
console.log('  Elevation (adjusted):', solution.elevationAdj, 'MIL');
console.log('  Flight time:', solution.flightTime, 's');
console.log('  In range:', solution.inRange);
console.log('  Recommended charge:', solution.recommendedCharge);
console.log();

// Test 5: Auto charge selection
console.log('TEST 5: Auto Charge Selection');
console.log('------------------------------');

const scenarios = [
  { distance: 200, name: 'Very close (200m)' },
  { distance: 800, name: 'Medium (800m)' },
  { distance: 1500, name: 'Long (1500m)' },
  { distance: 2800, name: 'Very long (2800m)' },
];

for (const scenario of scenarios) {
  const testMortar: Coordinate = { east: 500, north: 500, height: 100 };
  const testTarget: Coordinate = {
    east: 500 + scenario.distance / 10,
    north: 500,
    height: 100,
  };

  const autoSolution = calculateFireSolutionAuto({
    mortar: testMortar,
    target: testTarget,
    mortarType: 'US',
    ammoType: 'HE',
  });

  console.log(
    `${scenario.name}: Ring ${autoSolution.ringCount} (recommended: ${autoSolution.recommendedCharge})`
  );
}
console.log();

// Test 6: Out of range
console.log('TEST 6: Out of Range');
console.log('--------------------');

const farMortar: Coordinate = { east: 500, north: 500, height: 100 };
const farTarget: Coordinate = { east: 800, north: 500, height: 100 }; // 3000m away

const oorSolution = calculateFireSolution({
  mortar: farMortar,
  target: farTarget,
  mortarType: 'RUS',
  ammoType: 'HE',
  ringCount: 4,
});

console.log('Target distance:', oorSolution.distance, 'm');
console.log('In range:', oorSolution.inRange);
console.log('Recommended charge:', oorSolution.recommendedCharge);
console.log();

// Test 7: Height variations
console.log('TEST 7: Height Correction');
console.log('-------------------------');

const baseMortar: Coordinate = { east: 500, north: 500, height: 100 };

const scenarios2 = [
  { height: 100, name: 'Same height' },
  { height: 150, name: 'Target +50m' },
  { height: 50, name: 'Target -50m' },
  { height: 200, name: 'Target +100m' },
];

for (const scenario of scenarios2) {
  const testTarget: Coordinate = {
    east: 600,
    north: 500,
    height: scenario.height,
  };

  const sol = calculateFireSolution({
    mortar: baseMortar,
    target: testTarget,
    mortarType: 'US',
    ammoType: 'HE',
    ringCount: 4,
  });

  console.log(
    `${scenario.name}: ELEV ${sol.elevationBase} MIL → ${sol.elevationAdj} MIL (Δ${sol.deltaElev} MIL)`
  );
}
console.log();

console.log('=== All Integration Tests Complete ===');
