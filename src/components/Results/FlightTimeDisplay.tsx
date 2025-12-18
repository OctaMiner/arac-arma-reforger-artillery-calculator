/**
 * FlightTimeDisplay Component - Flight Time Display
 *
 * Features:
 * - Prominent time of flight in seconds
 * - Clock icon
 * - Military tactical styling
 */

import { Clock } from 'lucide-react'

interface FlightTimeDisplayProps {
  flightTime: number
  className?: string
}

export function FlightTimeDisplay({ flightTime, className = '' }: FlightTimeDisplayProps) {
  // Format time with one decimal place
  const formatTime = (value: number) => {
    return value.toFixed(1)
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-accent-yellow" />
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          Time of Flight
        </span>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-mono font-bold text-accent-yellow tabular-nums">
          {formatTime(flightTime)}
        </span>
        <span className="text-xl text-text-secondary font-mono">s</span>
      </div>
    </div>
  )
}
