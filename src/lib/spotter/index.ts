// ============================================
// ARAC Spotter Module - Barrel Export
// ============================================

// Target Calculator
export {
  calculateTargetFromSpotter,
  calculateAzimuth,
  calculateDistance,
  calculateHeightAngle,
  createSpotterInputFromCoordinates,
} from './targetCalculator';

export type { SpotterInput } from './targetCalculator';

// Correction
export {
  applyCorrection,
  lateralToMilCorrection,
  milToLateralCorrection,
  calculateCorrectionFromImpact,
  aggregateCorrections,
  formatCorrectionCall,
} from './correction';

export type { CorrectionInput } from './correction';
