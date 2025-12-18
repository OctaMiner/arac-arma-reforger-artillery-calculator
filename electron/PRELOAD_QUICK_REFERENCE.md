# Preload API - Quick Reference

## Verwendung in React Components

### Basic Usage

```tsx
import { useElectronAPI } from '@/hooks/useElectronAPI'

const MyComponent = () => {
  const api = useElectronAPI()

  const handleAction = async () => {
    const result = await api.loadMissions()
    console.log(result)
  }

  return <button onClick={handleAction}>Load</button>
}
```

### With Loading State

```tsx
import { useElectronData } from '@/hooks/useElectronAPI'

const MyComponent = () => {
  const { data, loading, error } = useElectronData(
    (api) => api.loadMissions()
  )

  if (loading) return <Spinner />
  if (error) return <Error message={error.message} />

  return <List items={data} />
}
```

---

## API Methods (16 total)

### App Info (2)

```tsx
const version = await window.api.getAppVersion()
const path = await window.api.getAppPath()
```

### Settings (2)

```tsx
const settings = await window.api.loadSettings()
await window.api.saveSettings({
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 2
})
```

### User Profile (2)

```tsx
const profile = await window.api.loadUserProfile()
await window.api.saveUserProfile({
  name: 'Player',
  createdAt: new Date().toISOString(),
  preferences: {
    defaultMortarType: 'US',
    defaultAmmo: 'HE'
  },
  statistics: {
    totalShots: 0,
    missionsCreated: 0,
    stationsCreated: 0
  }
})
```

### Missions (4)

```tsx
const missions = await window.api.loadMissions()

await window.api.saveMission({
  id: 'mission-1',
  name: 'Attack Point Alpha',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mapId: 'everon',
  mortarConfig: { type: 'US', ammo: 'HE', charge: 2 },
  mortarPos: { east: 100, north: 100, height: 50 },
  targetPos: { east: 200, north: 200, height: 60 },
  fireSolution: { /* ... */ }
})

await window.api.updateMission(updatedMission)
await window.api.deleteMission('mission-1')
```

### Stations (3)

```tsx
const stations = await window.api.loadStations()

await window.api.saveStation({
  id: 'station-1',
  name: 'Firebase Echo',
  mapId: 'everon',
  position: { east: 100, north: 100, height: 50 },
  defaultConfig: { type: 'US', ammo: 'HE', charge: 2 },
  createdAt: new Date().toISOString()
})

await window.api.deleteStation('station-1')
```

### History (3)

```tsx
const history = await window.api.getHistory({ limit: 10, offset: 0 })

await window.api.addHistory({
  // id und timestamp werden automatisch generiert
  mortarConfig: { type: 'US', ammo: 'HE', charge: 2 },
  mortarPos: { east: 100, north: 100, height: 50 },
  targetPos: { east: 200, north: 200, height: 60 },
  fireSolution: { /* ... */ }
})

await window.api.clearHistory()
```

---

## Error Handling

```tsx
try {
  await window.api.saveMission(mission)
  toast.success('Saved!')
} catch (error) {
  console.error('Error:', error)
  toast.error('Save failed')
}
```

---

## TypeScript Autocomplete

```tsx
window.api. // <- IDE zeigt alle 16 Methoden
            // mit vollständiger Type Info
```

---

## Debugging

```js
// DevTools Console
console.log('API:', window.api)
console.log('Methods:', Object.keys(window.api))

// Test einzelne Methode
await window.api.getAppVersion()
```

---

## Common Patterns

### Load on Mount

```tsx
useEffect(() => {
  window.api.loadSettings().then(setSettings)
}, [])
```

### Save on Change

```tsx
const handleChange = useCallback(async (newSettings) => {
  await window.api.saveSettings(newSettings)
}, [])
```

### Optimistic Update

```tsx
const handleDelete = async (id: string) => {
  // UI sofort aktualisieren
  setMissions(prev => prev.filter(m => m.id !== id))

  try {
    await window.api.deleteMission(id)
  } catch (error) {
    // Rollback bei Fehler
    setMissions(originalMissions)
  }
}
```

---

## Security Check

```js
// Diese sollten ALLE undefined sein:
typeof window.require  // undefined ✅
typeof window.fs       // undefined ✅
typeof window.process  // undefined ✅

// Nur 'api' sollte exposed sein:
typeof window.api      // object ✅
```
