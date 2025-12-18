# ARAC - Detaillierte Task-Liste mit Agent-Zuweisungen

Diese Datei enthält alle Tasks die der **Project Lead** (`/lead`) koordinieren und abhaken muss.
Jeder Task ist einem spezifischen Agent zugewiesen.

**Reihenfolge**: Backend → Frontend → Integration → Testing → Polish

---

## WICHTIG: Agent-Delegation (Context-Sparend)

Der `/lead` Agent delegiert Tasks an spezialisierte Subagenten via Slash-Commands.
Dies spart Context im Hauptfenster und nutzt das Expertenwissen der Agents.

**Ablauf**:
1. `/lead` identifiziert nächsten Task
2. `/lead` ruft den zuständigen Agent via `SlashCommand` Tool auf
3. Agent arbeitet selbstständig und meldet Ergebnis
4. `/lead` hakt Task ab und geht zum nächsten

**Beispiel**:
```
Task: "US HE Ring 0 Tabelle aus Excel extrahieren" - Agent: /ballistics
→ /lead ruft /ballistics mit diesem Task auf
→ /ballistics extrahiert die Daten und erstellt die JSON
→ /lead markiert Task als [x]
```

---

## Legende

- `[ ]` = Offen
- `[x]` = Erledigt
- **Agent**: Welcher Agent die Aufgabe ausführt
- **Prio**: 1 (kritisch) bis 4 (nice-to-have)
- **Abhängig von**: Tasks die vorher erledigt sein müssen

---

# PHASE 1: PROJEKT-SETUP

## 1.1 Entwicklungsumgebung

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Node.js Projekt initialisieren (`npm init`) | `/electron` | 1 | - |
| [x] | TypeScript konfigurieren (strict mode) | `/electron` | 1 | 1.1.1 |
| [x] | Electron + Vite Setup | `/electron` | 1 | 1.1.2 |
| [x] | React 18 einrichten | `/frontend` | 1 | 1.1.3 |
| [x] | TailwindCSS konfigurieren | `/design` | 1 | 1.1.4 |
| [x] | ESLint + Prettier Setup | `/frontend` | 2 | 1.1.4 |
| [x] | Vitest Test-Framework einrichten | `/qaa` | 2 | 1.1.4 |
| [x] | Git Repository initialisieren (SPÄTER - nicht jetzt) | `/lead` | 4 | 1.1.1 |
| [x] | .gitignore verifizieren (keine privaten Pfade, kein .claude/) | `/lead` | 4 | 1.1.8 |

## 1.2 Projektstruktur anlegen

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Ordnerstruktur erstellen (src/, electron/, tests/) | `/lead` | 1 | 1.1.3 |
| [x] | Type-Definitionen Ordner (src/types/) | `/frontend` | 1 | 1.2.1 |
| [x] | Ballistics Modul Ordner (src/lib/ballistics/) | `/ballistics` | 1 | 1.2.1 |
| [x] | Coordinates Modul Ordner (src/lib/coordinates/) | `/ballistics` | 1 | 1.2.1 |
| [x] | Storage Modul Ordner (src/lib/storage/) | `/electron` | 1 | 1.2.1 |
| [x] | Components Ordner mit Unterordnern | `/frontend` | 1 | 1.2.1 |
| [x] | Assets Ordner für Karten/Icons | `/map` | 1 | 1.2.1 |

---

# PHASE 2: BACKEND - CORE LOGIC

## 2.1 Type-Definitionen (TypeScript Interfaces)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `Coordinate` Interface (east, north, height) | `/ballistics` | 1 | 1.2.2 |
| [x] | `MortarType` Type ('US' \| 'RUS') | `/ballistics` | 1 | 1.2.2 |
| [x] | `AmmoType` Type ('HE' \| 'Smoke' \| 'Illumination') | `/ballistics` | 1 | 1.2.2 |
| [x] | `BallisticEntry` Interface (range, elevation, tof, dElev) | `/ballistics` | 1 | 1.2.2 |
| [x] | `FireSolution` Interface (azimuth, elevation, flightTime, etc.) | `/ballistics` | 1 | 1.2.2 |
| [x] | `FireMission` Interface (name, positions, solution, timestamp) | `/ballistics` | 1 | 1.2.2 |
| [x] | `MortarStation` Interface (name, position, defaultConfig) | `/ballistics` | 1 | 1.2.2 |
| [x] | `SpotterData` Interface (position, measurements) | `/spotter` | 1 | 1.2.2 |
| [x] | `CorrectionData` Interface (leftRight, addDrop) | `/spotter` | 1 | 1.2.2 |
| [x] | `UserProfile` Interface (name, preferences, stations, history) | `/electron` | 1 | 1.2.2 |
| [x] | `AppSettings` Interface (theme, language, defaults) | `/electron` | 1 | 1.2.2 |
| [x] | `MapConfig` Interface (id, name, bounds, tileUrl) | `/map` | 1 | 1.2.2 |

