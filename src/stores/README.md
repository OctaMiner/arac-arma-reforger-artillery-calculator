# Zustand Stores - ARAC

Dieses Verzeichnis enthält alle Zustand Stores für das State Management der ARAC App.

## Store Übersicht

### 1. `useAppStore` - Main Application Store
**Verantwortlich für:**
- Mörser-Konfiguration (Typ, Munition, Ladung)
- Mörser- und Ziel-Positionen
- Fire Solution Berechnung
- Ausgewählte Karte

**Verwendung:**
```tsx
import { useAppStore, selectFireSolution } from '@/stores'

const MyComponent = () => {
  const fireSolution = useAppStore(selectFireSolution)
  const setTargetPosition = useAppStore(state => state.setTargetPosition)
  const calculateSolution = useAppStore(state => state.calculateSolution)

  // ...
}
```

### 2. `useMissionsStore` - Missions Management
**Verantwortlich für:**
- Laden gespeicherter Missionen
- Erstellen, Aktualisieren, Löschen von Missionen
- Auswahl aktiver Mission

**Verwendung:**
```tsx
import { useMissionsStore } from '@/stores'

const MissionList = () => {
  const missions = useMissionsStore(state => state.missions)
  const loadMissions = useMissionsStore(state => state.loadMissions)

  useEffect(() => {
    loadMissions()
  }, [loadMissions])

  // ...
}
```

### 3. `useStationsStore` - Mortar Stations
**Verantwortlich für:**
- Laden gespeicherter Mörser-Stellungen
- Erstellen, Löschen von Stellungen
- Filtern nach Karte

**Verwendung:**
```tsx
import { useStationsStore, selectStationsByMap } from '@/stores'

const StationList = ({ mapId }: { mapId: string }) => {
  const stations = useStationsStore(selectStationsByMap(mapId))
  const saveStation = useStationsStore(state => state.saveStation)

  // ...
}
```

### 4. `useHistoryStore` - Calculation History
**Verantwortlich für:**
- Lade-Historie aller Berechnungen
- Hinzufügen neuer Einträge
- Pagination
- Löschen der Historie

**Verwendung:**
```tsx
import { useHistoryStore } from '@/stores'

const History = () => {
  const history = useHistoryStore(state => state.history)
  const loadHistory = useHistoryStore(state => state.loadHistory)
  const addToHistory = useHistoryStore(state => state.addToHistory)

  // Auto-save calculation to history
  useEffect(() => {
    if (fireSolution && mortarPos && targetPos) {
      addToHistory(mortarConfig, mortarPos, targetPos, fireSolution)
    }
  }, [fireSolution])

  // ...
}
```

### 5. `useSpotterStore` - Spotter Mode
**Verantwortlich für:**
- Spotter-Modus aktivieren/deaktivieren
- Spotter-Position und Messungen
- Korrekturen (Links/Rechts, Add/Drop)
- Berechnung korrigierter Zielpositionen

**Verwendung:**
```tsx
import { useSpotterStore, calculateCorrectedTarget } from '@/stores'

const SpotterPanel = () => {
  const spotterMode = useSpotterStore(state => state.spotterMode)
  const corrections = useSpotterStore(state => state.corrections)
  const applyCorrection = useSpotterStore(state => state.applyCorrection)

  const handleCorrection = () => {
    applyCorrection({ leftRight: 10, addDrop: 50 }) // 10m right, 50m add
  }

  // Calculate new target
  const newTarget = calculateCorrectedTarget(
    currentTarget,
    currentAzimuth,
    totalCorrection
  )

  // ...
}
```

### 6. `useUserStore` - User Profile & Settings
**Verantwortlich für:**
- Benutzerprofil und Statistiken
- App-Einstellungen (Theme, Sprache, Defaults)
- Persistierung über Electron API

**Verwendung:**
```tsx
import { useUserStore, selectTheme } from '@/stores'

const Settings = () => {
  const theme = useUserStore(selectTheme)
  const setTheme = useUserStore(state => state.setTheme)
  const incrementShots = useUserStore(state => state.incrementShots)

  // ...
}
```

## Best Practices

### 1. Selektoren verwenden
```tsx
// ✅ Good - verwendet Selektor
const fireSolution = useAppStore(selectFireSolution)

// ❌ Bad - volle Subscription
const fireSolution = useAppStore(state => state.fireSolution)
```

### 2. Actions außerhalb von Render extrahieren
```tsx
// ✅ Good
const Component = () => {
  const setPosition = useAppStore(state => state.setPosition)

  const handleClick = () => {
    setPosition(newPos)
  }
}

// ❌ Bad - Function Instabilität
const Component = () => {
  const handleClick = () => {
    useAppStore.getState().setPosition(newPos)
  }
}
```

### 3. Async Actions mit Error Handling
```tsx
const loadData = async () => {
  try {
    await useMissionsStore.getState().loadMissions()
  } catch (error) {
    console.error('Failed to load missions:', error)
  }
}
```

### 4. DevTools nur in Development
Alle Stores nutzen `devtools()` Middleware, die automatisch in Production deaktiviert wird.

```tsx
// Redux DevTools Extension zeigt alle Stores
// Konfiguriert mit Namen für einfaches Debugging
```

### 5. Optimistic Updates
Stores aktualisieren lokalen State sofort, auch wenn Electron API noch läuft:

```tsx
// Local state wird sofort aktualisiert
set({ missions: [...state.missions, newMission] })

// Electron API läuft asynchron im Hintergrund
await window.api.saveMission(newMission)
```

## Persistierung

- **App State**: Nur in-memory
- **Missions, Stations, History**: Via Electron API (JSON Files)
- **User Settings**: LocalStorage + Electron API
- **User Profile**: Nur Electron API

## Testing

```tsx
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from './useAppStore'

test('calculate fire solution', () => {
  const { result } = renderHook(() => useAppStore())

  act(() => {
    result.current.setMortarPosition(mortarPos)
    result.current.setTargetPosition(targetPos)
    result.current.calculateSolution()
  })

  expect(result.current.fireSolution).toBeDefined()
})
```

## Performance

- Alle Stores nutzen `devtools()` für Debugging
- Selektoren für optimale Re-Render Performance
- Lazy Loading für History (Pagination)
- Debounced Calculations beim Map Dragging (in Components)

## Electron Integration

Alle Stores nutzen `window.api` für Persistierung:

```tsx
// Type-safe dank ElectronAPI Interface
const missions = await window.api.loadMissions()
await window.api.saveMission(mission)
```

Fallback wenn keine Electron API verfügbar:
```tsx
if (!window.api) {
  // Fallback zu Defaults oder Error
  throw new Error('Electron API nicht verfügbar')
}
```
