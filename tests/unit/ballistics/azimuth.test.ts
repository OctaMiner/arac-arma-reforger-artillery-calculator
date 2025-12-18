/**
 * Unit tests for azimuth (bearing/direction) calculation
 * Tests angle calculations in degrees and mils
 */

import { describe, test, expect } from 'vitest';
import {
  calculateAzimuth,
  degToMil,
  milToDeg,
} from '../../../src/lib/ballistics/calculator.js';
import {
  marcelReferenceScenario,
  cardinalDirections,
  samePositionScenario,
} from '../../fixtures/mockData.js';

describe('calculateAzimuth', () => {
  describe('cardinal directions', () => {
    test('North = 0° / 0 MIL', () => {
      const result = calculateAzimuth(
        cardinalDirections.north.mortar,
        cardinalDirections.north.target
      );

      expect(result.degrees).toBeCloseTo(
        cardinalDirections.north.expected.azimuthDeg,
        1
      );
      expect(result.mils).toBeCloseTo(
        cardinalDirections.north.expected.azimuthMil,
        1
      );
    });

    test('East = 90° / 1600 MIL', () => {
      const result = calculateAzimuth(
        cardinalDirections.east.mortar,
        cardinalDirections.east.target
      );

      expect(result.degrees).toBeCloseTo(
        cardinalDirections.east.expected.azimuthDeg,
        1
      );
      expect(result.mils).toBeCloseTo(
        cardinalDirections.east.expected.azimuthMil,
        1
      );
    });

    test('South = 180° / 3200 MIL', () => {
      const result = calculateAzimuth(
        cardinalDirections.south.mortar,
        cardinalDirections.south.target
      );

      expect(result.degrees).toBeCloseTo(
        cardinalDirections.south.expected.azimuthDeg,
        1
      );
      expect(result.mils).toBeCloseTo(
        cardinalDirections.south.expected.azimuthMil,
        1
      );
    });

    test('West = 270° / 4800 MIL', () => {
      const result = calculateAzimuth(
        cardinalDirections.west.mortar,
        cardinalDirections.west.target
      );

      expect(result.degrees).toBeCloseTo(
        cardinalDirections.west.expected.azimuthDeg,
        1
      );
      expect(result.mils).toBeCloseTo(
        cardinalDirections.west.expected.azimuthMil,
        1
      );
    });
  });

  test('Marcel reference scenario: 101.26° / ~1800 MIL', () => {
    const result = calculateAzimuth(
      marcelReferenceScenario.mortar,
      marcelReferenceScenario.target
    );

    expect(result.degrees).toBeCloseTo(
      marcelReferenceScenario.expected.azimuthDeg,
      1
    );
    // MIL precision: allow ~1 MIL deviation due to rounding
    expect(result.mils).toBeCloseTo(
      marcelReferenceScenario.expected.azimuthMil,
      0
    );
  });

  test('Northeast diagonal (45°)', () => {
    const mortar = { east: 0, north: 0, height: 0 };
    const target = { east: 100, north: 100, height: 0 };

    const result = calculateAzimuth(mortar, target);

    expect(result.degrees).toBeCloseTo(45, 1);
    expect(result.mils).toBeCloseTo(800, 10);
  });

  test('Southwest diagonal (225°)', () => {
    const mortar = { east: 0, north: 0, height: 0 };
    const target = { east: -100, north: -100, height: 0 };

    const result = calculateAzimuth(mortar, target);

    expect(result.degrees).toBeCloseTo(225, 1);
    expect(result.mils).toBeCloseTo(4000, 10);
  });

  test('same position returns 0° / 0 MIL', () => {
    const result = calculateAzimuth(
      samePositionScenario.mortar,
      samePositionScenario.target
    );

    expect(result.degrees).toBe(0);
    expect(result.mils).toBe(0);
  });

  test('result is always in 0-360° range', () => {
    const testCases = [
      {
        mortar: { east: 0, north: 0, height: 0 },
        target: { east: 100, north: -100, height: 0 },
      },
      {
        mortar: { east: 0, north: 0, height: 0 },
        target: { east: -100, north: 100, height: 0 },
      },
      {
        mortar: { east: 50, north: 75, height: 0 },
        target: { east: 25, north: 120, height: 0 },
      },
    ];

    testCases.forEach(({ mortar, target }) => {
      const result = calculateAzimuth(mortar, target);
      expect(result.degrees).toBeGreaterThanOrEqual(0);
      expect(result.degrees).toBeLessThan(360);
    });
  });
});

describe('unit conversions', () => {
  test('degToMil: 0° = 0 MIL', () => {
    expect(degToMil(0)).toBe(0);
  });

  test('degToMil: 90° = 1600 MIL', () => {
    expect(degToMil(90)).toBeCloseTo(1600, 0);
  });

  test('degToMil: 180° = 3200 MIL', () => {
    expect(degToMil(180)).toBeCloseTo(3200, 0);
  });

  test('degToMil: 360° = 6400 MIL', () => {
    expect(degToMil(360)).toBeCloseTo(6400, 0);
  });

  test('milToDeg: 0 MIL = 0°', () => {
    expect(milToDeg(0)).toBe(0);
  });

  test('milToDeg: 1600 MIL = 90°', () => {
    expect(milToDeg(1600)).toBeCloseTo(90, 0);
  });

  test('milToDeg: 3200 MIL = 180°', () => {
    expect(milToDeg(3200)).toBeCloseTo(180, 0);
  });

  test('milToDeg: 6400 MIL = 360°', () => {
    expect(milToDeg(6400)).toBeCloseTo(360, 0);
  });

  test('round-trip conversion (deg -> mil -> deg)', () => {
    const originalDegrees = 123.45;
    const mils = degToMil(originalDegrees);
    const backToDegrees = milToDeg(mils);

    expect(backToDegrees).toBeCloseTo(originalDegrees, 2);
  });

  test('round-trip conversion (mil -> deg -> mil)', () => {
    const originalMils = 2345;
    const degrees = milToDeg(originalMils);
    const backToMils = degToMil(degrees);

    expect(backToMils).toBeCloseTo(originalMils, 2);
  });
});
