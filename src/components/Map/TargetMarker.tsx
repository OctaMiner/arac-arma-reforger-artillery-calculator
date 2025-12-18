/**
 * TargetMarker - Draggable marker for target position
 * Optimized with throttled drag updates (60fps) for smooth performance
 */

import { memo, useCallback, useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon, type DragEndEvent } from 'leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import {
  gameToLeaflet,
  leafletToGame,
  formatGridPosition,
} from '../../lib/coordinates/transform';
import { useThrottledCallback } from '../../hooks/useThrottledCallback';

// Custom icon for target (red crosshair)
const targetIcon = new DivIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #e94560;
      border: 3px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 20px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">✕</div>
  `,
  className: 'target-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const TargetMarker = memo(() => {
  const targetPosition = useAppStore((state) => state.targetPosition);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation - memoized
  const mapConfig = useMemo(() => getMapConfig(selectedMap as any), [selectedMap]);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  // Throttled position update - max 60fps (16ms)
  // This prevents calculation spam during drag
  const throttledSetPosition = useThrottledCallback(
    (lat: number, lng: number) => {
      const gameCoords = leafletToGame(lat, lng, mapHeight);
      setTargetPosition({
        ...gameCoords,
        height: targetPosition?.height ?? 0,
      });
    },
    16 // 60fps
  );

  // Memoized drag handler
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng();
      throttledSetPosition(lat, lng);
      // Note: Calculation is triggered automatically by useAutoCalculate hook
    },
    [throttledSetPosition]
  );

  if (!targetPosition) return null;

  // Convert Arma game coordinates to Leaflet position
  // Using Gene's formula: lat = mapHeight - north
  const leafletPosition = gameToLeaflet(
    targetPosition.east,
    targetPosition.north,
    mapHeight
  );

  return (
    <Marker
      position={leafletPosition}
      icon={targetIcon}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Tooltip permanent direction="bottom" offset={[0, 16]}>
        <strong>Ziel</strong>
        <br />
        {formatGridPosition(targetPosition)} | H: {targetPosition.height}m
      </Tooltip>
    </Marker>
  );
});

TargetMarker.displayName = 'TargetMarker';

export default TargetMarker;
