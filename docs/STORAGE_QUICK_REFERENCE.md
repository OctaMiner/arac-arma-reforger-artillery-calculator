# Storage System - Quick Reference

## Verzeichnisstruktur

```
electron/
├── storage.ts              (89 Zeilen)  - Core Storage-Funktionen
├── ipc-handlers.ts         (96 Zeilen)  - IPC Handler Setup
├── main.ts                            - Initialisiert Storage + IPC
├── preload.ts                         - Window API für Renderer
└── storage/
    ├── settings.ts         (41 Zeilen)  - App-Einstellungen
    ├── userProfile.ts      (22 Zeilen)  - Benutzerprofil
    ├── missions.ts         (71 Zeilen)  - Fire Missions (CRUD)
    ├── stations.ts         (47 Zeilen)  - Mortar Stations (CRUD)
    ├── history.ts          (65 Zeilen)  - Fire History
    ├── index.ts            (8 Zeilen)   - Barrel Export
    └── README.md                        - Dokumentation
```

**Total: 439 Zeilen Code**

## Gespeicherte Dateien

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `settings.json` | AppSettings | Theme, Sprache, Defaults |
| `profile.json` | UserProfile | Name, Statistiken, Preferences |
| `missions.json` | FireMission[] | Gespeicherte Feueraufträge |
| `stations.json` | MortarStation[] | Mörser-Stellungen |
| `history.json` | HistoryEntry[] | Schuss-Historie (max 1000) |

## Storage Location

- **macOS**: `~/Library/Application Support/ARAC/data/`
- **Windows**: `%APPDATA%/ARAC/data/`
- **Linux**: `~/.config/ARAC/data/`

## API Cheat Sheet

### Settings
```typescript
await window.api.loadSettings()                    // → AppSettings
await window.api.saveSettings(settings)            // → void
```

### Missions
```typescript
await window.api.loadMissions()                    // → FireMission[]
await window.api.saveMission(mission)              // → void
await window.api.updateMission(mission)            // → void
await window.api.deleteMission(id)                 // → void
```

### Stations
```typescript
await window.api.loadStations()                    // → MortarStation[]
await window.api.saveStation(station)              // → void
await window.api.deleteStation(id)                 // → void
```

### History
```typescript
await window.api.getHistory()                      // → HistoryEntry[]
await window.api.getHistory({ limit: 50, offset: 0 })  // Pagination
await window.api.addToHistory(entry)               // → void
await window.api.clearHistory()                    // → void
```

### User Profile
```typescript
await window.api.loadUserProfile()                 // → UserProfile | null
await window.api.saveUserProfile(profile)          // → void
```

### App Info
```typescript
await window.api.getVersion()                      // → string
await window.api.getAppPath()                      // → string (storage path)
```

## Error Handling

```typescript
try {
  await window.api.saveMission(mission);
  console.log('✓ Mission gespeichert');
} catch (error) {
  console.error('✗ Fehler beim Speichern:', error);
}
```

## Default Settings

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

## Type Definitions

Alle Types aus `/src/types/index.ts`:

```typescript
AppSettings        // App-Konfiguration
UserProfile        // Benutzerprofil
FireMission        // Gespeicherter Feuerauftrag
MortarStation      // Mörser-Stellung
HistoryEntry       // History-Eintrag
Coordinate         // Koordinate (east, north, height)
FireSolution       // Berechnungsergebnis
MortarConfig       // Mörser-Konfiguration
```

## Features

- **Automatische Initialisierung**: Storage-Verzeichnis wird beim Start erstellt
- **Default Settings**: Werden beim ersten Laden automatisch gespeichert
- **History Limit**: Max. 1000 Einträge, älteste werden entfernt
- **Mission Updates**: `updatedAt` wird automatisch gesetzt
- **Atomare Operationen**: Alle Schreibvorgänge sind atomar
- **Console Logging**: Alle Operationen werden geloggt

## Development

### Daten zurücksetzen
```bash
# macOS
rm -rf ~/Library/Application\ Support/ARAC/data

# Windows
rmdir /s "%APPDATA%\ARAC\data"

# Linux
rm -rf ~/.config/ARAC/data
```

### Console Output
```
[Storage] Initialized at: .../ARAC/data
[Storage] Saved: settings.json
[Storage] Loaded: missions.json
[IPC] Setting up handlers...
[IPC] All handlers registered successfully
```

## Nächste Phase

**Phase 3**: React Integration
- Hooks (useSettings, useMissions, useStations, useHistory)
- UI Components für CRUD-Operationen
- Persistierung in Berechnungs-Workflow
