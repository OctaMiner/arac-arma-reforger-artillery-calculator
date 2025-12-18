/**
 * MapControls - UI controls overlay for the map
 * Provides toggles for grid, range circles, and other map features
 */

import { useAppStore } from '../../stores/useAppStore'

const MapControls = () => {
  const showGrid = useAppStore((state) => state.showGrid)
  const toggleGrid = useAppStore((state) => state.toggleGrid)

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Grid Toggle Button */}
      <button
        onClick={toggleGrid}
        className={`
          px-3 py-2 rounded-lg backdrop-blur-md text-sm font-medium
          transition-all duration-200 shadow-lg
          ${
            showGrid
              ? 'bg-green-600/90 text-white hover:bg-green-700/90'
              : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700/90'
          }
        `}
        title={showGrid ? 'Grid ausblenden' : 'Grid einblenden'}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5h16M4 12h16M4 19h16"
            />
          </svg>
          <span>Grid</span>
        </div>
      </button>
    </div>
  )
}

export default MapControls
