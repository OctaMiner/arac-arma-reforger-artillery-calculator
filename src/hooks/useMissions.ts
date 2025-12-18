/**
 * useMissions - Composite Hook für Mission Management
 *
 * Vereinfacht das Arbeiten mit Missions Store.
 */

import { useEffect, useCallback } from 'react';
import { useMissionsStore, useAppStore, useUserStore } from '../stores';
import type { FireMission } from '../types';

interface UseMissionsOptions {
  /**
   * Auto-load missions on mount
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Map ID filter
   */
  mapId?: string;
}

/**
 * Hook für Mission Management
 *
 * @example
 * ```tsx
 * const MissionList = () => {
 *   const { missions, saveCurrent, deleteMission } = useMissions({
 *     autoLoad: true,
 *     mapId: 'everon'
 *   })
 *
 *   return (
 *     <div>
 *       {missions.map(m => (
 *         <div key={m.id}>{m.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useMissions = (options: UseMissionsOptions = {}) => {
  const { autoLoad = true, mapId } = options;

  // Store State
  const allMissions = useMissionsStore((state) => state.missions);
  const selectedMission = useMissionsStore((state) => state.selectedMission);
  const isLoading = useMissionsStore((state) => state.isLoading);
  const error = useMissionsStore((state) => state.error);

  // Store Actions
  const loadMissions = useMissionsStore((state) => state.loadMissions);
  const saveMission = useMissionsStore((state) => state.saveMission);
  const updateMission = useMissionsStore((state) => state.updateMission);
  const deleteMission = useMissionsStore((state) => state.deleteMission);
  const selectMission = useMissionsStore((state) => state.selectMission);
  const clearSelection = useMissionsStore((state) => state.clearSelection);

  // App State for saving current
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const fireSolution = useAppStore((state) => state.fireSolution);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // User stats
  const incrementMissions = useUserStore((state) => state.incrementMissions);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadMissions();
    }
  }, [autoLoad, loadMissions]);

  /**
   * Filter missions by map
   */
  const missions = mapId
    ? allMissions.filter((m) => m.mapId === mapId)
    : allMissions;

  /**
   * Save current calculation as mission
   */
  const saveCurrent = useCallback(
    async (name: string) => {
      if (!mortarPosition || !targetPosition || !fireSolution) {
        throw new Error('Keine vollständige Berechnung vorhanden');
      }

      await saveMission({
        name,
        mapId: selectedMap,
        mortarConfig,
        mortarPos: mortarPosition,
        targetPos: targetPosition,
        fireSolution,
      });

      incrementMissions();
    },
    [
      mortarPosition,
      targetPosition,
      fireSolution,
      selectedMap,
      mortarConfig,
      saveMission,
      incrementMissions,
    ]
  );

  /**
   * Load mission into calculator
   */
  const loadIntoCalculator = useCallback(
    (mission: FireMission) => {
      const appStore = useAppStore.getState();

      // Set configuration
      appStore.setMortarConfig(mission.mortarConfig);

      // Set positions
      appStore.setMortarPosition(mission.mortarPos);
      appStore.setTargetPosition(mission.targetPos);

      // Trigger calculation
      appStore.calculateSolution();

      // Select mission
      selectMission(mission.id);
    },
    [selectMission]
  );

  /**
   * Update currently selected mission
   */
  const updateCurrent = useCallback(
    async (updates: Partial<FireMission>) => {
      if (!selectedMission) {
        throw new Error('Keine Mission ausgewählt');
      }

      await updateMission({
        ...selectedMission,
        ...updates,
      });
    },
    [selectedMission, updateMission]
  );

  /**
   * Delete mission by ID
   */
  const deleteMissionById = useCallback(
    async (id: string) => {
      await deleteMission(id);
    },
    [deleteMission]
  );

  /**
   * Check if current calculation can be saved
   */
  const canSaveCurrent = Boolean(
    mortarPosition && targetPosition && fireSolution
  );

  return {
    // State
    missions,
    selectedMission,
    isLoading,
    error,
    canSaveCurrent,

    // Actions
    loadMissions,
    saveCurrent,
    loadIntoCalculator,
    updateCurrent,
    deleteMissionById,
    selectMission,
    clearSelection,
  };
};
