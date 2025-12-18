/**
 * HeightDiffInput Component
 * Input field for height difference between spotter and target
 * Optional field - improves target accuracy when spotter is elevated
 */

import { type ChangeEvent } from 'react';
import { useSpotterStore } from '../../stores/useSpotterStore';

export function HeightDiffInput() {
  const spotterPosition = useSpotterStore((state) => state.spotterPosition);
  const setSpotterPosition = useSpotterStore(
    (state) => state.setSpotterPosition
  );

  const handleHeightDiffChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty, negative numbers, and positive numbers (with optional decimal)
    if (value === '' || value === '-' || /^-?\d*\.?\d{0,1}$/.test(value)) {
      const heightDiff = value === '' || value === '-' ? 0 : parseFloat(value);

      if (spotterPosition) {
        setSpotterPosition({
          ...spotterPosition,
          heightDiff: isNaN(heightDiff) ? 0 : Math.min(999, Math.max(-999, heightDiff)),
        });
      }
    }
  };

  if (!spotterPosition) return null;

  return (
    <div className="space-y-2">
      <label className="block text-gray-300 text-xs uppercase font-semibold">
        Höhendifferenz (Optional)
      </label>

      <div>
        <label className="block text-gray-400 text-xs mb-1 flex items-center justify-between">
          <span>Höhe über/unter Ziel</span>
          <span className="text-[10px] text-gray-500">Meter</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={
            spotterPosition.heightDiff !== undefined
              ? spotterPosition.heightDiff
              : ''
          }
          onChange={handleHeightDiffChange}
          placeholder="0.0"
          maxLength={6}
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      {/* Help Text */}
      <div className="text-[10px] text-gray-500 leading-relaxed">
        <p>+ = Spotter über Ziel (erhöht)</p>
        <p>- = Spotter unter Ziel (tiefer)</p>
        <p>Leer = keine Korrektur</p>
      </div>
    </div>
  );
}
