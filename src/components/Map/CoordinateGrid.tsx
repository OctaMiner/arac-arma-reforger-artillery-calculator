/**
 * CoordinateGrid - Coordinate grid overlay for Arma Reforger maps
 *
 * Implementation based on Gene's map_viewer.html
 * https://github.com/GeNeFRAG/ArmaReforger/blob/main/maps_core/map_viewer.html
 *
 * Grid adapts to zoom level:
 * - Zoom < -1: 1000m (1km) grid
 * - Zoom < 0:  500m grid
 * - Zoom < 1:  200m grid
 * - Zoom < 2:  100m grid
 * - Zoom < 3:  50m grid
 * - Zoom < 4:  20m grid
 * - Zoom >= 4: 10m grid
 */

import { useEffect, useState, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps';

interface CoordinateGridProps {
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

/**
 * Calculate grid size based on zoom level (Gene's updateGridSizeForZoom)
 */
const getGridSizeForZoom = (zoom: number): number => {
  if (zoom < -1) return 1000; // 1km grid at very low zoom
  if (zoom < 0) return 500;
  if (zoom < 1) return 200;
  if (zoom < 2) return 100;
  if (zoom < 3) return 50;
  if (zoom < 4) return 20;
  return 10; // 10m grid at high zoom
};

const CoordinateGrid = ({
  color = '#ffffff',
  weight = 1,
  opacity = 0.3,
  dashArray = '5, 5',
}: CoordinateGridProps) => {
  const map = useMap();
  const selectedMap = useAppStore((state) => state.selectedMap);
  const mapConfig = getMapConfig(selectedMap as any);

  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const [gridSize, setGridSize] = useState(() =>
    getGridSizeForZoom(map.getZoom())
  );

  // Get map dimensions (Gene's approach: use map size directly)
  const [mapWidth, mapHeight] = mapConfig.size;

  // Update grid size on zoom change only
  useMapEvents({
    zoomend: () => {
      const newSize = getGridSizeForZoom(map.getZoom());
      if (newSize !== gridSize) {
        setGridSize(newSize);
      }
    },
  });

  // Draw grid when gridSize or map changes
  useEffect(() => {
    // Remove existing grid
    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
    }

    // Create new layer group for grid
    const gridLayer = L.layerGroup();
    gridLayerRef.current = gridLayer;

    // Gene's approach: Draw lines for entire map (0 to width/height)
    // Leaflet handles clipping/rendering optimization automatically

    // Vertical lines (East direction) - x from 0 to mapWidth
    for (let x = 0; x <= mapWidth; x += gridSize) {
      L.polyline(
        [
          [0, x], // [south, east]
          [mapHeight, x], // [north, east]
        ],
        {
          color,
          weight,
          opacity,
          dashArray,
          interactive: false,
        }
      ).addTo(gridLayer);
    }

    // Horizontal lines (North direction) - y from 0 to mapHeight
    for (let y = 0; y <= mapHeight; y += gridSize) {
      L.polyline(
        [
          [y, 0], // [north, west]
          [y, mapWidth], // [north, east]
        ],
        {
          color,
          weight,
          opacity,
          dashArray,
          interactive: false,
        }
      ).addTo(gridLayer);
    }

    // Add grid to map
    gridLayer.addTo(map);

    // Cleanup
    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
      }
    };
  }, [map, mapWidth, mapHeight, gridSize, color, weight, opacity, dashArray]);

  return null;
};

export default CoordinateGrid;
