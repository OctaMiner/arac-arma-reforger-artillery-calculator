/**
 * DistanceDisplay Component - Distance to Target Display
 *
 * Features:
 * - Distance in meters
 * - Ruler icon
 * - Military tactical styling
 * - Animated value changes
 */

import { useEffect, useRef } from 'react';
import { Ruler } from 'lucide-react';

interface DistanceDisplayProps {
  distance: number;
  className?: string;
}

export function DistanceDisplay({
  distance,
  className = '',
}: DistanceDisplayProps) {
  // Track previous value to detect changes
  const prevValueRef = useRef<number | null>(null);
  const valueElementRef = useRef<HTMLSpanElement>(null);
  // Format distance as integer
  const formatDistance = (value: number) => {
    return Math.round(value).toString();
  };

  // Trigger animation when value changes
  useEffect(() => {
    if (prevValueRef.current !== null && prevValueRef.current !== distance) {
      const element = valueElementRef.current;
      if (element) {
        element.classList.remove('animate-value-change');
        void element.offsetWidth;
        element.classList.add('animate-value-change');
      }
    }
    prevValueRef.current = distance;
  }, [distance]);

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
        <span
          ref={valueElementRef}
          className="text-4xl font-mono font-bold text-text-primary tabular-nums transition-all duration-300"
        >
          {formatDistance(distance)}
        </span>
        <span className="text-xl text-text-secondary font-mono">m</span>
      </div>
    </div>
  );
}
