/**
 * MapControls - UI controls overlay for the map
 * Provides toggles for grid, range circles, and other map features
 */

import { Grid3x3 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const MapControls = () => {
  const showGrid = useAppStore((state) => state.showGrid);
  const toggleGrid = useAppStore((state) => state.toggleGrid);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Grid Toggle Button */}
      <button
        onClick={toggleGrid}
        className={`
          px-3 py-2 rounded-lg backdrop-blur-md text-sm font-medium
          transition-all duration-200 shadow-lg
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          ${
            showGrid
              ? 'bg-primary/90 text-primary-foreground hover:bg-primary shadow-primary/30'
              : 'bg-card/90 text-foreground hover:bg-card/80 hover:border-primary/40'
          }
        `}
        title={showGrid ? 'Grid ausblenden' : 'Grid einblenden'}
      >
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          <span>Grid</span>
        </div>
      </button>
    </div>
  );
};

export default MapControls;
