/**
 * MortarMarker - Draggable marker for mortar position
 */

import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon, type DragEndEvent } from 'leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import {
  gameToLeaflet,
  leafletToGame,
  formatGridPosition,
} from '../../lib/coordinates/transform';

// Custom icon for mortar (blue circle with "M")
const mortarIcon = new DivIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #4a90e2;
      border: 3px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">M</div>
  `,
  className: 'mortar-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MortarMarker = () => {
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  if (!mortarPosition) return null;

  // Convert Arma game coordinates to Leaflet position
  // Using Gene's formula: lat = mapHeight - north
  const leafletPosition = gameToLeaflet(
    mortarPosition.east,
    mortarPosition.north,
    mapHeight
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { lat, lng } = e.target.getLatLng();

    // Convert back: Leaflet [lat, lng] → Arma [east, north]
    const gameCoords = leafletToGame(lat, lng, mapHeight);
    setMortarPosition({
      ...gameCoords,
      height: mortarPosition.height, // Keep existing height
    });

    // Note: Calculation is triggered automatically by useAutoCalculate hook
  };

  return (
    <Marker
      position={leafletPosition}
      icon={mortarIcon}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -16]}>
        <strong>Mörser</strong>
        <br />
        {formatGridPosition(mortarPosition)} | H: {mortarPosition.height}m
      </Tooltip>
    </Marker>
  );
};

export default MortarMarker;
