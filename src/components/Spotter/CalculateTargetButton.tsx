/**
 * CalculateTargetButton Component
 * Calculates target position from spotter measurements
 */

import { Calculator } from 'lucide-react';
import { useSpotterStore } from '../../stores/useSpotterStore';
import { useAppStore } from '../../stores/useAppStore';
import { calculateTargetFromSpotter } from '../../lib/spotter';

export function CalculateTargetButton() {
  const spotterPosition = useSpotterStore((state) => state.spotterPosition);
  const measurements = useSpotterStore((state) => state.spotterMeasurements);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);
  const calculateSolution = useAppStore((state) => state.calculateSolution);

  const isDisabled = !spotterPosition || !measurements;

  const handleCalculate = () => {
    if (!spotterPosition || !measurements) return;

    // Calculate target position from spotter data
    const target = calculateTargetFromSpotter({
      spotterPosition,
      distance: measurements.distance,
      azimuth: measurements.azimuth,
    });

    // Set as target position and calculate fire solution
    setTargetPosition(target);
    calculateSolution();
  };

  return (
    <button
      onClick={handleCalculate}
      disabled={isDisabled}
      className="btn-primary w-full bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 border-amber-600/30"
    >
      <div className="flex items-center justify-center gap-2">
        <Calculator className="w-4 h-4" />
        <span>Ziel berechnen</span>
      </div>
    </button>
  );
}
