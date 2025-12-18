/**
 * StationCard Component - Individual mortar station card
 *
 * Features:
 * - Displays station name, coordinates, default config
 * - "Anfahren" button to load station (green)
 * - Delete button (red)
 * - Compact card layout
 */

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
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white text-sm">{station.name}</h3>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-400 transition-colors"
          title="Stellung löschen"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Coordinates */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white font-mono">
            {formatGridPosition(station.position)}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">H:</span>
          <span className="text-white font-mono">
            {station.position.height.toFixed(0)}m
          </span>
        </div>

        {/* Default Config Badge */}
        {station.defaultConfig && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
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
        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors"
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
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
          <span>Anfahren</span>
        </div>
      </button>
    </div>
  );
}
