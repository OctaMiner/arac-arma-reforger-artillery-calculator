/**
 * StationPanel Component - Container for station management
 *
 * Features:
 * - Section header "Mörser-Stellungen"
 * - StationSaveButton at top
 * - StationList below
 * - Consistent styling with MissionPanel
 * - Green theme for stations vs blue for missions
 */

import { StationSaveButton } from './StationSaveButton'
import { StationList } from './StationList'

export function StationPanel() {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Mörser-Stellungen
        </h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Save Button */}
        <StationSaveButton />

        {/* Stations List */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">
            Gespeicherte Stellungen
          </div>
          <StationList />
        </div>
      </div>
    </div>
  )
}
