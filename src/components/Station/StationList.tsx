/**
 * StationList Component - List of all saved mortar stations
 *
 * Features:
 * - Loads stations on mount
 * - Displays stations as StationCards
 * - Shows "Keine Stellungen" message when empty
 * - Loading state
 *
 * Performance optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Memoized loadStations callback
 */

import { useEffect, memo, useCallback } from 'react';
import { useStationsStore } from '../../stores/useStationsStore';
import { StationCard } from './StationCard';

export const StationList = memo(() => {
  const stations = useStationsStore((state) => state.stations);
  const isLoading = useStationsStore((state) => state.isLoading);
  const loadStations = useStationsStore((state) => state.loadStations);

  // Memoized load callback
  const handleLoadStations = useCallback(() => {
    loadStations();
  }, [loadStations]);

  // Load stations on mount
  useEffect(() => {
    handleLoadStations();
  }, [handleLoadStations]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <svg
          className="animate-spin h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">Lade Stellungen...</span>
      </div>
    );
  }

  // Empty state
  if (stations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-3 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm font-medium">Keine Stellungen gespeichert</p>
        <p className="text-xs mt-1">Speichere deine erste Mörser-Position</p>
      </div>
    );
  }

  // Stations list
  return (
    <div className="space-y-2">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  );
});

StationList.displayName = 'StationList';