## 2.2 Ballistische Daten (JSON Tables)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | US HE Ring 0 Tabelle aus Excel extrahieren | `/ballistics` | 1 | 2.1.4 |
| [x] | US HE Ring 1 Tabelle aus Excel extrahieren | `/ballistics` | 1 | 2.1.4 |
| [x] | US HE Ring 2 Tabelle aus Excel extrahieren | `/ballistics` | 1 | 2.1.4 |
| [x] | US HE Ring 3 Tabelle aus Excel extrahieren | `/ballistics` | 1 | 2.1.4 |
| [x] | US HE Ring 4 Tabelle (bereits vorhanden, verifizieren) | `/ballistics` | 1 | 2.1.4 |
| [x] | US Smoke alle Ringe extrahieren | `/ballistics` | 2 | 2.1.4 |
| [x] | US Illumination alle Ringe extrahieren | `/ballistics` | 2 | 2.1.4 |
| [x] | RUS HE Ring 0-4 Tabellen extrahieren | `/ballistics` | 1 | 2.1.4 |
| [x] | RUS Smoke alle Ringe extrahieren | `/ballistics` | 2 | 2.1.4 |
| [x] | RUS Illumination alle Ringe extrahieren | `/ballistics` | 2 | 2.1.4 |
| [x] | Polynomial-Koeffizienten für alle Kombinationen | `/ballistics` | 2 | 2.2.1-10 |
| [x] | Delta-ELEV Koeffizienten extrahieren | `/ballistics` | 1 | 2.2.1-10 |
| [x] | Alle Tabellen validieren gegen Excel-Referenz | `/qaa` | 1 | 2.2.1-12 |

## 2.3 Berechnungs-Engine (Core Calculator)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `calculateDistance()` Funktion implementieren | `/ballistics` | 1 | 2.1.1 |
| [x] | Unit Tests für calculateDistance (alle Quadranten) | `/qaa` | 1 | 2.3.1 |
| [x] | `calculateAzimuth()` Funktion implementieren | `/ballistics` | 1 | 2.1.1 |
| [x] | Unit Tests für calculateAzimuth (0°, 90°, 180°, 270°, Edge Cases) | `/qaa` | 1 | 2.3.3 |
| [x] | `degToMil()` und `milToDeg()` Konverter | `/ballistics` | 1 | 2.1.1 |
| [x] | `interpolateElevation()` Funktion (lineare Interpolation) | `/ballistics` | 1 | 2.2.13 |
| [x] | Unit Tests für interpolateElevation (Grenzwerte, Zwischenwerte) | `/qaa` | 1 | 2.3.6 |
| [x] | `polynomialElevation()` Funktion (5. Grades) | `/ballistics` | 2 | 2.2.11 |
| [x] | `interpolateFlightTime()` Funktion | `/ballistics` | 1 | 2.2.13 |
| [x] | `getDeltaElevPer100m()` aus Tabelle | `/ballistics` | 1 | 2.2.12 |
| [x] | `calculateDeltaElevation()` Höhenkorrektur | `/ballistics` | 1 | 2.3.10 |
| [x] | Unit Tests für Höhenkorrektur (positiv, negativ, null) | `/qaa` | 1 | 2.3.11 |
| [x] | `applyHeightCorrection()` Final-Elevation | `/ballistics` | 1 | 2.3.11 |
| [x] | `checkRange()` Reichweiten-Validierung | `/ballistics` | 1 | 2.2.13 |
| [x] | `findOptimalRingCount()` Automatische Ring-Wahl | `/ballistics` | 2 | 2.3.14 |
| [x] | `calculateFireSolution()` Hauptfunktion (alles zusammen) | `/ballistics` | 1 | 2.3.1-15 |
| [x] | Integrations-Test: Vollständige Berechnung gegen Referenzwerte | `/qaa` | 1 | 2.3.16 |
| [x] | Performance-Test: < 50ms für calculateFireSolution | `/qaa` | 2 | 2.3.16 |

## 2.4 Spotter-Berechnungen

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `calculateTargetFromSpotter()` Position aus Fernglas-Daten | `/spotter` | 1 | 2.1.8 |
| [x] | Unit Tests für Spotter-Berechnung (verschiedene Azimute) | `/qaa` | 1 | 2.4.1 |
| [x] | `applyCorrection()` Feuerkorrektur anwenden | `/spotter` | 1 | 2.1.9 |
| [x] | Unit Tests für Korrektur (l/r, add/drop) | `/qaa` | 1 | 2.4.3 |
| [x] | `lateralToMilCorrection()` Seitenabweichung → MIL | `/spotter` | 2 | 2.1.9 |
| [x] | `calculateCorrectionFromImpact()` Auto-Korrektur berechnen | `/spotter` | 2 | 2.4.3 |

