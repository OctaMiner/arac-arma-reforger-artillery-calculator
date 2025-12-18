# ARAC Storage System

Persistenz-Layer für die ARAC Electron-App.

## Struktur

```
electron/
├── storage.ts              # Core Storage-Funktionen
├── ipc-handlers.ts         # IPC Handler für Renderer-Kommunikation
└── storage/
    ├── settings.ts         # App-Einstellungen
    ├── userProfile.ts      # Benutzerprofil
    ├── missions.ts         # Feueraufträge
    ├── stations.ts         # Mörser-Stellungen
    ├── history.ts          # Schuss-Historie
    └── index.ts            # Barrel Export
```

## Storage-Pfad

Die Daten werden im plattformspezifischen userData-Verzeichnis gespeichert:

- **Windows**: `%APPDATA%/ARAC/data/`
- **macOS**: `~/Library/Application Support/ARAC/data/`
- **Linux**: `~/.config/ARAC/data/`

## Gespeicherte Dateien

| Datei | Inhalt | Typ |
|-------|--------|-----|
| `settings.json` | App-Einstellungen (Theme, Sprache, Defaults) | AppSettings |
| `profile.json` | Benutzerprofil und Statistiken | UserProfile |
| `missions.json` | Liste aller gespeicherten Missionen | FireMission[] |
| `stations.json` | Liste aller Mörser-Stellungen | MortarStation[] |
| `history.json` | Schuss-Historie (max. 1000 Einträge) | HistoryEntry[] |

## Verwendung im Renderer

```typescript
// Settings laden
const settings = await window.api.loadSettings();

// Settings speichern
await window.api.saveSettings({
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 4
});

// Mission speichern
await window.api.saveMission(mission);

// Missionen laden
const missions = await window.api.loadMissions();

// Mission löschen
await window.api.deleteMission(missionId);

// History abrufen (mit Pagination)
const history = await window.api.getHistory({ limit: 50, offset: 0 });

// Zur History hinzufügen
await window.api.addToHistory({
  mortarConfig: { type: 'US', ammo: 'HE', charge: 4 },
  mortarPos: { east: 100, north: 100, height: 0 },
  targetPos: { east: 200, north: 200, height: 0 },
  fireSolution: { /* ... */ }
});
```

## Fehlerbehandlung

Alle Storage-Funktionen verwenden `withErrorHandling()` und werfen Fehler, die im Renderer abgefangen werden müssen:

```typescript
try {
  await window.api.saveMission(mission);
  console.log('Mission gespeichert');
} catch (error) {
  console.error('Fehler beim Speichern:', error);
}
```

## Implementierungsdetails

### Automatische Initialisierung
Das Storage-Verzeichnis wird beim App-Start automatisch erstellt (siehe `main.ts`).

### Default Settings
Beim ersten Laden werden automatisch Default-Settings gespeichert.

### History Limit
Die History wird auf max. 1000 Einträge begrenzt. Älteste Einträge werden automatisch entfernt.

### Mission Updates
Beim Speichern einer Mission wird automatisch der `updatedAt`-Timestamp aktualisiert.

### Atomare Operationen
Alle Schreibvorgänge sind atomar - entweder komplett oder gar nicht.

## IPC Handler

Alle Handler sind in `electron/ipc-handlers.ts` registriert:

- `save-settings` / `load-settings`
- `save-user-profile` / `load-user-profile`
- `save-mission` / `load-missions` / `delete-mission` / `update-mission`
- `save-station` / `load-stations` / `delete-station`
- `add-history` / `get-history` / `clear-history`
- `get-app-path` / `get-app-version`

## Entwicklung

### Testing
Storage-Funktionen können direkt getestet werden:

```typescript
import * as storage from './electron/storage';

await storage.initStorage();
const settings = await storage.loadSettings();
```

### Debugging
Storage-Operationen loggen alle Aktionen in der Konsole:

```
[Storage] Initialized at: /Users/username/Library/Application Support/ARAC/data
[Storage] Saved: settings.json
[Storage] Loaded: missions.json
```

### Daten löschen
Zum Zurücksetzen der App einfach das data-Verzeichnis löschen:

```bash
# macOS
rm -rf ~/Library/Application\ Support/ARAC/data

# Windows
rmdir /s "%APPDATA%\ARAC\data"
```
