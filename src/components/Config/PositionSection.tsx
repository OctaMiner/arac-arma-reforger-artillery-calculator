/**
 * PositionSection Component
 * Combines coordinate and height inputs for mortar or target position
 *
 * Features:
 * - Coordinate and height inputs
 * - Visual indicator when position is set
 * - Hint for map click to set position
 */

import { useTranslation } from 'react-i18next';
import type { Coordinate } from '../../types';
import { CoordinateInput } from './CoordinateInput';
import { HeightInput } from './HeightInput';

interface PositionSectionProps {
  title: string;
  position: Coordinate | null;
  onChange: (position: Coordinate) => void;
  disabled?: boolean;
  /** Show hint for target position (right-click or shift-click) */
  isTarget?: boolean;
}

export function PositionSection({
  title,
  position,
  onChange,
  disabled = false,
  isTarget = false,
}: PositionSectionProps) {
  const { t } = useTranslation();

  const handleHeightChange = (height: number) => {
    onChange({
      east: position?.east ?? 0,
      north: position?.north ?? 0,
      height,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
          {title}
        </h3>
        {position ? (
          <span className="text-green-500 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t('common.set')}
          </span>
        ) : (
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full" />
            {t('common.notSet')}
          </span>
        )}
      </div>

      {/* Hint for setting position on map */}
      {!position && (
        <div
          className={`p-2 rounded border text-xs ${
            isTarget
              ? 'bg-red-950/30 border-red-800 text-red-300'
              : 'bg-blue-950/30 border-blue-800 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{isTarget ? '🎯' : '📍'}</span>
            <div>
              <strong>{t('common.setOnMap')}</strong>
              <div className="mt-1">
                {isTarget ? (
                  <>{t('config.rightClickHint')}</>
                ) : (
                  <>{t('config.leftClickHint')}</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CoordinateInput
        label={t('common.coordinates')}
        position={position}
        onChange={onChange}
        disabled={disabled}
      />

      <HeightInput
        label={t('positions.height')}
        value={position?.height ?? 0}
        onChange={handleHeightChange}
        disabled={disabled}
        showAutoIndicator={true}
      />
    </div>
  );
}