## 2.5 Storage (Persistenz)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Electron IPC: `get-app-path` Handler | `/electron` | 1 | 1.1.3 |
| [x] | Storage Pfad Setup (%APPDATA%/ARAC/) | `/electron` | 1 | 2.5.1 |
| [x] | `saveToFile()` Generic JSON Writer | `/electron` | 1 | 2.5.2 |
| [x] | `loadFromFile()` Generic JSON Reader | `/electron` | 1 | 2.5.2 |
| [x] | Error Handling für File-Operationen | `/electron` | 1 | 2.5.3-4 |
| [x] | **Settings Storage** | | | |
| [x] | `saveSettings()` Funktion | `/electron` | 1 | 2.5.3 |
| [x] | `loadSettings()` Funktion | `/electron` | 1 | 2.5.4 |
| [x] | Default Settings Fallback | `/electron` | 1 | 2.5.7 |
| [x] | **User Profile Storage** | | | |
| [x] | `saveUserProfile()` Funktion | `/electron` | 1 | 2.5.3 |
| [x] | `loadUserProfile()` Funktion | `/electron` | 1 | 2.5.4 |
| [x] | **Fire Missions Storage** | | | |
| [x] | `saveMission()` Einzelne Mission speichern | `/electron` | 1 | 2.5.3 |
| [x] | `loadMissions()` Alle Missionen laden | `/electron` | 1 | 2.5.4 |
| [x] | `deleteMission()` Mission löschen | `/electron` | 1 | 2.5.3 |
| [x] | `updateMission()` Mission aktualisieren | `/electron` | 2 | 2.5.12 |
| [x] | **Mortar Stations Storage** (Vordefinierte Stellungen) | | | |
| [x] | `saveStation()` Stellung speichern | `/electron` | 1 | 2.5.3 |
| [x] | `loadStations()` Alle Stellungen laden | `/electron` | 1 | 2.5.4 |
| [x] | `deleteStation()` Stellung löschen | `/electron` | 1 | 2.5.3 |
| [x] | **Fire History Storage** (Historie) | | | |
| [x] | `addToHistory()` Schuss zur Historie hinzufügen | `/electron` | 2 | 2.5.3 |
| [x] | `getHistory()` Historie abrufen (mit Pagination) | `/electron` | 2 | 2.5.4 |
| [x] | `clearHistory()` Historie löschen | `/electron` | 3 | 2.5.3 |
| [x] | History Entry Interface (timestamp, mission, result) | `/electron` | 2 | 2.1.10 |

---

# PHASE 3: BACKEND - ELECTRON MAIN PROCESS

## 3.1 Electron Main Setup

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `main.ts` Grundstruktur | `/electron` | 1 | 1.1.3 |
| [x] | BrowserWindow Konfiguration (Größe, Frame, Icon) | `/electron` | 1 | 3.1.1 |
| [x] | Security: contextIsolation = true | `/electron` | 1 | 3.1.1 |
| [x] | Security: nodeIntegration = false | `/electron` | 1 | 3.1.1 |
| [x] | Preload Script Setup | `/electron` | 1 | 3.1.1 |
| [x] | DevTools nur im Dev-Mode | `/electron` | 2 | 3.1.1 |
| [ ] | Window State Persistence (Größe/Position merken) | `/electron` | 3 | 3.1.2 |

## 3.2 IPC Handlers

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | IPC Handler: `save-settings` | `/electron` | 1 | 2.5.6 |
| [x] | IPC Handler: `load-settings` | `/electron` | 1 | 2.5.7 |
| [x] | IPC Handler: `save-user-profile` | `/electron` | 1 | 2.5.9 |
| [x] | IPC Handler: `load-user-profile` | `/electron` | 1 | 2.5.10 |
| [x] | IPC Handler: `save-mission` | `/electron` | 1 | 2.5.12 |
| [x] | IPC Handler: `load-missions` | `/electron` | 1 | 2.5.13 |
| [x] | IPC Handler: `delete-mission` | `/electron` | 1 | 2.5.14 |
| [x] | IPC Handler: `save-station` | `/electron` | 1 | 2.5.17 |
| [x] | IPC Handler: `load-stations` | `/electron` | 1 | 2.5.18 |
| [x] | IPC Handler: `delete-station` | `/electron` | 1 | 2.5.19 |
| [x] | IPC Handler: `add-history` | `/electron` | 2 | 2.5.21 |
| [x] | IPC Handler: `get-history` | `/electron` | 2 | 2.5.22 |
| [x] | IPC Handler: `get-app-version` | `/electron` | 3 | 3.1.1 |

## 3.3 Preload Script (Context Bridge)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `preload.ts` erstellen | `/electron` | 1 | 3.1.5 |
| [x] | API Whitelist definieren | `/electron` | 1 | 3.3.1 |
| [x] | contextBridge.exposeInMainWorld('api', {...}) | `/electron` | 1 | 3.3.2 |
| [x] | TypeScript Typing für window.api | `/electron` | 1 | 3.3.3 |

---

# PHASE 4: FRONTEND - STATE MANAGEMENT

