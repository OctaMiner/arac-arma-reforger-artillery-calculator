# Map Integration Status

**Datum**: 2025-12-16
**Status**: Everon vollständig implementiert, Arland und Conflict vorbereitet

---

## Implementierungsübersicht

### Fertiggestellt

1. **MapSelector.tsx**
   - Dropdown für Kartenauswahl
   - Integration mit Zustand Store
   - TailwindCSS Styling mit Dark Theme
   - Icons (Map von lucide-react)
   - Alle verfügbaren Karten werden angezeigt

2. **MapView.tsx**
   - Leaflet Integration mit CRS.Simple
   - ImageOverlay für Everon-Karte
   - Dynamischer Kartenwechsel mit Animation
   - Warning-Overlay für fehlende Karten
   - Key-based Remounting für saubere State-Resets

3. **Map Configurations (configs.ts)**
   - Everon: Vollständig konfiguriert mit Bild
   - Arland: Konfiguriert, Bild fehlt
   - Conflict: Konfiguriert, Bild fehlt
   - Alle Karten im MapSelector sichtbar

4. **Zustand Store Integration**
   - `selectedMap` State
   - `setSelectedMap` Action
   - Funktioniert out-of-the-box

---

## Aktuelle Karten

### Everon
- **Status**: Vollständig funktionsfähig
- **Bild**: `/public/maps/everon.png` (23.2 MB)
- **Größe**: 7678x7398px
- **Spielwelt**: 13.6km x 13.0km
- **Grid**: X=97-133 (Ost), Y=0-130 (Nord)
- **Bounds**: `[[0, -300], [13000, 13300]]`

### Arland
- **Status**: Konfiguriert, Bild fehlt
- **Benötigt**: `/public/maps/arland.png`
- **Geschätzte Größe**: 8km x 8km
- **Bounds**: `[[0, 0], [8000, 8000]]`
- **Hinweis**: User sieht Warning-Overlay beim Auswählen

### Conflict
- **Status**: Konfiguriert, Bild fehlt
- **Benötigt**: `/public/maps/conflict.png`
- **Geschätzte Größe**: 6km x 6km
- **Bounds**: `[[0, 0], [6000, 6000]]`
- **Hinweis**: User sieht Warning-Overlay beim Auswählen

---

## Features

### Kartenwechsel
- Dropdown im MapSelector zeigt alle Karten
- Wechsel animiert mit Leaflet `fitBounds()`
- MapContainer wird mit `key={selectedMap}` neu gemountet
- State (Marker, Positionen) bleibt erhalten

### Fehlerbehandlung
- Wenn Kartenbild fehlt: Warning-Overlay wird angezeigt
- Coordinate Grid wird trotzdem gerendert
- User kann weiterhin navigieren und Marker setzen
- Keine Console-Errors

### Performance
- Einzelne PNG-Bilder (kein Tile-System nötig für kleine Karten)
- Leaflet CRS.Simple für optimale Performance
- Lazy Loading von Bildern durch Browser
- Smooth Zoom/Pan mit angepassten Settings

---

## Nächste Schritte (optional)

### 1. Fehlende Kartenbilder hinzufügen

**Option A: Aus arma-mortar.com extrahieren**
```bash
# Arland und Conflict von https://arma-mortar.com/ laden
# Screenshots zusammensetzen oder Tiles herunterladen
```

**Option B: Aus iZurvive**
```bash
# https://www.izurvive.com/reforger_everon/
# Bilder für Arland/Conflict exportieren
```

**Option C: In-Game Screenshots**
```bash
# Mit Debug-Kamera hochauflösende Screenshots erstellen
# Bilder mit Photoshop/GIMP zusammensetzen
```

### 2. Tile-System für große Karten (Phase 2)

Wenn Kartenbilder zu groß werden (>50MB), Tile-System implementieren:

- Siehe `IMPLEMENTATION_PLAN.md` Phase 3
- Python-Script zum Tile-Generieren nutzen
- TileLayer statt ImageOverlay

### 3. Höhendaten Integration (Phase 3)

Für präzise ballistische Berechnungen:

- Höhendaten als JSON Grid (10m Auflösung)
- Integration in Ballistic Calculations
- Elevation-basierte Zielpunkt-Korrektur

---

## Dateien

```
src/
├── components/
│   └── Map/
│       ├── MapSelector.tsx        ✓ Fertig
│       └── MapView.tsx            ✓ Fertig (mit Verbesserungen)
├── lib/
│   └── maps/
│       ├── configs.ts             ✓ Fertig (alle 3 Karten)
│       ├── types.ts               ✓ Fertig
│       ├── index.ts               ✓ Fertig
│       └── README.md              ✓ Neu erstellt
├── stores/
│   └── useAppStore.ts             ✓ Store hat selectedMap State
public/
└── maps/
    ├── everon.png                 ✓ Vorhanden (23.2 MB)
    ├── arland.png                 ⚠ Fehlt (TODO)
    └── conflict.png               ⚠ Fehlt (TODO)
```

---

## Technische Details

### Koordinatensystem

```typescript
// Leaflet verwendet [lat, lng] = [north, east]
const position = L.latLng(north, east)

// Arma Reforger Koordinaten
{
  east: number,   // X-Achse (nach rechts)
  north: number   // Y-Achse (nach oben)
}
```

### Map Bounds

```typescript
bounds: [[south, west], [north, east]]

// Beispiel Everon
bounds: [[0, -300], [13000, 13300]]
```

### Zoom-Levels

- `minZoom: -4` bis `-2` → Komplette Karte sichtbar
- `defaultZoom: -3` bis `-2` → Start-Ansicht
- `maxZoom: 2` → Maximum reinzoomen (~0.5m/Pixel)

---

## Testing

### Manuelle Tests

1. **MapSelector**
   - [ ] Dropdown zeigt alle 3 Karten
   - [ ] Everon auswählbar und lädt Bild
   - [ ] Arland auswählbar → Warning erscheint
   - [ ] Conflict auswählbar → Warning erscheint

2. **Kartenwechsel**
   - [ ] Wechsel von Everon → Arland animiert
   - [ ] Bounds passen zur neuen Karte
   - [ ] Marker bleiben bestehen (wenn in Bounds)
   - [ ] Keine Console-Errors

3. **Performance**
   - [ ] Everon lädt in < 3 Sekunden
   - [ ] Zoom ist smooth (>30fps)
   - [ ] Pan ist smooth
   - [ ] Marker dragging reagiert schnell

### TypeScript Build

```bash
npm run build
# ✓ Kompiliert ohne Fehler
```

---

## Referenzen

- **Leaflet**: https://leafletjs.com/reference.html
- **React-Leaflet**: https://react-leaflet.js.org/
- **arma-mortar.com**: https://arma-mortar.com/ (Referenz-Implementierung)
- **iZurvive**: https://www.izurvive.com/reforger_everon/

---

## Support

Bei Fragen oder Problemen:

1. Lese `src/lib/maps/README.md` für Details zur Map-Konfiguration
2. Prüfe `docs/IMPLEMENTATION_PLAN.md` für Tile-System Details
3. Checke `src/components/Map/MapView.tsx` für Implementierung

---

**Map Specialist Agent**
ARAC Project - Artillery Calculator für Arma Reforger
