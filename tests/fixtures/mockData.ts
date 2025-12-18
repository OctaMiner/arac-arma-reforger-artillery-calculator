/**
 * Mock data for tests
 * Based on reference calculations from Marcel's Excel spreadsheet
 */

import type { Coordinate } from '../../src/types/index.js';

/**
 * Reference scenario: Marcel's Excel calculation
 * NOTE: Coordinates are in GRID UNITS (1 grid = 10m)
 * Mortar: 481/473 grid (4810m/4730m), height 95m
 * Target: 707/428 grid (7070m/4280m), height 145m
 * Delta: 226 east, 45 north = 230.43 grid units = 2304.3m
 *
 * Expected results:
 * - Distance: 230.43 grid units (2304.37m in meters)
 * - Azimuth: 101.26° / 1800 MIL
 * - Elevation (US HE Ring4): ~1134 MIL
 * - Height correction: ~9.11 MIL (target 50m higher)
 * - Final elevation: ~1125 MIL
 */
export const marcelReferenceScenario = {
  mortar: {
    east: 481,
    north: 473,
    height: 95,
  } as Coordinate,
  target: {
    east: 707,
    north: 428,
    height: 145,
  } as Coordinate,
  expected: {
    distance: 230.43, // Grid units - multiply by 10 for meters
    distanceMeters: 2304.3,
    azimuthDeg: 101.26,
    azimuthMil: 1800,
    elevationMil: 1134,
    heightDelta: 50,
    deltaElevation: 9.11,
    finalElevation: 1125,
  },
  config: {
    mortarType: 'US' as const,
    ammoType: 'HE' as const,
    chargeCount: 4,
  },
};

/**
 * Edge case: Same position
 */
export const samePositionScenario = {
  mortar: {
    east: 500,
    north: 500,
    height: 100,
  } as Coordinate,
  target: {
    east: 500,
    north: 500,
    height: 100,
  } as Coordinate,
  expected: {
    distance: 0,
    azimuthDeg: 0,
    azimuthMil: 0,
  },
};

/**
 * Cardinal directions test cases
 */
export const cardinalDirections = {
  north: {
    mortar: { east: 500, north: 500, height: 0 } as Coordinate,
    target: { east: 500, north: 600, height: 0 } as Coordinate,
    expected: { azimuthDeg: 0, azimuthMil: 0 },
  },
  east: {
    mortar: { east: 500, north: 500, height: 0 } as Coordinate,
    target: { east: 600, north: 500, height: 0 } as Coordinate,
    expected: { azimuthDeg: 90, azimuthMil: 1600 },
  },
  south: {
    mortar: { east: 500, north: 500, height: 0 } as Coordinate,
    target: { east: 500, north: 400, height: 0 } as Coordinate,
    expected: { azimuthDeg: 180, azimuthMil: 3200 },
  },
  west: {
    mortar: { east: 500, north: 500, height: 0 } as Coordinate,
    target: { east: 400, north: 500, height: 0 } as Coordinate,
    expected: { azimuthDeg: 270, azimuthMil: 4800 },
  },
};

/**
 * Spotter test scenarios
 */
export const spotterScenarios = {
  basic: {
    spotterPos: { east: 500, north: 500, height: 0 } as Coordinate,
    distanceToTarget: 1000,
    azimuthToTarget: 90,
    expectedTarget: { east: 600, north: 500 },
  },
  correction: {
    currentTarget: { east: 500, north: 500, height: 0 } as Coordinate,
    firingAzimuth: 0,
    corrections: {
      right100: {
        leftRight: 100,
        addDrop: 0,
        expectedEast: 510,
        expectedNorth: 500,
      },
      left50: {
        leftRight: -50,
        addDrop: 0,
        expectedEast: 495,
        expectedNorth: 500,
      },
      add200: {
        leftRight: 0,
        addDrop: 200,
        expectedEast: 500,
        expectedNorth: 520,
      },
      drop100: {
        leftRight: 0,
        addDrop: -100,
        expectedEast: 500,
        expectedNorth: 490,
      },
    },
  },
};

/**
 * Mock missions for storage tests
 */
export const mockMissions = [
  {
    id: '1',
    name: 'Test Mission Alpha',
    mortarType: 'US' as const,
    ammoType: 'HE' as const,
    chargeCount: 4,
    mortarPos: marcelReferenceScenario.mortar,
    targetPos: marcelReferenceScenario.target,
    createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    name: 'Test Mission Bravo',
    mortarType: 'RU' as const,
    ammoType: 'SMOKE' as const,
    chargeCount: 3,
    mortarPos: { east: 300, north: 400, height: 50 },
    targetPos: { east: 500, north: 600, height: 75 },
    createdAt: new Date('2024-01-01T11:00:00Z').toISOString(),
  },
];
