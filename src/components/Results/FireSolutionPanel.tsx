/**
 * FireSolutionPanel Component - Complete Fire Solution Display
 *
 * Features:
 * - Container for all fire solution result components
 * - Large, prominent display of critical values
 * - Handles null state with placeholder
 * - Shows range warning when out of range
 * - Responsive grid layout
 * - Military tactical styling
 */

import { useAppStore } from '../../stores/useAppStore';
import { getMaximumRange, getMinimumRange } from '../../lib/ballistics/range';
import { AzimuthDisplay } from './AzimuthDisplay';
import { ElevationDisplay } from './ElevationDisplay';
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { DistanceDisplay } from './DistanceDisplay';
import { RingCountDisplay } from './RingCountDisplay';
import { RangeWarning } from './RangeWarning';
import { Target, Crosshair } from 'lucide-react';

export function FireSolutionPanel() {
  const fireSolution = useAppStore((state) => state.fireSolution);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const windData = useAppStore((state) => state.windData);
  const isCalculating = useAppStore((state) => state.isCalculating);

  // Calculate range limits
  const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo);
  const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo);

  // Loading state
  if (isCalculating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-text-secondary uppercase tracking-wider">
            Calculating...
          </span>
        </div>
      </div>
    );
  }

  // No solution state - show placeholder
  if (!fireSolution) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="flex items-center gap-4">
            <Crosshair className="w-16 h-16 text-muted-foreground" />
            <Target className="w-16 h-16 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-mono font-bold text-text-primary mb-2">
              No Fire Solution
            </h3>
            <p className="text-sm text-text-secondary font-mono">
              {!mortarPosition && !targetPosition
                ? 'Set mortar position and target position on the map to calculate fire solution.'
                : !mortarPosition
                  ? 'Set mortar position on the map.'
                  : 'Set target position on the map.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render fire solution
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
      {/* Range Warning - Full Width at Top */}
      {!fireSolution.inRange && (
        <RangeWarning
          distance={fireSolution.distance}
          minRange={minRange}
          maxRange={maxRange}
          mortarType={mortarConfig.type}
          ammoType={mortarConfig.ammo}
        />
      )}

      {/* Main Fire Solution Grid */}
      <div
        className={`grid grid-cols-2 gap-8 ${!fireSolution.inRange ? 'opacity-50' : ''}`}
      >
        {/* PRIMARY VALUES - Top Row (Azimuth & Elevation) */}
        <div className="flex items-center justify-center p-8 bg-bg-secondary border-2 border-accent-blue/30 rounded-lg">
          <AzimuthDisplay
            azimuthMil={fireSolution.azimuthMil}
            azimuthDeg={fireSolution.azimuthDeg}
            azimuthWithWind={fireSolution.azimuthWithWind}
            windCorrection={fireSolution.windCorrection?.azimuthCorrection}
          />
        </div>

        <div className="flex items-center justify-center p-8 bg-bg-secondary border-2 border-accent-green/30 rounded-lg">
          <ElevationDisplay
            elevationAdj={fireSolution.elevationAdj}
            elevationBase={fireSolution.elevationBase}
            deltaElev={fireSolution.deltaElev}
            elevationWithWind={fireSolution.elevationWithWind}
          />
        </div>

        {/* SECONDARY VALUES - Bottom Row */}
        <div className="flex items-center justify-center p-6 bg-bg-secondary border border-border rounded-lg">
          <RingCountDisplay
            ringCount={fireSolution.ringCount}
            recommendedCharge={fireSolution.recommendedCharge}
          />
        </div>

        <div className="flex items-center justify-center p-6 bg-bg-secondary border border-border rounded-lg">
          <FlightTimeDisplay flightTime={fireSolution.flightTime} />
        </div>
      </div>

      {/* TERTIARY INFO - Distance (Full Width) */}
      <div
        className={`flex items-center justify-center p-6 bg-bg-secondary border border-border rounded-lg ${!fireSolution.inRange ? 'opacity-50' : ''}`}
      >
        <DistanceDisplay distance={fireSolution.distance} />
      </div>

      {/* Wind Info Banner (if wind is active) */}
      {windData && windData.speed > 0 && fireSolution.windCorrection && (
        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
          <div className="flex items-center justify-center gap-6 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Wind Speed:</span>
              <span className="text-accent-blue font-bold">
                {windData.speed.toFixed(1)} m/s
              </span>
            </div>
            <div className="h-4 w-px bg-accent-blue/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Direction:</span>
              <span className="text-accent-blue font-bold">
                {windData.direction}°
              </span>
            </div>
            <div className="h-4 w-px bg-accent-blue/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Crosswind:</span>
              <span className="text-accent-yellow font-bold">
                {fireSolution.windCorrection.crosswind.toFixed(1)} m/s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
