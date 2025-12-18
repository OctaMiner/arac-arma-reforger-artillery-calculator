# ARAC IPC API Reference

Referenz-Dokumentation für alle IPC Handler zwischen Main Process und Renderer Process.

## Channel Overview

| Channel | Request | Response | Kategorie |
|---------|---------|----------|-----------|
| `save-settings` | AppSettings | void | Settings |
| `load-settings` | void | AppSettings | Settings |
| `save-user-profile` | UserProfile | void | Profile |
| `load-user-profile` | void | UserProfile\|null | Profile |
| `save-mission` | FireMission | void | Missions |
| `load-missions` | void | FireMission[] | Missions |
| `delete-mission` | string | void | Missions |
| `update-mission` | FireMission | void | Missions |
| `save-station` | MortarStation | void | Stations |
| `load-stations` | void | MortarStation[] | Stations |
| `delete-station` | string | void | Stations |
| `add-history` | HistoryEntry (ohne id/timestamp) | void | History |
| `get-history` | {limit?, offset?} | HistoryEntry[] | History |
| `clear-history` | void | void | History |
| `get-app-version` | void | string | App Info |
| `get-app-path` | void | string | App Info |

## Settings Management

### save-settings

Speichert App-Einstellungen persistent.

**Channel:** `save-settings`

**Request:**
```typescript
{
  theme: 'dark' | 'light',
  language: 'de' | 'en',
  showGrid: boolean,
  defaultMortarType: 'US' | 'RUS',
  defaultAmmo: 'HE' | 'Smoke' | 'Illumination',
  defaultCharge: 0 | 1 | 2 | 3 | 4
}
```

**Response:** `void`

**Validierung:**
- Alle Felder müssen vorhanden sein
- Theme muss 'dark' oder 'light' sein
- Language muss 'de' oder 'en' sein
- defaultCharge muss 0-4 sein

**Beispiel:**
```typescript
await window.api.saveSettings({
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 4
});
```

### load-settings

Lädt App-Einstellungen. Liefert Defaults beim ersten Start.

**Channel:** `load-settings`

**Request:** `void`

**Response:**
```typescript
{
  theme: 'dark' | 'light',
  language: 'de' | 'en',
  showGrid: boolean,
  defaultMortarType: 'US' | 'RUS',
  defaultAmmo: 'HE' | 'Smoke' | 'Illumination',
  defaultCharge: 0 | 1 | 2 | 3 | 4
}
```

**Defaults:**
```typescript
{
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 4
}
```

**Beispiel:**
```typescript
const settings = await window.api.loadSettings();
console.log(settings.theme); // 'dark'
```

## User Profile Management

### save-user-profile

Speichert User-Profil persistent.

**Channel:** `save-user-profile`

**Request:**
```typescript
{
  name: string,
  createdAt: string,  // ISO Date
  preferences: {
    defaultMortarType: 'US' | 'RUS',
    defaultAmmo: 'HE' | 'Smoke' | 'Illumination'
  },
  statistics: {
    totalShots: number,
    missionsCreated: number,
    stationsCreated: number
  }
}
```

**Response:** `void`

**Validierung:**
- Name darf nicht leer sein
- createdAt muss vorhanden sein
- preferences und statistics müssen Objects sein

**Beispiel:**
```typescript
await window.api.saveUserProfile({
  name: 'Commander Jones',
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
});
```

### load-user-profile

Lädt User-Profil. Kann null sein wenn noch nicht erstellt.

**Channel:** `load-user-profile`

**Request:** `void`

**Response:**
```typescript
{
  name: string,
  createdAt: string,
  preferences: {
    defaultMortarType: 'US' | 'RUS',
    defaultAmmo: 'HE' | 'Smoke' | 'Illumination'
  },
  statistics: {
    totalShots: number,
    missionsCreated: number,
    stationsCreated: number
  }
} | null
```

