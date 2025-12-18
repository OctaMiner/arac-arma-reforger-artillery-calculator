# Phase 4.1 - Zustand Store Setup - COMPLETE

## Implementierte Stores

### 1. useAppStore.ts
**Main Application Store - Zentrale App-Logik**

**State:**
- `mortarConfig`: MortarConfig (type, ammo, charge)
- `mortarPosition`: Coordinate | null
- `targetPosition`: Coordinate | null
- `fireSolution`: FireSolution | null
- `selectedMap`: string
- `isCalculating`: boolean
- `error`: string | null

**Actions:**
- `setMortarConfig(config)` - Partielle Config-Updates
- `setMortarType(type)` - Nur Mörser-Typ ändern
- `setAmmoType(ammo)` - Nur Munitionstyp ändern
- `setCharge(charge)` - Nur Ladung ändern
- `setMortarPosition(pos)` - Mörser-Position setzen
- `setTargetPosition(pos)` - Ziel-Position setzen
- `setSelectedMap(mapId)` - Karte wechseln
- `calculateSolution()` - Fire Solution berechnen
- `reset()` - Alles zurücksetzen

**Features:**
- Automatische Berechnung mit `calculateFireSolution()` aus Ballistics Engine
- Error Handling für fehlende Positionen
- Out-of-range Detection
- Redux DevTools Integration

---

### 2. useMissionsStore.ts
**Fire Mission Persistence**

**State:**
- `missions`: FireMission[]
- `selectedMission`: FireMission | null
- `isLoading`: boolean
- `error`: string | null

**Actions:**
- `loadMissions()` - Alle Missionen laden
- `saveMission(missionData)` - Neue Mission speichern
- `updateMission(mission)` - Mission aktualisieren
- `deleteMission(id)` - Mission löschen
- `selectMission(id)` - Mission auswählen
- `clearSelection()` - Auswahl aufheben

**Features:**
- Vollständige Electron API Integration
- Auto-UUID Generation
- Timestamps (createdAt, updatedAt)
- Optimistic UI Updates
- Error Handling

---

### 3. useStationsStore.ts
**Mortar Station Management**

**State:**
- `stations`: MortarStation[]
- `selectedStation`: MortarStation | null
- `isLoading`: boolean
- `error`: string | null

**Actions:**
- `loadStations()` - Alle Stellungen laden
- `saveStation(name, mapId, position, config?)` - Neue Stellung speichern
- `deleteStation(id)` - Stellung löschen
- `selectStation(id)` - Stellung auswählen
- `clearSelection()` - Auswahl aufheben

**Features:**
- Optional: Default Mortar Config pro Station
- Map-Filterung via Selector
- Electron API Integration

---

### 4. useHistoryStore.ts
**Calculation History mit Pagination**

**State:**
- `history`: HistoryEntry[]
- `isLoading`: boolean
- `error`: string | null
- `hasMore`: boolean
- `limit`: number (50)
- `offset`: number

**Actions:**
- `loadHistory(limit?, offset?)` - History laden
- `addToHistory(...)` - Neuen Eintrag hinzufügen
- `clearHistory()` - Alles löschen
- `loadMore()` - Nächste Page laden

**Features:**
- Pagination Support (50 Einträge pro Page)
- Auto-Timestamps via Electron
- Mission-Referenzen
- Corrections tracking
- Filter-Selectors (by Mission, Recent)

---

### 5. useSpotterStore.ts
**Spotter Mode & Target Corrections**

**State:**
- `spotterMode`: boolean
- `spotterPosition`: Coordinate | null
- `spotterMeasurements`: { distance, azimuth } | null
- `corrections`: CorrectionData[]
- `showCorrectionPanel`: boolean

**Actions:**
- `toggleSpotterMode()` - Spotter an/aus
- `setSpotterMode(enabled)` - Explizit setzen
- `setSpotterPosition(pos)` - Spotter-Position
- `setSpotterMeasurements(measurements)` - Vector 21 Daten
- `applyCorrection(correction)` - Korrektur hinzufügen
- `clearCorrections()` - Alle Korrekturen löschen
- `removeLastCorrection()` - Letzte Korrektur rückgängig
- `reset()` - Alles zurücksetzen

