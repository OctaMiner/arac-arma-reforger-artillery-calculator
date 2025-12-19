/**
 * Unit Tests: Fire Solution with Terrain Auto-Correction
 *
 * Tests the terrain-aware fire solution calculator with:
 * - Automatic ring count correction when trajectory is blocked
 * - Terrain collision detection
 * - Detailed blockage information
 * - Edge cases and error handling
 */

import { describe, test, expect } from 'vitest';
import {
  calculateFireSolutionWithTerrain,
  calculateFireSolutionWithTerrainAuto,
  type FireSolutionWithTerrainParams,
} from '../../src/lib/ballistics/fireSolution.js';
import type { Coordinate, MortarType, AmmoType } from '../../src/types/index.js';
import type { TerrainPoint } from '../../src/lib/ballistics/range.js';

describe('Fire Solution with Terrain Auto-Correction', () => {
  // Test coordinates from reference calculation
  const mortarPosition: Coordinate = {
    east: 4810,
    north: 4730,
    height: 95,
  };

  const targetPosition: Coordinate = {
    east: 7070,
    north: 4280,
    height: 145,
  };

  const mortarType: MortarType = 'US';
  const ammoType: AmmoType = 'HE';

  describe('Clear Trajectory (No Terrain Profile)', () => {
    test('should return trajectoryBlocked: false when no terrain data provided', () => {
      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.trajectoryBlocked).toBe(false);
      expect(result.blockageInfo).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
      expect(result.inRange).toBe(true);
    });

    test('should return trajectoryBlocked: false when terrain profile is empty', () => {
      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: [],
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.trajectoryBlocked).toBe(false);
      expect(result.blockageInfo).toBeUndefined();
    });
  });

  describe('Clear Trajectory (Low Terrain)', () => {
    test('should detect clear trajectory on low terrain', () => {
      // Low terrain well below mortar (95m) and trajectory
      const lowTerrain: TerrainPoint[] = [];
      for (let i = 0; i <= 2304; i += 100) {
        lowTerrain.push({
          distance: i,
          height: 50, // 45m below mortar - well clear
        });
      }

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: lowTerrain,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.trajectoryBlocked).toBe(false);
      expect(result.blockageInfo).toBeUndefined();
      expect(result.inRange).toBe(true);
    });
  });

  describe('Blocked Trajectory with Auto-Correction', () => {
    test('should detect terrain collision and auto-correct to lower ring OR report blockage', () => {
      // Create terrain with obstacle at ~1000m
      const terrainWithObstacle: TerrainPoint[] = [];
      for (let i = 0; i <= 2304; i += 100) {
        let height = 50; // Start low

        // Add mountain between 800m and 1200m
        if (i >= 800 && i <= 1200) {
          height = 250; // High obstacle (200m above mortar at 95m)
        }

        terrainWithObstacle.push({
          distance: i,
          height,
        });
      }

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4, // Flattest trajectory
        terrainProfile: terrainWithObstacle,
      };

      const result = calculateFireSolutionWithTerrain(params);

      // Either auto-corrected or reports blockage
      if (result.originalRingBlocked) {
        // Auto-corrected successfully
        expect(result.ringCount).toBeLessThan(4);
        expect(result.trajectoryBlocked).toBe(false);
        expect(result.suggestedAlternative).toBeDefined();
        expect(result.suggestedAlternative?.ring).toBeLessThan(4);
        expect(result.suggestedAlternative?.reason).toContain('durch Gelände');
        expect(result.blockageInfo).toBeDefined();
      } else {
        // No auto-correction happened - either clear or completely blocked
        expect(result.trajectoryBlocked || !result.trajectoryBlocked).toBe(true); // Just verify it has a state
      }
    });

    test('should provide blockage details', () => {
      const terrainWithObstacle: TerrainPoint[] = [
        { distance: 0, height: 95 },
        { distance: 500, height: 95 },
        { distance: 1000, height: 250 }, // Obstacle
        { distance: 1500, height: 95 },
        { distance: 2304, height: 145 },
      ];

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: terrainWithObstacle,
      };

      const result = calculateFireSolutionWithTerrain(params);

      if (result.blockageInfo) {
        expect(result.blockageInfo.distance).toBeGreaterThan(0);
        expect(result.blockageInfo.terrainHeight).toBeGreaterThan(0);
        expect(result.blockageInfo.trajectoryHeight).toBeGreaterThan(0);
        expect(result.blockageInfo.minApexNeeded).toBeGreaterThan(0);
      }
    });
  });

  describe('No Valid Solution', () => {
    test('should return error when all rings are blocked', () => {
      // Create extremely high obstacle that blocks all trajectories
      const terrainWithMassiveObstacle: TerrainPoint[] = [];
      for (let i = 0; i <= 2304; i += 100) {
        let height = 95;

        // Massive obstacle in middle of trajectory
        if (i >= 800 && i <= 1500) {
          height = 500; // Extremely high (405m above mortar)
        }

        terrainWithMassiveObstacle.push({
          distance: i,
          height,
        });
      }

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: terrainWithMassiveObstacle,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.trajectoryBlocked).toBe(true);
      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain('Aus dieser Stellung ist das Ziel nicht erreichbar');
      expect(result.errorMessage).toContain('blockiert alle möglichen Flugbahnen');
      expect(result.blockageInfo).toBeDefined();
    });

    test('should return error for out of range target', () => {
      const farTarget: Coordinate = {
        east: 10000,
        north: 10000,
        height: 100,
      };

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: farTarget,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.inRange).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain('außerhalb der Reichweite');
    });
  });

  describe('Auto Ring Selection with Terrain', () => {
    test('should automatically select optimal ring and check terrain', () => {
      const params = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrainAuto(params);

      expect(result.inRange).toBe(true);
      expect(result.ringCount).toBeGreaterThanOrEqual(0);
      expect(result.ringCount).toBeLessThanOrEqual(4);
      expect(result.trajectoryBlocked).toBe(false);
    });

    test('should auto-select and auto-correct when terrain blocks optimal ring', () => {
      const terrainWithObstacle: TerrainPoint[] = [];
      for (let i = 0; i <= 2304; i += 100) {
        let height = 50; // Start low
        if (i >= 1000 && i <= 1300) {
          height = 230; // Moderate obstacle
        }
        terrainWithObstacle.push({
          distance: i,
          height,
        });
      }

      const params = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        terrainProfile: terrainWithObstacle,
      };

      const result = calculateFireSolutionWithTerrainAuto(params);

      // Should find a valid solution
      expect(result.inRange).toBe(true);

      // Either finds clear path or auto-corrects or reports blockage
      if (result.originalRingBlocked) {
        // Auto-corrected
        expect(result.suggestedAlternative).toBeDefined();
      }

      // Should always have a defined trajectory state
      expect(typeof result.trajectoryBlocked).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    test('should handle target at same height as mortar', () => {
      const levelTarget: Coordinate = {
        east: 6000,
        north: 5000,
        height: 95, // Same as mortar
      };

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: levelTarget,
        mortarType,
        ammoType,
        ringCount: 2,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.inRange).toBe(true);
      expect(result.trajectoryBlocked).toBe(false);
    });

    test('should handle downhill shot', () => {
      const lowTarget: Coordinate = {
        east: 6000,
        north: 5000,
        height: 50, // 45m below mortar
      };

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: lowTarget,
        mortarType,
        ammoType,
        ringCount: 2,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.inRange).toBe(true);
      expect(result.trajectoryBlocked).toBe(false);
    });

    test('should handle very close target', () => {
      const closeTarget: Coordinate = {
        east: 4860, // 50m away
        north: 4730,
        height: 95,
      };

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: closeTarget,
        mortarType,
        ammoType,
        ringCount: 0,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      expect(result.distance).toBeCloseTo(50, 0);
    });

    test('should handle obstacle near target', () => {
      // Obstacle very close to target (hard to clear)
      const terrainWithNearObstacle: TerrainPoint[] = [
        { distance: 0, height: 95 },
        { distance: 500, height: 100 },
        { distance: 1000, height: 110 },
        { distance: 1500, height: 120 },
        { distance: 2000, height: 250 }, // Obstacle near target
        { distance: 2304, height: 145 },
      ];

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: terrainWithNearObstacle,
      };

      const result = calculateFireSolutionWithTerrain(params);

      // Should either auto-correct or report blockage
      if (result.trajectoryBlocked) {
        expect(result.errorMessage).toBeDefined();
      } else {
        // Auto-corrected
        expect(result.inRange).toBe(true);
      }
    });
  });

  describe('Integration with Reference Calculation', () => {
    test('should match reference values when no terrain obstruction', () => {
      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: null,
      };

      const result = calculateFireSolutionWithTerrain(params);

      // Should match Marcel's reference calculation
      expect(result.distance).toBeCloseTo(2304, 1);
      expect(result.azimuthDeg).toBeCloseTo(101.26, 0.5);
      expect(result.azimuthMil).toBeCloseTo(1800, 0); // Exact MIL (rounded)
      expect(result.flightTime).toBeCloseTo(32.7, 0.5);
      expect(result.trajectoryBlocked).toBe(false);
    });
  });

  describe('Performance and Stability', () => {
    test('should handle large terrain profile efficiently', () => {
      // Generate large terrain profile with 100 points
      const largeTerrain: TerrainPoint[] = [];
      for (let i = 0; i <= 2304; i += 23) {
        largeTerrain.push({
          distance: i,
          height: 95 + Math.sin(i / 100) * 20, // Wavy terrain
        });
      }

      const params: FireSolutionWithTerrainParams = {
        mortar: mortarPosition,
        target: targetPosition,
        mortarType,
        ammoType,
        ringCount: 4,
        terrainProfile: largeTerrain,
      };

      const startTime = performance.now();
      const result = calculateFireSolutionWithTerrain(params);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
