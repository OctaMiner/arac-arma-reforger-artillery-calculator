/**
 * MapSelector - Dropdown for selecting different Arma Reforger maps
 * Supports all 24 maps from Gene's CDN
 *
 * Features:
 * - Dark theme styling with TailwindCSS
 * - Map icon for visual clarity
 * - Hover and focus states
 * - Connected to Zustand store (selectedMap)
 * - Displays all available maps from configs (sorted alphabetically)
 * - Height data badge for maps with elevation data
 */

import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { getMapsByCategory, type MapId } from '../../lib/maps';
import { Map, Mountain } from 'lucide-react';

export function MapSelector() {
  const { t } = useTranslation();
  const selectedMap = useAppStore((state) => state.selectedMap);
  const setSelectedMap = useAppStore((state) => state.setSelectedMap);
  const { vanilla, mods } = getMapsByCategory(); // Grouped by category

  const handleMapChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mapId = event.target.value as MapId;
    setSelectedMap(mapId);
  };

  // Get selected map config to show height data badge
  const allMaps = [...vanilla, ...mods];
  const selectedMapConfig = allMaps.find((m) => m.id === selectedMap);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="map-select" className="section-header">
          {t('sidebar.map')}
        </label>
        {selectedMapConfig?.hasHeightData && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <Mountain className="w-3 h-3" />
            <span>{t('sidebar.heightData')}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Map className="w-4 h-4 text-muted-foreground" />
        </div>
        <select
          id="map-select"
          value={selectedMap}
          onChange={handleMapChange}
          className="select-field w-full pl-10 pr-10 py-3 appearance-none font-medium text-sm"
        >
          <optgroup label={t('sidebar.vanilla')}>
            {vanilla.map((map) => (
              <option key={map.id} value={map.id}>
                {map.displayName} {map.hasHeightData ? '⛰️' : ''}
              </option>
            ))}
          </optgroup>
          <optgroup label={t('sidebar.mods')}>
            {mods.map((map) => (
              <option key={map.id} value={map.id}>
                {map.displayName} {map.hasHeightData ? '⛰️' : ''}
              </option>
            ))}
          </optgroup>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
