# Storage System - Implementierung Phase 2.5

Status: ABGESCHLOSSEN

## Erstellte Dateien

### Core Storage
- `/electron/storage.ts` - Core Storage-Funktionen (saveToFile, loadFromFile, initStorage)
- `/electron/ipc-handlers.ts` - Alle IPC Handler für Renderer-Main Kommunikation

### Storage Module
- `/electron/storage/settings.ts` - App-Einstellungen mit Defaults
- `/electron/storage/userProfile.ts` - Benutzerprofil
- `/electron/storage/missions.ts` - Fire Missions (CRUD)
- `/electron/storage/stations.ts` - Mortar Stations (CRUD)
- `/electron/storage/history.ts` - Fire History mit Pagination
- `/electron/storage/index.ts` - Barrel Export aller Storage-Funktionen
- `/electron/storage/README.md` - Storage-Dokumentation

### Aktualisierte Dateien
- `/electron/main.ts` - Initialisiert Storage und IPC Handler beim App-Start
- `/electron/preload.ts` - Erweitert um alle Storage-API Calls

## Features

### Storage Pfad
- Windows: `%APPDATA%/ARAC/data/`
- macOS: `~/Library/Application Support/ARAC/data/`
- Linux: `~/.config/ARAC/data/`

### Automatische Initialisierung
Das Storage-Verzeichnis wird beim App-Start automatisch erstellt.

### Error Handling
Alle Operationen sind mit `withErrorHandling()` wrapped und loggen Fehler in der Konsole.

### Default Settings
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

### History Limit
Max. 1000 Einträge, älteste werden automatisch entfernt.

### CRUD Operationen
- **Missions**: save, load, update, delete
- **Stations**: save, load, delete
- **History**: add, get (mit Pagination), clear
- **Settings**: save, load (mit Defaults)
- **Profile**: save, load

## API Usage (Renderer)

```typescript
// Settings
const settings = await window.api.loadSettings();
await window.api.saveSettings(settings);

// Missions
const missions = await window.api.loadMissions();
await window.api.saveMission(mission);
await window.api.updateMission(mission);
await window.api.deleteMission(id);

// Stations
const stations = await window.api.loadStations();
await window.api.saveStation(station);
await window.api.deleteStation(id);

// History
const history = await window.api.getHistory({ limit: 50, offset: 0 });
await window.api.addToHistory(entry);
await window.api.clearHistory();

// User Profile
const profile = await window.api.loadUserProfile();
await window.api.saveUserProfile(profile);

// App Info
const version = await window.api.getVersion();
const path = await window.api.getAppPath();
```

## IPC Channels

| Channel | Direction | Zweck |
|---------|-----------|-------|
| `save-settings` | R→M | Einstellungen speichern |
| `load-settings` | R→M | Einstellungen laden |
| `save-user-profile` | R→M | Profil speichern |
| `load-user-profile` | R→M | Profil laden |
| `save-mission` | R→M | Mission speichern |
| `load-missions` | R→M | Alle Missionen laden |
| `update-mission` | R→M | Mission aktualisieren |
| `delete-mission` | R→M | Mission löschen |
| `save-station` | R→M | Station speichern |
| `load-stations` | R→M | Alle Stationen laden |
| `delete-station` | R→M | Station löschen |
| `add-history` | R→M | History-Eintrag hinzufügen |
| `get-history` | R→M | History abrufen (paginiert) |
| `clear-history` | R→M | History löschen |
| `get-app-path` | R→M | Storage-Pfad abrufen |
| `get-app-version` | R→M | App-Version abrufen |

R→M = Renderer to Main

## Type Safety

Alle Storage-Funktionen verwenden die Types aus `/src/types/index.ts`:
- `AppSettings`
- `UserProfile`
- `FireMission`
- `MortarStation`
- `HistoryEntry`
- `Coordinate`
- `FireSolution`
- `MortarConfig`

## Logging

Alle Storage-Operationen loggen ihre Aktionen:
```
[Storage] Initialized at: /Users/username/Library/Application Support/ARAC/data
[Storage] Saved: settings.json
[Storage] Loaded: missions.json
[Storage] File not found: profile.json
[IPC] Setting up handlers...
[IPC] All handlers registered successfully
```

## Testing

Zum Testen kann das data-Verzeichnis manuell gelöscht werden:

```bash
# macOS
rm -rf ~/Library/Application\ Support/ARAC/data

# Windows
rmdir /s "%APPDATA%\ARAC\data"
```

## Nächste Schritte

Das Storage-System ist vollständig implementiert und bereit zur Verwendung im Frontend.

Phase 3 kann nun beginnen:
- React Hooks für Storage (useSettings, useMissions, etc.)
- UI Components für Mission/Station Management
- Persistierung der Berechnungen
