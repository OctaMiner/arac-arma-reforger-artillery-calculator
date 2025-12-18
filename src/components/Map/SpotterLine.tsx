/**
 * SpotterLine - Line of sight from spotter to calculated target
 *
 * Shows:
 * - Dashed line from spotter position to target
 * - Different from FireLine (mortar to target)
 * - Only visible when spotter mode is active and target is calculated
 * - Yellow color to match spotter theme
 *
 * Displays distance label centered above the line
 */

import { Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useSpotterStore } from '../../stores/useSpotterStore';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import { gameToLeaflet } from '../../lib/coordinates/transform';

const SpotterLine = () => {
  const spotterMode = useSpotterStore((state) => state.spotterMode);
  const spotterPosition = useSpotterStore((state) => state.spotterPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  // Only show when spotter mode is active and both positions are set
  if (!spotterMode || !spotterPosition || !targetPosition) return null;

  // Calculate distance between spotter and target
  const deltaEast = targetPosition.east - spotterPosition.east;
  const deltaNorth = targetPosition.north - spotterPosition.north;
  const distance = Math.sqrt(deltaEast * deltaEast + deltaNorth * deltaNorth);

  // Calculate midpoint for distance label (in game coordinates)
  const midNorth = (spotterPosition.north + targetPosition.north) / 2;
  const midEast = (spotterPosition.east + targetPosition.east) / 2;

  // Calculate perpendicular offset to position label above the line
  const lineLength = Math.max(distance, 1);
  const perpX = (-deltaNorth / lineLength) * 50; // Offset 50m perpendicular
  const perpY = (deltaEast / lineLength) * 50;

  // Convert label position to Leaflet coordinates
  const labelPosition = gameToLeaflet(
    midEast + perpX,
    midNorth + perpY,
    mapHeight
  );

  // Convert positions to Leaflet coordinates
  const positions: [number, number][] = [
    gameToLeaflet(spotterPosition.east, spotterPosition.north, mapHeight),
    gameToLeaflet(targetPosition.east, targetPosition.north, mapHeight),
  ];

  // Create custom icon for distance label (yellow theme for spotter)
  const distanceIcon = L.divIcon({
    className: 'spotter-distance-label',
    html: `<div style="
      background: rgba(234, 179, 8, 0.9);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      font-family: monospace;
      white-space: nowrap;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    ">${Math.round(distance)}m</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10],
  });

  return (
    <>
      {/* Spotter sight line - dashed yellow line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#eab308', // Yellow-500
          weight: 2,
          dashArray: '5, 10', // Different dash pattern than FireLine
          opacity: 0.7,
        }}
      />
      {/* Distance label centered above the line */}
      <Marker
        position={labelPosition}
        icon={distanceIcon}
        interactive={false}
      />
    </>
  );
};

export default SpotterLine;
