# System-Architektur
# Arma Reforger Artillery Calculator (ARAC)

## 1. Technologie-Stack

### 1.1 Empfohlene Technologie: Electron + React

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Electron (Main Process)                  ││
│  │  - Window Management                                     ││
│  │  - File System Access                                    ││
│  │  - Native OS Integration                                 ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Electron (Renderer Process)                 ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │                   React Frontend                     │││
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐  │││
│  │  │  │ Map     │  │ Config  │  │ Results Display     │  │││
│  │  │  │ View    │  │ Panel   │  │ (Azimut, Elevation) │  │││
│  │  │  └─────────┘  └─────────┘  └─────────────────────┘  │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │              Calculation Engine (JS)                 │││
│  │  │  - Ballistics Calculator                             │││
│  │  │  - Coordinate Transformer                            │││
│  │  │  - Polynomial Interpolation                          │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Local Storage                         ││
│  │  - settings.json (Preferences)                           ││
│  │  - missions.json (Saved Fire Missions)                   ││
│  │  - ballistics/ (Ballistic Tables)                        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 External CDN (GeNeFRAG)                   ││
│  │  - Map Images (24 Maps, up to 17.150 x 17.150 px)        ││
│  │  - Height Data (9 Maps with terrain elevation)           ││
│  │  - CDN: pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Warum Electron + React?

| Kriterium | Electron + React | Alternativen |
|-----------|------------------|--------------|
| Windows-Unterstützung | Nativ | Tauri (neu), PyQt (Python) |
| Moderne UI | React + TailwindCSS | Qt Widgets, WPF |
| Karten-Integration | Leaflet.js perfekt | OpenLayers, eigene Lösung |
| Bundle-Größe | ~150MB | Tauri: ~10MB, PyQt: ~80MB |
| Entwickler-Community | Sehr groß | Tauri wächst |
| Antivirus-Kompatibilität | Gut (bekannte Technologie) | Gut |

**Entscheidung**: Electron bietet die beste Balance aus Entwicklungsgeschwindigkeit, UI-Möglichkeiten und Karten-Integration.

---

## 2. Projektstruktur

```
arma-reforger-artillery-calc/
├── package.json
├── electron/
│   ├── main.ts              # Electron Main Process
│   ├── preload.ts           # Secure Bridge to Renderer
│   └── ipc/
│       ├── fileHandler.ts   # File Operations
│       └── settingsHandler.ts
├── src/
│   ├── main.tsx             # React Entry Point
│   ├── App.tsx              # Main App Component
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx          # Leaflet Map Container
│   │   │   ├── MortarMarker.tsx     # Mortar Position Marker
│   │   │   ├── TargetMarker.tsx     # Target Position Marker
│   │   │   ├── FireLine.tsx         # Line between Mortar & Target
│   │   │   └── CoordinateGrid.tsx   # Grid Overlay
│   │   ├── Config/
│   │   │   ├── MortarSelector.tsx   # US/RUS Selection
│   │   │   ├── AmmoSelector.tsx     # HE/Smoke/Illumination
│   │   │   ├── ChargeSelector.tsx   # Ring Count (0-4)
│   │   │   └── ElevationInput.tsx   # Height Inputs
│   │   ├── Results/
│   │   │   ├── FireSolution.tsx     # Main Results Display
│   │   │   ├── AzimuthDisplay.tsx   # Direction in MIL
│   │   │   ├── ElevationDisplay.tsx # Elevation in MIL
│   │   │   └── FlightTimeDisplay.tsx
│   │   ├── Spotter/
│   │   │   └── SpotterInput.tsx     # Vector Binocular Input
│   │   ├── Missions/
│   │   │   ├── MissionList.tsx      # Saved Missions
│   │   │   └── MissionSaveDialog.tsx
│   │   └── UI/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useCalculation.ts        # Main Calculation Hook
│   │   ├── useMap.ts                # Map State Management
│   │   ├── useMissions.ts           # Mission Storage
│   │   └── useSettings.ts           # App Settings
│   ├── lib/
│   │   ├── ballistics/
│   │   │   ├── calculator.ts        # Main Calculator
│   │   │   ├── tables/
│   │   │   │   ├── us_mortar.json   # US Ballistic Data
│   │   │   │   └── rus_mortar.json  # RUS Ballistic Data
│   │   │   ├── interpolation.ts     # Polynomial Interpolation
│   │   │   ├── azimuth.ts           # Direction Calculation
│   │   │   └── elevation.ts         # Elevation Calculation
│   │   ├── coordinates/
│   │   │   ├── distance.ts          # Distance Calculation
│   │   │   ├── converter.ts         # Coordinate Conversion
│   │   │   └── spotter.ts           # Spotter Calculation
│   │   └── storage/
│   │       ├── missions.ts          # Mission CRUD
│   │       └── settings.ts          # Settings CRUD
│   ├── types/
│   │   ├── mortar.ts                # Mortar Types
│   │   ├── mission.ts               # Mission Types
│   │   └── coordinates.ts           # Coordinate Types
│   ├── assets/
│   │   └── icons/                   # App Icons
│   └── styles/
│       └── globals.css              # TailwindCSS
├── public/
│   └── index.html
└── tests/
    ├── ballistics.test.ts
    └── coordinates.test.ts
```

