/**
 * SpotterToggle Component
 * Toggle switch to enable/disable Spotter Mode
 */

import { useSpotterStore } from '../../stores/useSpotterStore';

export function SpotterToggle() {
  const spotterMode = useSpotterStore((state) => state.spotterMode);
  const toggleSpotterMode = useSpotterStore((state) => state.toggleSpotterMode);

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Spotter-Modus
        </h3>
        <p className="text-xs text-muted-foreground">
          Zielberechnung mit Vector 21 Fernglas
        </p>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={toggleSpotterMode}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          ${spotterMode ? 'bg-amber-600 shadow-lg shadow-amber-600/30' : 'bg-muted'}
        `}
        role="switch"
        aria-checked={spotterMode}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${spotterMode ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
