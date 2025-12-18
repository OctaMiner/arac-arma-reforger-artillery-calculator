/**
 * DistanceDisplay Component - Distance to Target Display
 *
 * Features:
 * - Distance in meters
 * - Ruler icon
 * - Military tactical styling
 */

import { Ruler } from 'lucide-react'

interface DistanceDisplayProps {
  distance: number
  className?: string
}

export function DistanceDisplay({ distance, className = '' }: DistanceDisplayProps) {
  // Format distance as integer
  const formatDistance = (value: number) => {
    return Math.round(value).toString()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Ruler className="w-4 h-4 text-text-primary" />
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          Distance
        </span>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-mono font-bold text-text-primary tabular-nums">
          {formatDistance(distance)}
        </span>
        <span className="text-xl text-text-secondary font-mono">m</span>
      </div>
    </div>
  )
}
