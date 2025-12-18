/**
 * Auto Height Hook
 * Automatically loads and sets terrain height when positions change
 *
 * Features:
 * - Watches mortar and target positions
 * - Loads height data from heightService
 * - Only activates for maps with height data
 * - Respects manual height overrides
 * - Debounces rapid position changes
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { getTerrainHeight, preloadHeightData } from '@/lib/maps/heightService';
import { getMapConfig } from '@/lib/maps/configs';
import type { MapId } from '@/lib/maps/types';

/**
 * Debounce time for position changes (ms)
 * Prevents excessive requests during dragging
 */
const DEBOUNCE_MS = 100; // Reduced for faster feedback

/**
 * Hook that automatically loads terrain heights for positions
 * Call this hook once in your app root (App.tsx or MainContent.tsx)
 */
export function useAutoHeight() {
  const selectedMapId = useAppStore((state) => state.selectedMap);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);

  // Track last position we loaded height for
  const mortarHeightSetRef = useRef<string | null>(null);
  const targetHeightSetRef = useRef<string | null>(null);

  // Debounce timers
  const mortarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get map config
  const mapConfig = getMapConfig(selectedMapId as MapId);

  // Auto-load mortar height
  useEffect(() => {
    // Clear existing timer
    if (mortarTimerRef.current) {
      clearTimeout(mortarTimerRef.current);
    }

    // Skip if no position or no height data available
    if (!mortarPosition || !mapConfig?.hasHeightData) {
      mortarHeightSetRef.current = null;
      return;
    }

    const { east, north, height } = mortarPosition;
    const posKey = `${east},${north}`;

    // Skip if we already loaded height for this exact position
    if (mortarHeightSetRef.current === posKey) {
      return;
    }

    // Skip if height was manually set (height > 0)
    // When user changes height, we don't overwrite
    if (height > 0) {
      return;
    }

    // Debounce: Wait for position to settle
    mortarTimerRef.current = setTimeout(async () => {
      try {
        const terrainHeight = await getTerrainHeight(mapConfig.id, east, north);

        if (terrainHeight !== null) {
          // Mark this position as loaded
          mortarHeightSetRef.current = posKey;

          // Get latest state from store to avoid stale closure
          const currentPosition = useAppStore.getState().mortarPosition;

          // Only update if position hasn't changed and height is still 0
          if (
            currentPosition &&
            currentPosition.east === east &&
            currentPosition.north === north &&
            currentPosition.height === 0
          ) {
            const store = useAppStore.getState();
            store.setMortarPosition({
              east,
              north,
              height: Math.round(terrainHeight),
            });

            // Note: calculateSolution() is called by MapClickHandler
            // No need to call it here to avoid infinite loop
          }
        }
      } catch (error) {
        console.warn('Failed to load terrain height for mortar:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (mortarTimerRef.current) {
        clearTimeout(mortarTimerRef.current);
      }
    };
  }, [
    mortarPosition?.east,
    mortarPosition?.north,
    mortarPosition?.height,
    mapConfig?.id,
    mapConfig?.hasHeightData,
  ]);

  // Auto-load target height
  useEffect(() => {
    // Clear existing timer
    if (targetTimerRef.current) {
      clearTimeout(targetTimerRef.current);
    }

    // Skip if no position or no height data available
    if (!targetPosition || !mapConfig?.hasHeightData) {
      targetHeightSetRef.current = null;
      return;
    }

    const { east, north, height } = targetPosition;
    const posKey = `${east},${north}`;

    // Skip if we already loaded height for this exact position
    if (targetHeightSetRef.current === posKey) {
      return;
    }

    // Skip if height was manually set (height > 0)
    // When user changes height, we don't overwrite
    if (height > 0) {
      return;
    }

    // Debounce: Wait for position to settle
    targetTimerRef.current = setTimeout(async () => {
      try {
        const terrainHeight = await getTerrainHeight(mapConfig.id, east, north);

        if (terrainHeight !== null) {
          // Mark this position as loaded
          targetHeightSetRef.current = posKey;

          // Get latest state from store to avoid stale closure
          const currentPosition = useAppStore.getState().targetPosition;

          // Only update if position hasn't changed and height is still 0
          if (
            currentPosition &&
            currentPosition.east === east &&
            currentPosition.north === north &&
            currentPosition.height === 0
          ) {
            const store = useAppStore.getState();
            store.setTargetPosition({
              east,
              north,
              height: Math.round(terrainHeight),
            });

            // Note: calculateSolution() is called by MapClickHandler
            // No need to call it here to avoid infinite loop
          }
        }
      } catch (error) {
        console.warn('Failed to load terrain height for target:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
      }
    };
  }, [
    targetPosition?.east,
    targetPosition?.north,
    targetPosition?.height,
    mapConfig?.id,
    mapConfig?.hasHeightData,
  ]);

  // Reset refs and preload height data when map changes
  useEffect(() => {
    mortarHeightSetRef.current = null;
    targetHeightSetRef.current = null;

    // Preload height data for faster access
    if (mapConfig?.hasHeightData) {
      preloadHeightData(selectedMapId);
    }
  }, [selectedMapId, mapConfig?.hasHeightData]);
}

/**
 * Get current auto-height status for UI feedback
 */
export function useAutoHeightStatus() {
  const selectedMapId = useAppStore((state) => state.selectedMap);
  const mapConfig = getMapConfig(selectedMapId as MapId);

  return {
    enabled: mapConfig?.hasHeightData ?? false,
    mapName: mapConfig?.displayName ?? 'Unknown',
  };
}
