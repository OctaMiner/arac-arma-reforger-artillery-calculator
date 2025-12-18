/**
 * QuickStationSelect Component - Quick Station Selection Dropdown
 *
 * Features:
 * - Dropdown to quickly select a saved mortar station
 * - Loads station position and config when selected
 * - Filters stations by current map
 * - Compact design for ConfigPanel integration
 */

import { useEffect, useMemo } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useStationsStore } from '../../stores/useStationsStore';
import { useAppStore } from '../../stores/useAppStore';

export function QuickStationSelect() {
  const stations = useStationsStore((state) => state.stations);
  const selectedStation = useStationsStore((state) => state.selectedStation);
  const isLoading = useStationsStore((state) => state.isLoading);
  const loadStations = useStationsStore((state) => state.loadStations);
  const selectStation = useStationsStore((state) => state.selectStation);
  const clearSelection = useStationsStore((state) => state.clearSelection);

  const selectedMap = useAppStore((state) => state.selectedMap);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setMortarConfig = useAppStore((state) => state.setMortarConfig);

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Filter stations by current map
  const filteredStations = useMemo(() => {
    return stations.filter((station) => station.mapId === selectedMap);
  }, [stations, selectedMap]);

  // When a station is selected, update mortar position and config
  useEffect(() => {
    if (selectedStation) {
      // Set mortar position from station
      setMortarPosition(selectedStation.position);

      // If station has a default config, apply it
      if (selectedStation.defaultConfig) {
        setMortarConfig(selectedStation.defaultConfig);
      }
    }
  }, [selectedStation, setMortarPosition, setMortarConfig]);

  // Handle selection change
  const handleSelectionChange = (stationId: string) => {
    if (stationId === '') {
      clearSelection();
    } else {
      selectStation(stationId);
    }
  };

  // If no stations for this map, don't render
  if (!isLoading && filteredStations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <MapPin className="w-4 h-4 text-accent-blue" />
        <span>Schnellauswahl Stellung</span>
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded border border-gray-700 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Lade Stellungen...</span>
        </div>
      ) : (
        <select
          value={selectedStation?.id || ''}
          onChange={(e) => handleSelectionChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-colors"
        >
          <option value="">Keine Stellung ausgewählt</option>
          {filteredStations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name} ({Math.round(station.position.east)}E,{' '}
              {Math.round(station.position.north)}N)
            </option>
          ))}
        </select>
      )}

      {selectedStation && (
        <div className="px-3 py-2 bg-accent-blue/10 border border-accent-blue/30 rounded">
          <div className="text-xs text-text-secondary font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span>Position:</span>
              <span className="text-accent-blue">
                {Math.round(selectedStation.position.east)}E,{' '}
                {Math.round(selectedStation.position.north)}N,{' '}
                {Math.round(selectedStation.position.height)}m
              </span>
            </div>
            {selectedStation.defaultConfig && (
              <div className="flex items-center justify-between">
                <span>Config:</span>
                <span className="text-accent-blue">
                  {selectedStation.defaultConfig.type === 'US'
                    ? 'M252 (USA)'
                    : 'M82 (RUS)'}
                  {' • '}
                  {selectedStation.defaultConfig.ammo}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
