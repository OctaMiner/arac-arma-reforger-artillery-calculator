# Zustand Store Usage Examples

## Beispiel 1: Einfache Berechnung

```tsx
import { useAppStore } from '@/stores'

const SimpleCalculator = () => {
  const mortarConfig = useAppStore(state => state.mortarConfig)
  const setMortarPosition = useAppStore(state => state.setMortarPosition)
  const setTargetPosition = useAppStore(state => state.setTargetPosition)
  const calculateSolution = useAppStore(state => state.calculateSolution)
  const fireSolution = useAppStore(state => state.fireSolution)

  const handleCalculate = () => {
    // Set positions
    setMortarPosition({ east: 100, north: 100, height: 50 })
    setTargetPosition({ east: 150, north: 150, height: 55 })

    // Calculate
    calculateSolution()
  }

  return (
    <div>
      <button onClick={handleCalculate}>Calculate</button>
      {fireSolution && (
        <div>
          <p>Azimuth: {fireSolution.azimuthMil} MIL</p>
          <p>Elevation: {fireSolution.elevationAdj} MIL</p>
          <p>Distance: {fireSolution.distance}m</p>
        </div>
      )}
    </div>
  )
}
```

## Beispiel 2: Auto-Calculation mit Custom Hook

```tsx
import { useCalculation } from '@/hooks'
import { useAppStore } from '@/stores'

const AutoCalculator = () => {
  const setMortarPosition = useAppStore(state => state.setMortarPosition)
  const setTargetPosition = useAppStore(state => state.setTargetPosition)

  const { fireSolution, isCalculating, error } = useCalculation({
    autoCalculate: true,  // Auto-berechnen bei Änderungen
    autoHistory: true,    // Auto-speichern in History
    debounceMs: 300,      // Debounce für Map Dragging
    onCalculated: () => {
      console.log('Calculation completed!')
    }
  })

  const handleMapClick = (position) => {
    // Einfach Position setzen - Berechnung erfolgt automatisch!
    setTargetPosition(position)
  }

  return (
    <div>
      {isCalculating && <span>Calculating...</span>}
      {error && <span>Error: {error}</span>}
      {fireSolution && (
        <div>
          <p>Azimuth: {fireSolution.azimuthMil} MIL</p>
          <p>Elevation: {fireSolution.elevationAdj} MIL</p>
        </div>
      )}
    </div>
  )
}
```

## Beispiel 3: Mission speichern und laden

```tsx
import { useMissions } from '@/hooks'
import { useState } from 'react'

const MissionPanel = () => {
  const [missionName, setMissionName] = useState('')

  const {
    missions,
    saveCurrent,
    loadIntoCalculator,
    deleteMissionById,
    canSaveCurrent,
    isLoading
  } = useMissions({
    autoLoad: true,
    mapId: 'everon' // Nur Everon Missionen
  })

  const handleSave = async () => {
    try {
      await saveCurrent(missionName)
      setMissionName('')
      alert('Mission gespeichert!')
    } catch (error) {
      alert('Fehler: ' + error.message)
    }
  }

  return (
    <div>
      {/* Mission speichern */}
      <div>
        <input
          value={missionName}
          onChange={(e) => setMissionName(e.target.value)}
          placeholder="Mission Name"
        />
        <button
          onClick={handleSave}
          disabled={!canSaveCurrent || !missionName}
        >
          Save Current
        </button>
      </div>

      {/* Mission Liste */}
      <div>
        <h3>Saved Missions</h3>
        {isLoading && <p>Loading...</p>}
        {missions.map(mission => (
          <div key={mission.id}>
            <span>{mission.name}</span>
            <button onClick={() => loadIntoCalculator(mission)}>
              Load
            </button>
            <button onClick={() => deleteMissionById(mission.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Beispiel 4: Mortar Stations

```tsx
import { useStations } from '@/hooks'
import { useState } from 'react'

