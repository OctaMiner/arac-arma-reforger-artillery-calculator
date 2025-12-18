/**
 * AzimuthDisplay Component - Large Azimuth Display
 *
 * Features:
 * - Large, prominent azimuth value in MIL
 * - Optional degree display
 * - Wind correction indicator
 * - Military tactical styling
 */

import { Compass } from 'lucide-react'

interface AzimuthDisplayProps {
  azimuthMil: number
  azimuthDeg?: number
  azimuthWithWind?: number
  windCorrection?: number
  className?: string
}

export function AzimuthDisplay({
  azimuthMil,
  azimuthDeg,
  azimuthWithWind,
  windCorrection,
  className = ''
}: AzimuthDisplayProps) {
  // Format azimuth with leading zeros
  const formatMil = (value: number) => {
    return Math.round(value).toString().padStart(4, '0')
  }

  // Determine which azimuth to show (with or without wind)
  const displayAzimuth = azimuthWithWind !== undefined ? azimuthWithWind : azimuthMil
  const hasWindCorrection = windCorrection !== undefined && windCorrection !== 0

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-5 h-5 text-accent-blue" />
        <span className="text-sm font-mono text-text-secondary uppercase tracking-wider">
          Direction
        </span>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-6xl font-mono font-bold text-accent-blue tabular-nums">
          {formatMil(displayAzimuth)}
        </span>
        <span className="text-2xl text-text-secondary font-mono">MIL</span>
      </div>

      {/* Wind Correction Indicator */}
      {hasWindCorrection && windCorrection !== undefined && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/30 rounded">
          <span className="text-xs text-text-secondary font-mono">WIND:</span>
          <span className={`text-sm font-mono font-bold ${
            windCorrection > 0 ? 'text-accent-yellow' : 'text-accent-green'
          }`}>
            {windCorrection > 0 ? '+' : ''}{windCorrection.toFixed(1)} MIL
          </span>
        </div>
      )}

      {/* Optional Degree Display */}
      {azimuthDeg !== undefined && (
        <div className="mt-2 text-sm text-text-secondary font-mono">
          {azimuthDeg.toFixed(1)}°
        </div>
      )}
    </div>
  )
}
