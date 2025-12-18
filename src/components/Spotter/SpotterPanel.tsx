/**
 * SpotterPanel Component
 * Main container for spotter mode functionality
 *
 * Features:
 * - Toggle spotter mode on/off
 * - Spotter position input (GPS)
 * - Vector 21 measurement input
 * - Target calculation from spotter data
 * - Fire correction panel
 */

import { useSpotterStore } from '../../stores/useSpotterStore'
import { SpotterToggle } from './SpotterToggle'
import { SpotterPositionInput } from './SpotterPositionInput'
import { VectorMeasurementInput } from './VectorMeasurementInput'
import { CalculateTargetButton } from './CalculateTargetButton'
import { CorrectionPanel } from './CorrectionPanel'

export function SpotterPanel() {
  const spotterMode = useSpotterStore((state) => state.spotterMode)

  return (
    <div
      className={`
        bg-gray-800/50 rounded-lg border transition-colors
        ${spotterMode ? 'border-yellow-600/50' : 'border-gray-700'}
      `}
    >
      {/* Header */}
      <div
        className={`
          px-4 py-3 border-b transition-colors
          ${spotterMode ? 'border-yellow-600/30' : 'border-gray-700'}
        `}
      >
        <div className="flex items-center gap-2 mb-3">
          <svg
            className={`w-5 h-5 transition-colors ${
              spotterMode ? 'text-yellow-400' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <h2 className="text-lg font-bold text-white">Spotter</h2>
        </div>

        {/* Toggle */}
        <SpotterToggle />
      </div>

      {/* Content - Only shown when active */}
      {spotterMode && (
        <div className="p-4 space-y-4">
          {/* Spotter Position */}
          <div className="pb-4 border-b border-gray-700">
            <SpotterPositionInput />
          </div>

          {/* Vector 21 Measurement */}
          <div className="pb-4 border-b border-gray-700">
            <VectorMeasurementInput />
          </div>

          {/* Calculate Target Button */}
          <div className="pb-4 border-b border-gray-700">
            <CalculateTargetButton />
          </div>

          {/* Fire Correction */}
          <CorrectionPanel />
        </div>
      )}

      {/* Collapsed State Info */}
      {!spotterMode && (
        <div className="px-4 py-3 text-xs text-gray-500 text-center">
          Aktiviere Spotter-Modus für Vector 21 Integration
        </div>
      )}
    </div>
  )
}
