# Preload Script - Test Guide

## Manueller Test

### 1. App starten
```bash
npm run dev
```

### 2. DevTools öffnen
`Ctrl+Shift+I` (Windows) oder `Cmd+Option+I` (Mac)

### 3. Console Tests

#### API verfügbar?
```js
console.log('API verfügbar:', typeof window.api)
// Erwartet: "object"
```

#### Alle Methoden vorhanden?
```js
console.log(Object.keys(window.api))
// Erwartet: Array mit allen 16 Methoden
```

#### App Version laden
```js
window.api.getAppVersion().then(v => console.log('Version:', v))
// Erwartet: "1.0.0" oder ähnlich
```

#### Settings laden (sollte Defaults zurückgeben)
```js
window.api.loadSettings().then(s => console.log('Settings:', s))
// Erwartet: AppSettings Object
```

#### Mission speichern
```js
const testMission = {
  id: 'test-1',
  name: 'Test Mission',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mapId: 'everon',
  mortarConfig: {
    type: 'US',
    ammo: 'HE',
    charge: 2
  },
  mortarPos: { east: 100, north: 100, height: 50 },
  targetPos: { east: 200, north: 200, height: 60 },
  fireSolution: {
    azimuthDeg: 45,
    azimuthMil: 800,
    elevationBase: 1200,
    elevationAdj: 1220,
    deltaElev: 20,
    distance: 1414,
    flightTime: 30,
    ringCount: 2,
    inRange: true
  }
}

window.api.saveMission(testMission).then(() => {
  console.log('Mission gespeichert!')
  return window.api.loadMissions()
}).then(missions => {
  console.log('Missions:', missions)
})
```

#### History Test
```js
window.api.addHistory({
  mortarConfig: { type: 'US', ammo: 'HE', charge: 2 },
  mortarPos: { east: 100, north: 100, height: 50 },
  targetPos: { east: 200, north: 200, height: 60 },
  fireSolution: {
    azimuthDeg: 45,
    azimuthMil: 800,
    elevationBase: 1200,
    elevationAdj: 1220,
    deltaElev: 20,
    distance: 1414,
    flightTime: 30,
    ringCount: 2,
    inRange: true
  }
}).then(() => {
  console.log('History Entry hinzugefügt!')
  return window.api.getHistory({ limit: 10 })
}).then(history => {
  console.log('History:', history)
})
```

## TypeScript Checks

### 1. Type-Safety in React Component
```tsx
// src/test/APITest.tsx
import { useElectronAPI } from '@/hooks/useElectronAPI'

export const APITest = () => {
  const api = useElectronAPI()

  const testAPI = async () => {
    // TypeScript sollte hier autocomplete geben
    const version = await api.getAppVersion()
    const settings = await api.loadSettings()

    // TypeScript sollte Fehler zeigen bei falschen Types:
    // @ts-expect-error - sollte Fehler geben
    await api.saveSettings({ invalid: 'data' })
  }

  return <button onClick={testAPI}>Test API</button>
}
```

### 2. Type-Safety prüfen
```bash
# TypeScript Compiler sollte keine Fehler zeigen
npx tsc --noEmit
```

## Security Checks

### 1. Node.js APIs nicht verfügbar
```js
// Diese sollten ALLE undefined sein:
console.log('fs:', typeof window.fs)              // undefined
console.log('require:', typeof window.require)    // undefined
console.log('process:', typeof window.process)    // undefined
console.log('Buffer:', typeof window.Buffer)      // undefined
```

### 2. Nur whitelisted API verfügbar
```js
// Nur 'api' sollte verfügbar sein, nichts anderes
console.log(Object.keys(window).filter(k => k.includes('electron') || k === 'api'))
// Erwartet: ['api']
```

## Häufige Fehler

### "window.api is undefined"
- Prüfe ob preload.ts in main.ts korrekt eingebunden ist
- Prüfe ob webPreferences.preload auf preload.js zeigt

### "contextBridge is not defined"
- contextIsolation muss true sein in BrowserWindow

### TypeScript Fehler "Property 'api' does not exist"
- Prüfe ob electron.d.ts in src/ liegt
- Prüfe ob tsconfig.json "src" inkludiert
- VS Code neu laden

## Erfolg-Kriterien

- [ ] window.api ist verfügbar
- [ ] Alle 16 Methoden funktionieren
- [ ] TypeScript gibt keine Fehler
- [ ] Autocomplete funktioniert in IDE
- [ ] Keine Node.js APIs sind exposed
- [ ] Security Settings sind korrekt
