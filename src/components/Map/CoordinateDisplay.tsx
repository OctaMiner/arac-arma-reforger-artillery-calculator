/**
 * CoordinateDisplay - Shows current mouse position in Arma coordinates
 * Displays both precise meters and 3-digit grid coordinates (Arma Reforger style)
 * Also shows which ring the mouse position falls into relative to mortar
 */

import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import {
  leafletToGame,
  formatGridIngame,
} from '../../lib/coordinates/transform';
import {
  findOptimalRingCount,
  getMinimumRange,
  getMaximumRange,
} from '../../lib/ballistics/range';

// Colors for each ring level (matching RangeCircle)
const RING_COLORS = [
  '#22c55e', // Ring 0 - Green
  '#84cc16', // Ring 1 - Lime
  '#eab308', // Ring 2 - Yellow
  '#f97316', // Ring 3 - Orange
  '#ef4444', // Ring 4 - Red
];

const CoordinateDisplay = () => {
  const [coords, setCoords] = useState<{ east: number; north: number } | null>(
    null
  );
  const selectedMap = useAppStore((state) => state.selectedMap);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  useMapEvents({
    mousemove: (e) => {
      const { lat, lng } = e.latlng;
      // Convert Leaflet coordinates to Arma game coordinates
      const gameCoords = leafletToGame(lat, lng, mapHeight);
      setCoords(gameCoords);
    },
    mouseout: () => {
      setCoords(null);
    },
  });

  if (!coords) return null;

  // Grid format: 000,0 / 000,0 (Ingame style with decimal precision)
  const gridE = formatGridIngame(coords.east);
  const gridN = formatGridIngame(coords.north);

  // Exact meters (rounded to 1m)
  const meterE = Math.round(coords.east);
  const meterN = Math.round(coords.north);

  // Calculate distance to mortar and determine ring
  let distanceToMortar: number | null = null;
  let currentRing: number | null = null;
  let ringColor = '#6b7280';
  let rangeStatus = '';

  if (mortarPosition) {
    const dx = coords.east - mortarPosition.east;
    const dy = coords.north - mortarPosition.north;
    distanceToMortar = Math.round(Math.sqrt(dx * dx + dy * dy));

    const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo);
    const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo);

    if (distanceToMortar < minRange) {
      rangeStatus = 'TOTZONE';
      ringColor = '#991b1b';
    } else if (distanceToMortar > maxRange) {
      rangeStatus = 'AUSSER REICHWEITE';
      ringColor = '#6b7280';
    } else {
      currentRing = findOptimalRingCount(
        distanceToMortar,
        mortarConfig.type,
        mortarConfig.ammo
      );
      if (currentRing >= 0 && currentRing <= 4) {
        ringColor = RING_COLORS[currentRing];
        rangeStatus = `Ring ${currentRing}`;
      }
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
        border: '1px solid rgba(100, 100, 100, 0.5)',
        lineHeight: '1.6',
        minWidth: '180px',
      }}
    >
      {/* Grid Reference (Ingame style with decimal) */}
      <div style={{ color: '#86efac', fontWeight: 600, marginBottom: '4px' }}>
        {gridE} / {gridN}
      </div>

      {/* Exact Meters */}
      <div style={{ color: '#9ca3af', fontSize: '12px' }}>
        <span style={{ color: '#93c5fd' }}>E:</span>{' '}
        {meterE.toString().padStart(5, ' ')}m
        <span style={{ margin: '0 8px' }}>|</span>
        <span style={{ color: '#fca5a5' }}>N:</span>{' '}
        {meterN.toString().padStart(5, ' ')}m
      </div>

      {/* Distance and Ring info (only if mortar is set) */}
      {mortarPosition && distanceToMortar !== null && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(100, 100, 100, 0.5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>
            {distanceToMortar}m
          </span>
          <span
            style={{
              color: ringColor,
              fontWeight: 600,
              fontSize: '12px',
              padding: '2px 8px',
              background: `${ringColor}20`,
              borderRadius: '4px',
              border: `1px solid ${ringColor}50`,
            }}
          >
            {rangeStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export default CoordinateDisplay;
