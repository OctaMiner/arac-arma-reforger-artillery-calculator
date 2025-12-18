/**
 * FireLine - Dashed line between mortar and target
 *
 * Color indicates range status:
 * - Green: Target is within valid range (between min and max)
 * - Red: Target is out of range (too close or too far)
 *
 * Shows distance label centered above the line
 */

import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useAppStore } from '../../stores/useAppStore'
import { getMaximumRange, getMinimumRange } from '../../lib/ballistics/range'
import { getMapConfig } from '../../lib/maps/configs'
import { gameToLeaflet } from '../../lib/coordinates/transform'

const FireLine = () => {
  const mortarPosition = useAppStore((state) => state.mortarPosition)
  const targetPosition = useAppStore((state) => state.targetPosition)
  const mortarConfig = useAppStore((state) => state.mortarConfig)
  const selectedMap = useAppStore((state) => state.selectedMap)

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any)
  const mapHeight = mapConfig?.size[1] ?? 12800

  if (!mortarPosition || !targetPosition) return null

  // Calculate distance between mortar and target
  const deltaEast = targetPosition.east - mortarPosition.east
  const deltaNorth = targetPosition.north - mortarPosition.north
  const distance = Math.sqrt(deltaEast * deltaEast + deltaNorth * deltaNorth)

  // Get range limits for current mortar config
  const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo)
  const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo)

  // Determine if target is in valid range (between min and max)
  const isInRange = distance >= minRange && distance <= maxRange
  const lineColor = isInRange ? '#22c55e' : '#ef4444'

  // Calculate midpoint for distance label (in game coordinates)
  const midNorth = (mortarPosition.north + targetPosition.north) / 2
  const midEast = (mortarPosition.east + targetPosition.east) / 2

  // Calculate perpendicular offset to position label above the line
  const lineLength = Math.max(distance, 1)
  const perpX = -deltaNorth / lineLength * 50 // Offset 50m perpendicular
  const perpY = deltaEast / lineLength * 50

  // Convert label position to Leaflet coordinates
  const labelPosition = gameToLeaflet(midEast + perpX, midNorth + perpY, mapHeight)

  // Convert positions to Leaflet coordinates
  const positions: [number, number][] = [
    gameToLeaflet(mortarPosition.east, mortarPosition.north, mapHeight),
    gameToLeaflet(targetPosition.east, targetPosition.north, mapHeight)
  ]

  // Create custom icon for distance label
  const distanceIcon = L.divIcon({
    className: 'distance-label',
    html: `<div style="
      background: rgba(0, 0, 0, 0.75);
      color: ${lineColor};
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      font-family: monospace;
      white-space: nowrap;
      border: 1px solid ${lineColor};
    ">${Math.round(distance)}m</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10]
  })

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: lineColor,
          weight: 2,
          dashArray: '10, 10',
          opacity: 0.9
        }}
      />
      {/* Distance label centered above the line */}
      <Marker
        position={labelPosition}
        icon={distanceIcon}
        interactive={false}
      />
    </>
  )
}

export default FireLine
