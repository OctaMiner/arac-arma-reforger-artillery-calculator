/**
 * Main App Store - Central state management for mortar calculator
 *
 * Manages:
 * - Mortar configuration (type, ammo, charge)
 * - Mortar and target positions
 * - Fire solution calculation
 * - Selected map (auto-resets positions on change)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Coordinate,
  MortarConfig,
  FireSolutionWithTerrain,
  MortarType,
  AmmoType,
  RingCount,
  WindData,
} from '../types';
import {
  calculateFireSolutionWithTerrain,
  calculateFireSolutionWithTerrainAuto,
  calculateWindCorrection,
  applyWindToAzimuth,
} from '../lib/ballistics';
import { getTerrainProfile, isHeightDataLoaded, preloadHeightData } from '../lib/maps/heightService';

interface AppState {
  // Configuration
  mortarConfig: MortarConfig;
  selectedMap: string;

  // Manual charge override (null = auto mode)
  manualChargeOverride: RingCount | null;

  // Wind
  windData: WindData | null;

  // Positions
  mortarPosition: Coordinate | null;
  targetPosition: Coordinate | null;

  // Results
  fireSolution: FireSolutionWithTerrain | null;

  // UI State
  isCalculating: boolean;
  error: string | null;
  showGrid: boolean;

  // Actions
  setMortarConfig: (config: Partial<MortarConfig>) => void;
  setMortarType: (type: MortarType) => void;
  setAmmoType: (ammo: AmmoType) => void;
  setCharge: (charge: RingCount) => void;
  setManualChargeOverride: (charge: RingCount | null) => void;
  setWindData: (wind: WindData | null) => void;
  setMortarPosition: (position: Coordinate | null) => void;
  setTargetPosition: (position: Coordinate | null) => void;
  setSelectedMap: (mapId: string) => void;
  setShowGrid: (show: boolean) => void;
  toggleGrid: () => void;
  calculateSolution: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_CONFIG: MortarConfig = {
  type: 'US',
  ammo: 'HE',
  charge: 4,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      mortarConfig: DEFAULT_CONFIG,
      selectedMap: 'everon',
      manualChargeOverride: null, // null = automatic mode
      windData: null, // null = no wind
      mortarPosition: null,
      targetPosition: null,
      fireSolution: null,
      isCalculating: false,
      error: null,
      showGrid: true, // Grid enabled by default

      // Actions
      setMortarConfig: (config) =>
        set(
          (state) => ({
            mortarConfig: { ...state.mortarConfig, ...config },
          }),
          false,
          'setMortarConfig'
        ),

      setMortarType: (type) =>
        set(
          (state) => ({
            mortarConfig: { ...state.mortarConfig, type },
          }),
          false,
          'setMortarType'
        ),

      setAmmoType: (ammo) =>
        set(
          (state) => ({
            mortarConfig: { ...state.mortarConfig, ammo },
          }),
          false,
          'setAmmoType'
        ),

      setCharge: (charge) =>
        set(
          (state) => ({
            mortarConfig: { ...state.mortarConfig, charge },
          }),
          false,
          'setCharge'
        ),

      setManualChargeOverride: (charge) =>
        set({ manualChargeOverride: charge }, false, 'setManualChargeOverride'),

      setWindData: (wind) => set({ windData: wind }, false, 'setWindData'),

      setMortarPosition: (position) =>
        set({ mortarPosition: position }, false, 'setMortarPosition'),

      setTargetPosition: (position) =>
        set({ targetPosition: position }, false, 'setTargetPosition'),

      setSelectedMap: (mapId) =>
        set(
          {
            selectedMap: mapId,
            // Reset positions and solution when map changes
            // Coordinates are not valid across different maps
            mortarPosition: null,
            targetPosition: null,
            fireSolution: null,
            error: null,
          },
          false,
          'setSelectedMap'
        ),

      setShowGrid: (show) => set({ showGrid: show }, false, 'setShowGrid'),

      toggleGrid: () =>
        set((state) => ({ showGrid: !state.showGrid }), false, 'toggleGrid'),

      calculateSolution: async () => {
        const state = get();
        const {
          mortarPosition,
          targetPosition,
          mortarConfig,
          manualChargeOverride,
          windData,
          selectedMap,
        } = state;

        // Validation
        if (!mortarPosition || !targetPosition) {
          set({
            error: 'Mörser- und Zielposition müssen gesetzt sein',
            fireSolution: null,
          });
          return;
        }

        try {
          set(
            { isCalculating: true, error: null },
            false,
            'calculateSolution/start'
          );

          // Preload height data if not already loaded, then get terrain profile
          let terrainProfile = null;
          if (!isHeightDataLoaded(selectedMap)) {
            // Wait for height data to load (max 5 seconds)
            await preloadHeightData(selectedMap);
          }

          if (isHeightDataLoaded(selectedMap)) {
            terrainProfile = getTerrainProfile(
              selectedMap,
              mortarPosition.east,
              mortarPosition.north,
              targetPosition.east,
              targetPosition.north
            );
          }

          let solution: FireSolutionWithTerrain;

          // MANUAL MODE: User has explicitly chosen a ring
          if (manualChargeOverride !== null) {
            solution = calculateFireSolutionWithTerrain({
              mortar: mortarPosition,
              target: targetPosition,
              mortarType: mortarConfig.type,
              ammoType: mortarConfig.ammo,
              ringCount: manualChargeOverride,
              terrainProfile,
            });
          } else {
            // AUTO MODE: Calculate with automatic optimal ring selection + terrain
            solution = calculateFireSolutionWithTerrainAuto({
              mortar: mortarPosition,
              target: targetPosition,
              mortarType: mortarConfig.type,
              ammoType: mortarConfig.ammo,
              terrainProfile,
            });

            // Update the mortarConfig charge to match the calculated optimal charge
            // This keeps the UI in sync but the calculation drives the charge, not the input
            if (solution.recommendedCharge !== undefined) {
              set(
                (state) => ({
                  mortarConfig: {
                    ...state.mortarConfig,
                    charge: solution.recommendedCharge!,
                  },
                }),
                false,
                'calculateSolution/updateCharge'
              );
            }
          }

          // Apply wind correction if wind data is provided
          if (windData && windData.speed > 0 && solution.inRange) {
            const windCorrection = calculateWindCorrection(
              windData,
              solution.azimuthDeg,
              solution.flightTime,
              solution.distance
            );

            const azimuthWithWind = applyWindToAzimuth(
              solution.azimuthMil,
              windCorrection
            );

            // Wind affects elevation slightly through range correction
            // For simplicity, we'll use the same elevation but could adjust for range change
            const elevationWithWind = solution.elevationAdj;

            solution = {
              ...solution,
              windCorrection,
              azimuthWithWind,
              elevationWithWind,
            };
          }

          // Determine error message: use solution's errorMessage if available
          let errorMsg: string | null = null;
          if (solution.errorMessage) {
            errorMsg = solution.errorMessage;
          } else if (solution.trajectoryBlocked) {
            errorMsg = 'Aus dieser Stellung ist das Ziel nicht erreichbar. Bitte ändern Sie die Position der Mörserstellung.';
          } else if (!solution.inRange) {
            errorMsg = 'Ziel außer Reichweite';
          }

          set(
            {
              fireSolution: solution,
              isCalculating: false,
              error: errorMsg,
            },
            false,
            'calculateSolution/success'
          );
        } catch (err) {
          set(
            {
              fireSolution: null,
              isCalculating: false,
              error:
                err instanceof Error
                  ? err.message
                  : 'Fehler bei der Berechnung',
            },
            false,
            'calculateSolution/error'
          );
        }
      },

      reset: () =>
        set(
          {
            mortarConfig: DEFAULT_CONFIG,
            manualChargeOverride: null,
            windData: null,
            mortarPosition: null,
            targetPosition: null,
            fireSolution: null,
            isCalculating: false,
            error: null,
            showGrid: true, // Keep grid visible after reset
          },
          false,
          'reset'
        ),
    }),
    {
      name: 'app-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for performance optimization
export const selectMortarConfig = (state: AppState) => state.mortarConfig;
export const selectMortarPosition = (state: AppState) => state.mortarPosition;
export const selectTargetPosition = (state: AppState) => state.targetPosition;
export const selectFireSolution = (state: AppState) => state.fireSolution;
export const selectIsCalculating = (state: AppState) => state.isCalculating;
export const selectError = (state: AppState) => state.error;
