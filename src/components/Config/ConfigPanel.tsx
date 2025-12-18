/**
 * ConfigPanel Component
 * Main container for all configuration components
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { MortarTypeSelector } from './MortarTypeSelector';
import { AmmoTypeSelector } from './AmmoTypeSelector';
import { PositionSection } from './PositionSection';
import { MapSelector } from '../Map';
import { QuickStationSelect } from '../Station';
import type { Coordinate } from '../../types';

export function ConfigPanel() {
  const { t } = useTranslation();
  const mortarConfig = useAppStore((state) => state.mortarConfig);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);
  const isCalculating = useAppStore((state) => state.isCalculating);

  const setMortarType = useAppStore((state) => state.setMortarType);
  const setAmmoType = useAppStore((state) => state.setAmmoType);
  const setMortarPosition = useAppStore((state) => state.setMortarPosition);
  const setTargetPosition = useAppStore((state) => state.setTargetPosition);

  // Note: Auto-calculation is now handled by useAutoCalculate hook in App.tsx

  const handleMortarPositionChange = (position: Coordinate) => {
    setMortarPosition(position);
  };

  const handleTargetPositionChange = (position: Coordinate) => {
    setTargetPosition(position);
  };

  return (
    <div className="space-y-6">
      {/* Map Selection */}
      <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 uppercase tracking-wide">
          {t('sidebar.map')}
        </h2>
        <MapSelector />
      </div>

      {/* Mortar Configuration Section */}
      <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 uppercase tracking-wide">
          {t('config.mortarConfig')}
        </h2>

        <div className="space-y-4">
          <MortarTypeSelector
            value={mortarConfig.type}
            onChange={setMortarType}
            disabled={isCalculating}
          />

          <AmmoTypeSelector
            value={mortarConfig.ammo}
            onChange={setAmmoType}
            disabled={isCalculating}
          />
        </div>
      </div>

      {/* Position Section */}
      <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 uppercase tracking-wide">
          {t('config.positions')}
        </h2>

        <div className="space-y-5">
          {/* Quick Station Select */}
          <QuickStationSelect />

          <div className="border-t border-gray-700 pt-5">
            <PositionSection
              title={t('config.mortarPosition')}
              position={mortarPosition}
              onChange={handleMortarPositionChange}
              disabled={isCalculating}
              isTarget={false}
            />
          </div>

          <div className="border-t border-gray-700 pt-5">
            <PositionSection
              title={t('config.targetPosition')}
              position={targetPosition}
              onChange={handleTargetPositionChange}
              disabled={isCalculating}
              isTarget={true}
            />
          </div>
        </div>
      </div>

      {/* Calculation Status */}
      {isCalculating && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-400 text-sm">
              {t('common.calculating')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
