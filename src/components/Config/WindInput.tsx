/**
 * WindInput Component
 * Allows user to configure wind conditions for ballistic corrections
 *
 * Features:
 * - Wind speed input (0-20 m/s)
 * - Wind direction input (0-360° or cardinal directions)
 * - Toggle to enable/disable wind
 * - Visual wind strength indicator
 * - Wind direction compass visualization
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Wind, Compass } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getWindStrength, getWindDirectionName } from '../../lib/ballistics'
import type { WindData } from '../../types'

const CARDINAL_DIRECTIONS = [
  { name: 'N', deg: 0 },
  { name: 'NE', deg: 45 },
  { name: 'E', deg: 90 },
  { name: 'SE', deg: 135 },
  { name: 'S', deg: 180 },
  { name: 'SW', deg: 225 },
  { name: 'W', deg: 270 },
  { name: 'NW', deg: 315 }
]

export function WindInput() {
  const { t } = useTranslation()
  const windData = useAppStore((state) => state.windData)
  const setWindData = useAppStore((state) => state.setWindData)

  const [enabled, setEnabled] = useState(false)
  const [speed, setSpeed] = useState(5)
  const [direction, setDirection] = useState(0)
  const [useCardinal, setUseCardinal] = useState(true)

  // Initialize from store
  useEffect(() => {
    if (windData) {
      setEnabled(true)
      setSpeed(windData.speed)
      setDirection(windData.direction)
    }
  }, [])

  // Update store when wind changes
  useEffect(() => {
    if (enabled) {
      const newWindData: WindData = { speed, direction }
      setWindData(newWindData)
    } else {
      setWindData(null)
    }
  }, [enabled, speed, direction, setWindData])

  // Note: Recalculation is now handled by useAutoCalculate hook in App.tsx

  const handleToggle = () => {
    setEnabled(!enabled)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 20) {
      setSpeed(value)
    }
  }

  const handleDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 360) {
      setDirection(value)
    }
  }

  const handleCardinalSelect = (deg: number) => {
    setDirection(deg)
  }

  const windStrength = getWindStrength(speed)
  const windDirName = getWindDirectionName(direction)

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-blue-400 uppercase tracking-wide">
            {t('wind.title')}
          </h2>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-600'
          }`}
          aria-label={t('wind.toggle')}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {!enabled && (
        <div className="text-sm text-gray-400">
          {t('wind.disabled')}
        </div>
      )}

      {enabled && (
        <div className="space-y-4">
          {/* Wind Speed Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              {t('wind.speed')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={speed}
                onChange={handleSpeedChange}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={speed}
                onChange={handleSpeedChange}
                className="w-20 bg-[#0f0f1e] border border-gray-600 rounded px-3 py-1.5 text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400 font-mono">m/s</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                speed < 3 ? 'text-green-400' :
                speed < 6 ? 'text-yellow-400' :
                speed < 10 ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {windStrength}
              </span>
              <span className="text-xs text-gray-500">
                ({(speed * 3.6).toFixed(1)} km/h)
              </span>
            </div>
          </div>

          {/* Direction Input Mode Toggle */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setUseCardinal(true)}
              className={`px-3 py-1 rounded ${
                useCardinal
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {t('wind.cardinal')}
            </button>
            <button
              onClick={() => setUseCardinal(false)}
              className={`px-3 py-1 rounded ${
                !useCardinal
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {t('wind.degrees')}
            </button>
          </div>

          {/* Wind Direction Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              {t('wind.direction')}
            </label>

            {useCardinal ? (
              // Cardinal Direction Selector
              <div className="grid grid-cols-4 gap-2">
                {CARDINAL_DIRECTIONS.map((dir) => (
                  <button
                    key={dir.name}
                    onClick={() => handleCardinalSelect(dir.deg)}
                    className={`px-3 py-2 rounded font-mono font-bold uppercase transition-all ${
                      direction === dir.deg
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    {dir.name}
                  </button>
                ))}
              </div>
            ) : (
              // Degree Input
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={direction}
                  onChange={handleDirectionChange}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  step="5"
                  value={direction}
                  onChange={handleDirectionChange}
                  className="w-20 bg-[#0f0f1e] border border-gray-600 rounded px-3 py-1.5 text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400 font-mono">°</span>
              </div>
            )}

            {/* Visual Direction Indicator */}
            <div className="mt-3 flex items-center gap-3">
              <Compass className="w-5 h-5 text-blue-400" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{t('wind.currentDirection')}:</span>
                <span className="font-mono text-lg font-bold text-blue-400">
                  {windDirName} ({direction}°)
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-lg">ℹ️</span>
              <div>
                <p className="text-blue-300 text-xs font-medium">
                  {t('wind.activeTitle')}
                </p>
                <p className="text-blue-200/70 text-xs mt-1">
                  {t('wind.activeDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
