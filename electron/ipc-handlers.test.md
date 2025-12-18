# IPC Handler Test Dokumentation

## Status: Phase 3.2 - ABGESCHLOSSEN

Alle IPC Handler wurden erfolgreich implementiert und sind bereit für Phase 3.3 (Preload Script).

## Implementierte Handler

### Prio 1 - Core Funktionalität

#### Settings Management
- `save-settings` - Settings speichern mit Validierung
- `load-settings` - Settings laden (liefert Defaults beim ersten Start)

#### User Profile Management
- `save-user-profile` - User Profil speichern mit Validierung
- `load-user-profile` - User Profil laden (kann null sein)

#### Mission Management
- `save-mission` - Einzelne Mission speichern (Create/Update)
- `load-missions` - Alle Missionen laden
- `delete-mission` - Mission löschen
- `update-mission` - Mission explizit updaten (mit Fehler wenn nicht vorhanden)

#### Station Management
- `save-station` - Stellung speichern (Create/Update)
- `load-stations` - Alle Stellungen laden
- `delete-station` - Stellung löschen

### Prio 2 - History System

- `add-history` - Zur Historie hinzufügen (auto-generiert ID + Timestamp)
- `get-history` - Historie abrufen mit optionaler Pagination
- `clear-history` - Gesamte Historie löschen

### Prio 3 - App Info

- `get-app-version` - App-Version aus package.json (via app.getVersion())
- `get-app-path` - Storage-Pfad zurückgeben

## Sicherheits-Features

### Input Validierung
Alle Handler validieren ihre Eingaben:
- Type Guards für Settings, UserProfile, Mission, Station, HistoryEntry
- String-Validierung (nicht-leer)
- Object-Validierung (nicht-null, kein Array)
- Pagination-Parameter-Validierung

### Error Handling
- Alle Handler haben try/catch Blöcke
- Console.error Logging für Debugging
- Fehler werden an Renderer zurückgegeben

### Context Isolation
- contextIsolation: true (main.ts)
- nodeIntegration: false (main.ts)
- sandbox: true (main.ts)

## Storage-Struktur

### Dateien
```
%APPDATA%/ARAC/data/
├── settings.json       - App-Einstellungen
├── profile.json        - User-Profil
├── missions.json       - Fire Missions (Array)
├── stations.json       - Mortar Stations (Array)
└── history.json        - Calculation History (Array, max 1000)
```

### Defaults
- Settings: Liefert Defaults beim ersten Start
- UserProfile: Kann null sein
- Missions/Stations/History: Leere Arrays wenn Datei nicht existiert

## Handler-Übersicht

| Handler | Input | Output | Validierung | Error Handling |
|---------|-------|--------|-------------|----------------|
| save-settings | AppSettings | void | validateSettings() | try/catch |
| load-settings | - | AppSettings | - | try/catch |
| save-user-profile | UserProfile | void | validateUserProfile() | try/catch |
| load-user-profile | - | UserProfile\|null | - | try/catch |
| save-mission | FireMission | void | validateMission() | try/catch |
| load-missions | - | FireMission[] | - | try/catch |
| delete-mission | string | void | isValidString() | try/catch |
| update-mission | FireMission | void | validateMission() | try/catch |
| save-station | MortarStation | void | validateStation() | try/catch |
| load-stations | - | MortarStation[] | - | try/catch |
| delete-station | string | void | isValidString() | try/catch |
| add-history | HistoryEntry | void | validateHistoryEntry() | try/catch |
| get-history | {limit?, offset?} | HistoryEntry[] | pagination validation | try/catch |
| clear-history | - | void | - | try/catch |
| get-app-version | - | string | - | try/catch |
| get-app-path | - | string | - | try/catch |

## Nächste Schritte (Phase 3.3)

1. Preload Script implementieren
2. contextBridge.exposeInMainWorld() für alle Handler
3. Type-Safe API für Renderer
4. window.api Interface erstellen

## Test-Checkliste

- [x] Alle Prio 1 Handler implementiert
- [x] Alle Prio 2 Handler implementiert
- [x] Alle Prio 3 Handler implementiert
- [x] Input Validierung für alle Handler
- [x] Error Handling für alle Handler
- [x] Type Guards implementiert
- [x] Storage-Funktionen existieren
- [x] Handler in main.ts registriert
- [ ] Preload Script implementieren (Phase 3.3)
- [ ] Integration Tests (Phase 4.x)

## Bekannte Einschränkungen

1. Validierung ist Basic - Keine Deep-Validation von Koordinaten etc.
2. Keine Rate-Limiting (für Electron Desktop ok)
3. Keine User-spezifische Trennung (Single-User App)
4. History hat Hard-Limit von 1000 Einträgen

## Performance

- Alle File-Operationen sind async
- JSON.stringify mit pretty-print (2 spaces)
- Keine Caching (für Desktop-App ok)
- Files werden komplett gelesen/geschrieben (keine Streams)

## Anti-Virus Kompatibilität

Vermieden:
- eval(), new Function()
- child_process
- Registry-Zugriff
- Native Modules
- System-weite Hooks

Genutzt:
- Nur Standard Electron APIs
- Nur app.getPath('userData')
- Nur fs/promises (Standard Node.js)
