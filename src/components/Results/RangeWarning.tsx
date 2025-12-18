/**
 * RangeWarning Component - Out of Range Warning Display
 *
 * Features:
 * - Prominent warning when target is out of range
 * - Shows if target is too far or too close
 * - Displays current distance vs max/min range
 * - Military tactical styling with alert colors
 */

import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { MortarType, AmmoType } from '../../types';

interface RangeWarningProps {
  distance: number;
  minRange: number;
  maxRange: number;
  mortarType: MortarType;
  ammoType: AmmoType;
  className?: string;
}

export function RangeWarning({
  distance,
  minRange,
  maxRange,
  mortarType,
  ammoType,
  className = '',
}: RangeWarningProps) {
  const isTooFar = distance > maxRange;
  const isTooClose = distance < minRange;

  if (!isTooFar && !isTooClose) return null;

  return (
    <div
      className={`border-2 border-accent-red bg-accent-red/10 rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-3 px-6 py-4 border-b-2 border-accent-red/30">
        <AlertCircle className="w-8 h-8 text-accent-red" />
        <span className="text-2xl font-mono font-bold text-accent-red uppercase tracking-wider">
          Target Out of Range
        </span>
      </div>

      {/* Details */}
      <div className="px-6 py-4 space-y-4">
        {/* Current vs Range */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-xs text-text-secondary font-mono uppercase mb-1">
              Current Distance
            </div>
            <div className="text-3xl font-mono font-bold text-accent-red tabular-nums">
              {Math.round(distance)}
              <span className="text-xl text-text-secondary ml-1">m</span>
            </div>
          </div>

          <div className="h-12 w-px bg-accent-red/30"></div>

          <div className="text-center">
            <div className="text-xs text-text-secondary font-mono uppercase mb-1">
              {isTooFar ? 'Maximum Range' : 'Minimum Range'}
            </div>
            <div className="text-3xl font-mono font-bold text-text-primary tabular-nums">
              {isTooFar ? Math.round(maxRange) : Math.round(minRange)}
              <span className="text-xl text-text-secondary ml-1">m</span>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-3 bg-bg-primary/50 border border-accent-red/30 rounded px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-mono text-text-primary">
              {isTooFar ? (
                <>
                  Target is{' '}
                  <span className="font-bold text-accent-red">
                    {Math.round(distance - maxRange)}m
                  </span>{' '}
                  beyond maximum range. Move mortar closer or reduce distance to
                  target.
                </>
              ) : (
                <>
                  Target is{' '}
                  <span className="font-bold text-accent-red">
                    {Math.round(minRange - distance)}m
                  </span>{' '}
                  inside minimum range. Move mortar further back or increase
                  distance to target.
                </>
              )}
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-secondary font-mono">
          <span>
            System:{' '}
            <span className="text-text-primary font-bold">
              {mortarType === 'US' ? 'M252' : 'M82'}
            </span>
          </span>
          <span className="opacity-30">|</span>
          <span>
            Ammo:{' '}
            <span className="text-text-primary font-bold">{ammoType}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
