# Preload Script - Context Bridge API

## Übersicht

Das Preload Script (`preload.ts`) ist die **sichere Brücke** zwischen dem Electron Main Process und dem React Renderer Process.

### Architektur

```
┌─────────────────────┐
│   React App         │
│   (Renderer)        │
│   - Kein Node.js    │
│   - Nur Browser API │
└──────────┬──────────┘
           │
           │ window.api.loadSettings()
           │
┌──────────▼──────────┐
│   Preload Script    │
│   (preload.ts)      │
│   - contextBridge   │
│   - IPC invoke      │
└──────────┬──────────┘
           │
           │ ipcRenderer.invoke('load-settings')
           │
┌──────────▼──────────┐
│   Main Process      │
│   (main.ts)         │
│   - IPC Handler     │
│   - File System     │
└─────────────────────┘
```

## Sicherheit (KRITISCH!)

### Security Settings in main.ts

```typescript
webPreferences: {
  contextIsolation: true,    // ✅ MUSS true sein
  nodeIntegration: false,    // ✅ MUSS false sein
  sandbox: true,             // ✅ MUSS true sein
  preload: path.join(__dirname, 'preload.js')
}
```

### Was diese Settings bedeuten

| Setting | Wert | Bedeutung |
|---------|------|-----------|
| `contextIsolation` | `true` | Renderer hat KEINEN direkten Zugriff auf Electron/Node.js APIs |
| `nodeIntegration` | `false` | `require()`, `fs`, `path` etc. sind NICHT im Renderer verfügbar |
| `sandbox` | `true` | Chromium Sandbox isoliert Renderer-Prozess komplett |

**Warum?** Verhindert XSS-Angriffe, Code Injection und Supply Chain Attacks.

## API Struktur

### Exposed API (window.api)

```typescript
window.api = {
  // App Info (2 Methoden)
  getAppVersion: () => Promise<string>
  getAppPath: () => Promise<string>

  // Settings (2 Methoden)
  loadSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>

  // User Profile (2 Methoden)
  loadUserProfile: () => Promise<UserProfile | null>
  saveUserProfile: (profile: UserProfile) => Promise<void>

  // Missions (4 Methoden)
  loadMissions: () => Promise<FireMission[]>
  saveMission: (mission: FireMission) => Promise<void>
  updateMission: (mission: FireMission) => Promise<void>
  deleteMission: (id: string) => Promise<void>

  // Stations (3 Methoden)
  loadStations: () => Promise<MortarStation[]>
  saveStation: (station: MortarStation) => Promise<void>
  deleteStation: (id: string) => Promise<void>

  // History (3 Methoden)
  getHistory: (params?: { limit?: number; offset?: number }) => Promise<HistoryEntry[]>
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<void>
  clearHistory: () => Promise<void>
}
```

**Gesamt: 16 Methoden** - Whitelist, nichts anderes ist exposed!

## Verwendung in React

### 1. Hook nutzen (empfohlen)

```tsx
import { useElectronAPI } from '@/hooks/useElectronAPI'

const MyComponent = () => {
  const api = useElectronAPI()

  const handleSave = async () => {
    try {
      await api.saveSettings({
        theme: 'dark',
        language: 'de',
        // ...
      })
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### 2. Mit Loading State

```tsx
import { useElectronData } from '@/hooks/useElectronAPI'

const MissionsList = () => {
  const { data: missions, loading, error } = useElectronData(
    (api) => api.loadMissions(),
    [] // deps
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {missions?.map(m => <li key={m.id}>{m.name}</li>)}
    </ul>
  )
}
```

### 3. Direkter Zugriff (wenn nötig)

```tsx
const handleQuickAction = async () => {
  const version = await window.api.getAppVersion()
  console.log('App Version:', version)
}
```

## TypeScript Integration

### Type-Safety

Die API ist vollständig typisiert:

```typescript
// ✅ TypeScript weiß: settings ist AppSettings
const settings = await window.api.loadSettings()

// ✅ Autocomplete für alle Methoden
window.api. // <- IDE zeigt alle 16 Methoden

// ❌ TypeScript Fehler: falscher Type
await window.api.saveSettings({ invalid: 'data' })
```

### Type Definition Files

1. **electron/preload.ts** - Implementierung + Export `ElectronAPI`
2. **src/types/index.ts** - Interface `ElectronAPI` Definition
3. **src/electron.d.ts** - Global Window Declaration

## IPC Flow Beispiel

### Beispiel: Mission speichern

```typescript
// 1. React Component
await window.api.saveMission(mission)
          ↓
// 2. Preload Script
ipcRenderer.invoke('save-mission', mission)
          ↓
// 3. Main Process (ipc-handlers.ts)
ipcMain.handle('save-mission', async (_, mission) => {
  const storage = new StorageManager('missions.json')
  await storage.save(mission)
})
```

## Fehlerbehandlung

### In React Components

```tsx
try {
  await window.api.saveMission(mission)
  toast.success('Mission gespeichert!')
} catch (error) {
  // Fehler vom Main Process wird hier gefangen
  console.error('Save failed:', error)
  toast.error('Fehler beim Speichern')
}
```

### Im Preload Script

KEINE try/catch nötig - Fehler werden automatisch vom Main Process zum Renderer propagiert.

## Testing

### DevTools Console Test

```js
// API verfügbar?
console.log(typeof window.api) // "object"

// Methoden vorhanden?
console.log(Object.keys(window.api).length) // 16

// Version laden
await window.api.getAppVersion() // "1.0.0"
```

Siehe `electron/preload.test.md` für vollständige Test-Suite.

## Debugging

### Häufige Fehler

#### "window.api is undefined"
- **Ursache:** Preload Script nicht geladen
- **Fix:** Prüfe `webPreferences.preload` in main.ts

#### "contextBridge is not defined"
- **Ursache:** `contextIsolation` ist false
- **Fix:** Setze `contextIsolation: true` in main.ts

#### TypeScript Fehler "Property 'api' does not exist"
- **Ursache:** Type Declaration nicht gefunden
- **Fix:**
  - Prüfe ob `src/electron.d.ts` existiert
  - VS Code neu laden (`Cmd+Shift+P` -> "Reload Window")

## Best Practices

### ✅ DO

- Nutze `useElectronAPI()` Hook in Components
- Verwende TypeScript für Type-Safety
- Handle Errors mit try/catch
- Validiere Daten im Main Process

### ❌ DON'T

- NIEMALS `contextIsolation: false` setzen
- NIEMALS `nodeIntegration: true` setzen
- NIEMALS eval() oder new Function() im Preload
- NIEMALS unvalidierte Daten vom Renderer akzeptieren

## Erweiterung

### Neue API-Methode hinzufügen

1. **IPC Channel definieren** (`electron/types/ipc.ts`)
```typescript
export const IPC_CHANNELS = {
  // ...
  MY_NEW_CHANNEL: 'my-new-channel'
}
```

2. **Handler implementieren** (`electron/ipc-handlers.ts`)
```typescript
ipcMain.handle('my-new-channel', async (_, data) => {
  // Implementation
})
```

3. **Preload API erweitern** (`electron/preload.ts`)
```typescript
const api = {
  // ...
  myNewMethod: (data) => ipcRenderer.invoke('my-new-channel', data)
}
```

4. **Type hinzufügen** (`src/types/index.ts`)
```typescript
export interface ElectronAPI {
  // ...
  myNewMethod: (data: MyType) => Promise<MyReturnType>
}
```

## Referenzen

- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Bridge API](https://www.electronjs.org/docs/latest/api/context-bridge)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
