/**
 * Hooks Barrel Export
 * Central export point for all custom hooks
 */

// Electron API Hook
export { useElectronAPI, useElectronData, isElectronAPI } from './useElectronAPI'

// Composite Hooks
export { useCalculation } from './useCalculation'
export { useMissions } from './useMissions'
export { useStations } from './useStations'
export { useSpotter } from './useSpotter'

// Terrain Height Hooks
export {
  useTerrainHeight,
  usePreloadHeightData,
  useHeightDifference,
  useTerrainHeights
} from './useTerrainHeight'
export type { Coordinate, TerrainHeightResult } from './useTerrainHeight'

// Auto Height Hook
export { useAutoHeight, useAutoHeightStatus } from './useAutoHeight'

// Re-export all stores for convenience
export * from '../stores'