## 4.1 Zustand Store Setup

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Zustand installieren und konfigurieren | `/frontend` | 1 | 1.1.4 |
| [x] | **App Store** (Hauptzustand) | | | |
| [x] | Store: mortarConfig State (type, ammo, charge) | `/frontend` | 1 | 4.1.1 |
| [x] | Store: mortarPosition State | `/frontend` | 1 | 4.1.1 |
| [x] | Store: targetPosition State | `/frontend` | 1 | 4.1.1 |
| [x] | Store: fireSolution State (berechnet) | `/frontend` | 1 | 4.1.1 |
| [x] | Store: selectedMap State | `/frontend` | 1 | 4.1.1 |
| [x] | Actions: setMortarConfig | `/frontend` | 1 | 4.1.3 |
| [x] | Actions: setMortarPosition | `/frontend` | 1 | 4.1.4 |
| [x] | Actions: setTargetPosition | `/frontend` | 1 | 4.1.5 |
| [x] | Actions: calculateSolution (ruft Engine auf) | `/frontend` | 1 | 2.3.16 |
| [x] | **Missions Store** | | | |
| [x] | Store: missions Array State | `/frontend` | 1 | 4.1.1 |
| [x] | Store: selectedMission State | `/frontend` | 1 | 4.1.1 |
| [x] | Actions: loadMissions (von Storage) | `/frontend` | 1 | 3.2.6 |
| [x] | Actions: saveMission | `/frontend` | 1 | 3.2.5 |
| [x] | Actions: deleteMission | `/frontend` | 1 | 3.2.7 |
| [x] | Actions: selectMission (lädt in Hauptzustand) | `/frontend` | 1 | 4.1.14 |
| [x] | **Stations Store** (Vordefinierte Stellungen) | | | |
| [x] | Store: stations Array State | `/frontend` | 1 | 4.1.1 |
| [x] | Actions: loadStations | `/frontend` | 1 | 3.2.9 |
| [x] | Actions: saveStation | `/frontend` | 1 | 3.2.8 |
| [x] | Actions: deleteStation | `/frontend` | 1 | 3.2.10 |
| [x] | Actions: selectStation (setzt Mörser-Position) | `/frontend` | 1 | 4.1.21 |
| [x] | **History Store** | | | |
| [x] | Store: history Array State | `/frontend` | 2 | 4.1.1 |
| [x] | Actions: loadHistory | `/frontend` | 2 | 3.2.12 |
| [x] | Actions: addToHistory | `/frontend` | 2 | 3.2.11 |
| [x] | **Spotter Store** | | | |
| [x] | Store: spotterMode State (boolean) | `/frontend` | 1 | 4.1.1 |
| [x] | Store: spotterPosition State | `/frontend` | 1 | 4.1.1 |
| [x] | Store: spotterMeasurements State | `/frontend` | 1 | 4.1.1 |
| [x] | Store: corrections Array State (Historie) | `/frontend` | 2 | 4.1.1 |
| [x] | Actions: toggleSpotterMode | `/frontend` | 1 | 4.1.28 |
| [x] | Actions: setSpotterData | `/frontend` | 1 | 4.1.29-30 |
| [x] | Actions: applyCorrection | `/frontend` | 1 | 2.4.3 |
| [x] | **User Store** | | | |
| [x] | Store: userProfile State | `/frontend` | 2 | 4.1.1 |
| [x] | Store: settings State | `/frontend` | 1 | 4.1.1 |
| [x] | Actions: loadUserProfile | `/frontend` | 2 | 3.2.4 |
| [x] | Actions: saveUserProfile | `/frontend` | 2 | 3.2.3 |
| [x] | Actions: loadSettings | `/frontend` | 1 | 3.2.2 |
| [x] | Actions: saveSettings | `/frontend` | 1 | 3.2.1 |

## 4.2 Custom Hooks

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `useCalculation()` - Automatische Berechnung bei Änderungen | `/frontend` | 1 | 4.1.11 |
| [x] | `useDebounce()` - Verzögerte Berechnung beim Drag | `/frontend` | 2 | 4.2.1 |
| [x] | `useMissions()` - Mission CRUD Operations | `/frontend` | 1 | 4.1.13-18 |
| [x] | `useStations()` - Station CRUD Operations | `/frontend` | 1 | 4.1.20-24 |
| [x] | `useSpotter()` - Spotter Mode Logic | `/frontend` | 1 | 4.1.28-34 |
| [x] | `useHistory()` - History Operations | `/frontend` | 2 | 4.1.25-27 |
| [x] | `useSettings()` - Settings Load/Save | `/frontend` | 1 | 4.1.39-40 |
| [ ] | `useKeyboardShortcuts()` - Hotkeys | `/frontend` | 3 | 4.1.1 |

---

# PHASE 5: FRONTEND - UI COMPONENTS

## 5.1 Layout Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `App.tsx` Haupt-Layout | `/frontend` | 1 | 4.1.1 |
| [x] | `Header.tsx` - Logo, Map-Auswahl, Settings | `/frontend` | 1 | 5.1.1 |
| [x] | `Sidebar.tsx` - Konfiguration Container | `/frontend` | 1 | 5.1.1 |
| [x] | `MainContent.tsx` - Karte + Results Container | `/frontend` | 1 | 5.1.1 |
| [x] | `ResultsBar.tsx` - Ergebnis-Anzeige (zusätzlich) | `/frontend` | 1 | 5.1.1 |
| [ ] | `Footer.tsx` - Version, Links | `/frontend` | 3 | 5.1.1 |
| [x] | Responsive Layout (Flexbox/Grid) | `/design` | 2 | 5.1.1-4 |
| [x] | Dark Theme Variablen (CSS Custom Properties) | `/design` | 1 | 1.1.5 |
| [x] | Theme auf alle Components anwenden | `/design` | 1 | 5.1.7 |

## 5.2 Map Components