**Beispiel:**
```typescript
const profile = await window.api.loadUserProfile();
if (profile) {
  console.log(`Welcome back, ${profile.name}!`);
} else {
  console.log('No profile found. Please create one.');
}
```

## Mission Management

### save-mission

Speichert oder updated eine Fire Mission.

**Channel:** `save-mission`

**Request:**
```typescript
{
  id: string,
  name: string,
  createdAt: string,
  updatedAt: string,
  mapId: string,
  mortarConfig: {
    type: 'US' | 'RUS',
    ammo: 'HE' | 'Smoke' | 'Illumination',
    charge: 0 | 1 | 2 | 3 | 4
  },
  mortarPos: {
    east: number,
    north: number,
    height: number
  },
  targetPos: {
    east: number,
    north: number,
    height: number
  },
  fireSolution: {
    azimuthDeg: number,
    azimuthMil: number,
    elevationBase: number,
    elevationAdj: number,
    deltaElev: number,
    distance: number,
    flightTime: number,
    ringCount: 0 | 1 | 2 | 3 | 4,
    inRange: boolean
  }
}
```

**Response:** `void`

**Verhalten:**
- Wenn Mission mit ID existiert: Update (updatedAt wird gesetzt)
- Wenn Mission neu: Create

**Validierung:**
- Alle Top-Level Felder müssen vorhanden sein
- id, name, mapId dürfen nicht leer sein
- mortarConfig, mortarPos, targetPos, fireSolution müssen Objects sein

**Beispiel:**
```typescript
await window.api.saveMission({
  id: 'mission-001',
  name: 'Operation Alpha',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mapId: 'everon',
  mortarConfig: { type: 'US', ammo: 'HE', charge: 4 },
  mortarPos: { east: 1234, north: 5678, height: 100 },
  targetPos: { east: 2234, north: 6678, height: 150 },
  fireSolution: {
    azimuthDeg: 45,
    azimuthMil: 800,
    elevationBase: 1200,
    elevationAdj: 1250,
    deltaElev: 50,
    distance: 1000,
    flightTime: 15.5,
    ringCount: 4,
    inRange: true
  }
});
```

### load-missions

Lädt alle gespeicherten Fire Missions.

**Channel:** `load-missions`

**Request:** `void`

**Response:** `FireMission[]` (leeres Array wenn keine vorhanden)

**Beispiel:**
```typescript
const missions = await window.api.loadMissions();
console.log(`Found ${missions.length} missions`);
missions.forEach(m => console.log(`- ${m.name}`));
```

### delete-mission

Löscht eine Fire Mission permanent.

**Channel:** `delete-mission`

**Request:** `string` (Mission ID)

**Response:** `void`

**Validierung:**
- ID darf nicht leer sein

**Beispiel:**
```typescript
await window.api.deleteMission('mission-001');
console.log('Mission deleted');
```

### update-mission

Explizit eine Mission updaten. Wirft Fehler wenn Mission nicht existiert.

**Channel:** `update-mission`

**Request:** `FireMission` (siehe save-mission)

**Response:** `void`

**Unterschied zu save-mission:**
- Wirft Fehler wenn Mission nicht existiert
- save-mission erstellt neue Mission wenn nicht vorhanden
- update-mission setzt updatedAt automatisch

**Beispiel:**
```typescript
try {
  await window.api.updateMission(modifiedMission);
  console.log('Mission updated');
} catch (error) {
  console.error('Mission not found:', error);
}
```

## Station Management

### save-station

Speichert oder updated eine Mortar Station.

**Channel:** `save-station`

**Request:**
```typescript
{
  id: string,
  name: string,
  mapId: string,
  position: {
    east: number,
    north: number,
    height: number
  },
  defaultConfig?: {
    type: 'US' | 'RUS',
    ammo: 'HE' | 'Smoke' | 'Illumination',
    charge: 0 | 1 | 2 | 3 | 4
  },
  createdAt: string
}
```

**Response:** `void`

