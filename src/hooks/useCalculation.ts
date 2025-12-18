/**
 * useCalculation - Composite Hook für Fire Solution Berechnung
 *
 * Kombiniert mehrere Stores für automatische Berechnung und History.
 * Nutzt Debouncing für Performance beim Map Dragging.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, useHistoryStore, useUserStore } from '../stores';
import type { Coordinate } from '../types';

interface UseCalculationOptions {
  /**
   * Auto-calculate wenn sich Positionen ändern
   * @default true
   */
  autoCalculate?: boolean;

  /**
   * Automatisch zur History hinzufügen
   * @default true
   */
  autoHistory?: boolean;

  /**
   * Debounce delay in ms (für Map Dragging)
   * @default 300
   */
  debounceMs?: number;

  /**
   * Callback wenn Berechnung abgeschlossen
   */
  onCalculated?: () => void;
}

/**
 * Hook für Fire Solution Berechnung mit Auto-Update und History
 *
 * @example
 * ```tsx
 * const Calculator = () => {
 *   const { calculate, reset } = useCalculation({
 *     autoCalculate: true,
 *     autoHistory: true,
 *     debounceMs: 300
 *   })
 *
 *   return <button onClick={calculate}>Calculate</button>
 * }
 * ```
 */
export const useCalculation = (options: UseCalculationOptions = {}) => {
  const {
    autoCalculate = true,
    autoHistory = true,
    debounceMs = 300,
    onCalculated,
  } = options;

  // Store State
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const fireSolution = useAppStore((state) => state.fireSolution);
  const isCalculating = useAppStore((state) => state.isCalculating);
  const error = useAppStore((state) => state.error);

  // Store Actions
  const calculateSolution = useAppStore((state) => state.calculateSolution);
  const resetApp = useAppStore((state) => state.reset);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  const incrementShots = useUserStore((state) => state.incrementShots);

  // Debounce Timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastCalculationRef = useRef<string>('');

  /**
   * Manual calculation trigger
   */
  const calculate = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    calculateSolution();
  }, [calculateSolution]);

  /**
   * Debounced calculation
   */
  const calculateDebounced = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      calculateSolution();
    }, debounceMs);
  }, [calculateSolution, debounceMs]);

  /**
   * Reset all calculation state
   */
  const reset = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    resetApp();
  }, [resetApp]);

  /**
   * Set positions and trigger calculation
   */
  const setPositionsAndCalculate = useCallback(
    (mortar: Coordinate | null, target: Coordinate | null) => {
      useAppStore.getState().setMortarPosition(mortar);
      useAppStore.getState().setTargetPosition(target);

      if (mortar && target) {
        calculateDebounced();
      }
    },
    [calculateDebounced]
  );

  // Auto-calculate on position/config changes
  useEffect(() => {
    if (!autoCalculate) return;

    if (mortarPosition && targetPosition) {
      calculateDebounced();
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    mortarPosition,
    targetPosition,
    mortarConfig.type,
    mortarConfig.ammo,
    mortarConfig.charge,
    autoCalculate,
    calculateDebounced,
  ]);

  // Auto-add to history when calculation completes
  useEffect(() => {
    if (!autoHistory || !fireSolution || !mortarPosition || !targetPosition) {
      return;
    }

    // Create unique key for this calculation
    const calculationKey = JSON.stringify({
      mortar: mortarPosition,
      target: targetPosition,
      config: mortarConfig,
      solution: fireSolution,
    });

    // Only add if different from last calculation
    if (calculationKey !== lastCalculationRef.current) {
      lastCalculationRef.current = calculationKey;

      // Add to history
      addToHistory(
        mortarConfig,
        mortarPosition,
        targetPosition,
        fireSolution
      ).catch(console.error);

      // Increment shot counter
      incrementShots();

      // Callback
      onCalculated?.();
    }
  }, [
    fireSolution,
    mortarPosition,
    targetPosition,
    mortarConfig,
    autoHistory,
    addToHistory,
    incrementShots,
    onCalculated,
  ]);

  return {
    // State
    fireSolution,
    isCalculating,
    error,
    hasResult: fireSolution !== null,
    isInRange: fireSolution?.inRange ?? false,

    // Actions
    calculate,
    calculateDebounced,
    reset,
    setPositionsAndCalculate,
  };
};