**REFERENZEN**:
- https://arma-mortar.com/ - Gute Karten-Implementierung
- `docs/reference/map_viewer.html` - GeNeFRAG's Vanilla JS Implementation
- `data/maps/all_arma_maps.json` - 24 Karten mit CDN-URLs

**CDN Integration** (NEU):
- Karten werden von GeNeFRAG's CDN geladen (keine lokalen Tiles nötig!)
- CDN: `pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev`
- 24 Maps verfügbar, 10 mit Höhendaten

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `MapView.tsx` - Leaflet Container (wie arma-mortar.com) | `/map` | 1 | 4.1.7 |
| [x] | Custom CRS für Arma-Koordinaten | `/map` | 1 | 5.2.1 |
| [x] | **CDN-Integration**: Map via ImageOverlay statt TileLayer laden | `/map` | 1 | 5.2.1 |
| [x] | **ArmaMap Interface**: Types für CDN-Karten definieren | `/map` | 1 | 5.2.1 |
| [x] | **Map-Loader**: `loadMapsFromConfig()` aus all_arma_maps.json | `/map` | 1 | 5.2.3-4 |
| [x] | `MapSelector.tsx` - Dropdown für 24 Karten | `/map` | 1 | 5.2.5 |
| [x] | **Höhendaten-Service**: `getTerrainHeight()` für Maps mit height_data | `/map` | 2 | 5.2.5 |
| [x] | **Auto-Höhe**: Automatische Höhenabfrage bei Marker-Platzierung | `/map` | 2 | 5.2.7 |
| [x] | `MortarMarker.tsx` - Draggable Mörser-Icon | `/map` | 1 | 5.2.1 |
| [x] | `TargetMarker.tsx` - Draggable Ziel-Icon | `/map` | 1 | 5.2.1 |
| [x] | `FireLine.tsx` - Linie zwischen Mörser und Ziel | `/map` | 1 | 5.2.4-5 |
| [x] | `CoordinateGrid.tsx` - Adaptives Raster (10m-1000m je nach Zoom) | `/map` | 2 | 5.2.1 |
| [x] | `StationMarkers.tsx` - Gespeicherte Stellungen anzeigen | `/map` | 2 | 4.1.20 |
| [x] | `SpotterMarker.tsx` - Spotter Position + Sichtlinie | `/spotter` | 2 | 4.1.29 |
| [ ] | `ImpactMarker.tsx` - Einschlagpunkt für Korrektur | `/spotter` | 3 | 4.1.31 |
| [x] | Click Handler: Mörser setzen (Linksklick) | `/map` | 1 | 5.2.4 |
| [x] | Click Handler: Ziel setzen (Ctrl+Klick oder Rechtsklick) | `/map` | 1 | 5.2.5 |
| [x] | Drag Handler: Position Update während Drag | `/map` | 1 | 5.2.4-5 |
| [x] | Zoom Controls Styling | `/design` | 2 | 5.2.1 |
| [x] | Koordinaten-Anzeige an Mausposition | `/map` | 2 | 5.2.1 |
| [x] | **Loading-Indikator**: Spinner während Karten-Download | `/design` | 2 | 5.2.3 |

## 5.3 Config Components (Sidebar)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `ConfigPanel.tsx` - Container für Konfiguration | `/frontend` | 1 | 5.1.3 |
| [x] | `MortarTypeSelector.tsx` - US/RUS Toggle | `/frontend` | 1 | 4.1.3 |
| [x] | `AmmoTypeSelector.tsx` - HE/Smoke/Illumination | `/frontend` | 1 | 4.1.3 |
| [x] | `ChargeSelector.tsx` - Ring Count 0-4 Slider/Buttons | `/frontend` | 1 | 4.1.3 |
| [x] | `CoordinateInput.tsx` - Manuelle Ost/Nord Eingabe | `/frontend` | 1 | 4.1.4-5 |
| [x] | `HeightInput.tsx` - Höheneingabe für Mörser/Ziel | `/frontend` | 1 | 4.1.4-5 |
| [x] | `PositionSection.tsx` - Kombiniert Coordinate+Height | `/frontend` | 1 | 5.3.5-6 |
| [x] | `QuickStationSelect.tsx` - Dropdown für gespeicherte Stellungen | `/frontend` | 2 | 4.1.24 |
| [x] | Input Validierung (nur Zahlen, Bereich) | `/frontend` | 1 | 5.3.5-6 |
| [x] | Auto-Berechnung bei Input-Änderung | `/frontend` | 1 | 4.2.1 |
| [x] | Styling: Kompakte, dunkle Inputs | `/design` | 1 | 5.3.1-8 |

