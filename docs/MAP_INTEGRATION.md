# Map Integration - ARAC

## Übersicht

Die Map-Integration für ARAC verwendet Leaflet.js mit einem Custom CRS (Coordinate Reference System) für Arma Reforger Spielkoordinaten.

## Architektur

### Custom CRS
- **CRS**: `L.CRS.Simple` für 2D-Spielkoordinaten
- **Einheiten**: Game Units in 10m-Schritten
- **Koordinatensystem**: Ost (X) / Nord (Y)
- **Bounds**: [0, 0] bis [10000, 10000] für Everon

### Komponenten

#### MapView.tsx
Haupt-Container für die Leaflet-Karte mit:
- MapContainer mit Custom CRS
- TileLayer (optional, wenn verfügbar)
- CoordinateGrid für Orientierung
- Marker (Mörser, Ziel, Spotter)
- Overlays (FireLine, RangeCircle)

#### CoordinateGrid.tsx
Zeichnet ein Koordinaten-Grid auf der Karte:
- Grid-Linien alle 100 Einheiten (1km)
- Labels an den Rändern
- Anpassbare Farbe und Opacity

#### MapSelector.tsx
Dropdown für Kartenauswahl:
- Everon (Standard)
- Arland (vorbereitet)
- Conflict (vorbereitet)

### Map Configurations

Karten-Konfigurationen in `/src/lib/maps/configs.ts`:

```typescript
interface MapConfig {
  id: string              // "everon"
  name: string            // "everon"
  displayName: string     // "Everon"
  bounds: [[number, number], [number, number]]
  center: [number, number]
  minZoom: number
  maxZoom: number
  defaultZoom: number
  gridInterval: number    // Grid-Abstände in Game Units
  tileUrl?: string       // Optional: Tile-Server URL
  attribution?: string
}
```

## Tile-Integration

### Aktueller Stand
- **Kein TileLayer**: Die Karte zeigt aktuell nur einen dunklen Hintergrund mit Grid
- **Grid-basiert**: Koordinaten-Grid für Orientierung
- **Funktional**: Alle Marker und Berechnungen funktionieren ohne Tiles

### Tiles hinzufügen (zukünftig)

Es gibt mehrere Optionen, um Karten-Tiles zu integrieren:

#### Option 1: Custom Tile-Server
Eigenen Tile-Server mit Arma Reforger Karten-Imagery aufsetzen:

1. Karten-Screenshots aus Arma Reforger extrahieren
2. Mit Tools wie `gdal2tiles` in Tiles konvertieren
3. Auf eigenem Server hosten
4. In `configs.ts` einbinden:

```typescript
tileUrl: 'https://your-server.com/tiles/everon/{z}/{x}/{y}.png'
```

#### Option 2: iZurvive-Integration
iZurvive bietet hochwertige Arma Reforger Karten:
- URL: https://www.izurvive.com/reforger_everon/
- Eventuell API oder Tile-Zugriff anfragen
- Lizenzierung beachten

#### Option 3: Community-Tiles
- Recherche nach Community-Projekten mit Arma Reforger Tiles
- Eventuell arma-mortar.com kontaktieren für Tile-Sharing

#### Option 4: Hybrid-Ansatz
- Aktuell: Grid-basiert (wie jetzt)
- Optional: Tiles laden wenn verfügbar
- Fallback: Grid-System

## Koordinaten-Transformation

### Leaflet ↔ Arma
```typescript
// Leaflet LatLng → Arma Koordinaten
function leafletToArma(latlng: L.LatLng) {
  return {
    east: latlng.lng / 10,   // X = Ost
    north: latlng.lat / 10   // Y = Nord
  }
}

// Arma → Leaflet LatLng
function armaToLeaflet(east: number, north: number) {
  return L.latLng(north * 10, east * 10)
}
```

## State Management

Map-State wird in Zustand Store verwaltet:
- `selectedMap`: Aktuell ausgewählte Karte (z.B. "everon")
- `setSelectedMap(mapId)`: Karte wechseln

## Styling

CSS-Klassen in `globals.css`:
- `.map-selector` - Container für MapSelector
- `.map-selector-dropdown` - Dropdown-Styling
- `.grid-label` - Grid-Label-Styling

## Performance

### Optimierungen
- Grid wird nur einmal beim Mount gerendert
- MapUpdater Component für effiziente Updates
- Marker sind optimiert mit `interactive: false` für Grid

### Zukünftige Optimierungen
- Grid nur bei bestimmten Zoom-Levels anzeigen
- Tile-Caching implementieren
- Lazy-Loading für große Maps

## Neue Karte hinzufügen

1. Konfiguration in `/src/lib/maps/configs.ts`:
```typescript
export const NEW_MAP_CONFIG: MapConfig = {
  id: 'newmap',
  name: 'newmap',
  displayName: 'New Map',
  bounds: [[0, 0], [8000, 8000]],
  center: [4000, 4000],
  minZoom: -2,
  maxZoom: 2,
  defaultZoom: -1,
  gridInterval: 100,
  tileUrl: undefined, // Optional
  attribution: 'Arma Reforger - New Map'
}
```

2. Type in `types.ts` erweitern:
```typescript
export type MapId = 'everon' | 'arland' | 'conflict' | 'newmap'
```

3. In MAP_CONFIGS hinzufügen:
```typescript
export const MAP_CONFIGS: Record<MapId, MapConfig> = {
  everon: EVERON_CONFIG,
  arland: ARLAND_CONFIG,
  conflict: CONFLICT_CONFIG,
  newmap: NEW_MAP_CONFIG
}
```

## Bekannte Limitierungen

1. **Keine Tiles**: Aktuell nur Grid-basiert
2. **Keine Höhendaten**: Karte ist 2D
3. **Keine POIs**: Keine Points of Interest markiert
4. **Statische Bounds**: Map-Größen sind fix

## Roadmap

### Phase 1 (Aktuell) ✅
- [x] Leaflet-Integration
- [x] Custom CRS für Arma-Koordinaten
- [x] Coordinate Grid
- [x] Map Selector
- [x] Multi-Map Support (Konfiguration)

### Phase 2 (Nächste Schritte)
- [ ] Tile-Integration (Option prüfen)
- [ ] Zoom-abhängiges Grid (100m bei high zoom)
- [ ] Map-Overlays (POIs, Landmarks)
- [ ] Screenshot-Export

### Phase 3 (Future)
- [ ] Höhenkarten-Integration
- [ ] Terrain-Analyse
- [ ] Wind-Overlay (falls relevant)
- [ ] Multi-Layer Support

## Ressourcen

### Externe Links
- [iZurvive Everon](https://www.izurvive.com/reforger_everon/)
- [arma-mortar.com](https://arma-mortar.com/)
- [Leaflet Docs](https://leafletjs.com/)
- [React-Leaflet Docs](https://react-leaflet.js.org/)

### Arma Reforger
- Koordinatensystem: 10m-Einheiten
- In-Game Map: Grid mit Nummern
- Everon: ~12.8km x 12.8km
