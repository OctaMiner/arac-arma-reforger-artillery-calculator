/**
 * AzimuthDisplay Component - Large Azimuth Display
 *
 * Features:
 * - Large, prominent azimuth value in MIL
 * - Shows degrees as secondary info
 * - Wind correction indicator (if applicable)
 * - Copy-to-clipboard button
 * - Military tactical styling
 * - Animated value changes
 */

import { useEffect, useRef, useState } from 'react';
import { Compass, Copy, Check } from 'lucide-react';

interface AzimuthDisplayProps {
  azimuthMil: number;
  azimuthDeg?: number;
  azimuthWithWind?: number;
  windCorrection?: number;
  className?: string;
}

export function AzimuthDisplay({
  azimuthMil,
  azimuthDeg,
  azimuthWithWind,
  windCorrection,
  className = '',
}: AzimuthDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Track previous value to detect changes
  const prevValueRef = useRef<number | null>(null);
  const valueElementRef = useRef<HTMLSpanElement>(null);

  // Format azimuth with leading zeros (4 digits for MIL)
  const formatMil = (value: number) => {
    return Math.round(value).toString().padStart(4, '0');
  };

  // Format degrees with 1 decimal
  const formatDeg = (value: number) => {
    return value.toFixed(1);
  };

  // Determine which azimuth to show (with or without wind)
  const displayAzimuth =
    azimuthWithWind !== undefined ? azimuthWithWind : azimuthMil;
  const hasWindAdjustment =
    windCorrection !== undefined && Math.abs(windCorrection) > 0.1;

  // Copy to clipboard handler
  const handleCopy = async () => {
    const value = formatMil(displayAzimuth);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Trigger animation when value changes
  useEffect(() => {
    if (
      prevValueRef.current !== null &&
      prevValueRef.current !== displayAzimuth
    ) {
      // Value changed - trigger animation
      const element = valueElementRef.current;
      if (element) {
        // Remove animation class if it exists
        element.classList.remove('animate-value-change');
        // Trigger reflow to restart animation
        void element.offsetWidth;
        // Add animation class
        element.classList.add('animate-value-change');
      }
    }
    prevValueRef.current = displayAzimuth;
  }, [displayAzimuth]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label with Copy Button */}
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-5 h-5 text-accent-blue" />
        <span className="text-sm font-mono text-text-secondary uppercase tracking-wider">
          Azimuth
        </span>
        <button
          onClick={handleCopy}
          className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors text-text-secondary hover:text-accent-blue"
          title="Copy to clipboard"
          aria-label="Copy azimuth value"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <span
          ref={valueElementRef}
          className="text-6xl font-mono font-bold text-accent-blue tabular-nums transition-all duration-300"
        >
          {formatMil(displayAzimuth)}
        </span>
        <span className="text-2xl text-text-secondary font-mono">MIL</span>
      </div>

      {/* Copied Feedback */}
      {copied && (
        <div className="mt-1 text-xs text-green-500 font-medium">Copied!</div>
      )}

      {/* Degrees (secondary info) */}
      {azimuthDeg !== undefined && (
        <div className="mt-1 text-lg text-muted-foreground font-mono">
          {formatDeg(azimuthDeg)}°
        </div>
      )}

      {/* Wind Correction Indicator */}
      {hasWindAdjustment && windCorrection !== undefined && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/30 rounded">
          <span className="text-xs text-text-secondary font-mono">
            WIND ADJ:
          </span>
          <span
            className={`text-sm font-mono font-bold ${
              windCorrection > 0 ? 'text-accent-blue' : 'text-accent-yellow'
            }`}
          >
            {windCorrection > 0 ? '+' : ''}
            {windCorrection.toFixed(1)} MIL
          </span>
        </div>
      )}

      {/* Base Azimuth (if wind adjusted) */}
      {hasWindAdjustment && (
        <div className="mt-1 text-xs text-muted-foreground font-mono">
          Base: {formatMil(azimuthMil)} MIL
        </div>
      )}
    </div>
  );
}