---

## 3. Komponenten-Architektur

### 3.1 Datenfluss

```
┌──────────────────────────────────────────────────────────────────┐
│                           App State                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Mortar Config  │  │   Positions    │  │  Fire Solution     │  │
│  │ - type: US/RUS │  │ - mortar: {x,y}│  │ - azimuth: number  │  │
│  │ - ammo: HE/... │  │ - target: {x,y}│  │ - elevation: number│  │
│  │ - charge: 0-4  │  │ - heights      │  │ - flightTime: num  │  │
│  └───────┬────────┘  └───────┬────────┘  └────────────────────┘  │
│          │                   │                      ▲            │
│          └─────────┬─────────┘                      │            │
│                    ▼                                │            │
│          ┌─────────────────────┐                    │            │
│          │ Calculation Engine  │────────────────────┘            │
│          └─────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Berechnungs-Engine

```typescript
// lib/ballistics/calculator.ts

interface FireSolution {
  azimuth: number;        // Richtung in MIL (0-6400)
  azimuthDeg: number;     // Richtung in Grad (0-360)
  elevation: number;      // Höhenwinkel in MIL
  elevationAdj: number;   // Korrigiert für Höhendifferenz
  distance: number;       // Entfernung in Metern
  flightTime: number;     // Flugzeit in Sekunden
  inRange: boolean;       // Ziel erreichbar?
  recommendedCharge: number; // Empfohlene Ladung
}

interface CalculationInput {
  mortarPos: { east: number; north: number; height: number };
  targetPos: { east: number; north: number; height: number };
  mortarType: 'US' | 'RUS';
  ammoType: 'HE' | 'Smoke' | 'Illumination';
  chargeCount: number; // 0-4
  wind?: { direction: number; speed: number };
}

function calculateFireSolution(input: CalculationInput): FireSolution {
  // 1. Entfernung berechnen
  const distance = calculateDistance(input.mortarPos, input.targetPos);

  // 2. Azimut berechnen
  const azimuth = calculateAzimuth(input.mortarPos, input.targetPos);

  // 3. Basis-Elevation aus Tabelle interpolieren
  const baseElevation = interpolateElevation(
    input.mortarType,
    input.ammoType,
    input.chargeCount,
    distance
  );

  // 4. Höhenkorrektur berechnen
  const heightDiff = input.targetPos.height - input.mortarPos.height;
  const deltaElev = calculateDeltaElevation(heightDiff, distance, input.chargeCount);

  // 5. Finale Elevation
  const elevation = baseElevation - deltaElev; // Minus weil höheres Ziel = niedrigere Elevation

  // 6. Flugzeit interpolieren
  const flightTime = interpolateFlightTime(
    input.mortarType,
    input.ammoType,
    input.chargeCount,
    distance
  );

  return {
    azimuth: azimuth.mil,
    azimuthDeg: azimuth.deg,
    elevation: baseElevation,
    elevationAdj: elevation,
    distance,
    flightTime,
    inRange: checkRange(input.mortarType, input.ammoType, input.chargeCount, distance),
    recommendedCharge: findOptimalCharge(input.mortarType, input.ammoType, distance)
  };
}
```

### 3.3 Polynomial-Interpolation (aus Marcel's Excel)

```typescript
// lib/ballistics/interpolation.ts

// Polynomial-Koeffizienten für Elevation (MIL) basierend auf Entfernung
// Format: a0 + a1*x + a2*x² + a3*x³ + a4*x⁴ + a5*x⁵
// wobei x = Entfernung in Metern

interface PolynomialCoefficients {
  a0: number;
  a1: number;
  a2: number;
  a3: number;
  a4: number;
  a5: number;
}

