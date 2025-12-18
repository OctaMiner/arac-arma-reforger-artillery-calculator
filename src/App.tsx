/**
 * ARAC Main Application
 * Arma Reforger Artillery Calculator
 */

import { useState } from 'react';
import {
  Sidebar,
  MainContent,
  ResultsBar,
  FAQ,
  LanguageSelector,
} from './components/Layout';
import { ConfigPanel, WindInput } from './components/Config';
import { MissionPanel, MissionSaveDialog } from './components/Mission';
import { StationPanel } from './components/Station';
import { SpotterPanel } from './components/Spotter';
import { HistoryPanel } from './components/History';
import { ProfilePanel } from './components/Profile';
import { TrajectoryGraph } from './components/Results';
import { MapView } from './components/Map';
import { ToastContainer } from './components/UI/Toast';
import { SectionErrorBoundary } from './components/ErrorBoundary';
import { useAutoHeight } from './hooks/useAutoHeight';
import { useAutoCalculate } from './hooks/useAutoCalculate';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useInitialize } from './hooks/useInitialize';

/**
 * Loading Screen Component
 * Displayed during app initialization
 */
function LoadingScreen({ error }: { error?: string | null }) {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-destructive">
              Fehler beim Laden
            </h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Neu laden
            </button>
          </>
        ) : (
          <>
            <div className="text-primary text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold">ARAC wird geladen...</h2>
            <p className="text-muted-foreground">
              Artillery Calculator initialisiert
            </p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  // Initialize app - load all persisted data
  const { isInitialized, isLoading, error } = useInitialize();

  // State for Save Mission Dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Enable automatic height loading when positions change
  useAutoHeight();

  // Enable automatic calculation when data changes
  useAutoCalculate();

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    onEscape: () => setShowSaveDialog(false),
    onSaveShortcut: () => setShowSaveDialog(true),
    // Note: Ring count shortcuts (1-5) work automatically
  });

  // Show loading screen during initialization
  if (isLoading || !isInitialized) {
    return <LoadingScreen error={error} />;
  }

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Sidebar - Full Height, Contains Header + Panels */}
        <Sidebar>
          <LanguageSelector />

          <SectionErrorBoundary section="config">
            <ConfigPanel />
          </SectionErrorBoundary>

          <SectionErrorBoundary section="spotter">
            <SpotterPanel />
          </SectionErrorBoundary>

          <WindInput />
          <TrajectoryGraph />

          <SectionErrorBoundary section="mission">
            <MissionPanel />
          </SectionErrorBoundary>

          <SectionErrorBoundary section="station">
            <StationPanel />
          </SectionErrorBoundary>

          <HistoryPanel />
          <ProfilePanel />
          <FAQ />
        </Sidebar>

        {/* Main Content - Map Area + Results Bar */}
        <MainContent>
          {/* Map - Takes remaining space */}
          <div className="flex-1 relative overflow-hidden">
            <SectionErrorBoundary section="map">
              <MapView />
            </SectionErrorBoundary>
          </div>

          {/* Results Bar - At bottom of map area */}
          <SectionErrorBoundary section="results">
            <ResultsBar />
          </SectionErrorBoundary>
        </MainContent>
      </div>

      {/* Mission Save Dialog - Triggered by Ctrl+S */}
      {showSaveDialog && (
        <MissionSaveDialog onClose={() => setShowSaveDialog(false)} />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </>
  );
}

export default App;
