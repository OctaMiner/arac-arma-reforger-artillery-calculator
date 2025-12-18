/**
 * MissionCard Component - Single mission card display
 *
 * Features:
 * - Shows mission name, date, and fire solution preview
 * - Load and Delete buttons
 * - Highlights active/selected mission
 * - Compact card layout
 *
 * Performance optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Event handlers memoized with useCallback
 */

import { useState, memo, useCallback, useMemo } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { FireMission } from '../../types';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { useAppStore } from '../../stores/useAppStore';
import { MissionDeleteConfirm } from './MissionDeleteConfirm';
import { useToast } from '../UI/Toast';

interface MissionCardProps {
  mission: FireMission;
  isSelected?: boolean;
}

export const MissionCard = memo(
  ({ mission, isSelected = false }: MissionCardProps) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const toast = useToast();

    // Store actions
    const selectMission = useMissionsStore((state) => state.selectMission);
    const setMortarPosition = useAppStore((state) => state.setMortarPosition);
    const setTargetPosition = useAppStore((state) => state.setTargetPosition);
    const setMortarConfig = useAppStore((state) => state.setMortarConfig);
    const calculateSolution = useAppStore((state) => state.calculateSolution);

    // Memoize formatted date
    const formattedDate = useMemo(() => {
      return new Date(mission.createdAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [mission.createdAt]);

    // Memoized load handler
    const handleLoadMission = useCallback(() => {
      // Select mission in store
      selectMission(mission.id);

      // Load positions and config into app state
      setMortarPosition(mission.mortarPos);
      setTargetPosition(mission.targetPos);
      setMortarConfig(mission.mortarConfig);

      // Show success toast
      toast.success(`Mission "${mission.name}" geladen`);

      // Recalculate solution
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        calculateSolution();
      }, 0);
    }, [
      mission,
      selectMission,
      setMortarPosition,
      setTargetPosition,
      setMortarConfig,
      calculateSolution,
      toast,
    ]);

    // Memoized delete handler
    const handleShowDeleteConfirm = useCallback(() => {
      setShowDeleteConfirm(true);
    }, []);

    const handleHideDeleteConfirm = useCallback(() => {
      setShowDeleteConfirm(false);
    }, []);

  return (
    <>
      <div
        className={`
          panel space-y-2 transition-all
          ${isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'}
        `}
      >
        {/* Mission Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {mission.name}
            </h3>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <span className="badge badge-primary">Aktiv</span>
          )}
        </div>

        {/* Fire Solution Preview */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/30 rounded p-2">
            <div className="text-xs text-muted-foreground">Azimut</div>
            <div className="font-mono font-semibold text-primary">
              {mission.fireSolution.azimuthMil.toFixed(0)} MIL
            </div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-xs text-muted-foreground">Elevation</div>
            <div className="font-mono font-semibold text-primary">
              {mission.fireSolution.elevationAdj.toFixed(0)} MIL
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex justify-between">
            <span>Entfernung:</span>
            <span className="font-mono text-foreground">
              {mission.fireSolution.distance.toFixed(0)}m
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ladung:</span>
            <span className="font-mono text-foreground">
              {mission.mortarConfig.charge} Ringe
            </span>
          </div>
          <div className="flex justify-between">
            <span>Typ:</span>
            <span className="text-foreground">
              {mission.mortarConfig.type} / {mission.mortarConfig.ammo}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleLoadMission} className="btn-secondary flex-1">
            <div className="flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>Laden</span>
            </div>
          </button>
          <button
            onClick={handleShowDeleteConfirm}
            className="btn-danger px-3"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <MissionDeleteConfirm
          mission={mission}
          onConfirm={handleHideDeleteConfirm}
          onCancel={handleHideDeleteConfirm}
        />
      )}
    </>
  );
  }
);

MissionCard.displayName = 'MissionCard';
