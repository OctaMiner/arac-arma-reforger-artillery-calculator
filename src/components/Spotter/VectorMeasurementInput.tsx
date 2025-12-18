/**
 * VectorMeasurementInput Component
 * Input fields for Vector 21 measurements (Distance and Azimuth)
 */

import { type ChangeEvent } from 'react';
import { useSpotterStore } from '../../stores/useSpotterStore';

export function VectorMeasurementInput() {
  const measurements = useSpotterStore((state) => state.spotterMeasurements);
  const setSpotterMeasurements = useSpotterStore(
    (state) => state.setSpotterMeasurements
  );

  const handleDistanceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const distance = value === '' ? 0 : parseInt(value, 10);
      setSpotterMeasurements({
        distance: Math.min(9999, Math.max(0, distance)),
        azimuth: measurements?.azimuth ?? 0,
      });
    }
  };

  const handleAzimuthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,1})?$/.test(value)) {
      const azimuth = value === '' ? 0 : parseFloat(value);
      setSpotterMeasurements({
        distance: measurements?.distance ?? 0,
        azimuth: Math.min(360, Math.max(0, azimuth)),
      });
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-gray-300 text-xs uppercase font-semibold mb-2">
        Vector 21 Messung
      </label>

      {/* Distance */}
      <div>
        <label className="block text-gray-400 text-xs mb-1 flex items-center justify-between">
          <span>Entfernung (R-Taste)</span>
          <span className="text-[10px] text-gray-500">Meter</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={measurements?.distance ?? ''}
          onChange={handleDistanceChange}
          placeholder="0"
          maxLength={4}
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      {/* Azimuth */}
      <div>
        <label className="block text-gray-400 text-xs mb-1 flex items-center justify-between">
          <span>Azimut (V-Taste)</span>
          <span className="text-[10px] text-gray-500">Grad (0-360)</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={measurements?.azimuth ?? ''}
          onChange={handleAzimuthChange}
          placeholder="0.0"
          maxLength={5}
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      {/* Help Text */}
      <div className="text-[10px] text-gray-500 leading-relaxed">
        <p>R-Taste = Entfernung messen</p>
        <p>V-Taste = Azimut messen</p>
        <p>R + V = Beide gleichzeitig</p>
      </div>
    </div>
  );
}