const StationPanel = () => {
  const [stationName, setStationName] = useState('')

  const {
    stations,
    saveCurrentAsStation,
    loadStationIntoCalculator,
    deleteStationById,
    canSaveCurrentAsStation,
    isPositionSaved,
    findNearestStation
  } = useStations({
    autoLoad: true,
    mapId: 'everon'
  })

  const handleSave = async () => {
    try {
      await saveCurrentAsStation(
        stationName,
        true // Include mortar config
      )
      setStationName('')
      alert('Station gespeichert!')
    } catch (error) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleFindNearest = () => {
    const currentPos = { east: 100, north: 100, height: 50 }
    const result = findNearestStation(currentPos)

    if (result) {
      console.log(`Nearest: ${result.station.name} (${result.distance}m away)`)
    }
  }

  return (
    <div>
      {/* Station speichern */}
      <div>
        <input
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          placeholder="Station Name"
        />
        <button
          onClick={handleSave}
          disabled={!canSaveCurrentAsStation || !stationName}
        >
          Save Station
        </button>
      </div>

      {/* Station Liste */}
      <div>
        <h3>Saved Stations</h3>
        {stations.map(station => (
          <div key={station.id}>
            <span>{station.name}</span>
            <button onClick={() => loadStationIntoCalculator(station)}>
              Load
            </button>
            <button onClick={() => deleteStationById(station.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Utilities */}
      <button onClick={handleFindNearest}>
        Find Nearest Station
      </button>
    </div>
  )
}
```

## Beispiel 5: Spotter Mode mit Korrekturen

```tsx
import { useSpotter } from '@/hooks'

const SpotterPanel = () => {
  const {
    isActive,
    toggle,
    corrections,
    totalCorrection,
    correctedTarget,
    applyCorrection,
    applyCorrectedTarget,
    quickCorrection,
    clearCorrections,
    removeLastCorrection,
    canApplyCorrection,
    hasCorrections
  } = useSpotter()

  return (
    <div>
      {/* Spotter Mode Toggle */}
      <button onClick={toggle}>
        {isActive ? 'Disable' : 'Enable'} Spotter Mode
      </button>

      {isActive && (
        <div>
          {/* Quick Corrections */}
          <div>
            <h3>Quick Corrections</h3>
            <button onClick={() => quickCorrection('left', 50)}>
              50m LEFT
            </button>
            <button onClick={() => quickCorrection('right', 50)}>
              50m RIGHT
            </button>
            <button onClick={() => quickCorrection('add', 50)}>
              50m ADD
            </button>
            <button onClick={() => quickCorrection('drop', 50)}>
              50m DROP
            </button>
          </div>

          {/* Manual Correction */}
          <div>
            <h3>Manual Correction</h3>
            <button
              onClick={() =>
                applyCorrection({ leftRight: 10, addDrop: 25 })
              }
            >
              Apply Custom Correction
            </button>
          </div>

          {/* Corrections List */}
          {hasCorrections && (
            <div>
              <h3>Applied Corrections</h3>
              <ul>
                {corrections.map((corr, i) => (
                  <li key={i}>
                    L/R: {corr.leftRight}m, A/D: {corr.addDrop}m
                  </li>
                ))}
              </ul>
              <p>
                Total: L/R {totalCorrection.leftRight}m, A/D{' '}
                {totalCorrection.addDrop}m
              </p>

              {/* Actions */}
              <button onClick={removeLastCorrection}>
                Undo Last
              </button>
              <button onClick={clearCorrections}>
                Clear All
              </button>
              <button
                onClick={applyCorrectedTarget}
                disabled={!canApplyCorrection}
              >
                Apply to Target
              </button>
            </div>
          )}

          {/* Corrected Target Preview */}
          {correctedTarget && (
            <div>
              <h3>New Target Position</h3>
              <p>
                Grid: {correctedTarget.east.toFixed(1)} /{' '}
                {correctedTarget.north.toFixed(1)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

## Beispiel 6: User Settings

```tsx
import { useUserStore } from '@/stores'

const SettingsPanel = () => {
  const theme = useUserStore(state => state.settings.theme)
  const language = useUserStore(state => state.settings.language)
  const showGrid = useUserStore(state => state.settings.showGrid)
  const statistics = useUserStore(state => state.userProfile?.statistics)

  const setTheme = useUserStore(state => state.setTheme)
  const setLanguage = useUserStore(state => state.setLanguage)
  const toggleGrid = useUserStore(state => state.toggleGrid)

  return (
    <div>
      {/* Theme */}
      <div>
        <label>Theme:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label>Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Grid */}
      <div>
        <label>
          <input type="checkbox" checked={showGrid} onChange={toggleGrid} />
          Show Grid
        </label>
      </div>

      {/* Statistics */}
      {statistics && (
        <div>
          <h3>Statistics</h3>
          <p>Total Shots: {statistics.totalShots}</p>
          <p>Missions Created: {statistics.missionsCreated}</p>
          <p>Stations Created: {statistics.stationsCreated}</p>
        </div>
      )}
    </div>
  )
}
```

## Beispiel 7: History mit Pagination

```tsx
import { useHistoryStore } from '@/stores'
import { useEffect } from 'react'

const HistoryPanel = () => {
  const history = useHistoryStore(state => state.history)
  const isLoading = useHistoryStore(state => state.isLoading)
  const hasMore = useHistoryStore(state => state.hasMore)
  const loadHistory = useHistoryStore(state => state.loadHistory)
  const loadMore = useHistoryStore(state => state.loadMore)
  const clearHistory = useHistoryStore(state => state.clearHistory)

  // Initial load
  useEffect(() => {
    loadHistory(50, 0) // Load first 50 entries
  }, [loadHistory])

  return (
    <div>
      <h3>Calculation History</h3>

      {/* History List */}
      <div>
        {history.map(entry => (
          <div key={entry.id}>
            <p>
              {new Date(entry.timestamp).toLocaleString()}
            </p>
            <p>
              Distance: {entry.fireSolution.distance}m
            </p>
            <p>
              Azimuth: {entry.fireSolution.azimuthMil} MIL
            </p>
            <p>
              Elevation: {entry.fireSolution.elevationAdj} MIL
            </p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <button onClick={loadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {/* Clear */}
      <button onClick={clearHistory}>
        Clear History
      </button>
    </div>
  )
}
```

## Beispiel 8: Complete Calculator Component

```tsx
import { useCalculation, useMissions, useStations, useSpotter } from '@/hooks'
import { useAppStore } from '@/stores'

const CompleteCalculator = () => {
  // Main calculation hook
  const {
    fireSolution,
    isCalculating,
    error,
    reset
  } = useCalculation({
    autoCalculate: true,
    autoHistory: true
  })

  // Missions
  const { saveCurrent: saveMission, canSaveCurrent } = useMissions()

  // Stations
  const { saveCurrentAsStation, canSaveCurrentAsStation } = useStations()

  // Spotter
  const { isActive: spotterActive, toggle: toggleSpotter } = useSpotter()

  // App state
  const mortarConfig = useAppStore(state => state.mortarConfig)
  const setMortarType = useAppStore(state => state.setMortarType)
  const setAmmoType = useAppStore(state => state.setAmmoType)
  const setCharge = useAppStore(state => state.setCharge)

  return (
    <div className="calculator">
      {/* Configuration */}
      <div className="config">
        <select
          value={mortarConfig.type}
          onChange={(e) => setMortarType(e.target.value)}
        >
          <option value="US">M252 (US)</option>
          <option value="RUS">2B14 (RUS)</option>
        </select>

        <select
          value={mortarConfig.ammo}
          onChange={(e) => setAmmoType(e.target.value)}
        >
          <option value="HE">HE</option>
          <option value="Smoke">Smoke</option>
          <option value="Illumination">Illumination</option>
        </select>

        <select
          value={mortarConfig.charge}
          onChange={(e) => setCharge(Number(e.target.value))}
        >
          <option value="0">0 Rings</option>
          <option value="1">1 Ring</option>
          <option value="2">2 Rings</option>
          <option value="3">3 Rings</option>
          <option value="4">4 Rings</option>
        </select>
      </div>

      {/* Fire Solution Display */}
      {isCalculating && <div>Calculating...</div>}
      {error && <div className="error">{error}</div>}
      {fireSolution && (
        <div className="solution">
          <div>
            <strong>Azimuth:</strong> {fireSolution.azimuthMil} MIL (
            {fireSolution.azimuthDeg.toFixed(1)}°)
          </div>
          <div>
            <strong>Elevation:</strong> {fireSolution.elevationAdj} MIL
          </div>
          <div>
            <strong>Distance:</strong> {fireSolution.distance}m
          </div>
          <div>
            <strong>Flight Time:</strong> {fireSolution.flightTime}s
          </div>
          {!fireSolution.inRange && (
            <div className="warning">Target out of range!</div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button onClick={reset}>Reset</button>
        <button onClick={toggleSpotter}>
          {spotterActive ? 'Disable' : 'Enable'} Spotter
        </button>
        <button
          onClick={() => saveMission('My Mission')}
          disabled={!canSaveCurrent}
        >
          Save Mission
        </button>
        <button
          onClick={() => saveCurrentAsStation('My Station')}
          disabled={!canSaveCurrentAsStation}
        >
          Save Station
        </button>
      </div>
    </div>
  )
}
```
