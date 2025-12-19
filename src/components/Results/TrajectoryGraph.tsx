/**
 * TrajectoryGraph Component - Visualizes mortar shell flight path with terrain
 *
 * Features:
 * - SVG-based trajectory visualization
 * - Real terrain profile between mortar and target
 * - Parabolic flight path
 * - Shows if trajectory clears terrain obstacles
 * - Ring selector buttons (0-4) adapted to ammo type
 * - Responsive sizing
 * - Updates with fire solution changes
 */

import { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import {
  getTerrainProfile,
  isHeightDataLoaded,
  preloadHeightData,
} from '../../lib/maps/heightService';
import { getAllRingRanges } from '../../lib/ballistics/range';
import type { RingCount } from '../../types';

export function TrajectoryGraph() {
  const fireSolution = useAppStore((state) => state.fireSolution);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const selectedMap = useAppStore((state) => state.selectedMap);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const manualChargeOverride = useAppStore(
    (state) => state.manualChargeOverride
  );
  const setManualChargeOverride = useAppStore(
    (state) => state.setManualChargeOverride
  );
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  // Get available rings based on ammo type
  // HE: 0-4, Smoke/Illumination: 1-4
  const availableRings = useMemo((): RingCount[] => {
    if (mortarConfig.ammo === 'HE') {
      return [0, 1, 2, 3, 4];
    }
    return [1, 2, 3, 4]; // Smoke and Illumination have no Ring 0
  }, [mortarConfig.ammo]);

  // Check if we're in auto mode
  const isAutoMode = manualChargeOverride === null;

  // Handle ring change - sets manual override
  const handleRingChange = (ring: RingCount) => {
    setManualChargeOverride(ring);
    // Trigger recalculation with the new charge
    setTimeout(() => calculateSolution(), 0);
  };

  // Handle reset to auto mode
  const handleResetToAuto = () => {
    setManualChargeOverride(null);
    // Trigger recalculation in auto mode
    setTimeout(() => calculateSolution(), 0);
  };

  // Track if height data is loaded
  const [heightDataReady, setHeightDataReady] = useState(false);

  // Preload height data and check if ready
  useEffect(() => {
    preloadHeightData(selectedMap);

    // Check periodically if data is loaded
    const checkInterval = setInterval(() => {
      if (isHeightDataLoaded(selectedMap)) {
        setHeightDataReady(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Also check immediately
    if (isHeightDataLoaded(selectedMap)) {
      setHeightDataReady(true);
    }

    return () => clearInterval(checkInterval);
  }, [selectedMap]);

  // Reset ready state when map changes
  useEffect(() => {
    setHeightDataReady(isHeightDataLoaded(selectedMap));
  }, [selectedMap]);

  // Get terrain profile
  const terrainProfile = useMemo(() => {
    if (!mortarPosition || !targetPosition || !heightDataReady) {
      return null;
    }

    return getTerrainProfile(
      selectedMap,
      mortarPosition.east,
      mortarPosition.north,
      targetPosition.east,
      targetPosition.north,
      60 // More samples for smoother terrain
    );
  }, [selectedMap, mortarPosition, targetPosition, heightDataReady]);

  // Don't render if no solution
  if (!fireSolution || !mortarPosition || !targetPosition) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              Flugbahn
            </h2>
          </div>

          {/* Ring Selector Buttons (always visible) */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 mr-1">Ladung:</span>

            {/* Auto Button */}
            <button
              onClick={handleResetToAuto}
              className={`
                px-2 py-1 text-xs font-medium rounded transition-all
                ${
                  isAutoMode
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }
              `}
              title="Automatische Ladungsauswahl basierend auf Distanz"
            >
              Auto
            </button>

            <span className="text-gray-600 mx-1">|</span>

            {/* Ring Buttons */}
            {availableRings.map((ring) => {
              const currentCharge = manualChargeOverride ?? mortarConfig.charge;
              const isActive = !isAutoMode && currentCharge === ring;

              return (
                <button
                  key={ring}
                  onClick={() => handleRingChange(ring)}
                  className={`
                    px-2.5 py-1 text-xs font-bold rounded transition-all
                    ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : isAutoMode && mortarConfig.charge === ring
                          ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }
                  `}
                  title={`Ring ${ring} - ${ring === 0 ? 'Steilste' : ring === 4 ? 'Flachste' : 'Mittlere'} Flugbahn`}
                >
                  {ring}
                </button>
              );
            })}
            <span className="text-xs text-gray-500 ml-2">
              ({mortarConfig.ammo})
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
            Setze Mörser und Ziel auf der Karte
          </div>
        </div>
      </div>
    );
  }

  // Calculate trajectory parameters
  const distanceToTarget = fireSolution.distance;
  const mortarHeight = mortarPosition.height;
  const targetHeight = targetPosition.height;
  const isOutOfRange = !fireSolution.inRange;

  // Get the max range for the current ring
  const currentRing = fireSolution.ringCount;
  const ringRanges = getAllRingRanges(mortarConfig.type, mortarConfig.ammo);
  const currentRingRange = ringRanges.find((r) => r.ringCount === currentRing);
  const maxRangeForRing = currentRingRange?.maxRange ?? distanceToTarget;

  // Determine actual trajectory end point
  // If out of range, trajectory ends at max range (before target)
  // If in range, trajectory ends at target
  const trajectoryEndDistance = isOutOfRange
    ? Math.min(maxRangeForRing, distanceToTarget * 0.9) // Cap at 90% to show gap
    : distanceToTarget;

  // For out-of-range: estimate landing height at impact point
  // For in-range: use target height
  const trajectoryEndHeight = isOutOfRange
    ? mortarHeight // Approximate landing at similar height (shell falls to ground)
    : targetHeight;

  // For SVG display, we need the full distance to show the target
  const displayDistance = distanceToTarget;

  // =======================================================
  // PARABOLA THROUGH START AND END POINTS
  //
  // Vertex form: y = a(x - h)² + k where (h, k) is the apex
  //
  // Given:
  // - Start point: (0, mortarHeight)
  // - End point: (d, endHeight) where d = trajectoryEndDistance
  // - Apex X position: h (based on elevation angle)
  //
  // The apex X position determines where the highest point is.
  // Higher elevation = apex closer to start (h < d/2)
  // Lower elevation = apex closer to middle (h ≈ d/2)
  // =======================================================

  const d = trajectoryEndDistance;
  const startHeight = mortarHeight;
  const endHeight = trajectoryEndHeight;
  const heightDiff = endHeight - startHeight;

  // Determine apex X position based on elevation
  let flightTime: number;
  let apexXRatio: number; // 0 to 1, where apex is located

  if (
    isOutOfRange ||
    fireSolution.elevationAdj === 0 ||
    fireSolution.flightTime === 0
  ) {
    flightTime = 25;
    apexXRatio = 0.45; // Slightly before middle for max range
  } else {
    flightTime = fireSolution.flightTime;
    const elevationMil = fireSolution.elevationAdj;

    // Higher elevation (steeper) = apex earlier in flight
    // Range: 800 MIL (flat, ~45°) → ratio 0.45
    //        1200 MIL (steep, ~67°) → ratio 0.35
    //        1500 MIL (very steep, ~84°) → ratio 0.25
    apexXRatio = Math.max(
      0.25,
      Math.min(0.48, 0.55 - (elevationMil - 800) / 2000)
    );
  }

  // Apex X must be less than d/2 for downward-opening parabola when heights are similar
  // Clamp to ensure valid parabola
  let actualApexX = d * apexXRatio;

  // Ensure apex is before midpoint to get downward parabola
  actualApexX = Math.min(actualApexX, d * 0.48);

  // =======================================================
  // Calculate parabola parameters
  // From vertex form through two points:
  // a = heightDiff / [d × (d - 2h)]
  // k = startHeight - a × h²
  // =======================================================

  const denominator = d * (d - 2 * actualApexX);

  let parabolaA: number;
  let apexHeight: number;

  if (Math.abs(denominator) > 0.001) {
    parabolaA = heightDiff / denominator;
    apexHeight = startHeight - parabolaA * actualApexX * actualApexX;
  } else {
    // Fallback: apex at midpoint, estimate height from flight time
    actualApexX = d * 0.4;
    const g = 9.81;
    const timeToApex = flightTime * 0.4;
    apexHeight = startHeight + (timeToApex * timeToApex * g) / 2;
    parabolaA = (startHeight - apexHeight) / (actualApexX * actualApexX);
  }

  // Ensure apex is above both endpoints (sanity check)
  const minApexHeight = Math.max(startHeight, endHeight) + 30;
  if (apexHeight < minApexHeight) {
    apexHeight = minApexHeight;
    // Recalculate parabolaA to pass through start
    parabolaA = (startHeight - apexHeight) / (actualApexX * actualApexX);
  }

  // SVG dimensions - larger graph for better visualization
  const svgWidth = 400;
  const svgHeight = 280;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Calculate height range from terrain (NOT trajectory!)
  // The terrain view should stay constant regardless of which ring is selected
  let minTerrainHeight = Math.min(mortarHeight, targetHeight);
  let maxTerrainHeight = Math.max(mortarHeight, targetHeight);

  if (terrainProfile && terrainProfile.length > 0) {
    const terrainHeights = terrainProfile.map((p) => p.height);
    minTerrainHeight = Math.min(...terrainHeights);
    maxTerrainHeight = Math.max(...terrainHeights);
  }

  // Fixed height range - always show up to 600m for consistent trajectory visualization
  // This ensures high trajectories (Ring 0) are always fully visible
  const minHeight = Math.min(minTerrainHeight - 20, 0);
  const maxHeight = Math.max(600, apexHeight + 50, maxTerrainHeight + 100);
  const heightRange = maxHeight - minHeight;

  // Scale factors - use displayDistance so target is always visible
  const xScale = graphWidth / displayDistance;
  const yScale = graphHeight / heightRange;

  // Convert real coordinates to SVG coordinates
  const toSvgX = (x: number) => padding.left + x * xScale;
  const toSvgY = (h: number) =>
    padding.top + graphHeight - (h - minHeight) * yScale;

  // Helper function to calculate trajectory height at any x position
  // Using vertex form: y = a(x - h)² + k where h = actualApexX
  const getTrajectoryHeight = (x: number): number => {
    return parabolaA * (x - actualApexX) * (x - actualApexX) + apexHeight;
  };

  // Generate trajectory path points - only up to trajectoryEndDistance
  const trajectoryPoints: string[] = [];
  const numPoints = 50;

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * trajectoryEndDistance; // Only go to trajectory end
    const y = getTrajectoryHeight(x);

    if (i === 0) {
      trajectoryPoints.push(
        `M ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`
      );
    } else {
      trajectoryPoints.push(
        `L ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`
      );
    }
  }

  const trajectoryPath = trajectoryPoints.join(' ');

  // Generate terrain path
  let terrainPath = '';
  if (terrainProfile && terrainProfile.length > 0) {
    const terrainPoints = terrainProfile.map((p, i) => {
      const x = toSvgX(p.distance).toFixed(1);
      const y = toSvgY(p.height).toFixed(1);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });

    // Close the terrain area (fill to bottom)
    const lastPoint = terrainProfile[terrainProfile.length - 1];
    const firstPoint = terrainProfile[0];
    terrainPoints.push(
      `L ${toSvgX(lastPoint.distance).toFixed(1)} ${toSvgY(minHeight).toFixed(1)}`
    );
    terrainPoints.push(
      `L ${toSvgX(firstPoint.distance).toFixed(1)} ${toSvgY(minHeight).toFixed(1)}`
    );
    terrainPoints.push('Z');

    terrainPath = terrainPoints.join(' ');
  }

  // Key points for SVG
  const mortarX = toSvgX(0);
  const mortarY = toSvgY(mortarHeight);
  const targetX = toSvgX(displayDistance); // Target at full distance
  const targetY = toSvgY(targetHeight);
  const apexSvgX = toSvgX(actualApexX);
  const apexSvgY = toSvgY(apexHeight);

  // Impact point (where trajectory ends) - different from target if out of range
  const impactX = toSvgX(trajectoryEndDistance);
  const impactY = toSvgY(trajectoryEndHeight);

  // Use blockageInfo from fireSolution if available (synchronized with map marker)
  // Otherwise fall back to local calculation for visual display
  const blockageInfo = fireSolution.blockageInfo;
  let trajectoryBlocked = fireSolution.trajectoryBlocked || fireSolution.originalRingBlocked || false;
  let worstCollision: {
    distance: number;
    terrainHeight: number;
    trajectoryHeight: number;
    clearance: number;
  } | null = null;

  // Use fireSolution blockageInfo if available (ensures sync with map marker)
  if (blockageInfo && blockageInfo.distance > 0) {
    worstCollision = {
      distance: blockageInfo.distance,
      terrainHeight: blockageInfo.terrainHeight,
      trajectoryHeight: blockageInfo.trajectoryHeight,
      clearance: blockageInfo.trajectoryHeight - blockageInfo.terrainHeight,
    };
  } else if (terrainProfile) {
    // Fallback: local calculation if no blockageInfo
    for (let i = 0; i < terrainProfile.length; i++) {
      const p = terrainProfile[i];

      // Only check terrain up to trajectory end (not beyond impact point)
      if (p.distance > trajectoryEndDistance) {
        continue;
      }

      // Skip start and end zones (first/last 5% of trajectory)
      if (
        p.distance < trajectoryEndDistance * 0.05 ||
        p.distance > trajectoryEndDistance * 0.95
      ) {
        continue;
      }

      const trajectoryHeight = getTrajectoryHeight(p.distance);
      const clearance = trajectoryHeight - p.height;

      // Check for collision (with 10m safety margin)
      if (clearance < 10) {
        trajectoryBlocked = true;

        // Track the worst collision point
        if (!worstCollision || clearance < worstCollision.clearance) {
          worstCollision = {
            distance: p.distance,
            terrainHeight: p.height,
            trajectoryHeight,
            clearance,
          };
        }
      }
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      {/* Header with Ring Selector */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            Flugbahn
          </h2>
          {isOutOfRange ? (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
              Außer Reichweite!
            </span>
          ) : trajectoryBlocked ? (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
              Hindernis!
            </span>
          ) : null}
        </div>

        {/* Ring Selector Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-1">Ladung:</span>

          {/* Auto Button */}
          <button
            onClick={handleResetToAuto}
            className={`
              px-2 py-1 text-xs font-medium rounded transition-all
              ${
                isAutoMode
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
              }
            `}
            title="Automatische Ladungsauswahl basierend auf Distanz"
          >
            Auto
          </button>

          <span className="text-gray-600 mx-1">|</span>

          {/* Ring Buttons */}
          {availableRings.map((ring) => {
            const currentCharge = manualChargeOverride ?? mortarConfig.charge;
            const isActive = !isAutoMode && currentCharge === ring;

            return (
              <button
                key={ring}
                onClick={() => handleRingChange(ring)}
                className={`
                  px-2.5 py-1 text-xs font-bold rounded transition-all
                  ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : isAutoMode && mortarConfig.charge === ring
                        ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }
                `}
                title={`Ring ${ring} - ${ring === 0 ? 'Steilste' : ring === 4 ? 'Flachste' : 'Mittlere'} Flugbahn`}
              >
                {ring}
              </button>
            );
          })}
          <span className="text-xs text-gray-500 ml-2">
            ({mortarConfig.ammo})
          </span>
        </div>
      </div>

      {/* Graph */}
      <div className="p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '320px' }}
        >
          {/* Definitions */}
          <defs>
            {/* Grid pattern */}
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Trajectory gradient */}
            <linearGradient
              id="trajectoryGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            {/* Terrain gradient */}
            <linearGradient
              id="terrainGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(139, 92, 42, 0.6)" />
              <stop offset="100%" stopColor="rgba(139, 92, 42, 0.2)" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight}
            fill="url(#grid)"
          />

          {/* Y-axis labels - more labels for better scale readability */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const h = minHeight + heightRange * t;
            const y = toSvgY(h);
            return (
              <g key={t}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 5}
                  y={y}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="9"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {h.toFixed(0)}m
                </text>
              </g>
            );
          })}

          {/* Terrain fill */}
          {terrainPath && (
            <path d={terrainPath} fill="url(#terrainGradient)" stroke="none" />
          )}

          {/* Terrain outline */}
          {terrainProfile && terrainProfile.length > 0 && (
            <path
              d={terrainProfile
                .map((p, i) =>
                  i === 0
                    ? `M ${toSvgX(p.distance).toFixed(1)} ${toSvgY(p.height).toFixed(1)}`
                    : `L ${toSvgX(p.distance).toFixed(1)} ${toSvgY(p.height).toFixed(1)}`
                )
                .join(' ')}
              fill="none"
              stroke="rgba(139, 92, 42, 0.8)"
              strokeWidth="2"
            />
          )}

          {/* Simple ground line if no terrain data */}
          {(!terrainProfile || terrainProfile.length === 0) && (
            <line
              x1={toSvgX(0)}
              y1={toSvgY(mortarHeight)}
              x2={toSvgX(displayDistance)}
              y2={toSvgY(targetHeight)}
              stroke="rgba(139, 92, 42, 0.5)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Trajectory path */}
          <path
            d={trajectoryPath}
            fill="none"
            stroke="url(#trajectoryGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Apex marker */}
          <circle
            cx={apexSvgX}
            cy={apexSvgY}
            r="5"
            fill="#a855f7"
            stroke="#1f2937"
            strokeWidth="2"
          />
          <text
            x={apexSvgX}
            y={apexSvgY - 12}
            fill="#a855f7"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            {apexHeight.toFixed(0)}m
          </text>

          {/* Mortar position */}
          <g transform={`translate(${mortarX}, ${mortarY})`}>
            <circle r="8" fill="#22c55e" stroke="#1f2937" strokeWidth="2" />
            <path
              d="M 0 -4 L 0 4"
              stroke="#1f2937"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Target position */}
          <g transform={`translate(${targetX}, ${targetY})`}>
            <circle r="8" fill="#ef4444" stroke="#1f2937" strokeWidth="2" />
            <circle r="3" fill="#1f2937" />
          </g>

          {/* Impact point - shown when out of range (trajectory ends before target) */}
          {isOutOfRange && (
            <>
              {/* Dashed line from impact to target showing the gap */}
              <line
                x1={impactX}
                y1={impactY}
                x2={targetX}
                y2={targetY}
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              {/* Impact marker (X mark) */}
              <g transform={`translate(${impactX}, ${impactY})`}>
                <circle r="6" fill="#f97316" stroke="#1f2937" strokeWidth="2" />
                <path
                  d="M -3 -3 L 3 3 M 3 -3 L -3 3"
                  stroke="#1f2937"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
              {/* Impact distance label */}
              <text
                x={impactX}
                y={impactY - 12}
                fill="#f97316"
                fontSize="8"
                textAnchor="middle"
                fontWeight="bold"
              >
                {trajectoryEndDistance.toFixed(0)}m
              </text>
            </>
          )}

          {/* Height labels at mortar and target */}
          <text
            x={mortarX}
            y={svgHeight - 8}
            fill="#22c55e"
            fontSize="10"
            textAnchor="middle"
            fontWeight="bold"
          >
            {mortarHeight.toFixed(0)}m
          </text>
          <text
            x={targetX}
            y={svgHeight - 8}
            fill="#ef4444"
            fontSize="10"
            textAnchor="middle"
            fontWeight="bold"
          >
            {targetHeight.toFixed(0)}m
          </text>

          {/* Distance label */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 8}
            fill="rgba(255, 255, 255, 0.6)"
            fontSize="10"
            textAnchor="middle"
          >
            {distanceToTarget.toFixed(0)}m
          </text>

          {/* Warning overlay if blocked or out of range */}
          {(trajectoryBlocked || !fireSolution.inRange) && (
            <rect
              x={padding.left}
              y={padding.top}
              width={graphWidth}
              height={graphHeight}
              fill="rgba(239, 68, 68, 0.1)"
            />
          )}
        </svg>

        {/* Stats below graph */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-900/50 rounded px-2 py-1">
            <div className="text-xs text-gray-400">Apex</div>
            <div className="text-sm font-mono text-purple-400">
              {apexHeight.toFixed(0)}m
            </div>
          </div>
          <div className="bg-gray-900/50 rounded px-2 py-1">
            <div className="text-xs text-gray-400">Flugzeit</div>
            <div className="text-sm font-mono text-blue-400">
              {flightTime.toFixed(1)}s
            </div>
          </div>
          <div className="bg-gray-900/50 rounded px-2 py-1">
            <div className="text-xs text-gray-400">Elevation</div>
            <div className="text-sm font-mono text-green-400">
              {fireSolution.elevationAdj.toFixed(0)} MIL
            </div>
          </div>
        </div>

        {/* Collision Warning Details */}
        {trajectoryBlocked && worstCollision && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <div className="text-red-400 font-semibold text-sm">
                  Einschlag in Gelände!
                </div>
                <div className="text-red-300/80 text-xs mt-1 space-y-0.5">
                  <div>
                    Bei{' '}
                    <span className="font-mono">
                      {worstCollision.distance.toFixed(0)}m
                    </span>{' '}
                    Entfernung
                  </div>
                  <div>
                    Terrain:{' '}
                    <span className="font-mono">
                      {worstCollision.terrainHeight.toFixed(0)}m
                    </span>{' '}
                    | Flugbahn:{' '}
                    <span className="font-mono">
                      {worstCollision.trajectoryHeight.toFixed(0)}m
                    </span>
                  </div>
                  <div className="text-red-400 font-medium">
                    Fehlt: {Math.abs(worstCollision.clearance).toFixed(0)}m Höhe
                  </div>
                </div>
                <div className="text-yellow-400/90 text-xs mt-2 pt-2 border-t border-red-500/20">
                  <span className="font-medium">Lösung:</span> Weniger Ladung =
                  höhere Flugbahn
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success indicator when clear AND in range */}
        {!trajectoryBlocked &&
          !isOutOfRange &&
          terrainProfile &&
          terrainProfile.length > 0 && (
            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Flugbahn frei - Ziel erreichbar</span>
              </div>
            </div>
          )}

        {/* Terrain loading status */}
        {!heightDataReady && (
          <div className="mt-2 text-xs text-center text-gray-500">
            Lade Höhendaten...
          </div>
        )}
      </div>
    </div>
  );
}
