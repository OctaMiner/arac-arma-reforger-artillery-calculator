/**
 * MapView - Main Leaflet map container for ARAC
 * Uses Simple CRS for Arma Reforger coordinates (meters)
 * Maps loaded from Gene's CDN - no local files needed
 *
 * Performance optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Preloads map images with smooth progress
 * - Uses throttled marker updates (60fps)
 */

import { useEffect, useRef, useState, memo, useMemo } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps';
import MortarMarker from './MortarMarker';
import TargetMarker from './TargetMarker';
import SpotterMarker from './SpotterMarker';
import StationMarkers from './StationMarkers';
import FireLine from './FireLine';
import SpotterLine from './SpotterLine';
import RangeCircle from './RangeCircle';
import CoordinateDisplay from './CoordinateDisplay';
import MapClickHandler from './MapClickHandler';
import CoordinateGrid from './CoordinateGrid';
import MapControls from './MapControls';
import { MapLoadingOverlay } from './MapLoadingOverlay';

// Custom CRS for Arma Reforger (game coordinates in meters)
const ArmaCRS = L.CRS.Simple;

/**
 * Custom hook to preload map image with smooth progress animation
 * Uses easing function for natural feel - faster at start, slower near end
 */
function useMapImageLoader(imageUrl: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const animationFrame = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    // Reset state when URL changes
    setIsLoading(true);
    setProgress(0);
    setLoadedUrl(null);

    // Target time to reach 85% (in ms) - gives realistic feel
    const targetTime = 2500;
    startTime.current = Date.now();
    let imageLoaded = false;

    // Animate progress with easing
    const animateProgress = () => {
      const elapsed = Date.now() - startTime.current;

      if (!imageLoaded) {
        // Ease-out function: fast start, slow end
        // Progress goes from 0 to 85% over targetTime
        const t = Math.min(elapsed / targetTime, 1);
        const eased = 1 - Math.pow(1 - t, 3); // Cubic ease-out
        const newProgress = eased * 85;

        setProgress(newProgress);
        animationFrame.current = requestAnimationFrame(animateProgress);
      }
    };

    animationFrame.current = requestAnimationFrame(animateProgress);

    // Load image using Image API
    const img = new Image();

    img.onload = () => {
      imageLoaded = true;

      // Cancel animation
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      // Animate from current to 100%
      const currentProgress = progress;
      const remaining = 100 - currentProgress;
      const steps = 10;
      let step = 0;

      const finishAnimation = () => {
        step++;
        const newProgress = currentProgress + (remaining * (step / steps));
        setProgress(Math.min(newProgress, 100));

        if (step < steps) {
          setTimeout(finishAnimation, 30);
        } else {
          // Show map after reaching 100%
          setTimeout(() => {
            setLoadedUrl(imageUrl);
            setIsLoading(false);
          }, 200);
        }
      };

      finishAnimation();
    };

    img.onerror = () => {
      console.error('Failed to load map image');
      imageLoaded = true;
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      // Still show the map even if preload failed
      setLoadedUrl(imageUrl);
      setIsLoading(false);
    };

    img.src = imageUrl;

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { isLoading, progress, loadedUrl };
}

/**
 * MapUpdater - Handles initial map view setup and zoom behavior
 * Zooms centered on mortar position when using +/- buttons
 * Updates map view when map changes
 */
const MapUpdater = ({ mapId }: { mapId: string }) => {
  const map = useMap();
  const initialized = useRef(false);
  const currentMapId = useRef(mapId);
  const mortarPosition = useAppStore((state) => state.mortarPosition);

  // Handle map changes - refit bounds when map changes
  useEffect(() => {
    const config = getMapConfig(mapId as any);
    const bounds = L.latLngBounds(config.bounds);

    // If map changed, refit bounds
    if (currentMapId.current !== mapId) {
      map.fitBounds(bounds, { animate: true, padding: [20, 20] });
      currentMapId.current = mapId;
    }
    // Initial fit to bounds - only once on first load
    else if (!initialized.current) {
      map.fitBounds(bounds, { animate: false, padding: [20, 20] });
      initialized.current = true;
    }
  }, [map, mapId]);

  // Override zoom control behavior to zoom on mortar position
  useEffect(() => {
    if (!mortarPosition) return;

    const mortarLatLng = L.latLng(mortarPosition.north, mortarPosition.east);

    const handleZoomIn = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const currentZoom = map.getZoom();
      const maxZoom = map.getMaxZoom();
      if (currentZoom < maxZoom) {
        map.setView(mortarLatLng, currentZoom + 0.5, { animate: true });
      }
    };

    const handleZoomOut = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const currentZoom = map.getZoom();
      const minZoom = map.getMinZoom();
      if (currentZoom > minZoom) {
        map.setView(mortarLatLng, currentZoom - 0.5, { animate: true });
      }
    };

    // Find zoom control buttons and override their behavior
    const container = map.getContainer();
    const zoomInBtn = container.querySelector('.leaflet-control-zoom-in');
    const zoomOutBtn = container.querySelector('.leaflet-control-zoom-out');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', handleZoomIn, true);
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', handleZoomOut, true);
    }

    return () => {
      if (zoomInBtn) {
        zoomInBtn.removeEventListener('click', handleZoomIn, true);
      }
      if (zoomOutBtn) {
        zoomOutBtn.removeEventListener('click', handleZoomOut, true);
      }
    };
  }, [map, mortarPosition]);

  return null;
};

const MapView = memo(() => {
  const selectedMap = useAppStore((state) => state.selectedMap);
  const showGrid = useAppStore((state) => state.showGrid);

  // Memoize map config to prevent recalculation
  const mapConfig = useMemo(() => getMapConfig(selectedMap as any), [selectedMap]);

  // Preload map image with progress tracking
  const { isLoading, progress, loadedUrl } = useMapImageLoader(mapConfig.imageUrl);

  return (
    <div className="map-container relative">
      {/* Map Controls Overlay - only show when map is loaded */}
      {!isLoading && <MapControls />}

      {/* Loading Overlay with Progress Bar */}
      <MapLoadingOverlay
        isLoading={isLoading}
        progress={progress}
        mapName={mapConfig.name}
      />

      {/* Only render map when image is loaded */}
      {loadedUrl && (
        <MapContainer
          key={selectedMap} // Force remount on map change for clean state
          crs={ArmaCRS}
          center={mapConfig.center}
          zoom={mapConfig.defaultZoom}
          minZoom={-3} // Allow zooming out to see full map
          maxZoom={mapConfig.maxZoom}
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
          zoomControl={true}
          zoomSnap={0.25}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={60}
          dragging={true}
          scrollWheelZoom={true}
        >
          {/* Map Image Overlay - CDN image for entire map */}
          <ImageOverlay
            url={loadedUrl}
            bounds={mapConfig.bounds}
            opacity={1}
          />

          {/* Coordinate Grid (Gene's implementation) - Toggleable */}
          {showGrid && (
            <CoordinateGrid
              color="#ffffff"
              weight={1}
              opacity={0.3}
              dashArray="5, 5"
            />
          )}

          {/* Map updater component */}
          <MapUpdater mapId={selectedMap} />

          {/* Map interaction handlers */}
          <MapClickHandler />

          {/* Range circles */}
          <RangeCircle />

          {/* Markers and overlays */}
          <StationMarkers />
          <MortarMarker />
          <TargetMarker />
          <SpotterMarker />
          <FireLine />
          <SpotterLine />

          {/* Coordinate display */}
          <CoordinateDisplay />
        </MapContainer>
      )}
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;
