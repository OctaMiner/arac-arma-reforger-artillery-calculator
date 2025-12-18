/**
 * CorrectionPanel Component
 * Container for fire correction inputs and history
 */

import { useSpotterStore } from '../../stores/useSpotterStore'
import { useAppStore } from '../../stores/useAppStore'
import { applyCorrection } from '../../lib/spotter'
import { CorrectionInput } from './CorrectionInput'
import { CorrectionHistory } from './CorrectionHistory'
import type { CorrectionData } from '../../types'

export function CorrectionPanel() {
  const targetPosition = useAppStore((state) => state.targetPosition)
  const fireSolution = useAppStore((state) => state.fireSolution)
  const setTargetPosition = useAppStore((state) => state.setTargetPosition)
  const calculateSolution = useAppStore((state) => state.calculateSolution)
  const addCorrection = useSpotterStore((state) => state.applyCorrection)

  const handleApplyCorrection = (correction: CorrectionData) => {
    if (!targetPosition || !fireSolution) return

    // Calculate distance for correction input
    const mortarPosition = useAppStore.getState().mortarPosition
    if (!mortarPosition) return

    const deltaEast = (targetPosition.east - mortarPosition.east) * 10
    const deltaNorth = (targetPosition.north - mortarPosition.north) * 10
    const distance = Math.sqrt(deltaEast * deltaEast + deltaNorth * deltaNorth)

    // Apply correction to current target
    const correctedTarget = applyCorrection(targetPosition, {
      leftRight: correction.leftRight,
      addDrop: correction.addDrop,
      currentAzimuth: fireSolution.azimuthDeg,
      currentDistance: distance
    })

    // Update target position
    setTargetPosition(correctedTarget)

    // Add to correction history
    addCorrection(correction)

    // Recalculate fire solution
    calculateSolution()
  }

  const isDisabled = !targetPosition || !fireSolution

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <h3 className="text-sm font-bold text-white">Feuerkorrektur</h3>
      </div>

      {/* Info Text */}
      {isDisabled && (
        <div className="text-xs text-gray-500 leading-relaxed">
          Berechne zuerst ein Ziel, um Korrekturen anzuwenden
        </div>
      )}

      {/* Correction Input */}
      <CorrectionInput onApply={handleApplyCorrection} disabled={isDisabled} />

      {/* Correction History */}
      <CorrectionHistory />

      {/* Help Text */}
      <div className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-700 pt-3">
        <p className="font-semibold text-gray-400 mb-1">
          Vector 21 Korrektur-Modus:
        </p>
        <p>1. V-Taste auf Ziel halten</p>
        <p>2. C-Taste drücken</p>
        <p>3. Auf Einschlag zielen</p>
        <p>4. V-Taste loslassen</p>
        <p className="mt-1">Ausgabe: r./l. XX, A./D. XX</p>
      </div>
    </div>
  )
}
