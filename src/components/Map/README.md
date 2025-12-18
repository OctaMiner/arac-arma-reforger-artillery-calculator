# Map Components

Karten-Komponenten für ARAC mit Leaflet/React-Leaflet Integration.

## Komponenten

### MapView.tsx

Haupt-Container für die Leaflet-Karte.

**Features:**

- Simple CRS für Arma Reforger Koordinaten (0-10000)
- Dunkler Hintergrund (#1a1a2e)
- Zoom-Level: -2 bis 2
- Maximale Bounds: [[0,0], [10000, 10000]]

### MortarMarker.tsx

Draggable Marker für die Mörser-Position.

**Features:**

- Blaues Icon mit "M"
- Tooltip zeigt East, North, Height
- onDragEnd → Update Store + Berechnung

### TargetMarker.tsx

Draggable Marker für die Ziel-Position.

**Features:**

- Rotes Icon mit Kreuz
- Tooltip zeigt East, North, Height
- onDragEnd → Update Store + Berechnung

### FireLine.tsx

Gestrichelte Linie zwischen Mörser und Ziel.

**Features:**

- Rot (#ff6b6b)
- Dasharray: 10, 10
- Zeigt Schussrichtung

### CoordinateDisplay.tsx

Zeigt aktuelle Mausposition in Arma-Koordinaten.

**Features:**

- Position: Bottom-Right
- Format: "E: 1234 | N: 5678"
- Verschwindet wenn Maus die Karte verlässt

### MapClickHandler.tsx

Verwaltet Klick-Interaktionen auf der Karte.

**Features:**

- Linksklick → Setzt Mörser-Position
- Rechtsklick → Setzt Ziel-Position
- Ctrl/Alt + Klick → Setzt Ziel-Position

### CoordinateGrid.tsx (NEU - Adaptive)

Adaptives Koordinatenraster, das sich automatisch dem Zoom-Level anpasst.

**Features:**

- Zoom-basierte Grid-Intervalle (10m bis 1000m)
- Performance-optimiert (max 500 Linien)
- Nur sichtbarer Bereich wird gerendert
- Togglebar über MapControls
- Grid-Labels bei 1km Intervallen
- Basiert auf Gene's Referenz-Implementation

**Zoom-Levels:**

- Zoom < -1: 1000m Grid
- Zoom < 0: 500m Grid
- Zoom < 1: 200m Grid
- Zoom < 2: 100m Grid
- Zoom < 3: 50m Grid
- Zoom < 4: 20m Grid
- Zoom >= 4: 10m Grid

### MapControls.tsx (NEU)

UI-Overlay für Map-Steuerungen.

**Features:**

- Grid Toggle-Button (oben rechts)
- Visuelles Feedback (grün = aktiv, grau = inaktiv)
- Erweiterbar für weitere Map-Features

## Koordinaten-System

### Arma Reforger Koordinaten

- **East (X-Achse):** 0-10000 (10m Einheiten)
- **North (Y-Achse):** 0-10000 (10m Einheiten)
- **Height (Z-Achse):** Meter über Meeresspiegel

### Leaflet Koordinaten

- Leaflet verwendet [lat, lng] = [Y, X]
- Arma [east, north] = Leaflet [north, east]

### Transformation

```typescript
// Arma → Leaflet
const leafletPos: [number, number] = [coordinate.north, coordinate.east];

// Leaflet → Arma
const armaCoord: Coordinate = {
  east: Math.round(latlng.lng),
  north: Math.round(latlng.lat),
  height: 0,
};
```

## Store-Integration

```typescript
// Lesen
const mortarPosition = useAppStore((state) => state.mortarPosition);
const targetPosition = useAppStore((state) => state.targetPosition);
const showGrid = useAppStore((state) => state.showGrid);

// Schreiben
const setMortarPosition = useAppStore((state) => state.setMortarPosition);
const setTargetPosition = useAppStore((state) => state.setTargetPosition);
const calculateSolution = useAppStore((state) => state.calculateSolution);

// Grid Toggle
const toggleGrid = useAppStore((state) => state.toggleGrid);
const setShowGrid = useAppStore((state) => state.setShowGrid);
```

## Styling

Alle Leaflet-spezifischen Styles befinden sich in `src/styles/globals.css`:

- Dark theme für Zoom-Controls
- Tooltip-Styling
- Marker hover effects

## Next Steps

### Phase 5.3 - Map Tiles

- [ ] Integration von iZurvive Tiles
- [ ] Oder eigene Karten-Tiles für Everon
- [ ] Tile-Server Setup

### Phase 5.4 - Grid Overlay (ABGESCHLOSSEN)

- [x] Koordinaten-Grid (1000m bei niedrigem Zoom)
- [x] Feineres Grid (100m bei hohem Zoom)
- [x] Adaptives Grid basierend auf Zoom-Level
- [x] Grid-Beschriftung an den Rändern
- [x] Toggle-Funktion für Grid
- [x] Performance-Optimierung

### Phase 5.5 - Advanced Features

- [ ] Spotter-Marker
- [x] Range-Circles (min/max Range für Mörser) - Bereits implementiert
- [ ] Impact-Marker für Korrekturen
- [ ] Multi-Target Support

## Troubleshooting

### Marker werden nicht angezeigt

- Position muss nicht-null sein
- Position muss im Bounds [[0,0], [10000, 10000]] liegen

### Koordinaten sind falsch

- Prüfe Transformation: [north, east] für Leaflet
- Runde Werte auf ganze Zahlen

### Drag funktioniert nicht

- `draggable={true}` muss gesetzt sein
- Event-Handler muss `DragEndEvent` verwenden, nicht `LeafletMouseEvent`