## 5.4 Results Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `FireSolutionPanel.tsx` - Ergebnis-Container | `/frontend` | 1 | 4.1.6 |
| [x] | `AzimuthDisplay.tsx` - Große Azimut-Anzeige (MIL + Grad) | `/frontend` | 1 | 5.4.1 |
| [x] | `ElevationDisplay.tsx` - Große Elevation-Anzeige (MIL) | `/frontend` | 1 | 5.4.1 |
| [x] | `FlightTimeDisplay.tsx` - Flugzeit in Sekunden | `/frontend` | 1 | 5.4.1 |
| [x] | `DistanceDisplay.tsx` - Entfernung in Metern | `/frontend` | 1 | 5.4.1 |
| [x] | `RingCountDisplay.tsx` - Empfohlene/Aktuelle Ladung | `/frontend` | 2 | 5.4.1 |
| [x] | `RangeWarning.tsx` - Warnung wenn außer Reichweite | `/frontend` | 1 | 2.3.14 |
| [x] | `HeightCorrectionInfo.tsx` - Delta ELEV Anzeige (in ElevationDisplay integriert) | `/frontend` | 2 | 5.4.3 |
| [x] | Styling: Große, leuchtende Zahlen | `/design` | 1 | 5.4.2-5 |
| [ ] | Animation bei Wert-Änderung | `/design` | 3 | 5.4.9 |
| [ ] | Copy-to-Clipboard für Werte | `/frontend` | 3 | 5.4.2-4 |

## 5.5 Mission Management Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `MissionPanel.tsx` - Tab/Bereich für Missionen | `/frontend` | 1 | 4.1.13 |
| [x] | `MissionList.tsx` - Liste gespeicherter Missionen | `/frontend` | 1 | 4.2.3 |
| [x] | `MissionCard.tsx` - Einzelne Mission mit Quick-Load | `/frontend` | 1 | 5.5.2 |
| [x] | `MissionSaveDialog.tsx` - Modal zum Speichern | `/frontend` | 1 | 4.1.16 |
| [x] | `MissionDeleteConfirm.tsx` - Löschen-Bestätigung | `/frontend` | 2 | 4.1.17 |
| [x] | Quick-Load Button pro Mission | `/frontend` | 1 | 4.1.18 |
| [x] | Mission-Name Eingabefeld | `/frontend` | 1 | 5.5.4 |
| [x] | Timestamp Anzeige pro Mission | `/frontend` | 2 | 5.5.3 |
| [ ] | Search/Filter für Missionen | `/frontend` | 3 | 5.5.2 |
| [x] | Styling: Kompakte Mission-Cards | `/design` | 1 | 5.5.3 |

## 5.6 Station Management Components (Vordefinierte Stellungen)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `StationPanel.tsx` - Tab/Bereich für Stellungen | `/frontend` | 1 | 4.1.20 |
| [x] | `StationList.tsx` - Liste gespeicherter Stellungen | `/frontend` | 1 | 4.2.4 |
| [x] | `StationCard.tsx` - Einzelne Stellung mit Quick-Select | `/frontend` | 1 | 5.6.2 |
| [x] | `StationSaveDialog.tsx` - Modal zum Speichern | `/frontend` | 1 | 4.1.22 |
| [x] | "Aktuelle Position als Stellung speichern" Button | `/frontend` | 1 | 5.6.4 |
| [x] | Station-Name Eingabefeld | `/frontend` | 1 | 5.6.4 |
| [x] | Default-Konfiguration pro Stellung (Mörser-Typ, Munition) | `/frontend` | 2 | 2.1.7 |
| [x] | "Stellung anfahren" = Quick-Load Position + Config | `/frontend` | 1 | 4.1.24 |
| [x] | Styling: Kompakte Station-Cards | `/design` | 1 | 5.6.3 |

## 5.7 Spotter Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `SpotterPanel.tsx` - Container für Spotter-Modus | `/spotter` | 1 | 4.1.28 |
| [x] | `SpotterToggle.tsx` - Spotter-Modus Ein/Aus | `/spotter` | 1 | 4.1.33 |
| [x] | `SpotterPositionInput.tsx` - GPS Position des Spotters | `/spotter` | 1 | 4.1.29 |
| [x] | `VectorMeasurementInput.tsx` - Entfernung + Azimut | `/spotter` | 1 | 4.1.30 |
| [x] | `HeightDiffInput.tsx` - Höhendifferenz vom Spotter | `/spotter` | 2 | 5.7.4 |
| [x] | "Ziel berechnen" Button | `/spotter` | 1 | 2.4.1 |
| [x] | Berechnetes Ziel Anzeige | `/spotter` | 1 | 5.7.6 |
| [x] | `CorrectionPanel.tsx` - Feuerkorrektur-Eingabe | `/spotter` | 1 | 4.1.31 |
| [x] | `CorrectionInput.tsx` - L/R und Add/Drop Felder | `/spotter` | 1 | 5.7.8 |
| [x] | "Korrektur anwenden" Button | `/spotter` | 1 | 4.1.35 |
| [x] | `CorrectionHistory.tsx` - Liste vorheriger Korrekturen | `/spotter` | 2 | 4.1.31 |
| [x] | Visual: Spotter-Sichtlinie auf Karte | `/spotter` | 2 | 5.2.9 |
| [x] | Styling: Spotter-Panel im taktischen Look | `/design` | 1 | 5.7.1-11 |

