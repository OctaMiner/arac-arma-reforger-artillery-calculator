/**
 * Store Barrel Export
 * Central export point for all Zustand stores
 */

// App Store
export {
  useAppStore,
  selectMortarConfig,
  selectMortarPosition,
  selectTargetPosition,
  selectFireSolution,
  selectIsCalculating,
  selectError
} from './useAppStore'

// Missions Store
export {
  useMissionsStore,
  selectMissions,
  selectSelectedMission,
  selectMissionsLoading,
  selectMissionsError
} from './useMissionsStore'

// Stations Store
export {
  useStationsStore,
  selectStations,
  selectSelectedStation,
  selectStationsLoading,
  selectStationsError,
  selectStationsByMap
} from './useStationsStore'

// History Store
export {
  useHistoryStore,
  selectHistory,
  selectHistoryLoading,
  selectHistoryError,
  selectHasMoreHistory,
  selectHistoryByMission,
  selectRecentHistory
} from './useHistoryStore'

// Spotter Store
export {
  useSpotterStore,
  selectSpotterMode,
  selectSpotterPosition,
  selectSpotterMeasurements,
  selectCorrections,
  selectShowCorrectionPanel,
  selectTotalCorrection,
  selectHasCorrections,
  selectCorrectionCount,
  calculateCorrectedTarget
} from './useSpotterStore'

// User Store
export {
  useUserStore,
  selectUserProfile,
  selectStatistics,
  selectSettings,
  selectTheme,
  selectLanguage,
  selectShowGrid,
  selectDefaultMortarType,
  selectDefaultAmmo,
  selectDefaultCharge,
  selectUserLoading,
  selectUserError
} from './useUserStore'
