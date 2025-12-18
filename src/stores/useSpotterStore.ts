/**
 * Spotter Store - Manages spotter mode and corrections
 *
 * Handles:
 * - Spotter mode activation
 * - Spotter position and measurements
 * - Target corrections (left/right, add/drop)
 * - Calculating new target position from corrections
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Coordinate, CorrectionData } from '../types'

interface SpotterState {
  // State
  spotterMode: boolean
  spotterPosition: Coordinate | null
  spotterMeasurements: {
    distance: number // meters
    azimuth: number // degrees
  } | null
  corrections: CorrectionData[]

  // UI
  showCorrectionPanel: boolean

  // Actions
  toggleSpotterMode: () => void
  setSpotterMode: (enabled: boolean) => void
  setSpotterPosition: (position: Coordinate | null) => void
  setSpotterMeasurements: (measurements: {
    distance: number
    azimuth: number
  } | null) => void
  applyCorrection: (correction: CorrectionData) => void
  clearCorrections: () => void
  removeLastCorrection: () => void
  setShowCorrectionPanel: (show: boolean) => void
  reset: () => void
}

export const useSpotterStore = create<SpotterState>()(
  devtools(
    (set) => ({
      // Initial state
      spotterMode: false,
      spotterPosition: null,
      spotterMeasurements: null,
      corrections: [],
      showCorrectionPanel: false,

      // Toggle spotter mode on/off
      toggleSpotterMode: () =>
        set(
          (state) => ({
            spotterMode: !state.spotterMode,
            // Clear data when disabling
            ...(state.spotterMode && {
              spotterPosition: null,
              spotterMeasurements: null,
              corrections: [],
              showCorrectionPanel: false
            })
          }),
          false,
          'toggleSpotterMode'
        ),

      // Set spotter mode explicitly
      setSpotterMode: (enabled) =>
        set(
          {
            spotterMode: enabled,
            // Clear data when disabling
            ...(!enabled && {
              spotterPosition: null,
              spotterMeasurements: null,
              corrections: [],
              showCorrectionPanel: false
            })
          },
          false,
          'setSpotterMode'
        ),

      // Set spotter position (where the spotter is standing)
      setSpotterPosition: (position) =>
        set(
          {
            spotterPosition: position
          },
          false,
          'setSpotterPosition'
        ),

      // Set spotter measurements (from Vector 21)
      // Distance in meters, azimuth in degrees
      setSpotterMeasurements: (measurements) =>
        set(
          {
            spotterMeasurements: measurements
          },
          false,
          'setSpotterMeasurements'
        ),

      // Apply a correction
      // leftRight: positive = right, negative = left (meters)
      // addDrop: positive = add (further), negative = drop (shorter) (meters)
      applyCorrection: (correction) =>
        set(
          (state) => ({
            corrections: [...state.corrections, correction]
          }),
          false,
          'applyCorrection'
        ),

      // Clear all corrections
      clearCorrections: () =>
        set(
          {
            corrections: []
          },
          false,
          'clearCorrections'
        ),

      // Remove last correction (undo)
      removeLastCorrection: () =>
        set(
          (state) => ({
            corrections: state.corrections.slice(0, -1)
          }),
          false,
          'removeLastCorrection'
        ),

      // Toggle correction panel visibility
      setShowCorrectionPanel: (show) =>
        set(
          {
            showCorrectionPanel: show
          },
          false,
          'setShowCorrectionPanel'
        ),

      // Reset all spotter state
      reset: () =>
        set(
          {
            spotterMode: false,
            spotterPosition: null,
            spotterMeasurements: null,
            corrections: [],
            showCorrectionPanel: false
          },
          false,
          'reset'
        )
    }),
    {
      name: 'spotter-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Selectors
export const selectSpotterMode = (state: SpotterState) => state.spotterMode
export const selectSpotterPosition = (state: SpotterState) =>
  state.spotterPosition
export const selectSpotterMeasurements = (state: SpotterState) =>
  state.spotterMeasurements
export const selectCorrections = (state: SpotterState) => state.corrections
export const selectShowCorrectionPanel = (state: SpotterState) =>
  state.showCorrectionPanel

// Computed selectors
export const selectTotalCorrection = (state: SpotterState): CorrectionData => {
  return state.corrections.reduce(
    (total, correction) => ({
      leftRight: total.leftRight + correction.leftRight,
      addDrop: total.addDrop + correction.addDrop
    }),
    { leftRight: 0, addDrop: 0 }
  )
}

export const selectHasCorrections = (state: SpotterState) =>
  state.corrections.length > 0

export const selectCorrectionCount = (state: SpotterState) =>
  state.corrections.length

/**
 * Calculate new target position based on current target and corrections
 *
 * Note: This is a helper function, not a selector.
 * Use in components that need to calculate corrected position.
 *
 * @param currentTarget - Current target coordinate
 * @param currentAzimuth - Current azimuth in degrees
 * @param totalCorrection - Total correction to apply
 * @returns New target coordinate
 */
export const calculateCorrectedTarget = (
  currentTarget: Coordinate,
  currentAzimuth: number,
  totalCorrection: CorrectionData
): Coordinate => {
  // Convert azimuth to radians
  const azimuthRad = (currentAzimuth * Math.PI) / 180

  // Calculate perpendicular direction for left/right (90° from azimuth)
  const perpAzimuth = azimuthRad + Math.PI / 2

  // Apply add/drop correction (along azimuth)
  // Positive = further (add), negative = shorter (drop)
  const deltaEast1 = (totalCorrection.addDrop * Math.sin(azimuthRad)) / 10 // Convert to grid units
  const deltaNorth1 = (totalCorrection.addDrop * Math.cos(azimuthRad)) / 10

  // Apply left/right correction (perpendicular to azimuth)
  // Positive = right, negative = left
  const deltaEast2 = (totalCorrection.leftRight * Math.sin(perpAzimuth)) / 10
  const deltaNorth2 = (totalCorrection.leftRight * Math.cos(perpAzimuth)) / 10

  return {
    east: currentTarget.east + deltaEast1 + deltaEast2,
    north: currentTarget.north + deltaNorth1 + deltaNorth2,
    height: currentTarget.height // Height remains unchanged
  }
}
