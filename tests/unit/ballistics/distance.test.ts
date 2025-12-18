/**
 * Unit tests for distance calculation
 * Tests the core Pythagorean distance formula
 */

import { describe, test, expect } from 'vitest';
import { calculateDistance } from '../../../src/lib/ballistics/calculator.js';
import {
  marcelReferenceScenario,
  samePositionScenario,
} from '../../fixtures/mockData.js';

describe('calculateDistance', () => {
  test('calculates correct distance for Marcel reference scenario', () => {
    const result = calculateDistance(
      marcelReferenceScenario.mortar,
      marcelReferenceScenario.target
    );

    // Expected: 2304.37m (from Excel reference)
    expect(result).toBeCloseTo(marcelReferenceScenario.expected.distance, 0);
  });

  test('returns 0 for same position', () => {
    const result = calculateDistance(
      samePositionScenario.mortar,
      samePositionScenario.target
    );

    expect(result).toBe(0);
  });

  test('calculates distance for horizontal movement only (East)', () => {
    const mortar = { east: 100, north: 500, height: 0 };
    const target = { east: 200, north: 500, height: 0 };

    const result = calculateDistance(mortar, target);

    // 100 grid units = 1000m
    expect(result).toBeCloseTo(100, 1);
  });

  test('calculates distance for vertical movement only (North)', () => {
    const mortar = { east: 500, north: 100, height: 0 };
    const target = { east: 500, north: 300, height: 0 };

    const result = calculateDistance(mortar, target);

    // 200 grid units = 2000m
    expect(result).toBeCloseTo(200, 1);
  });

  test('distance is symmetrical (mortar<->target swap)', () => {
    const distance1 = calculateDistance(
      marcelReferenceScenario.mortar,
      marcelReferenceScenario.target
    );

    const distance2 = calculateDistance(
      marcelReferenceScenario.target,
      marcelReferenceScenario.mortar
    );

    expect(distance1).toBe(distance2);
  });

  test('handles negative coordinates correctly', () => {
    const mortar = { east: -100, north: -100, height: 0 };
    const target = { east: 100, north: 100, height: 0 };

    const result = calculateDistance(mortar, target);

    // sqrt((200)^2 + (200)^2) = sqrt(80000) ≈ 282.84
    expect(result).toBeCloseTo(282.84, 1);
  });

  test('diagonal distance (45 degrees)', () => {
    const mortar = { east: 0, north: 0, height: 0 };
    const target = { east: 100, north: 100, height: 0 };

    const result = calculateDistance(mortar, target);

    // sqrt(100^2 + 100^2) = 141.42
    expect(result).toBeCloseTo(141.42, 1);
  });
});
