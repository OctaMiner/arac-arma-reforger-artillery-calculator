/**
 * RangeCircle - Visualizes mortar range limits on map
 *
 * Shows:
 * - Outline circles for each charge/ring level (0-4) for HE ammo
 * - Min/Max range circles for Smoke/Illumination
 * - Filled zone only for the currently active ring (based on target distance)
 * - Red filled area for dead zone (minimum range)
 *
 * Works for all mortar types (US, RUS) and all ammo types (HE, Smoke, Illumination)
 */

import { Circle, Tooltip } from 'react-leaflet'
import { useAppStore } from '../../stores/useAppStore'
import { getMinimumRange, getMaximumRange, getAllRingRanges, findOptimalRingCount } from '../../lib/ballistics/range'
import { getMapConfig } from '../../lib/maps/configs'
import { gameToLeaflet } from '../../lib/coordinates/transform'

// Colors for each ring level (0-4) - distinct colors for easy recognition
const RING_COLORS = [
  '#22c55e', // Ring 0 - Green (closest)
  '#84cc16', // Ring 1 - Lime
  '#eab308', // Ring 2 - Yellow
  '#f97316', // Ring 3 - Orange
  '#ef4444', // Ring 4 - Red (farthest)
]

// Color for non-HE ammo (Smoke/Illumination)
const NON_HE_COLOR = '#3b82f6' // Blue

const RangeCircle = () => {
  const mortarPosition = useAppStore((state) => state.mortarPosition)
  const targetPosition = useAppStore((state) => state.targetPosition)
  const mortarConfig = useAppStore((state) => state.mortarConfig)
  const selectedMap = useAppStore((state) => state.selectedMap)

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any)
  const mapHeight = mapConfig?.size[1] ?? 12800

  // Don't render if no mortar position
  if (!mortarPosition) return null

  // Get range info for current mortar/ammo combination
  const ringRanges = getAllRingRanges(mortarConfig.type, mortarConfig.ammo)
  const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo)
  const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo)

  // Calculate distance to target
  let targetDistance = 0
  let targetInRange = false
  if (targetPosition && mortarPosition) {
    const dx = targetPosition.east - mortarPosition.east
    const dy = targetPosition.north - mortarPosition.north
    targetDistance = Math.sqrt(dx * dx + dy * dy)
    targetInRange = targetDistance >= minRange && targetDistance <= maxRange
  }

  // Convert Arma coordinates to Leaflet
  const center = gameToLeaflet(mortarPosition.east, mortarPosition.north, mapHeight)

  // For HE ammo: Show ring-based circles
  if (ringRanges.length > 0) {
    const optimalRing = targetDistance > 0
      ? findOptimalRingCount(targetDistance, mortarConfig.type, mortarConfig.ammo)
      : -1

    const activeRingInfo = optimalRing >= 0 ? ringRanges.find(r => r.ringCount === optimalRing) : null
    const activeColor = optimalRing >= 0 ? RING_COLORS[optimalRing] : '#3b82f6'

    return (
      <>
        {/* Filled zone for active ring only */}
        {activeRingInfo && (
          <Circle
            key={`ring-active-${activeRingInfo.ringCount}`}
            center={center}
            radius={activeRingInfo.maxRange}
            pathOptions={{
              color: activeColor,
              fillColor: activeColor,
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '10, 5'
            }}
          >
            <Tooltip>
              <strong style={{ color: activeColor }}>Ring {activeRingInfo.ringCount}</strong><br />
              {activeRingInfo.minRange}m - {activeRingInfo.maxRange}m<br />
              <span style={{ color: activeColor }}>&#10003; Aktiver Bereich</span>
            </Tooltip>
          </Circle>
        )}

        {/* Ring outline circles - just borders, no fill, no tooltips */}
        {/* Tooltips removed to avoid confusion - use CoordinateDisplay for ring info */}
        {/* Render from largest to smallest so smaller rings are on top */}
        {[...ringRanges].reverse().map((ringData, index) => {
          const ringNumber = ringData.ringCount
          const isActive = ringNumber === optimalRing
          const ringColor = RING_COLORS[ringNumber] || '#6b7280'

          // Skip the active ring outline (already drawn with fill above)
          if (isActive) return null

          return (
            <Circle
              key={`ring-outline-${ringNumber}-${index}`}
              center={center}
              radius={ringData.maxRange}
              pathOptions={{
                color: ringColor,
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: 2,
                opacity: 0.6,
                interactive: false // Disable hover/click to prevent tooltip conflicts
              }}
            />
          )
        })}

        {/* Minimum Range / Dead Zone */}
        {minRange > 0 && (
          <Circle
            center={center}
            radius={minRange}
            pathOptions={{
              color: '#991b1b',
              fillColor: '#7f1d1d',
              fillOpacity: 0.4,
              weight: 3,
              dashArray: '8, 4'
            }}
          >
            <Tooltip sticky>
              <strong style={{ color: '#ef4444' }}>&#9888; Totzone</strong><br />
              &lt; {minRange}m - Zu nah!
            </Tooltip>
          </Circle>
        )}
      </>
    )
  }

  // For Smoke/Illumination: Show min/max range circles
  return (
    <>
      {/* Max range circle - filled if target is in range */}
      <Circle
        center={center}
        radius={maxRange}
        pathOptions={{
          color: NON_HE_COLOR,
          fillColor: targetInRange ? NON_HE_COLOR : 'transparent',
          fillOpacity: targetInRange ? 0.15 : 0,
          weight: targetInRange ? 3 : 2,
          dashArray: targetInRange ? '10, 5' : undefined,
          opacity: targetInRange ? 1 : 0.6
        }}
      >
        <Tooltip sticky>
          <strong style={{ color: NON_HE_COLOR }}>
            {mortarConfig.ammo === 'Smoke' ? 'Rauch' : 'Leuchtgranate'}
          </strong><br />
          Max: {maxRange}m<br />
          {mortarConfig.type === 'US' ? 'US Mörser' : 'RUS Mörser'}
          {targetInRange && <><br /><span style={{ color: NON_HE_COLOR }}>&#10003; Ziel in Reichweite</span></>}
        </Tooltip>
      </Circle>

      {/* Minimum Range / Dead Zone */}
      {minRange > 0 && (
        <Circle
          center={center}
          radius={minRange}
          pathOptions={{
            color: '#991b1b',
            fillColor: '#7f1d1d',
            fillOpacity: 0.4,
            weight: 3,
            dashArray: '8, 4'
          }}
        >
          <Tooltip sticky>
            <strong style={{ color: '#ef4444' }}>&#9888; Totzone</strong><br />
            &lt; {minRange}m - Zu nah!
          </Tooltip>
        </Circle>
      )}
    </>
  )
}

export default RangeCircle
