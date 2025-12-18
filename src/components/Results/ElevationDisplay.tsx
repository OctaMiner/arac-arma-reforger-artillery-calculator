/**
 * ElevationDisplay Component - Large Elevation Display
 *
 * Features:
 * - Large, prominent elevation value in MIL
 * - Shows adjusted elevation (with height correction)
 * - Delta elevation indicator
 * - Wind correction indicator (if applicable)
 * - Copy-to-clipboard button
 * - Military tactical styling
 * - Animated value changes
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Copy, Check } from 'lucide-react';

interface ElevationDisplayProps {
  elevationAdj: number;
  elevationBase?: number;
  deltaElev?: number;
  elevationWithWind?: number;
  className?: string;
}

export function ElevationDisplay({
  elevationAdj,
  elevationBase,
  deltaElev,
  elevationWithWind,
  className = '',
}: ElevationDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Track previous value to detect changes
  const prevValueRef = useRef<number | null>(null);
  const valueElementRef = useRef<HTMLSpanElement>(null);

  // Format elevation with leading zeros
  const formatMil = (value: number) => {
    return Math.round(value).toString().padStart(4, '0');
  };

  // Determine which elevation to show (with or without wind)
  const displayElevation =
    elevationWithWind !== undefined ? elevationWithWind : elevationAdj;
  const hasHeightCorrection =
    deltaElev !== undefined && Math.abs(deltaElev) > 0.1;
  const hasWindAdjustment =
    elevationWithWind !== undefined &&
    Math.abs(elevationWithWind - elevationAdj) > 0.1;

  // Copy to clipboard handler
  const handleCopy = async () => {
    const value = formatMil(displayElevation);
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
      prevValueRef.current !== displayElevation
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
    prevValueRef.current = displayElevation;
  }, [displayElevation]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Label with Copy Button */}
      <div className="flex items-center gap-2 mb-2">
        <ArrowUp className="w-5 h-5 text-accent-green" />
        <span className="text-sm font-mono text-text-secondary uppercase tracking-wider">
          Elevation
        </span>
        <button
          onClick={handleCopy}
          className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors text-text-secondary hover:text-accent-green"
          title="Copy to clipboard"
          aria-label="Copy elevation value"
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
          className="text-6xl font-mono font-bold text-accent-green tabular-nums transition-all duration-300"
        >
          {formatMil(displayElevation)}
        </span>
        <span className="text-2xl text-text-secondary font-mono">MIL</span>
      </div>

      {/* Copied Feedback */}
      {copied && (
        <div className="mt-1 text-xs text-green-500 font-medium">Copied!</div>
      )}

      {/* Corrections Indicator */}
      <div className="mt-2 flex flex-col items-center gap-1">
        {/* Height Correction */}
        {hasHeightCorrection && deltaElev !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 rounded">
            <span className="text-xs text-text-secondary font-mono">
              HEIGHT ADJ:
            </span>
            <span
              className={`text-sm font-mono font-bold ${
                deltaElev > 0 ? 'text-accent-blue' : 'text-accent-yellow'
              }`}
            >
              {deltaElev > 0 ? '+' : ''}
              {deltaElev.toFixed(1)} MIL
            </span>
          </div>
        )}

        {/* Wind Adjustment */}
        {hasWindAdjustment && elevationWithWind !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-yellow/10 border border-accent-yellow/30 rounded">
            <span className="text-xs text-text-secondary font-mono">
              WIND ADJ
            </span>
          </div>
        )}
      </div>

      {/* Base Elevation (small, for reference) */}
      {elevationBase !== undefined && hasHeightCorrection && (
        <div className="mt-1 text-xs text-muted-foreground font-mono">
          Base: {formatMil(elevationBase)} MIL
        </div>
      )}
    </div>
  );
}
