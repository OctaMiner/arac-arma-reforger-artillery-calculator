/**
 * MapLoadingOverlay - Loading indicator with progress bar
 * Shows actual download progress while map image loads
 */

import { Map } from 'lucide-react';

interface MapLoadingOverlayProps {
  isLoading: boolean;
  progress: number; // 0-100
  mapName?: string;
}

export function MapLoadingOverlay({ isLoading, progress, mapName }: MapLoadingOverlayProps) {
  if (!isLoading) return null;

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-6 p-8 w-80">
        {/* Map Icon */}
        <div className="w-20 h-20 bg-accent-blue/20 rounded-full flex items-center justify-center border-2 border-accent-blue/40">
          <Map className="w-10 h-10 text-accent-blue" />
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-mono font-bold text-text-primary uppercase tracking-wider">
            Lade Karte
          </span>
          {mapName && (
            <span className="text-sm font-mono text-accent-blue">
              {mapName}
            </span>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            {/* Progress Bar Fill */}
            <div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <div className="flex justify-between text-xs font-mono text-text-secondary">
            <span>Fortschritt</span>
            <span className="text-accent-blue font-bold">{Math.round(clampedProgress)}%</span>
          </div>
        </div>

        {/* Status Text */}
        <span className="text-xs text-muted-foreground font-mono">
          {clampedProgress < 100 ? 'Kartendaten werden heruntergeladen...' : 'Karte wird gerendert...'}
        </span>
      </div>
    </div>
  );
}
