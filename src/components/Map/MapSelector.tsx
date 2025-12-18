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

import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../stores/useAppStore'
import { getMapsByCategory, type MapId } from '../../lib/maps'
import { Map, Mountain } from 'lucide-react'

export function MapSelector() {
  const { t } = useTranslation()
  const selectedMap = useAppStore((state) => state.selectedMap)
  const setSelectedMap = useAppStore((state) => state.setSelectedMap)
  const { vanilla, mods } = getMapsByCategory() // Grouped by category

  const handleMapChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mapId = event.target.value as MapId
    setSelectedMap(mapId)
  }

  // Get selected map config to show height data badge
  const allMaps = [...vanilla, ...mods]
  const selectedMapConfig = allMaps.find(m => m.id === selectedMap)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="map-select" className="block text-gray-400 text-xs uppercase font-medium">
          {t('sidebar.map')}
        </label>
        {selectedMapConfig?.hasHeightData && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Mountain className="w-3 h-3" />
            <span>{t('sidebar.heightData')}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Map className="w-4 h-4 text-gray-400" />
        </div>
        <select
          id="map-select"
          value={selectedMap}
          onChange={handleMapChange}
          className="
            w-full
            pl-10 pr-10 py-3
            bg-gray-800
            border border-gray-700
            text-white
            rounded
            appearance-none
            cursor-pointer
            transition-all duration-150 ease-in-out
            hover:bg-gray-750
            hover:border-gray-600
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-transparent
            font-medium
            text-sm
          "
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
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