**Verhalten:**
- Wenn Station mit ID existiert: Update
- Wenn Station neu: Create

**Validierung:**
- id, name, mapId, createdAt dürfen nicht leer sein
- position muss Object sein

**Beispiel:**
```typescript
await window.api.saveStation({
  id: 'station-001',
  name: 'Firebase Alpha',
  mapId: 'everon',
  position: { east: 1234, north: 5678, height: 100 },
  defaultConfig: { type: 'US', ammo: 'HE', charge: 4 },
  createdAt: new Date().toISOString()
});
```

### load-stations

Lädt alle gespeicherten Mortar Stations.

**Channel:** `load-stations`

**Request:** `void`

**Response:** `MortarStation[]` (leeres Array wenn keine vorhanden)

**Beispiel:**
```typescript
const stations = await window.api.loadStations();
console.log(`Found ${stations.length} stations`);
stations.forEach(s => console.log(`- ${s.name} (${s.mapId})`));
```

### delete-station

Löscht eine Mortar Station permanent.

**Channel:** `delete-station`

**Request:** `string` (Station ID)

**Response:** `void`

**Validierung:**
- ID darf nicht leer sein

**Beispiel:**
```typescript
await window.api.deleteStation('station-001');
console.log('Station deleted');
```

## History Management

### add-history

Fügt einen Eintrag zur Berechnungs-Historie hinzu.

**Channel:** `add-history`

**Request:**
```typescript
{
  missionId?: string,  // Optional: Referenz zur Mission
  mortarConfig: {
    type: 'US' | 'RUS',
    ammo: 'HE' | 'Smoke' | 'Illumination',
    charge: 0 | 1 | 2 | 3 | 4
  },
  mortarPos: {
    east: number,
    north: number,
    height: number
  },
  targetPos: {
    east: number,
    north: number,
    height: number
  },
  fireSolution: {
    azimuthDeg: number,
    azimuthMil: number,
    elevationBase: number,
    elevationAdj: number,
    deltaElev: number,
    distance: number,
    flightTime: number,
    ringCount: 0 | 1 | 2 | 3 | 4,
    inRange: boolean
  },
  corrections?: Array<{
    leftRight: number,
    addDrop: number
  }>
}
```

**Response:** `void`

**Auto-generiert:**
- `id` - Unique UUID
- `timestamp` - ISO Date (jetzt)

**Limit:** Max 1000 Einträge, älteste werden automatisch gelöscht.

**Validierung:**
- mortarConfig, mortarPos, targetPos, fireSolution müssen Objects sein

**Beispiel:**
```typescript
await window.api.addToHistory({
  missionId: 'mission-001',
  mortarConfig: { type: 'US', ammo: 'HE', charge: 4 },
  mortarPos: { east: 1234, north: 5678, height: 100 },
  targetPos: { east: 2234, north: 6678, height: 150 },
  fireSolution: {
    azimuthDeg: 45,
    azimuthMil: 800,
    elevationBase: 1200,
    elevationAdj: 1250,
    deltaElev: 50,
    distance: 1000,
    flightTime: 15.5,
    ringCount: 4,
    inRange: true
  },
  corrections: [
    { leftRight: -5, addDrop: 10 }
  ]
});
```

### get-history

Lädt Historie mit optionaler Pagination.

**Channel:** `get-history`

**Request:**
```typescript
{
  limit?: number,   // Anzahl Einträge (default: alle)
  offset?: number   // Offset (default: 0)
}
```

**Response:** `HistoryEntry[]`

**Sortierung:** Neueste zuerst

**Validierung:**
- limit muss > 0 sein (wenn angegeben)
- offset muss >= 0 sein

**Beispiele:**
```typescript
// Alle Einträge
const allHistory = await window.api.getHistory();

// Letzte 10 Einträge
const recent = await window.api.getHistory({ limit: 10 });

// Pagination: Page 2 mit 20 pro Seite
const page2 = await window.api.getHistory({ limit: 20, offset: 20 });
```

