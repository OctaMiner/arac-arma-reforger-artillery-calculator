/**
 * MapView - Main Leaflet map container for ARAC
 * Uses Simple CRS for Arma Reforger coordinates (meters)
 * Maps loaded from Gene's CDN - no local files needed
 */

import { useEffect, useRef } from 'react'
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '../../stores/useAppStore'
import { getMapConfig } from '../../lib/maps'
import MortarMarker from './MortarMarker'
import TargetMarker from './TargetMarker'
import FireLine from './FireLine'
import RangeCircle from './RangeCircle'
import CoordinateDisplay from './CoordinateDisplay'
import MapClickHandler from './MapClickHandler'
import CoordinateGrid from './CoordinateGrid'
import MapControls from './MapControls'

// Custom CRS for Arma Reforger (game coordinates in meters)
const ArmaCRS = L.CRS.Simple

/**
 * MapUpdater - Handles initial map view setup and zoom behavior
 * Zooms centered on mortar position when using +/- buttons
 * Updates map view when map changes
 */
const MapUpdater = ({ mapId }: { mapId: string }) => {
  const map = useMap()
  const initialized = useRef(false)
  const currentMapId = useRef(mapId)
  const mortarPosition = useAppStore((state) => state.mortarPosition)

  // Handle map changes - refit bounds when map changes
  useEffect(() => {
    const config = getMapConfig(mapId as any)
    const bounds = L.latLngBounds(config.bounds)

    // If map changed, refit bounds
    if (currentMapId.current !== mapId) {
      map.fitBounds(bounds, { animate: true, padding: [20, 20] })
      currentMapId.current = mapId
    }
    // Initial fit to bounds - only once on first load
    else if (!initialized.current) {
      map.fitBounds(bounds, { animate: false, padding: [20, 20] })
      initialized.current = true
    }
  }, [map, mapId])

  // Override zoom control behavior to zoom on mortar position
  useEffect(() => {
    if (!mortarPosition) return

    const mortarLatLng = L.latLng(mortarPosition.north, mortarPosition.east)

    const handleZoomIn = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const currentZoom = map.getZoom()
      const maxZoom = map.getMaxZoom()
      if (currentZoom < maxZoom) {
        map.setView(mortarLatLng, currentZoom + 0.5, { animate: true })
      }
    }

    const handleZoomOut = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const currentZoom = map.getZoom()
      const minZoom = map.getMinZoom()
      if (currentZoom > minZoom) {
        map.setView(mortarLatLng, currentZoom - 0.5, { animate: true })
      }
    }

    // Find zoom control buttons and override their behavior
    const container = map.getContainer()
    const zoomInBtn = container.querySelector('.leaflet-control-zoom-in')
    const zoomOutBtn = container.querySelector('.leaflet-control-zoom-out')

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', handleZoomIn, true)
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', handleZoomOut, true)
    }

    return () => {
      if (zoomInBtn) {
        zoomInBtn.removeEventListener('click', handleZoomIn, true)
      }
      if (zoomOutBtn) {
        zoomOutBtn.removeEventListener('click', handleZoomOut, true)
      }
    }
  }, [map, mortarPosition])

  return null
}

const MapView = () => {
  const selectedMap = useAppStore((state) => state.selectedMap)
  const showGrid = useAppStore((state) => state.showGrid)
  const mapConfig = getMapConfig(selectedMap as any)

  return (
    <div className="map-container relative">
      {/* Map Controls Overlay */}
      <MapControls />

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
          url={mapConfig.imageUrl}
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
        <MortarMarker />
        <TargetMarker />
        <FireLine />

        {/* Coordinate display */}
        <CoordinateDisplay />
      </MapContainer>
    </div>
  )
}

export default MapView