## 5.8 History Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `HistoryPanel.tsx` - Tab für Schuss-Historie | `/frontend` | 2 | 4.1.25 |
| [x] | `HistoryList.tsx` - Liste vergangener Schüsse | `/frontend` | 2 | 4.2.6 |
| [x] | `HistoryEntry.tsx` - Einzelner Eintrag mit Details | `/frontend` | 2 | 5.8.2 |
| [x] | Timestamp + Mission-Referenz | `/frontend` | 2 | 5.8.3 |
| [x] | "Erneut laden" Button pro Eintrag | `/frontend` | 2 | 5.8.3 |
| [x] | "Historie löschen" Button | `/frontend` | 3 | 4.1.27 |
| [x] | Pagination/Infinite Scroll | `/frontend` | 3 | 5.8.2 |

## 5.9 Settings Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `SettingsModal.tsx` - Einstellungen Dialog | `/frontend` | 2 | 4.1.36 |
| [x] | Theme Toggle (Dark/Light - vorerst nur Dark) | `/frontend` | 3 | 5.1.7 |
| [x] | Language Selector (DE/EN) | `/frontend` | 3 | 5.9.1 |
| [x] | Default Mörser-Typ Einstellung | `/frontend` | 2 | 5.9.1 |
| [x] | Default Munition Einstellung | `/frontend` | 2 | 5.9.1 |
| [x] | Grid Ein/Aus Toggle | `/frontend` | 2 | 5.2.7 |
| [x] | Reset to Defaults Button | `/frontend` | 3 | 5.9.1 |

## 5.10 User Profile Components

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `ProfilePanel.tsx` - Benutzer-Bereich | `/frontend` | 2 | 4.1.36 |
| [x] | Benutzername Eingabe/Anzeige | `/frontend` | 2 | 5.10.1 |
| [x] | Statistik-Anzeige (Anzahl Missionen, Schüsse) | `/frontend` | 3 | 5.10.1 |
| [x] | Export Profil (JSON Download) | `/frontend` | 3 | 5.10.1 |
| [x] | Import Profil (JSON Upload) | `/frontend` | 3 | 5.10.1 |

---

# PHASE 6: INTEGRATION & POLISH

## 6.1 Vollständige Integration

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Alle Stores miteinander verbinden | `/frontend` | 1 | Phase 4 komplett |
| [x] | Alle Components mit Stores verbinden | `/frontend` | 1 | Phase 5 komplett |
| [x] | Electron IPC in Hooks integrieren | `/frontend` | 1 | Phase 3 komplett |
| [x] | Initiales Laden aller Daten beim App-Start | `/frontend` | 1 | 6.1.1-3 |
| [x] | Error Boundaries für alle Hauptbereiche | `/frontend` | 2 | 6.1.2 |
| [x] | Loading States für async Operationen | `/frontend` | 2 | 6.1.3 |

## 6.2 UI/UX Polish

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | Konsistentes Spacing/Padding überall | `/design` | 1 | Phase 5 komplett |
| [x] | Hover States für alle interaktiven Elemente | `/design` | 1 | 6.2.1 |
| [x] | Focus States für Accessibility | `/design` | 2 | 6.2.2 |
| [x] | Transitions/Animationen für State-Änderungen | `/design` | 2 | 6.2.1 |
| [x] | Toast Notifications für Aktionen | `/design` | 2 | 6.1.2 |
| [ ] | Tooltips für komplexe UI-Elemente | `/design` | 3 | 6.2.1 |
| [x] | Icons für alle Buttons (Lucide/Heroicons) | `/design` | 2 | Phase 5 komplett |
| [x] | App Icon für Electron (ICO, PNG) | `/design` | 2 | 3.1.2 |

## 6.3 Performance Optimierung

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | React.memo für teure Components | `/frontend` | 2 | 6.1.2 |
| [x] | useMemo für Berechnungen | `/frontend` | 2 | 6.1.1 |
| [x] | useCallback für Event Handlers | `/frontend` | 2 | 6.1.2 |
| [x] | Debounced Berechnung beim Drag (< 16ms) | `/frontend` | 1 | 4.2.2 |
| [ ] | Lazy Loading für Map Tiles | `/map` | 2 | 5.2.1 |
| [ ] | Bundle Size Analyse | `/electron` | 3 | 6.3.1-5 |
| [ ] | **findBestRing Integration**: Terrain-Profil in Auto-Berechnung | `/ballistics` | 1 | 6.3.4 |

## 6.4 Keyboard Shortcuts

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [x] | `Ctrl+S`: Aktuelle Mission speichern | `/frontend` | 2 | 4.2.8 |
| [x] | `Ctrl+N`: Neue Mission (Reset) | `/frontend` | 3 | 4.2.8 |
| [x] | `Escape`: Dialoge schließen | `/frontend` | 2 | 4.2.8 |
| [x] | `Tab`: Durch Eingabefelder navigieren | `/frontend` | 2 | 4.2.8 |
| [x] | `1-5`: Ring Count schnell wählen | `/frontend` | 3 | 4.2.8 |

---

# PHASE 7: TESTING

## 7.1 Unit Tests

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | Tests für alle Ballistics-Funktionen | `/qaa` | 1 | Phase 2.3 |
| [ ] | Tests für alle Spotter-Funktionen | `/qaa` | 1 | Phase 2.4 |
| [ ] | Tests für alle Storage-Funktionen | `/qaa` | 2 | Phase 2.5 |
| [ ] | Tests für Custom Hooks | `/qaa` | 2 | Phase 4.2 |
| [ ] | Test Coverage > 80% für lib/ | `/qaa` | 2 | 7.1.1-4 |