// Beispiel-Koeffizienten (aus Excel extrahiert)
const US_HE_RING4: PolynomialCoefficients = {
  a0: 1652.31,
  a1: -0.430979,
  a2: 0.000459,
  a3: -0.0,
  a4: 0.0,
  a5: -0.0
};

function polynomialElevation(distance: number, coeffs: PolynomialCoefficients): number {
  const x = distance;
  return coeffs.a0
    + coeffs.a1 * x
    + coeffs.a2 * Math.pow(x, 2)
    + coeffs.a3 * Math.pow(x, 3)
    + coeffs.a4 * Math.pow(x, 4)
    + coeffs.a5 * Math.pow(x, 5);
}
```

---

## 4. Karten-Integration (CDN-basiert)

### 4.1 Datenquelle

Karten werden von GeNeFRAG's CDN geladen (Cloudflare R2 Storage):
- **Repository**: https://github.com/GeNeFRAG/ArmaReforger
- **CDN Base URL**: `https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/`
- **Lokale Konfiguration**: `data/maps/all_arma_maps.json`

### 4.2 Map-Konfiguration Interface

```typescript
// lib/maps/types.ts

interface ArmaMap {
  name: string;           // Display name (e.g., "Everon")
  namespace: string;      // Unique ID (e.g., "everon")
  size: [number, number]; // [width, height] in pixels (1px ≈ 1m)
  max_zoom: number;       // Maximum zoom level (5-7)
  resources: {
    map_image: string;    // CDN URL to full satellite image
    height_data?: string; // CDN URL to height JSON (optional)
  };
}
```

### 4.3 Leaflet.js mit CDN Image Overlay

```typescript
// components/Map/MapView.tsx

import { MapContainer, ImageOverlay, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '@/stores/useAppStore';

// Custom CRS für Arma Reforger Koordinaten (1 pixel = 1 meter)
const ArmaCRS = L.CRS.Simple;

function MapView() {
  const { selectedMap } = useAppStore();

  if (!selectedMap) return null;

  const [width, height] = selectedMap.size;
  // Leaflet Simple CRS: [[south, west], [north, east]]
  const bounds: L.LatLngBoundsExpression = [[0, 0], [height, width]];

  return (
    <MapContainer
      crs={ArmaCRS}
      bounds={bounds}
      maxBounds={bounds}
      minZoom={-2}
      maxZoom={selectedMap.max_zoom}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Map image loaded directly from CDN */}
      <ImageOverlay
        url={selectedMap.resources.map_image}
        bounds={bounds}
      />
      <MortarMarker />
      <TargetMarker />
      <FireLine />
      <CoordinateGrid />
    </MapContainer>
  );
}
```

### 4.4 Koordinaten-Konvertierung

```typescript
// In Leaflet Simple CRS:
// - lat (Y) = North coordinate (from bottom)
// - lng (X) = East coordinate (from left)

// Leaflet → Game Coordinates
function leafletToGame(latlng: L.LatLng, mapHeight: number): Coordinate {
  return {
    east: Math.round(latlng.lng),
    north: Math.round(mapHeight - latlng.lat), // Flip Y-axis
    height: 0
  };
}

// Game → Leaflet Coordinates
function gameToLeaflet(coord: Coordinate, mapHeight: number): L.LatLng {
  return L.latLng(mapHeight - coord.north, coord.east);
}
```

### 4.5 Verfügbare Karten

| Map | Größe | Zoom | Höhendaten |
|-----|-------|------|------------|
| Everon | 12.8 km | 7 | Ja |
| Arland | 4.1 km | 6 | Ja |
| Kolguev | 12.8 km | 7 | Ja |
| Anizay | 10.2 km | 7 | Ja |
| + 20 weitere... | | | |

Siehe `data/maps/all_arma_maps.json` für vollständige Liste.

### 4.6 Höhendaten Integration (Optional)

```typescript
// Automatische Höhenabfrage für Maps mit height_data
async function getTerrainHeight(
  map: ArmaMap,
  coord: Coordinate
): Promise<number | null> {
  if (!map.resources.height_data) return null;

  // Load height data from CDN (cached)
  const heightData = await fetchHeightData(map.resources.height_data);

  // Lookup height at coordinate
  return heightData[coord.north]?.[coord.east] ?? null;
}
```

### 4.7 Referenz-Implementation

Siehe `docs/reference/map_viewer.html` für eine funktionierende Vanilla JS Implementation mit:
- Map-Auswahl (24 Karten)
- Zoom und Pan
- Adaptives Koordinaten-Grid
- Echtzeit Koordinatenanzeige

---

## 5. Datenspeicherung

### 5.1 Speicherort (Windows)

```
%APPDATA%/ArmaReforgerArtilleryCalc/
├── settings.json       # App-Einstellungen
├── missions.json       # Gespeicherte Fire Missions
└── logs/               # Debug-Logs (optional)
```

### 5.2 Datenformate

```typescript
// types/mission.ts

