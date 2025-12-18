# Map Configuration Guide

## Übersicht

Das ARAC-Projekt unterstützt mehrere Arma Reforger Karten. Aktuell ist nur **Everon** vollständig integriert.

## Verfügbare Karten

### Everon (vollständig)
- Status: Implementiert
- Bild: `/public/maps/everon.png` (7678x7398px)
- Größe: 13.6km x 13.0km
- Grid: X=97-133, Y=0-130

### Arland (geplant)
- Status: Konfiguration vorhanden, Bild fehlt
- Benötigt: `/public/maps/arland.png`
- Geschätzte Größe: ~8km x 8km

### Conflict (geplant)
- Status: Konfiguration vorhanden, Bild fehlt
- Benötigt: `/public/maps/conflict.png`
- Geschätzte Größe: ~6km x 6km

## Neue Karte hinzufügen

### 1. Kartenbild vorbereiten

Das Kartenbild sollte eine hochauflösende PNG-Datei sein:

- Format: PNG (verlustfrei)
- Empfohlene Auflösung: ca. 1-2m/Pixel
- Für 10km Karte: mindestens 5000x5000px

Quellen für Kartenbilder:
- [iZurvive](https://www.izurvive.com/)
- [Arma-Mortar.com](https://arma-mortar.com/)
- In-Game Screenshots zusammengesetzt

### 2. Bild im Projekt platzieren

```bash
# Kartenbild in public/maps/ ablegen
cp meine-karte.png /public/maps/meinekarte.png
```

### 3. Konfiguration in configs.ts

Füge eine neue MapConfig hinzu:

```typescript
export const MEINE_KARTE_CONFIG: MapConfig = {
  id: 'meinekarte',
  name: 'meinekarte',
  displayName: 'Meine Karte',
  bounds: [
    [0, 0],           // Südwest-Ecke (Y, X) in Metern
    [10000, 10000]    // Nordost-Ecke
  ],
  center: [5000, 5000],
  minZoom: -3,        // Wie weit kann man rauszoomen
  maxZoom: 2,         // Wie weit kann man reinzoomen
  defaultZoom: -2,    // Startzoom
  gridInterval: 100,  // Grid-Größe (100m standard)
  imageUrl: '/maps/meinekarte.png',
  attribution: 'Arma Reforger - Meine Karte'
}
```

### 4. Karte registrieren

In `configs.ts`:

```typescript
export const MAP_CONFIGS: Record<MapId, MapConfig> = {
  everon: EVERON_CONFIG,
  arland: ARLAND_CONFIG,
  conflict: CONFLICT_CONFIG,
  meinekarte: MEINE_KARTE_CONFIG  // Neu
}
```

In `types.ts`:

```typescript
export type MapId = 'everon' | 'arland' | 'conflict' | 'meinekarte'
```

### 5. Test

1. App starten: `npm run dev`
2. MapSelector öffnen
3. Neue Karte auswählen
4. Prüfen:
   - Karte lädt korrekt
   - Koordinaten-Grid passt
   - Zoom-Level funktionieren
   - Marker sind platzierbar

## Koordinatensystem

ARAC nutzt das Arma Reforger Koordinatensystem:

- **X-Achse (Ost)**: Nach rechts
- **Y-Achse (Nord)**: Nach oben
- **Einheit**: Meter
- **Nullpunkt**: Südwest-Ecke der Karte

### Leaflet CRS.Simple

Leaflet nutzt `CRS.Simple` für Spielkarten:

```typescript
// Leaflet LatLng [lat, lng] = [north, east] in Metern
const position = L.latLng(north, east)

// Arma Koordinaten
const armaCoords = {
  east: latlng.lng,   // X
  north: latlng.lat   // Y
}
```

## Grid-System

Arma Reforger nutzt ein 100m-Grid:

- Grid-Nummer = Koordinate / 100
- Beispiel: X=10523m → Grid 105
- Sub-Grid: Letzte 2 Stellen (23)

## Tile-System (zukünftig)

Für sehr große Karten sollten Tiles genutzt werden:

```typescript
tileUrl: '/maps/tiles/{z}/{x}/{y}.png'
```

Siehe `IMPLEMENTATION_PLAN.md` für Details zur Tile-Generierung.

## Höhendaten (zukünftig)

Für präzise ballistische Berechnungen können Höhendaten integriert werden:

```typescript
heightmapUrl: '/height_data/everon_height.json'
```

Format: 2D-Array mit Höhenwerten in Metern für 10m-Grid-Zellen.

## Troubleshooting

### Karte lädt nicht
- Prüfe Browser Console auf Fehler
- Prüfe ob Bild-Pfad korrekt ist
- Prüfe ob Datei in `/public/maps/` liegt

### Koordinaten stimmen nicht
- Prüfe `bounds` Konfiguration
- Vergleiche mit In-Game Koordinaten
- Prüfe ob Grid-Interval korrekt ist (100m standard)

### Performance-Probleme
- Zu große Bilder reduzieren (< 20MB)
- Erwäge Tile-System für sehr große Karten
- Reduziere `maxZoom` wenn Bild zu groß

## Referenzen

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Arma Reforger Modding Wiki](https://community.bistudio.com/wiki/Arma_Reforger:Modding)
- [arma-mortar.com](https://arma-mortar.com/) - Referenz-Implementierung