## 7.2 Component Tests

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | Tests für FireSolutionPanel | `/qaa` | 2 | 5.4.1 |
| [ ] | Tests für ConfigPanel | `/qaa` | 2 | 5.3.1 |
| [ ] | Tests für MissionList | `/qaa` | 2 | 5.5.2 |
| [ ] | Tests für StationList | `/qaa` | 2 | 5.6.2 |
| [ ] | Snapshot Tests für Layout | `/qaa` | 3 | Phase 5 |

## 7.3 Integration Tests

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | Vollständiger Workflow: Position setzen → Berechnung | `/qaa` | 1 | 6.1.4 |
| [ ] | Vollständiger Workflow: Mission speichern/laden | `/qaa` | 1 | 6.1.4 |
| [ ] | Vollständiger Workflow: Station speichern/laden | `/qaa` | 1 | 6.1.4 |
| [ ] | Vollständiger Workflow: Spotter Modus | `/qaa` | 2 | 6.1.4 |
| [ ] | Electron IPC Roundtrip Tests | `/qaa` | 2 | 6.1.3 |

## 7.4 Validierung gegen Referenzdaten

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | Test gegen Marcel's Excel Beispiel (481/473 → 707/428) | `/qaa` | 1 | 7.1.1 |
| [ ] | Test gegen Gene's Tabelle (alle Ring-Kombinationen) | `/qaa` | 1 | 7.1.1 |
| [ ] | Test gegen In-Game Artillery Table Screenshot | `/qaa` | 1 | 7.1.1 |
| [ ] | Abweichung dokumentieren (soll < 5m bei 2000m) | `/qaa` | 1 | 7.4.1-3 |

---

# PHASE 8: BUILD & RELEASE

## 8.1 Build Konfiguration

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | electron-builder Konfiguration | `/electron` | 1 | Phase 7 |
| [ ] | Windows NSIS Installer Setup | `/electron` | 1 | 8.1.1 |
| [ ] | Portable EXE Build | `/electron` | 2 | 8.1.1 |
| [ ] | Auto-Updater Konfiguration (optional) | `/electron` | 3 | 8.1.1 |
| [ ] | Build ohne private Pfade verifizieren | `/lead` | 1 | 8.1.1-3 |

## 8.2 Code Signing (optional aber empfohlen)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | Code Signing Zertifikat beschaffen | `/lead` | 3 | 8.1.1 |
| [ ] | Signing in Build-Prozess integrieren | `/electron` | 3 | 8.2.1 |
| [ ] | Antivirus Test auf sauberem System | `/qaa` | 2 | 8.1.2-3 |

## 8.3 Release Vorbereitung

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | CHANGELOG.md erstellen | `/lead` | 2 | Phase 7 |
| [ ] | Version in package.json setzen (1.0.0) | `/lead` | 1 | 8.3.1 |
| [ ] | README.md mit Screenshots aktualisieren | `/lead` | 2 | 8.3.2 |

## 8.4 GitHub (SPÄTER - Optional)

| Status | Task | Agent | Prio | Abhängig von |
|--------|------|-------|------|--------------|
| [ ] | GitHub Repository erstellen | `/lead` | 4 | 8.3.3 |
| [ ] | .claude/ Ordner in .gitignore verifizieren | `/lead` | 4 | 8.4.1 |
| [ ] | Keine Claude-Referenzen im öffentlichen Code | `/lead` | 4 | 8.4.1 |
| [ ] | GitHub Release mit Binaries | `/lead` | 4 | 8.4.1-3 |

---

# ZUSAMMENFASSUNG

## Gesamt-Tasks pro Agent

| Agent | Anzahl Tasks |
|-------|-------------|
| `/lead` | ~15 |
| `/ballistics` | ~45 |
| `/frontend` | ~95 |
| `/electron` | ~50 |
| `/map` | ~20 |
| `/design` | ~30 |
| `/spotter` | ~20 |
| `/qaa` | ~40 |

## Kritischer Pfad (Prio 1 Tasks)

1. Projekt Setup (1.1, 1.2)
2. Type Definitionen (2.1)
3. Ballistische Tabellen (2.2)
4. Core Calculator (2.3)
5. Storage Backend (2.5)
6. Electron IPC (3.2)
7. Zustand Store (4.1)
8. Map Components (5.2)
9. Config Components (5.3)
10. Results Components (5.4)
11. Integration (6.1)
12. Validierung (7.4)
13. Build (8.1)

## Features die arma-mortar.com fehlen (jetzt integriert)

- [x] **Personalisierung**: User Profile mit Name und Präferenzen
- [x] **Historie**: Schuss-Historie mit Timestamp und Mission-Referenz
- [x] **Feuermissionen speichern**: Vollständige Mission mit allen Parametern
- [x] **Vordefinierte Stellungen**: "Stellung anfahren, aufbauen, schießen"
- [x] **Spotter Integration**: Vector 21 Fernglas Support
- [x] **Feuerkorrektur**: Korrekturwerte eingeben und anwenden
- [x] **Offline-fähig**: Komplett lokal, keine Internetverbindung nötig
