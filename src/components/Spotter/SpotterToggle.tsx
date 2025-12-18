/**
 * SpotterToggle Component
 * Toggle switch to enable/disable Spotter Mode
 */

import { useSpotterStore } from '../../stores/useSpotterStore'

export function SpotterToggle() {
  const spotterMode = useSpotterStore((state) => state.spotterMode)
  const toggleSpotterMode = useSpotterStore((state) => state.toggleSpotterMode)

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white mb-1">
          Spotter-Modus
        </h3>
        <p className="text-xs text-gray-400">
          Zielberechnung mit Vector 21 Fernglas
        </p>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={toggleSpotterMode}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800
          ${spotterMode ? 'bg-yellow-600' : 'bg-gray-600'}
        `}
        role="switch"
        aria-checked={spotterMode}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${spotterMode ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
