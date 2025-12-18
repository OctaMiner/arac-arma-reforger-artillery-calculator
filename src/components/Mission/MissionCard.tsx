/**
 * MissionCard Component - Single mission card display
 *
 * Features:
 * - Shows mission name, date, and fire solution preview
 * - Load and Delete buttons
 * - Highlights active/selected mission
 * - Compact card layout
 */

import { useState } from 'react';
import type { FireMission } from '../../types';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { useAppStore } from '../../stores/useAppStore';
import { MissionDeleteConfirm } from './MissionDeleteConfirm';

interface MissionCardProps {
  mission: FireMission;
  isSelected?: boolean;
}

export function MissionCard({ mission, isSelected = false }: MissionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Store actions
  const selectMission = useMissionsStore((state) => state.selectMission);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);
  const setMortarConfig = useAppStore((state) => state.setMortarConfig);
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  // Format date for display
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load mission into current configuration
  const handleLoadMission = () => {
    // Select mission in store
    selectMission(mission.id);

    // Load positions and config into app state
    setMortarPosition(mission.mortarPos);
    setTargetPosition(mission.targetPos);
    setMortarConfig(mission.mortarConfig);

    // Recalculate solution
    // Use setTimeout to ensure state updates have propagated
    setTimeout(() => {
      calculateSolution();
    }, 0);
  };

  return (
    <>
      <div
        className={`
          bg-gray-800 rounded-lg p-3 space-y-2 transition-all
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'hover:bg-gray-750'}
        `}
      >
        {/* Mission Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">
              {mission.name}
            </h3>
            <p className="text-xs text-gray-400">
              {formatDate(mission.createdAt)}
            </p>
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              Aktiv
            </span>
          )}
        </div>

        {/* Fire Solution Preview */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-900/50 rounded p-2">
            <div className="text-xs text-gray-400">Azimut</div>
            <div className="font-mono font-semibold text-blue-400">
              {mission.fireSolution.azimuthMil.toFixed(0)} MIL
            </div>
          </div>
          <div className="bg-gray-900/50 rounded p-2">
            <div className="text-xs text-gray-400">Elevation</div>
            <div className="font-mono font-semibold text-green-400">
              {mission.fireSolution.elevationAdj.toFixed(0)} MIL
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-400 space-y-0.5">
          <div className="flex justify-between">
            <span>Entfernung:</span>
            <span className="font-mono text-gray-300">
              {mission.fireSolution.distance.toFixed(0)}m
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ladung:</span>
            <span className="font-mono text-gray-300">
              {mission.mortarConfig.charge} Ringe
            </span>
          </div>
          <div className="flex justify-between">
            <span>Typ:</span>
            <span className="text-gray-300">
              {mission.mortarConfig.type} / {mission.mortarConfig.ammo}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleLoadMission}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            Laden
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
          >
            Löschen
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <MissionDeleteConfirm
          mission={mission}
          onConfirm={() => setShowDeleteConfirm(false)}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
