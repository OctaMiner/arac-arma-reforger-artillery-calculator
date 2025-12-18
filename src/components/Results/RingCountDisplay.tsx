/**
 * RingCountDisplay Component - Charge/Ring Count Display
 *
 * Features:
 * - Current ring count
 * - Recommended charge indicator
 * - Manual vs Auto mode indicator
 * - Military tactical styling
 */

import { Circle } from 'lucide-react'
import type { RingCount } from '../../types'

interface RingCountDisplayProps {
  ringCount: RingCount
  recommendedCharge?: RingCount
  isManualMode?: boolean
  className?: string
}

export function RingCountDisplay({
  ringCount,
  recommendedCharge,
  isManualMode = false,
  className = ''
}: RingCountDisplayProps) {
  // Determine if current charge is optimal
  const isOptimal = recommendedCharge === undefined || ringCount === recommendedCharge

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Circle className={`w-4 h-4 ${isOptimal ? 'text-accent-blue' : 'text-accent-yellow'}`} />
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          Charge
        </span>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-mono font-bold tabular-nums ${
          isOptimal ? 'text-accent-blue' : 'text-accent-yellow'
        }`}>
          {ringCount}
        </span>
        <span className="text-xl text-text-secondary font-mono">RNG</span>
      </div>

      {/* Mode Indicator & Recommendation */}
      <div className="mt-2 flex flex-col items-center gap-1">
        {/* Mode Badge */}
        <div className={`px-2 py-0.5 rounded text-xs font-mono ${
          isManualMode
            ? 'bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow'
            : 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
        }`}>
          {isManualMode ? 'MANUAL' : 'AUTO'}
        </div>

        {/* Recommendation if not optimal */}
        {!isOptimal && recommendedCharge !== undefined && (
          <div className="text-xs text-text-secondary font-mono mt-1">
            Recommended: <span className="text-accent-blue font-bold">{recommendedCharge}</span>
          </div>
        )}
      </div>
    </div>
  )
}