**Features:**
- L/R (left/right) Korrekturen
- A/D (add/drop) Korrekturen
- Total Correction Calculator
- `calculateCorrectedTarget()` Helper-Funktion
- Auto-Clear bei Deaktivierung

---

### 6. useUserStore.ts
**User Profile & App Settings**

**State:**
- `userProfile`: UserProfile | null
- `settings`: AppSettings
- `isLoading`: boolean
- `error`: string | null

**Actions (Profile):**
- `loadUserProfile()` - Profil laden
- `saveUserProfile(profile)` - Profil speichern
- `updateStatistics(update)` - Statistiken aktualisieren
- `incrementShots()` - Shot-Counter +1
- `incrementMissions()` - Mission-Counter +1
- `incrementStations()` - Station-Counter +1

**Actions (Settings):**
- `loadSettings()` - Settings laden
- `saveSettings(settings)` - Settings speichern
- `setTheme(theme)` - Dark/Light Theme
- `setLanguage(language)` - DE/EN
- `toggleGrid()` - Grid an/aus
- `setDefaultMortarType(type)` - Default US/RUS
- `setDefaultAmmo(ammo)` - Default Ammo
- `setDefaultCharge(charge)` - Default Charge

**Features:**
- LocalStorage Persist für Settings (zustand/persist)
- Electron API für User Profile
- Auto-Save für Settings
- Statistics Tracking
- Fallback zu Defaults

---

## Composite Hooks

### useCalculation.ts
**All-in-One Calculation Hook**

```tsx
const {
  fireSolution,
  isCalculating,
  error,
  hasResult,
  isInRange,
  calculate,
  calculateDebounced,
  reset,
  setPositionsAndCalculate
} = useCalculation({
  autoCalculate: true,      // Auto bei Änderungen
  autoHistory: true,        // Auto zur History
  debounceMs: 300,          // Debounce für Map Drag
  onCalculated: () => {}    // Callback
})
```

**Features:**
- Auto-Calculation bei Position/Config-Änderung
- Debouncing für Map Dragging Performance
- Auto-Add zu History
- Auto-Increment Shot Counter
- Duplicate Detection

---

### useMissions.ts
**Mission Management Hook**

```tsx
const {
  missions,
  selectedMission,
  isLoading,
  error,
  canSaveCurrent,
  saveCurrent,
  loadIntoCalculator,
  updateCurrent,
  deleteMissionById,
  selectMission,
  clearSelection
} = useMissions({
  autoLoad: true,
  mapId: 'everon'
})
```

**Features:**
- Auto-Load on mount
- Map Filtering
- Save current calculation
- Load mission into calculator
- canSaveCurrent validator

---

### useStations.ts
**Station Management Hook**

```tsx
const {
  stations,
  selectedStation,
  isLoading,
  error,
  canSaveCurrentAsStation,
  saveCurrentAsStation,
  loadStationIntoCalculator,
  deleteStationById,
  getStationById,
  isPositionSaved,
  findNearestStation
} = useStations({
  autoLoad: true,
  mapId: 'everon'
})
```

**Features:**
- Auto-Load on mount
- Map Filtering
- Save current position
- Load station into calculator
- Position duplicate detection
- Nearest station finder

---

### useSpotter.ts
**Spotter Mode Hook**

```tsx
const {
  isActive,
  spotterPosition,
  spotterMeasurements,
  corrections,
  totalCorrection,
  correctedTarget,
  canApplyCorrection,
  hasCorrections,
  toggle,
  enable,
  disable,
  setPosition,
  setMeasurements,
  applyCorrection,
  clearCorrections,
  removeLastCorrection,
  applyCorrectedTarget,
  setTargetFromSpotter,
  calculateTargetFromSpotter,
  quickCorrection
} = useSpotter()
```

**Features:**
- Spotter mode toggle
- Vector 21 integration
- Correction stacking
- Total correction calculator
- Apply to target
- Quick correction shortcuts

---

## Barrel Exports

### src/stores/index.ts
Exportiert alle Stores und Selectors:
- useAppStore + Selectors
- useMissionsStore + Selectors
- useStationsStore + Selectors
- useHistoryStore + Selectors
- useSpotterStore + Selectors + Helper
- useUserStore + Selectors

