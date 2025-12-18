# Automatische Höhenabfrage

## Übersicht

Das Auto-Height Feature lädt automatisch Geländehöhen von der CDN, wenn Mörser- oder Zielpositionen auf der Karte gesetzt werden.

## Features

- Automatisches Laden von Höhendaten beim Setzen von Positionen
- Funktioniert für alle Maps mit verfügbaren Höhendaten (10 Maps)
- Debounced Loading (300ms) für Performance während des Dragging
- Manuelle Überschreibung möglich
- UI-Feedback mit "Auto" Badge im Height Input

## Verfügbare Maps mit Höhendaten

- Everon
- Arland
- Kolguev
- Anizay
- Gogland
- Kunar
- Saigon
- Takistan
- Zarichne
- Zimnitrita

## Technische Details

### Hook: `useAutoHeight()`

Der Hook wird in `App.tsx` eingebunden und überwacht:

```typescript
import { useAutoHeight } from './hooks/useAutoHeight'

function App() {
  useAutoHeight()
  // ...
}
```

### Verhalten

1. **Automatisches Laden**
   - Wenn eine Position gesetzt wird (east/north) und height = 0
   - Höhendaten werden vom CDN geladen (gecacht)
   - Höhe wird automatisch in den Store gesetzt

2. **Manuelle Überschreibung**
   - Wenn der User die Höhe manuell ändert (height > 0)
   - Wird die Höhe NICHT automatisch überschrieben
   - Bei neuer Position wird wieder automatisch geladen

3. **Position-Tracking**
   - Jede Position (east,north) wird nur einmal geladen
   - Verhindert unnötige Requests

4. **Debouncing**
   - 300ms Verzögerung nach Position-Änderung
   - Verhindert excessive Requests während Dragging

### UI-Feedback

Im `HeightInput` wird ein "Auto" Badge angezeigt:

```typescript
<HeightInput
  label="Höhe"
  value={position?.height ?? 0}
  onChange={handleHeightChange}
  showAutoIndicator={true}  // Zeigt Auto Badge
/>
```

- Grünes Badge mit Pulse-Animation
- Nur sichtbar wenn: `autoHeightEnabled && height > 0`
- Hint-Text: "Höhe wird automatisch geladen • Manuell überschreibbar"

## Datenquelle

Höhendaten stammen von GeNeFRAG's CDN:
```
https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/{map}_height.json
```

Format: 2D-Array von Height-Strings
- Auflösung: ~10-20m pro Datenpunkt
- Dateigröße: 8-10 MB pro Map
- In-Memory Cache: 30 Minuten

## Services

### `heightService.ts`

```typescript
// Check if map has height data
hasHeightData(mapId: string): boolean

// Load height data (async, cached)
loadHeightData(mapId: string): Promise<HeightData | null>

// Get height at coordinate (async)
getTerrainHeight(mapId: string, east: number, north: number): Promise<number | null>

// Get height synchronously (cache only)
getTerrainHeightSync(mapId: string, east: number, north: number): number | null

// Preload height data
preloadHeightData(mapId: string): void
```

### `useAutoHeight.ts`

```typescript
// Main hook - aktiviert automatisches Laden
useAutoHeight(): void

// Status hook für UI
useAutoHeightStatus(): {
  enabled: boolean
  mapName: string
}
```

## Performance

- **Lazy Loading**: Höhendaten werden nur bei Bedarf geladen
- **Caching**: In-Memory Cache (30min TTL)
- **Debouncing**: 300ms Delay für Position-Updates
- **Request Deduplication**: Gleiche Position wird nicht mehrfach geladen

## Error Handling

- Fehlgeschlagene Requests loggen Warning in Console
- UI bleibt funktionsfähig (height = 0)
- Kein Blocking der User-Interaktion
- Manuelle Höheneingabe immer möglich

## Testing

1. **Karte mit Höhendaten öffnen** (z.B. Everon)
2. **Mörser-Position setzen** (Linksklick auf Karte)
   - Höhe sollte automatisch geladen werden
   - "Auto" Badge erscheint im Height Input
3. **Höhe manuell ändern**
   - Neue Höhe wird gespeichert
   - Automatisches Laden pausiert für diese Position
4. **Neue Position setzen**
   - Automatisches Laden wird fortgesetzt
5. **Karte ohne Höhendaten** (z.B. Bad Orb)
   - Kein automatisches Laden
   - Hint-Text: "Im Spiel: Karte öffnen..."

## Zukünftige Erweiterungen

- [ ] Bilinear Interpolation für genauere Höhen
- [ ] Höhen-Vorschau beim Hover über Karte
- [ ] Höhenprofil-Anzeige zwischen Mörser und Ziel
- [ ] Cache in LocalStorage für Offline-Nutzung
- [ ] Progressive Loading (Chunk-based)
