/**
 * FlightTimeDisplay Component - Flight Time Display
 *
 * Features:
 * - Prominent time of flight in seconds
 * - Clock icon
 * - Military tactical styling
 * - Animated value changes
 */

import { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface FlightTimeDisplayProps {
  flightTime: number;
  className?: string;
}

export function FlightTimeDisplay({
  flightTime,
  className = '',
}: FlightTimeDisplayProps) {
  // Track previous value to detect changes
  const prevValueRef = useRef<number | null>(null);
  const valueElementRef = useRef<HTMLSpanElement>(null);
  // Format time with one decimal place
  const formatTime = (value: number) => {
    return value.toFixed(1);
  };

  // Trigger animation when value changes
  useEffect(() => {
    if (prevValueRef.current !== null && prevValueRef.current !== flightTime) {
      const element = valueElementRef.current;
      if (element) {
        element.classList.remove('animate-value-change');
        void element.offsetWidth;
        element.classList.add('animate-value-change');
      }
    }
    prevValueRef.current = flightTime;
  }, [flightTime]);

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
        <span
          ref={valueElementRef}
          className="text-4xl font-mono font-bold text-accent-yellow tabular-nums transition-all duration-300"
        >
          {formatTime(flightTime)}
        </span>
        <span className="text-xl text-text-secondary font-mono">s</span>
      </div>
    </div>
  );
}