### src/hooks/index.ts
Exportiert alle Hooks:
- useElectronAPI, useElectronData
- useCalculation
- useMissions
- useStations
- useSpotter
- Re-export aller Stores

---

## Verwendung

### Import Pattern

```tsx
// Stores direkt
import { useAppStore, selectFireSolution } from '@/stores'

// Composite Hooks
import { useCalculation, useMissions } from '@/hooks'

// Oder beides
import { useCalculation, useAppStore } from '@/hooks'
```

### Selector Pattern

```tsx
// ✅ Good - Optimiert
const fireSolution = useAppStore(selectFireSolution)

// ⚠️ OK - Inline Selector
const fireSolution = useAppStore(state => state.fireSolution)

// ❌ Bad - Keine Selector
const { fireSolution } = useAppStore()
```

---

## Performance

### Devtools
- Alle Stores mit `devtools()` Middleware
- Nur in Development aktiv
- Named Stores für einfaches Debugging

### Optimierungen
- Selectors für Re-Render Prevention
- Debounced Calculations (300ms)
- Optimistic UI Updates
- Pagination für History (50 pro Page)
- LocalStorage Persist nur für Settings

### Re-Render Vermeidung
```tsx
// ✅ Nur re-render bei fireSolution-Änderung
const fireSolution = useAppStore(selectFireSolution)

// ❌ Re-render bei jedem Store-Update
const store = useAppStore()
```

---

## Electron Integration

Alle Stores nutzen `window.api` für Persistierung:

```tsx
// Type-safe dank ElectronAPI Interface
const missions = await window.api.loadMissions()
await window.api.saveMission(mission)
```

### Error Handling
```tsx
try {
  await saveMission(mission)
} catch (error) {
  // Error wird im Store State gespeichert
  console.error(error)
}
```

### Fallback
```tsx
if (!window.api) {
  // Settings: Fallback zu Defaults
  // Andere: Error werfen
}
```

---

## Testing

### Store Testing
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

### Hook Testing
```tsx
test('useCalculation auto-calculate', async () => {
  const { result } = renderHook(() => useCalculation())

  act(() => {
    useAppStore.getState().setMortarPosition(mortarPos)
    useAppStore.getState().setTargetPosition(targetPos)
  })

  await waitFor(() => {
    expect(result.current.fireSolution).toBeDefined()
  })
})
```

---

## Dokumentation

- `src/stores/README.md` - Store Overview und Best Practices
- `src/stores/EXAMPLES.md` - 8 vollständige Code-Beispiele
- Inline JSDoc Kommentare in allen Stores
- Type-safe dank TypeScript strict mode

---

## Nächste Schritte (Phase 4.2+)

1. React Components erstellen
2. Map Integration (React-Leaflet)
3. UI Components (TailwindCSS)
4. Keyboard Shortcuts
5. Theme System
6. i18n (DE/EN)

---

## Dependencies

```json
{
  "zustand": "^5.0.9"
}
```

Bereits installiert, keine weiteren Dependencies nötig.

---

## Dateien

```
src/
├── stores/
│   ├── useAppStore.ts        ✅ Main App State
│   ├── useMissionsStore.ts   ✅ Mission Persistence
│   ├── useStationsStore.ts   ✅ Station Management
│   ├── useHistoryStore.ts    ✅ Calculation History
│   ├── useSpotterStore.ts    ✅ Spotter Mode
│   ├── useUserStore.ts       ✅ User Profile & Settings
│   ├── index.ts              ✅ Barrel Export
│   ├── README.md             ✅ Documentation
│   └── EXAMPLES.md           ✅ Code Examples
│
├── hooks/
│   ├── useElectronAPI.ts     ✅ (Already existed)
│   ├── useCalculation.ts     ✅ Composite Hook
│   ├── useMissions.ts        ✅ Mission Hook
│   ├── useStations.ts        ✅ Station Hook
│   ├── useSpotter.ts         ✅ Spotter Hook
│   └── index.ts              ✅ Barrel Export
│
└── types/
    └── index.ts              ✅ (Already existed)
```

---

## Status: ✅ COMPLETE

Alle Stores implementiert und getestet.
Bereit für Integration mit React Components in Phase 4.2.
