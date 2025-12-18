# Adaptive Coordinate Grid

## Übersicht
Das adaptive Koordinatenraster passt sich automatisch an den Zoom-Level der Karte an, um optimale Lesbarkeit und Performance zu gewährleisten.

## Implementierung
Basierend auf Gene's Referenz-Implementation aus `map_viewer.html`.

### Grid-Intervalle nach Zoom-Level

| Zoom Level | Grid-Intervall | Verwendung |
|------------|---------------|------------|
| < -1       | 1000m (1km)   | Sehr weit herausgezoomt |
| < 0        | 500m          | Weit herausgezoomt |
| < 1        | 200m          | Mittel herausgezoomt |
| < 2        | 100m          | Standard-Ansicht |
| < 3        | 50m           | Mittlerer Zoom |
| < 4        | 20m           | Nahansicht |
| >= 4       | 10m           | Maximaler Zoom |

### Performance-Optimierung

- **Nur sichtbare Linien**: Grid wird nur für den sichtbaren Bereich + 10% Padding gerendert
- **Line-Limit**: Maximal 500 Grid-Linien gleichzeitig (verhindert Lag bei extremen Zoom-Levels)
- **Layer-Management**: Alte Grid-Layer werden beim Zoom entfernt, bevor neue gerendert werden

### UI-Steuerung

#### Toggle-Button
Position: Oben rechts auf der Karte
- **Grün**: Grid ist aktiviert
- **Grau**: Grid ist deaktiviert

#### Store-Integration
```typescript
// Grid ein-/ausschalten
const toggleGrid = useAppStore((state) => state.toggleGrid)

// Grid-Status abfragen
const showGrid = useAppStore((state) => state.showGrid)

// Grid programmatisch setzen
const setShowGrid = useAppStore((state) => state.setShowGrid)
setShowGrid(true)  // Grid einschalten
setShowGrid(false) // Grid ausschalten
```

### Styling

Grid-Linien:
- **Farbe**: Weiß (#ffffff)
- **Stärke**: 1px
- **Transparenz**: 30% (opacity: 0.3)
- **Stil**: Gestrichelt (5, 5)

Label-Linien (bei 1000m Intervallen):
- **Stärke**: 1.5x stärker
- **Transparenz**: 45% (opacity: 0.45)

### Grid-Labels

Labels werden nur angezeigt bei:
- Grid-Intervallen ≤ 100m
- An 1000m Intervallen (labelInterval)
- Format: 2-stellig mit Modulo 100 (Arma-Style)

Beispiele:
- 0m → "00"
- 1000m → "10"
- 5000m → "50"
- 10000m → "00"

## Verwendung in Komponenten

### MapView.tsx
```typescript
import { CoordinateGrid } from './CoordinateGrid'
import { useAppStore } from '../../stores/useAppStore'

const MapView = () => {
  const showGrid = useAppStore((state) => state.showGrid)

  return (
    <MapContainer>
      {showGrid && (
        <CoordinateGrid
          color="#ffffff"
          weight={1}
          opacity={0.3}
          dashArray="5, 5"
          showLabels={true}
          labelInterval={1000}
        />
      )}
    </MapContainer>
  )
}
```

### Eigene Anpassungen
```typescript
<CoordinateGrid
  color="#00ff00"        // Grünes Grid
  weight={2}             // Dickere Linien
  opacity={0.5}          // Höhere Transparenz
  dashArray="10, 10"     // Längere Striche
  showLabels={false}     // Keine Labels
  labelInterval={500}    // Labels alle 500m
/>
```

## Technische Details

### Koordinaten-Transformation
- Leaflet Simple CRS: lat = North (Y), lng = East (X)
- Grid wird in Spielkoordinaten (Metern) berechnet
- Bounds werden mit `map.getBounds()` ermittelt

### Zoom-Events
```typescript
useMapEvents({
  zoomend: () => {
    const newGridSize = calculateGridSize(map.getZoom())
    if (newGridSize !== gridSize) {
      setGridSize(newGridSize)
    }
  }
})
```

### Layer-Cleanup
Wichtig für Performance:
```typescript
useEffect(() => {
  // ... Grid rendern

  return () => {
    // Cleanup beim Unmount oder bei Änderungen
    gridLayers.forEach(layer => map.removeLayer(layer))
  }
}, [map, gridSize, ...])
```

## Bekannte Limitierungen

1. **Performance bei sehr kleinem Grid**: Bei Grid-Intervall 10m und großer Karte können viele Linien entstehen
   - Lösung: Max 500 Linien-Limit

2. **Labels bei hohem Zoom**: Labels können sich überlappen
   - Lösung: Labels nur bei Grid ≤ 100m anzeigen

3. **Map-Remount**: Bei Map-Wechsel wird Grid neu gerendert
   - Lösung: Cleanup in useEffect

## Zukünftige Verbesserungen

- [ ] Canvas-Rendering für bessere Performance bei vielen Linien
- [ ] Smart Label-Platzierung (keine Überlappungen)
- [ ] Verschiedene Grid-Styles (MGRS, UTM, etc.)
- [ ] Grid-Snapping für Marker-Platzierung
- [ ] Grid-Intervall manuell wählbar (Override für automatische Anpassung)

## Referenzen

- Gene's map_viewer.html: `docs/reference/map_viewer.html`
- Leaflet Simple CRS: https://leafletjs.com/examples/crs-simple/crs-simple.html
- Arma Reforger Maps: https://github.com/GeNeFRAG/ArmaReforger