### clear-history

Löscht die gesamte Historie permanent.

**Channel:** `clear-history`

**Request:** `void`

**Response:** `void`

**Beispiel:**
```typescript
if (confirm('Delete entire history?')) {
  await window.api.clearHistory();
  console.log('History cleared');
}
```

## App Info

### get-app-version

Liefert die App-Version aus package.json.

**Channel:** `get-app-version`

**Request:** `void`

**Response:** `string` (z.B. "1.0.0")

**Beispiel:**
```typescript
const version = await window.api.getAppVersion();
console.log(`ARAC v${version}`);
```

### get-app-path

Liefert den Storage-Pfad der App.

**Channel:** `get-app-path`

**Request:** `void`

**Response:** `string` (Absoluter Pfad)

**Beispiele:**
- Windows: `C:\Users\Username\AppData\Roaming\ARAC\data`
- macOS: `/Users/username/Library/Application Support/ARAC/data`
- Linux: `/home/username/.config/ARAC/data`

**Beispiel:**
```typescript
const path = await window.api.getAppPath();
console.log(`Data stored at: ${path}`);
```

## Error Handling

Alle IPC Handler können Fehler werfen:

```typescript
try {
  await window.api.saveMission(mission);
} catch (error) {
  console.error('Failed to save mission:', error);
  // Error.message enthält Details
}
```

### Häufige Fehler

- `Invalid settings data` - Validierung fehlgeschlagen
- `Invalid mission ID` - Leere ID übergeben
- `Mission with ID xxx not found` - Update fehlgeschlagen
- `Failed to save settings: [details]` - File I/O Fehler
- `Failed to load missions: [details]` - File I/O Fehler

## Type-Safety

Alle Handler sind TypeScript-typsicher über `electron/types/ipc.ts`:

```typescript
import type { IPC_CHANNELS, IpcHandlerMap } from './electron/types/ipc';

// Type-safe Channel-Namen
const channel: keyof IpcHandlerMap = IPC_CHANNELS.SAVE_SETTINGS;

// Type-safe Request/Response
type SaveSettingsRequest = IpcHandlerMap['save-settings']['request'];
type SaveSettingsResponse = IpcHandlerMap['save-settings']['response'];
```

## Security

### Context Isolation
- contextIsolation: true
- nodeIntegration: false
- sandbox: true

### Input Validation
Alle Inputs werden vor Verarbeitung validiert:
- Type Guards
- String Length Checks
- Enum Validation
- Object Structure Validation

### No Eval
Keine eval(), new Function() oder ähnliche unsafe Operations.

### Storage Path
Nur app.getPath('userData') - keine absoluten Pfade.

## Performance

- Alle Handler sind async/await
- Keine Blocking-Operationen
- JSON.parse/stringify für Serialisierung
- File I/O über fs.promises

### Response Times (Typical)

| Operation | Time |
|-----------|------|
| load-settings | < 10ms |
| save-settings | < 20ms |
| load-missions | < 50ms (100 Missions) |
| save-mission | < 30ms |
| get-history | < 50ms (1000 Entries) |
| add-history | < 30ms |

## Limits

- History: Max 1000 Einträge
- Missions: Unbegrenzt (praktisch limitiert durch Speicher)
- Stations: Unbegrenzt
- File Size: Keine expliziten Limits

## File Locations

```
%APPDATA%/ARAC/data/
├── settings.json       (~1 KB)
├── profile.json        (~1 KB)
├── missions.json       (~50 KB bei 100 Missions)
├── stations.json       (~20 KB bei 50 Stations)
└── history.json        (~500 KB bei 1000 Entries)
```

## Backward Compatibility

Settings werden mit Defaults gemerged:
```typescript
return { ...DEFAULT_SETTINGS, ...loadedSettings };
```

Dadurch werden neue Felder automatisch mit Defaults befüllt.

---

**Version:** 1.0.0
**Letzte Aktualisierung:** 2025-12-15
