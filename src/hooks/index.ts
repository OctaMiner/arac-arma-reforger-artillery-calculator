/**
 * Hooks Barrel Export
 * Central export point for all custom hooks
 */

// Electron API Hook
export {
  useElectronAPI,
  useElectronData,
  isElectronAPI,
} from './useElectronAPI';

// Composite Hooks
export { useCalculation } from './useCalculation';
export { useMissions } from './useMissions';
export { useStations } from './useStations';
export { useSpotter } from './useSpotter';

// Performance Hooks
export {
  useThrottledCallback,
  useDebouncedCallback,
} from './useThrottledCallback';
export {
  useBallisticCalculations,
  useRangeLimits,
} from './useBallisticCalculations';

// Keyboard Shortcuts
export { useKeyboardShortcuts, getShortcutHint } from './useKeyboardShortcuts';

// Terrain Height Hooks
export {
  useTerrainHeight,
  usePreloadHeightData,
  useHeightDifference,
  useTerrainHeights,
} from './useTerrainHeight';
export type { Coordinate, TerrainHeightResult } from './useTerrainHeight';

// Auto Height Hook
export { useAutoHeight, useAutoHeightStatus } from './useAutoHeight';

// App Initialization Hook
export { useInitialize, useInitializeStatus } from './useInitialize';

// Re-export all stores for convenience
export * from '../stores';
