/**
 * HeightInput Component
 * Reusable component for height (elevation) input
 */

import { type ChangeEvent, useEffect, useState } from 'react';
import { useAutoHeightStatus } from '@/hooks/useAutoHeight';
import { getCacheStats } from '@/lib/maps/heightService';

interface HeightInputProps {
  label: string;
  value: number;
  onChange: (height: number) => void;
  disabled?: boolean;
  /** Show auto-height indicator when height > 0 and auto-height is enabled */
  showAutoIndicator?: boolean;
}

export function HeightInput({
  label,
  value,
  onChange,
  disabled = false,
  showAutoIndicator = false,
}: HeightInputProps) {
  const { enabled: autoHeightEnabled, mapName } = useAutoHeightStatus();
  const [cacheStatus, setCacheStatus] = useState<string>('');

  // Update cache status periodically
  useEffect(() => {
    const updateStatus = () => {
      const stats = getCacheStats();
      if (stats.loaded > 0) {
        setCacheStatus(`✓ ${stats.loaded} Karten geladen`);
      } else if (stats.loading > 0) {
        setCacheStatus('⏳ Lädt...');
      } else {
        setCacheStatus('');
      }
    };
    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow negative values (e.g., -190m below sea level)
    if (inputValue === '' || inputValue === '-' || /^-?\d+$/.test(inputValue)) {
      const height =
        inputValue === '' || inputValue === '-' ? 0 : parseInt(inputValue, 10);
      onChange(Math.min(1000, Math.max(-500, height)));
    }
  };

  const showAutoTag = showAutoIndicator && autoHeightEnabled && value > 0;

  return (
    <div>
      <label className="block text-gray-400 text-xs uppercase mb-2 font-medium flex items-center justify-between">
        <span>{label}</span>
        {showAutoTag && (
          <span className="text-[10px] px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full border border-green-700/50 normal-case font-normal flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Auto
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="-?[0-9]*"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0"
          maxLength={5}
          className="w-full px-3 py-2 pr-8 bg-gray-800 border border-gray-600 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
          m
        </span>
      </div>
      <p className="text-gray-600 text-[10px] mt-1">
        {autoHeightEnabled ? (
          <span className="flex items-center gap-2">
            <span>Auto-Höhe aktiv ({mapName})</span>
            {cacheStatus && (
              <span className="text-green-500">{cacheStatus}</span>
            )}
          </span>
        ) : (
          <>Keine Höhendaten für diese Karte</>
        )}
      </p>
    </div>
  );
}
