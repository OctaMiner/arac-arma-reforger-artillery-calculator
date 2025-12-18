/**
 * useSpotter - Composite Hook für Spotter Mode
 *
 * Handhabt Spotter-Logik und Target-Korrekturen.
 */

import { useCallback, useMemo } from 'react';
import { useSpotterStore, useAppStore } from '../stores';
import { calculateCorrectedTarget } from '../stores/useSpotterStore';
import type { Coordinate, CorrectionData } from '../types';

/**
 * Hook für Spotter Mode Management
 *
 * @example
 * ```tsx
 * const SpotterPanel = () => {
 *   const {
 *     isActive,
 *     toggle,
 *     applyCorrection,
 *     applyCorrectedTarget
 *   } = useSpotter()
 *
 *   const handleCorrection = () => {
 *     applyCorrection({ leftRight: 10, addDrop: 50 })
 *     applyCorrectedTarget() // Update target position
 *   }
 *
 *   return (
 *     <button onClick={toggle}>
 *       {isActive ? 'Disable' : 'Enable'} Spotter
 *     </button>
 *   )
 * }
 * ```
 */
export const useSpotter = () => {
  // Spotter Store
  const spotterMode = useSpotterStore((state) => state.spotterMode);
  const spotterPosition = useSpotterStore((state) => state.spotterPosition);
  const spotterMeasurements = useSpotterStore(
    (state) => state.spotterMeasurements
  );
  const corrections = useSpotterStore((state) => state.corrections);
  const showCorrectionPanel = useSpotterStore(
    (state) => state.showCorrectionPanel
  );

  // Spotter Actions
  const toggleSpotterMode = useSpotterStore((state) => state.toggleSpotterMode);
  const setSpotterMode = useSpotterStore((state) => state.setSpotterMode);
  const setSpotterPosition = useSpotterStore(
    (state) => state.setSpotterPosition
  );
  const setSpotterMeasurements = useSpotterStore(
    (state) => state.setSpotterMeasurements
  );
  const applyCorrection = useSpotterStore((state) => state.applyCorrection);
  const clearCorrections = useSpotterStore((state) => state.clearCorrections);
  const removeLastCorrection = useSpotterStore(
    (state) => state.removeLastCorrection
  );
  const setShowCorrectionPanel = useSpotterStore(
    (state) => state.setShowCorrectionPanel
  );
  const resetSpotter = useSpotterStore((state) => state.reset);

  // App Store
  const fireSolution = useAppStore((state) => state.fireSolution);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  /**
   * Calculate total correction from all corrections
   */
  const totalCorrection = useMemo(
    () =>
      corrections.reduce(
        (total, correction) => ({
          leftRight: total.leftRight + correction.leftRight,
          addDrop: total.addDrop + correction.addDrop,
        }),
        { leftRight: 0, addDrop: 0 }
      ),
    [corrections]
  );

  /**
   * Calculate corrected target position
   */
  const correctedTarget = useMemo(() => {
    if (!targetPosition || !fireSolution || corrections.length === 0) {
      return null;
    }

    return calculateCorrectedTarget(
      targetPosition,
      fireSolution.azimuthDeg,
      totalCorrection
    );
  }, [targetPosition, fireSolution, totalCorrection, corrections.length]);

  /**
   * Apply corrected target to calculator and recalculate
   */
  const applyCorrectedTarget = useCallback(() => {
    if (!correctedTarget) {
      throw new Error('Keine Korrektur vorhanden');
    }

    // Set new target position
    setTargetPosition(correctedTarget);

    // Trigger recalculation
    calculateSolution();

    // Clear corrections after applying
    clearCorrections();
  }, [correctedTarget, setTargetPosition, calculateSolution, clearCorrections]);

  /**
   * Calculate target from spotter measurements
   * Uses distance and azimuth from Vector 21
   */
  const calculateTargetFromSpotter = useCallback((): Coordinate | null => {
    if (!spotterPosition || !spotterMeasurements) {
      return null;
    }

    const { distance, azimuth } = spotterMeasurements;

    // Convert azimuth to radians
    const azimuthRad = (azimuth * Math.PI) / 180;

    // Calculate target position
    // Grid coordinates are in 10m units
    const deltaEast = (distance * Math.sin(azimuthRad)) / 10;
    const deltaNorth = (distance * Math.cos(azimuthRad)) / 10;

    return {
      east: spotterPosition.east + deltaEast,
      north: spotterPosition.north + deltaNorth,
      height: spotterPosition.height, // Assume same height for now
    };
  }, [spotterPosition, spotterMeasurements]);

  /**
   * Set target from spotter measurements
   */
  const setTargetFromSpotter = useCallback(() => {
    const target = calculateTargetFromSpotter();

    if (!target) {
      throw new Error('Keine Spotter-Messungen vorhanden');
    }

    setTargetPosition(target);
    calculateSolution();
  }, [calculateTargetFromSpotter, setTargetPosition, calculateSolution]);

  /**
   * Quick correction shortcuts
   */
  const quickCorrection = useCallback(
    (type: 'left' | 'right' | 'add' | 'drop', meters: number = 50) => {
      const correction: CorrectionData =
        type === 'left'
          ? { leftRight: -meters, addDrop: 0 }
          : type === 'right'
            ? { leftRight: meters, addDrop: 0 }
            : type === 'add'
              ? { leftRight: 0, addDrop: meters }
              : { leftRight: 0, addDrop: -meters };

      applyCorrection(correction);
    },
    [applyCorrection]
  );

  return {
    // State
    isActive: spotterMode,
    spotterPosition,
    spotterMeasurements,
    corrections,
    totalCorrection,
    correctedTarget,
    showCorrectionPanel,
    hasMeasurements: Boolean(spotterMeasurements),
    hasCorrections: corrections.length > 0,
    canApplyCorrection: Boolean(correctedTarget),

    // Actions
    toggle: toggleSpotterMode,
    enable: () => setSpotterMode(true),
    disable: () => setSpotterMode(false),
    setPosition: setSpotterPosition,
    setMeasurements: setSpotterMeasurements,
    applyCorrection,
    clearCorrections,
    removeLastCorrection,
    applyCorrectedTarget,
    setTargetFromSpotter,
    toggleCorrectionPanel: () => setShowCorrectionPanel(!showCorrectionPanel),
    reset: resetSpotter,

    // Utilities
    calculateTargetFromSpotter,
    quickCorrection,
  };
};
