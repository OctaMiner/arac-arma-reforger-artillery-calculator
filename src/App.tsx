/**
 * ARAC Main Application
 * Arma Reforger Artillery Calculator
 */

import { Sidebar, MainContent, ResultsBar, FAQ, LanguageSelector } from './components/Layout'
import { ConfigPanel, WindInput } from './components/Config'
import { MissionPanel } from './components/Mission'
import { StationPanel } from './components/Station'
import { SpotterPanel } from './components/Spotter'
import { TrajectoryGraph } from './components/Results'
import { MapView } from './components/Map'
import { useAutoHeight } from './hooks/useAutoHeight'
import { useAutoCalculate } from './hooks/useAutoCalculate'

function App() {
  // Enable automatic height loading when positions change
  useAutoHeight()

  // Enable automatic calculation when data changes
  useAutoCalculate()

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Full Height, Contains Header + Panels */}
      <Sidebar>
        <LanguageSelector />
        <ConfigPanel />
        <MissionPanel />
        <StationPanel />
        <SpotterPanel />
        <WindInput />
        <TrajectoryGraph />
        <FAQ />
      </Sidebar>

      {/* Main Content - Map Area + Results Bar */}
      <MainContent>
        {/* Map - Takes remaining space */}
        <div className="flex-1 relative overflow-hidden">
          <MapView />
        </div>

        {/* Results Bar - At bottom of map area */}
        <ResultsBar />
      </MainContent>
    </div>
  )
}

export default App