interface SavedMission {
  id: string;
  name: string;
  createdAt: string;      // ISO Date
  mapId: string;          // z.B. "everon"
  mortarConfig: {
    type: 'US' | 'RUS';
    ammo: 'HE' | 'Smoke' | 'Illumination';
    charge: number;
  };
  mortarPos: {
    east: number;
    north: number;
    height: number;
  };
  targetPos: {
    east: number;
    north: number;
    height: number;
  };
  fireSolution: {
    azimuth: number;
    elevation: number;
    flightTime: number;
  };
}

// settings.json
interface AppSettings {
  theme: 'dark' | 'light';
  defaultMortarType: 'US' | 'RUS';
  defaultAmmo: 'HE' | 'Smoke' | 'Illumination';
  showGrid: boolean;
  language: 'de' | 'en';
}
```

---

## 6. Security & Antivirus-Kompatibilität

### 6.1 Code-Signing
- Electron-App mit Zertifikat signieren
- Verhindert "Unknown Publisher" Warnung
- Reduziert Antivirus False-Positives

### 6.2 Sichere IPC
```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Nur erlaubte Operationen exponieren
contextBridge.exposeInMainWorld('api', {
  saveMission: (mission: SavedMission) =>
    ipcRenderer.invoke('save-mission', mission),
  loadMissions: () =>
    ipcRenderer.invoke('load-missions'),
  getSettings: () =>
    ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: AppSettings) =>
    ipcRenderer.invoke('save-settings', settings)
});
```

### 6.3 Keine verdächtigen Operationen
- Kein Netzwerk-Zugriff (komplett offline)
- Kein Registry-Zugriff
- Keine Prozess-Injection
- Keine Keyboard-Hooks
- Nur AppData-Schreibzugriff

---

## 7. Build & Distribution

### 7.1 Build-Konfiguration

```json
// package.json
{
  "name": "arma-reforger-artillery-calc",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "electron:dev": "electron .",
    "electron:build": "electron-builder"
  },
  "build": {
    "appId": "com.arac.artillery-calculator",
    "productName": "ARAC - Artillery Calculator",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### 7.2 Distribution
- **Installer**: NSIS für Windows (.exe)
- **Portable**: Standalone .exe ohne Installation
- **GitHub Releases**: Automatische Builds via GitHub Actions

---

## 8. Erweiterbarkeit

### 8.1 Neue Karten hinzufügen
1. Map-Tiles in `/assets/maps/{map_id}/` ablegen
2. Map-Config in `maps.json` eintragen
3. Koordinatensystem-Grenzen definieren

### 8.2 Neue Mörser/Waffen hinzufügen
1. Ballistic-Table in `/lib/ballistics/tables/` als JSON
2. Polynomial-Koeffizienten berechnen oder aus Tabelle ableiten
3. In Calculator registrieren

### 8.3 Wind-Korrektur (experimentell)
```typescript
// Platzhalter für Wind-Berechnung
// Benötigt empirische Daten aus dem Spiel

interface WindCorrection {
  azimuthOffset: number;  // MIL Korrektur für Seitenwind
  rangeOffset: number;    // Meter Korrektur für Gegen-/Rückenwind
}

function calculateWindCorrection(
  wind: { direction: number; speed: number },
  azimuth: number,
  distance: number,
  flightTime: number
): WindCorrection {
  // TODO: Empirische Formel aus Spieltests ableiten
  // Vermutung: Linearer Einfluss basierend auf Flugzeit

  const crosswindComponent = Math.sin((wind.direction - azimuth) * Math.PI / 180) * wind.speed;
  const headwindComponent = Math.cos((wind.direction - azimuth) * Math.PI / 180) * wind.speed;

  // PLACEHOLDER - muss kalibriert werden!
  const WIND_FACTOR_LATERAL = 0.5; // MIL pro m/s Seitenwind pro Sekunde Flugzeit
  const WIND_FACTOR_RANGE = 1.0;   // Meter pro m/s Gegen-/Rückenwind pro Sekunde Flugzeit

  return {
    azimuthOffset: crosswindComponent * flightTime * WIND_FACTOR_LATERAL,
    rangeOffset: headwindComponent * flightTime * WIND_FACTOR_RANGE
  };
}
```
