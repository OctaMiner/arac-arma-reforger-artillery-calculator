/**
 * StationMarkers - Shows saved mortar stations on the map
 * Different icon from MortarMarker to distinguish saved positions
 */

import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { useStationsStore } from '../../stores/useStationsStore';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import {
  gameToLeaflet,
  formatGridPosition,
} from '../../lib/coordinates/transform';

// Custom icon for stations (green circle with "S")
// Different color from mortar (blue) to visually distinguish
const stationIcon = new DivIcon({
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #16a34a;
      border: 2px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.2s;
    ">S</div>
  `,
  className: 'station-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Highlighted icon for selected station
const stationIconSelected = new DivIcon({
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #16a34a;
      border: 3px solid #fbbf24;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: white;
      box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
      cursor: pointer;
      transform: scale(1.1);
    ">S</div>
  `,
  className: 'station-marker-selected',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const StationMarkers = () => {
  const selectedMap = useAppStore((state) => state.selectedMap);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setMortarConfig = useAppStore((state) => state.setMortarConfig);

  // Get all stations and filter by map
  const allStations = useStationsStore((state) => state.stations);
  const selectedStation = useStationsStore((state) => state.selectedStation);
  const selectStation = useStationsStore((state) => state.selectStation);

  // Filter stations for current map (memoized)
  const stations = useMemo(
    () => allStations.filter((s) => s.mapId === selectedMap),
    [allStations, selectedMap]
  );

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  if (stations.length === 0) return null;

  // Handle click on station marker
  const handleStationClick = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    if (!station) return;

    // Set as selected station
    selectStation(stationId);

    // Set mortar position to station position
    setMortarPosition(station.position);

    // If station has default config, apply it
    if (station.defaultConfig) {
      setMortarConfig(station.defaultConfig);
    }
  };

  return (
    <>
      {stations.map((station) => {
        const leafletPosition = gameToLeaflet(
          station.position.east,
          station.position.north,
          mapHeight
        );

        const isSelected = selectedStation?.id === station.id;

        return (
          <Marker
            key={station.id}
            position={leafletPosition}
            icon={isSelected ? stationIconSelected : stationIcon}
            eventHandlers={{
              click: () => handleStationClick(station.id),
            }}
          >
            <Tooltip direction="right" offset={[12, 0]}>
              <strong>{station.name}</strong>
              <br />
              {formatGridPosition(station.position)} | H: {station.position.height}m
              {station.defaultConfig && (
                <>
                  <br />
                  <span style={{ fontSize: '11px', color: '#a0a0a0' }}>
                    {station.defaultConfig.type} | {station.defaultConfig.ammo}
                  </span>
                </>
              )}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

export default StationMarkers;
