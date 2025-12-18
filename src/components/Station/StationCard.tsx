/**
 * StationCard Component - Individual mortar station card
 *
 * Features:
 * - Displays station name, coordinates, default config
 * - "Anfahren" button to load station (green)
 * - Delete button (red)
 * - Compact card layout
 */

import { MapPin, Trash2, Settings } from 'lucide-react';
import type { MortarStation } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { useStationsStore } from '../../stores/useStationsStore';
import { formatGridPosition } from '../../lib/coordinates/transform';

interface StationCardProps {
  station: MortarStation;
}

export function StationCard({ station }: StationCardProps) {
  // App store actions
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setMortarType = useAppStore((state) => state.setMortarType);
  const setAmmoType = useAppStore((state) => state.setAmmoType);
  const setCharge = useAppStore((state) => state.setCharge);
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  // Station store actions
  const deleteStation = useStationsStore((state) => state.deleteStation);

  const handleLoadStation = () => {
    // Set mortar position
    setMortarPosition(station.position);

    // Set default config if available
    if (station.defaultConfig) {
      setMortarType(station.defaultConfig.type);
      setAmmoType(station.defaultConfig.ammo);
      setCharge(station.defaultConfig.charge);
    }

    // Recalculate solution
    calculateSolution();
  };

  const handleDelete = async () => {
    if (confirm(`Stellung "${station.name}" wirklich löschen?`)) {
      await deleteStation(station.id);
    }
  };

  return (
    <div className="panel hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground text-sm">{station.name}</h3>
        <button
          onClick={handleDelete}
          className="btn-icon text-muted-foreground hover:text-destructive"
          title="Stellung löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Coordinates */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-foreground font-mono">
            {formatGridPosition(station.position)}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">H:</span>
          <span className="text-foreground font-mono">
            {station.position.height.toFixed(0)}m
          </span>
        </div>

        {/* Default Config Badge */}
        {station.defaultConfig && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Settings className="w-3 h-3" />
            <span>
              {station.defaultConfig.type} • {station.defaultConfig.ammo} •
              Ladung {station.defaultConfig.charge}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleLoadStation}
        className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600 border-emerald-600/30"
      >
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Anfahren</span>
        </div>
      </button>
    </div>
  );
}
