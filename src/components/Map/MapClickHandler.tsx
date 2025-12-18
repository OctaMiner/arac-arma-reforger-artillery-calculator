/**
 * MapClickHandler - Handles map clicks to set mortar/target positions
 *
 * Click modes:
 * - Left click: Set mortar position (blue)
 * - Right click OR Shift+Click: Set target position (red)
 * - Ctrl+Click or Alt+Click: Set target position (red)
 */

import { useMapEvents } from 'react-leaflet';
import { useCallback } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import { leafletToGame } from '../../lib/coordinates/transform';

const MapClickHandler = () => {
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  // Simple setters - calculation is triggered automatically by useAutoCalculate hook
  const handleSetMortar = useCallback(
    (coordinate: { east: number; north: number; height: number }) => {
      setMortarPosition(coordinate);
    },
    [setMortarPosition]
  );

  const handleSetTarget = useCallback(
    (coordinate: { east: number; north: number; height: number }) => {
      setTargetPosition(coordinate);
    },
    [setTargetPosition]
  );

  useMapEvents({
    click: (e) => {
      // Ignore clicks on controls (zoom buttons, etc.)
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control')) {
        return;
      }

      const { lat, lng } = e.latlng;

      // Convert Leaflet [lat, lng] to Arma [east, north]
      // Direct mapping: lat=north, lng=east (CRS.Simple origin is bottom-left)
      const gameCoords = leafletToGame(lat, lng, mapHeight);
      const coordinate = {
        ...gameCoords,
        height: 0, // Default height, auto-filled by useAutoHeight
      };

      // Shift+Click, Ctrl+Click or Alt+Click = Set target (red)
      if (
        e.originalEvent.shiftKey ||
        e.originalEvent.ctrlKey ||
        e.originalEvent.altKey
      ) {
        handleSetTarget(coordinate);
      } else {
        // Normal click = Set mortar (blue)
        handleSetMortar(coordinate);
      }
    },

    contextmenu: (e) => {
      // Ignore right-clicks on controls
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control')) {
        return;
      }

      // Right click = Set target (red)
      e.originalEvent.preventDefault();
      const { lat, lng } = e.latlng;

      // Convert Leaflet [lat, lng] to Arma [east, north]
      const gameCoords = leafletToGame(lat, lng, mapHeight);
      const coordinate = {
        ...gameCoords,
        height: 0,
      };

      handleSetTarget(coordinate);
    },
  });

  return null;
};

export default MapClickHandler;
