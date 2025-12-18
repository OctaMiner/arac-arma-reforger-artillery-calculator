/**
 * SpotterPositionInput Component
 * Input fields for spotter's GPS position (East, North, Height)
 * Uses Arma Reforger 3-digit grid format
 */

import { type ChangeEvent } from 'react'
import { useSpotterStore } from '../../stores/useSpotterStore'
import { formatGrid3 } from '../../lib/coordinates/transform'

/**
 * Convert 3-digit grid to meters
 * "811" → 8110m (81 * 100 + 1 * 10)
 */
function gridToMeters(grid: string): number {
  if (!grid || grid.length === 0) return 0
  const paddedGrid = grid.padStart(3, '0')
  const grid100m = parseInt(paddedGrid.slice(0, 2), 10) || 0
  const grid10m = parseInt(paddedGrid.slice(2, 3), 10) || 0
  return grid100m * 100 + grid10m * 10
}

export function SpotterPositionInput() {
  const spotterPosition = useSpotterStore((state) => state.spotterPosition)
  const setSpotterPosition = useSpotterStore((state) => state.setSpotterPosition)

  // Display value as 3-digit grid
  const eastGrid = spotterPosition ? formatGrid3(spotterPosition.east) : ''
  const northGrid = spotterPosition ? formatGrid3(spotterPosition.north) : ''

  const handleEastChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d{0,3}$/.test(value)) {
      const east = gridToMeters(value)
      setSpotterPosition({
        east,
        north: spotterPosition?.north ?? 0,
        height: spotterPosition?.height ?? 0
      })
    }
  }

  const handleNorthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d{0,3}$/.test(value)) {
      const north = gridToMeters(value)
      setSpotterPosition({
        east: spotterPosition?.east ?? 0,
        north,
        height: spotterPosition?.height ?? 0
      })
    }
  }

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^-?\d+$/.test(value)) {
      const height = value === '' ? 0 : parseInt(value, 10)
      setSpotterPosition({
        east: spotterPosition?.east ?? 0,
        north: spotterPosition?.north ?? 0,
        height: Math.min(9999, Math.max(-999, height))
      })
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-gray-300 text-xs uppercase font-semibold mb-2">
        Spotter Position (GPS)
      </label>

      {/* East & North */}
      <div className="grid grid-cols-2 gap-2">
        {/* East Input */}
        <div>
          <label className="block text-gray-500 text-[10px] uppercase mb-1">
            Ost (Grid)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={eastGrid}
            onChange={handleEastChange}
            placeholder="000"
            maxLength={3}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* North Input */}
        <div>
          <label className="block text-gray-500 text-[10px] uppercase mb-1">
            Nord (Grid)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={northGrid}
            onChange={handleNorthChange}
            placeholder="000"
            maxLength={3}
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="block text-gray-500 text-[10px] uppercase mb-1">
          Höhe (m)
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="-?[0-9]*"
          value={spotterPosition?.height ?? ''}
          onChange={handleHeightChange}
          placeholder="0"
          maxLength={4}
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
        />
      </div>
    </div>
  )
}
