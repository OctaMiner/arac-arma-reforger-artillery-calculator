/**
 * MissionList Component - Displays all saved fire missions
 *
 * Features:
 * - Loads missions from store on mount
 * - Shows empty state when no missions exist
 * - Scrollable list of MissionCard components
 * - Tracks selected mission
 *
 * Performance optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Memoized loadMissions callback
 */

import { useEffect, memo, useCallback } from 'react';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { MissionCard } from './MissionCard';

export const MissionList = memo(() => {
  // Store state
  const missions = useMissionsStore((state) => state.missions);
  const selectedMission = useMissionsStore((state) => state.selectedMission);
  const isLoading = useMissionsStore((state) => state.isLoading);
  const error = useMissionsStore((state) => state.error);
  const loadMissions = useMissionsStore((state) => state.loadMissions);

  // Memoized load callback
  const handleLoadMissions = useCallback(() => {
    loadMissions();
  }, [loadMissions]);

  // Load missions on mount
  useEffect(() => {
    handleLoadMissions();
  }, [handleLoadMissions]);

  // Loading state
  if (isLoading && missions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">Lade Missionen...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-red-400 text-sm">Fehler beim Laden: {error}</p>
      </div>
    );
  }

  // Empty state
  if (missions.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium">Keine Missionen gespeichert</p>
          <p className="text-xs text-gray-500 mt-1">
            Erstelle eine Feuerlösung und speichere sie als Mission
          </p>
        </div>
      </div>
    );
  }

  // Missions list
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          isSelected={selectedMission?.id === mission.id}
        />
      ))}
    </div>
  );
});

MissionList.displayName = 'MissionList';
