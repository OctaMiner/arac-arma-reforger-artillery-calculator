/**
 * CalculateTargetButton Component
 * Calculates target position from spotter measurements
 */

import { useSpotterStore } from '../../stores/useSpotterStore'
import { useAppStore } from '../../stores/useAppStore'
import { calculateTargetFromSpotter } from '../../lib/spotter'

export function CalculateTargetButton() {
  const spotterPosition = useSpotterStore((state) => state.spotterPosition)
  const measurements = useSpotterStore((state) => state.spotterMeasurements)
  const setTargetPosition = useAppStore((state) => state.setTargetPosition)
  const calculateSolution = useAppStore((state) => state.calculateSolution)

  const isDisabled = !spotterPosition || !measurements

  const handleCalculate = () => {
    if (!spotterPosition || !measurements) return

    // Calculate target position from spotter data
    const target = calculateTargetFromSpotter({
      spotterPosition,
      distance: measurements.distance,
      azimuth: measurements.azimuth
    })

    // Set as target position and calculate fire solution
    setTargetPosition(target)
    calculateSolution()
  }

  return (
    <button
      onClick={handleCalculate}
      disabled={isDisabled}
      className={`
        w-full px-4 py-2.5 rounded font-semibold text-sm transition-colors
        flex items-center justify-center gap-2
        ${
          isDisabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800'
        }
      `}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      Ziel berechnen
    </button>
  )
}
