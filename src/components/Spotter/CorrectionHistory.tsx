/**
 * CorrectionHistory Component
 * Displays history of applied corrections
 */

import { useSpotterStore } from '../../stores/useSpotterStore'

export function CorrectionHistory() {
  const corrections = useSpotterStore((state) => state.corrections)
  const removeLastCorrection = useSpotterStore(
    (state) => state.removeLastCorrection
  )
  const clearCorrections = useSpotterStore((state) => state.clearCorrections)

  if (corrections.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-xs">
        Noch keine Korrekturen
      </div>
    )
  }

  const formatCorrection = (value: number, type: 'lr' | 'ad'): string => {
    if (type === 'lr') {
      if (value === 0) return '0m'
      return value > 0 ? `R ${value}m` : `L ${Math.abs(value)}m`
    } else {
      if (value === 0) return '0m'
      return value > 0 ? `A ${value}m` : `D ${Math.abs(value)}m`
    }
  }

  return (
    <div className="space-y-2">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase">
          Korrektur-Historie
        </span>
        <button
          onClick={clearCorrections}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Alle löschen
        </button>
      </div>

      {/* Corrections List */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {corrections.map((correction, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-yellow-600/20 rounded text-xs"
          >
            <div className="flex items-center gap-3 font-mono">
              <span className="text-gray-500">#{index + 1}</span>
              <span className="text-white">
                {formatCorrection(correction.leftRight, 'lr')}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-white">
                {formatCorrection(correction.addDrop, 'ad')}
              </span>
            </div>
            {index === corrections.length - 1 && (
              <button
                onClick={removeLastCorrection}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Letzte rückgängig"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Total Correction Summary */}
      {corrections.length > 1 && (
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between px-3 py-2 bg-yellow-600/10 border border-yellow-600/30 rounded">
            <span className="text-xs font-semibold text-yellow-400">
              Gesamt:
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-white">
                {formatCorrection(
                  corrections.reduce((sum, c) => sum + c.leftRight, 0),
                  'lr'
                )}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-white">
                {formatCorrection(
                  corrections.reduce((sum, c) => sum + c.addDrop, 0),
                  'ad'
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
