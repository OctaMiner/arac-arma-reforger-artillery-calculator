/**
 * Auto Calculate Hook
 * Automatically triggers fire solution calculation when relevant data changes
 *
 * Features:
 * - Watches positions, config, and wind
 * - Debounces rapid changes
 * - Prevents infinite loops with refs
 * - Only calculates when both positions are set
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Debounce time for calculation (ms)
 * Allows height data to load before calculating
 */
const DEBOUNCE_MS = 150;

/**
 * Hook that automatically calculates fire solution when data changes
 * Call this hook once in your app root (App.tsx)
 */
export function useAutoCalculate() {
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const manualChargeOverride = useAppStore(
    (state) => state.manualChargeOverride
  );
  const windData = useAppStore((state) => state.windData);
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  // Track if we're currently calculating to prevent re-entry
  const isCalculatingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track last calculated state to prevent unnecessary recalculations
  const lastCalculatedRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Skip if positions not set
    if (!mortarPosition || !targetPosition) {
      return;
    }

    // Skip if already calculating
    if (isCalculatingRef.current) {
      return;
    }

    // Create state signature to detect changes
    // NOTE: In auto mode, we ignore mortarConfig.charge because calculateSolution
    // will change it, which would cause an infinite loop
    const stateSignature = JSON.stringify({
      mortar: mortarPosition,
      target: targetPosition,
      type: mortarConfig.type,
      ammo: mortarConfig.ammo,
      // Only include charge in manual mode
      charge: manualChargeOverride !== null ? manualChargeOverride : 'auto',
      manualCharge: manualChargeOverride,
      wind: windData,
    });

    // Skip if this exact state was already calculated
    if (lastCalculatedRef.current === stateSignature) {
      return;
    }

    // Debounce: Wait for data to settle (height loading, etc.)
    debounceTimerRef.current = setTimeout(() => {
      isCalculatingRef.current = true;
      lastCalculatedRef.current = stateSignature;

      try {
        calculateSolution();
      } finally {
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isCalculatingRef.current = false;
        }, 50);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    mortarPosition?.east,
    mortarPosition?.north,
    mortarPosition?.height,
    targetPosition?.east,
    targetPosition?.north,
    targetPosition?.height,
    mortarConfig.type,
    mortarConfig.ammo,
    // NOTE: Do NOT include mortarConfig.charge here!
    // In auto mode, calculateSolution changes the charge, which would cause infinite loop
    // In manual mode, manualChargeOverride is used instead
    manualChargeOverride,
    windData?.speed,
    windData?.direction,
    calculateSolution,
  ]);
}
