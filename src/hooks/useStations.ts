/**
 * useStations - Composite Hook für Station Management
 *
 * Vereinfacht das Arbeiten mit Stations Store und Integration mit App.
 */

import { useEffect, useCallback } from 'react';
import { useStationsStore, useAppStore, useUserStore } from '../stores';
import type { Coordinate, MortarStation } from '../types';

interface UseStationsOptions {
  /**
   * Auto-load stations on mount
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Filter by map ID
   */
  mapId?: string;
}

/**
 * Hook für Station Management
 *
 * @example
 * ```tsx
 * const StationPanel = () => {
 *   const {
 *     stations,
 *     saveCurrentAsStation,
 *     loadStationIntoCalculator
 *   } = useStations({ mapId: 'everon' })
 *
 *   return (
 *     <div>
 *       {stations.map(s => (
 *         <button onClick={() => loadStationIntoCalculator(s)}>
 *           {s.name}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useStations = (options: UseStationsOptions = {}) => {
  const { autoLoad = true, mapId } = options;

  // Store State
  const allStations = useStationsStore((state) => state.stations);
  const selectedStation = useStationsStore((state) => state.selectedStation);
  const isLoading = useStationsStore((state) => state.isLoading);
  const error = useStationsStore((state) => state.error);

  // Store Actions
  const loadStations = useStationsStore((state) => state.loadStations);
  const saveStation = useStationsStore((state) => state.saveStation);
  const deleteStation = useStationsStore((state) => state.deleteStation);
  const selectStation = useStationsStore((state) => state.selectStation);
  const clearSelection = useStationsStore((state) => state.clearSelection);

  // App State
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const selectedMap = useAppStore((state) => state.selectedMap);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setMortarConfig = useAppStore((state) => state.setMortarConfig);

  // User stats
  const incrementStations = useUserStore((state) => state.incrementStations);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadStations();
    }
  }, [autoLoad, loadStations]);

  /**
   * Filter stations by map
   */
  const stations = mapId
    ? allStations.filter((s) => s.mapId === mapId)
    : allStations;

  /**
   * Save current mortar position as station
   */
  const saveCurrentAsStation = useCallback(
    async (name: string, includeConfig: boolean = true) => {
      if (!mortarPosition) {
        throw new Error('Keine Mörser-Position gesetzt');
      }

      await saveStation(
        name,
        selectedMap,
        mortarPosition,
        includeConfig ? mortarConfig : undefined
      );

      incrementStations();
    },
    [mortarPosition, selectedMap, mortarConfig, saveStation, incrementStations]
  );

  /**
   * Load station into calculator (set mortar position + optional config)
   */
  const loadStationIntoCalculator = useCallback(
    (station: MortarStation) => {
      // Set mortar position
      setMortarPosition(station.position);

      // Optionally set config
      if (station.defaultConfig) {
        setMortarConfig(station.defaultConfig);
      }

      // Select station
      selectStation(station.id);
    },
    [setMortarPosition, setMortarConfig, selectStation]
  );

  /**
   * Delete station by ID
   */
  const deleteStationById = useCallback(
    async (id: string) => {
      await deleteStation(id);
    },
    [deleteStation]
  );

  /**
   * Get station by ID
   */
  const getStationById = useCallback(
    (id: string) => {
      return allStations.find((s) => s.id === id);
    },
    [allStations]
  );

  /**
   * Check if current position can be saved as station
   */
  const canSaveCurrentAsStation = Boolean(mortarPosition);

  /**
   * Check if a position is already saved as station
   */
  const isPositionSaved = useCallback(
    (position: Coordinate) => {
      return stations.some(
        (s) =>
          s.position.east === position.east &&
          s.position.north === position.north &&
          s.position.height === position.height
      );
    },
    [stations]
  );

  /**
   * Find nearest station to a coordinate
   */
  const findNearestStation = useCallback(
    (position: Coordinate) => {
      if (stations.length === 0) return null;

      let nearest = stations[0];
      let minDistance = calculateDistance(position, nearest.position);

      for (const station of stations.slice(1)) {
        const distance = calculateDistance(position, station.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = station;
        }
      }

      return { station: nearest, distance: minDistance };
    },
    [stations]
  );

  return {
    // State
    stations,
    selectedStation,
    isLoading,
    error,
    canSaveCurrentAsStation,

    // Actions
    loadStations,
    saveCurrentAsStation,
    loadStationIntoCalculator,
    deleteStationById,
    getStationById,
    selectStation,
    clearSelection,

    // Utilities
    isPositionSaved,
    findNearestStation,
  };
};

/**
 * Calculate distance between two coordinates (helper)
 */
function calculateDistance(a: Coordinate, b: Coordinate): number {
  const dx = (a.east - b.east) * 10; // Convert to meters
  const dy = (a.north - b.north) * 10;
  const dz = a.height - b.height;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
