# Spotter Components Documentation

## Phase 5.7 - Vector 21 Spotter Integration - ABGESCHLOSSEN

Alle UI-Komponenten für den Spotter-Modus sind erstellt und integriert.

---

## Übersicht

Das Spotter-System ermöglicht die Zielberechnung mit dem Vector 21 Fernglas und präzise Feuerkorrektur nach Einschlagbeobachtung.

### Workflow

1. **Spotter-Modus aktivieren** (Toggle)
2. **Spotter-Position eingeben** (GPS-Koordinaten)
3. **Vector 21 Messung eingeben** (Entfernung + Azimut)
4. **Ziel berechnen** → Setzt targetPosition im AppStore
5. **Schuss abfeuern** (Mörser-Crew)
6. **Einschlag beobachten** (Spotter mit Vector 21 Correction Mode)
7. **Korrektur eingeben** (L/R + A/D in Metern)
8. **Korrektur anwenden** → Neues Ziel wird berechnet
9. **Wiederholen** bis Treffer

---

## Komponenten-Struktur

```
src/components/Spotter/
├── SpotterPanel.tsx              (Haupt-Container)
├── SpotterToggle.tsx             (Aktivierung On/Off)
├── SpotterPositionInput.tsx      (GPS Eingabe)
├── VectorMeasurementInput.tsx    (Entfernung + Azimut)
├── CalculateTargetButton.tsx     (Zielberechnung)
├── CorrectionPanel.tsx           (Korrektur-Container)
├── CorrectionInput.tsx           (L/R + A/D Eingabe)
├── CorrectionHistory.tsx         (Historie der Korrekturen)
└── index.ts                      (Barrel Export)
```

**Gesamt:** 824 Zeilen Code in 9 Dateien

---

## Komponenten-Details

### 1. SpotterPanel.tsx

**Haupt-Container für alle Spotter-Funktionen**

- Zeigt Toggle für Spotter-Modus
- Expandiert/Kollabiert basierend auf Modus-Status
- Visuelles Feedback mit gelber Border wenn aktiv
- Organisiert alle Sub-Komponenten in Sektionen

**Features:**
- Conditional Rendering (nur aktiv wenn Modus an)
- Visuelles Theme: Gelb/Orange (Spotter-Farben)
- Icon: Fernglas/Spotter-Symbol
- Sektionen getrennt durch Border-Bottom

---

### 2. SpotterToggle.tsx

**Toggle-Switch für Spotter-Modus**

- Beschreibung: "Zielberechnung mit Vector 21 Fernglas"
- Toggle-Switch (iOS-Style)
- Gelbe Hintergrundfarbe wenn aktiv
- Accessibility: ARIA-Attribute

**Store Actions:**
- `toggleSpotterMode()` - Toggle On/Off

---

### 3. SpotterPositionInput.tsx

**GPS-Position des Spotters (Beobachter)**

- 3 Felder: East, North, Height
- Validierung: East/North 0-9999, Height -999 bis +9999
- Numerische Eingabe mit Pattern-Validierung
- Gelbe Border-Highlight (Spotter-Theme)

**Store Actions:**
- `setSpotterPosition(Coordinate)`

**Datenformat:**
```typescript
{
  east: number,    // 0-9999 (10m Einheiten)
  north: number,   // 0-9999 (10m Einheiten)
  height: number   // -999 bis +9999 (Meter)
}
```

---

### 4. VectorMeasurementInput.tsx

**Vector 21 Fernglas-Messung**

- **Entfernung**: Laser-Messung in Metern (R-Taste)
- **Azimut**: Kompass-Azimut in Grad (V-Taste)
- Hilfetext: Tastenbelegung des Vector 21

**Store Actions:**
- `setSpotterMeasurements({ distance: number, azimuth: number })`

**Datenformat:**
```typescript
{
  distance: number,  // Meter (0-9999)
  azimuth: number    // Grad (0-360)
}
```

**Hilfetext:**
- R-Taste = Entfernung messen
- V-Taste = Azimut messen
- R + V = Beide gleichzeitig

---

### 5. CalculateTargetButton.tsx

**Berechnet Ziel-Position aus Spotter-Daten**

- Disabled wenn Position oder Messung fehlt
- Ruft `calculateTargetFromSpotter()` auf
- Setzt Ergebnis als `targetPosition` im AppStore
- Triggert automatisch `calculateSolution()`

**Funktion:**
```typescript
const target = calculateTargetFromSpotter({
  spotterPosition: { east, north, height },
  distance: measurements.distance,      // Meter
  azimuth: measurements.azimuth         // Grad
})
```

**Store Actions:**
- `setTargetPosition(Coordinate)` - Setzt berechnetes Ziel
- `calculateSolution()` - Berechnet Fire Solution

---

### 6. CorrectionPanel.tsx

**Container für Feuerkorrektur-Funktionen**

- Zeigt `CorrectionInput` und `CorrectionHistory`
- Info-Text wenn kein Ziel berechnet
- Orange Theme (Unterscheidung zu Spotter-Gelb)
- Hilfetext: Vector 21 Correction Mode Anleitung

**Funktion:**
1. Nimmt Korrektur entgegen (L/R, A/D)
2. Berechnet neue Position mit `applyCorrection()`
3. Update `targetPosition` im AppStore
4. Speichert Korrektur in Historie
5. Triggert `calculateSolution()`

**Store Actions:**
- `applyCorrection(CorrectionData)` - Speichert in Historie
- `setTargetPosition(Coordinate)` - Update Ziel
- `calculateSolution()` - Neuberechnung

---

### 7. CorrectionInput.tsx

**Eingabe für L/R und A/D Korrekturen**

**Felder:**
- **Left/Right**: Seitenabweichung in Metern
  - Negativ = Links
  - Positiv = Rechts
  - Preset-Buttons: L50, L25, R25, R50

- **Add/Drop**: Längenabweichung in Metern
  - Negativ = Kürzer (Drop)
  - Positiv = Weiter (Add)
  - Preset-Buttons: D50, D25, A25, A50

**Features:**
- Manuelle Eingabe oder Preset-Buttons
- Reset auf 0 nach Anwendung
- Disabled wenn kein Ziel aktiv
- Orange Button "Korrektur anwenden"

**Datenformat:**
```typescript
{
  leftRight: number,  // Meter (-inf bis +inf)
  addDrop: number     // Meter (-inf bis +inf)
}
```

---

### 8. CorrectionHistory.tsx

**Liste der angewendeten Korrekturen**

**Features:**
- Zeigt alle Korrekturen mit Index (#1, #2, ...)
- Format: "L 20m | A 30m" oder "R 15m | D 25m"
- "Letzte rückgängig" Button (nur für neueste)
- "Alle löschen" Button
- Gesamtkorrektur-Anzeige (wenn > 1 Korrektur)
- Max-Height mit Scroll (max-h-32)

**Store Actions:**
- `removeLastCorrection()` - Undo letzte Korrektur
- `clearCorrections()` - Alle löschen

**Anzeige-Format:**
```
#1  L 20m | A 30m  [x]
#2  R 10m | D 15m  [x]
-------------------------
Gesamt: R 10m | A 15m
```

---

## Store-Integration

### useSpotterStore

```typescript
// State
spotterMode: boolean
spotterPosition: Coordinate | null
spotterMeasurements: { distance: number, azimuth: number } | null
corrections: CorrectionData[]
showCorrectionPanel: boolean

// Actions
toggleSpotterMode()
setSpotterPosition(position)
setSpotterMeasurements(measurements)
applyCorrection(correction)
clearCorrections()
removeLastCorrection()
```

### useAppStore

```typescript
// State
targetPosition: Coordinate | null
fireSolution: FireSolution | null
mortarPosition: Coordinate | null

// Actions
setTargetPosition(position)
calculateSolution()
```

---

## Spotter-Library-Funktionen

### calculateTargetFromSpotter()

**Location:** `src/lib/spotter/targetCalculator.ts`

```typescript
calculateTargetFromSpotter({
  spotterPosition: Coordinate,
  distance: number,        // Meter
  azimuth: number,         // Grad (0-360)
  heightAngle?: number     // Optional: Grad (-90 bis +90)
}): Coordinate
```

**Berechnung:**
1. Azimut in Radianten konvertieren
2. Horizontale Distanz aus Höhenwinkel berechnen
3. Delta-East = distance * sin(azimuth)
4. Delta-North = distance * cos(azimuth)
5. In Arma-Koordinaten (10m Einheiten) konvertieren
6. Höhenänderung aus Höhenwinkel berechnen
7. Spotter-Position + Deltas = Ziel-Position

---

### applyCorrection()

**Location:** `src/lib/spotter/correction.ts`

```typescript
applyCorrection(
  target: Coordinate,
  correction: {
    leftRight: number,      // Meter (+ = rechts, - = links)
    addDrop: number,        // Meter (+ = weiter, - = kürzer)
    currentAzimuth: number, // Grad vom Mörser zum Ziel
    currentDistance: number // Meter zum Ziel
  }
): Coordinate
```

**Berechnung:**
1. **Seitenkorrektur** (perpendikular zum Azimut):
   - Lateral-Winkel = Azimut + 90°
   - Delta-East = leftRight * sin(lateral-angle)
   - Delta-North = leftRight * cos(lateral-angle)

2. **Längskorrektur** (entlang des Azimuts):
   - Delta-East = addDrop * sin(azimuth)
   - Delta-North = addDrop * cos(azimuth)

3. **Gesamt-Korrektur:**
   - Total-Delta = Lateral + Longitudinal
   - Neue Position = Alte Position + Total-Delta

---

## Styling (TailwindCSS)

### Spotter-Theme

**Farben:**
- Primary: `yellow-600` (Aktiv-Zustand)
- Hover: `yellow-700`
- Active: `yellow-800`
- Border: `yellow-600/50` (50% Opacity)
- Background: `yellow-600/10` (Highlights)

**Korrektur-Theme:**
- Primary: `orange-600`
- Hover: `orange-700`
- Unterscheidung zu Spotter-Gelb

### Komponenten-Stil

**Panel:**
```css
border: border-yellow-600/50     /* Aktiv */
border: border-gray-700          /* Inaktiv */
```

**Inputs:**
```css
border: border-yellow-600/30
focus:border-yellow-500
focus:ring-yellow-500
```

**Buttons:**
```css
bg-yellow-600 hover:bg-yellow-700    /* Spotter-Actions */
bg-orange-600 hover:bg-orange-700    /* Korrektur-Actions */
```

---

## Vector 21 Fernglas (RHS Mod)

### Messmodi

| Funktion | Taste | Ausgabe | Verwendung |
|----------|-------|---------|------------|
| Entfernung | R halten | Meter | Distance Input |
| Azimut | V halten | Grad | Azimuth Input |
| Beide | R + V | Beide | Beide Inputs |
| Correction | V halten → C → Einschlag → loslassen | r./l. XX, A./D. XX | Correction Input |

### Korrektur-Ausgaben verstehen

**Seitenabweichung:**
- `r. 20` = 20 Meter nach RECHTS korrigieren
- `l. 20` = 20 Meter nach LINKS korrigieren

**Längenabweichung:**
- `A. 30` = 30 Meter WEITER (Add distance)
- `D. 30` = 30 Meter KÜRZER (Drop distance)

**Beispiel-Ausgabe:**
```
r. 25, A. 50
```
= 25m rechts, 50m weiter

### Korrektur-Workflow im Spiel

1. **V-Taste auf Ziel halten**
2. **C-Taste drücken** (Korrektur-Modus aktiviert)
3. **Auf Einschlag zielen** (Vector 21 misst Abweichung)
4. **V-Taste loslassen** (Zeigt Korrektur an)
5. **Werte in ARAC eingeben**
6. **"Korrektur anwenden" klicken**
7. **Neues Fire Solution verwenden**

---

## Integration in App.tsx

```typescript
import { SpotterPanel } from './components/Spotter'

function App() {
  return (
    <Sidebar>
      <ConfigPanel />
      <MissionPanel />
      <StationPanel />
      <SpotterPanel />  {/* NEU */}
    </Sidebar>
  )
}
```

**Position:** Nach StationPanel, vor Ende der Sidebar

---

## Verwendungsbeispiel

### 1. Spotter-Modus starten

1. **Spotter-Panel** in Sidebar öffnen
2. **Toggle aktivieren** → Panel expandiert
3. **Spotter-Position eingeben** (GPS vom Spiel)
   - East: 5234
   - North: 8912
   - Height: 125

### 2. Ziel erfassen

1. **Vector 21 im Spiel nutzen** (R + V Tasten)
2. **Werte ablesen:**
   - Entfernung: 1250m
   - Azimut: 87.5°
3. **In ARAC eingeben**
4. **"Ziel berechnen" klicken**
   - → Ziel-Position wird berechnet
   - → Fire Solution erscheint in ResultsBar

### 3. Schuss abfeuern

1. Mörser-Crew nutzt Fire Solution
2. Schuss wird abgefeuert
3. Spotter beobachtet Einschlag

### 4. Feuerkorrektur

1. **Vector 21 Correction Mode nutzen:**
   - V-Taste auf ursprüngliches Ziel
   - C-Taste drücken
   - Auf Einschlag zielen
   - V-Taste loslassen
2. **Ausgabe z.B.:** "r. 30, D. 20"
3. **In ARAC eingeben:**
   - L/R: +30 (rechts)
   - A/D: -20 (kürzer)
4. **"Korrektur anwenden" klicken**
   - → Neues Ziel berechnet
   - → Neue Fire Solution

### 5. Wiederholen

- Prozess wiederholen bis Treffer
- Historie zeigt alle Korrekturen
- "Letzte rückgängig" bei Fehleingabe

---

## TypeScript-Typen

```typescript
// Spotter Position
interface Coordinate {
  east: number    // 10m Einheiten
  north: number   // 10m Einheiten
  height: number  // Meter
}

// Vector 21 Messung
interface SpotterMeasurements {
  distance: number  // Meter
  azimuth: number   // Grad (0-360)
}

// Feuerkorrektur
interface CorrectionData {
  leftRight: number  // Meter (+ = rechts, - = links)
  addDrop: number    // Meter (+ = weiter, - = kürzer)
}

// Korrektur mit Kontext (für Library-Funktion)
interface CorrectionInput {
  leftRight: number
  addDrop: number
  currentAzimuth: number   // Grad
  currentDistance: number  // Meter
}
```

---

## Testing-Hinweise

### Manuelle Tests

1. **Toggle-Funktion:**
   - An/Aus-Schalten
   - Panel expandiert/kollabiert
   - Border-Farbe ändert sich

2. **Zielberechnung:**
   - Spotter-Position eingeben
   - Messwerte eingeben
   - "Ziel berechnen" → Fire Solution sollte erscheinen
   - Ziel-Marker auf Karte sichtbar

3. **Korrektur-Anwendung:**
   - Nach Fire Solution: Korrektur eingeben
   - Preset-Buttons testen
   - "Korrektur anwenden" → Neue Fire Solution
   - Ziel-Marker bewegt sich

4. **Historie:**
   - Mehrere Korrekturen anwenden
   - "Letzte rückgängig" testen
   - "Alle löschen" testen
   - Gesamt-Anzeige prüfen

### Unit-Test-Ideen

```typescript
// Zielberechnung
test('calculateTargetFromSpotter - basic', () => {
  const result = calculateTargetFromSpotter({
    spotterPosition: { east: 500, north: 500, height: 0 },
    distance: 1000,
    azimuth: 0  // Nord
  })
  expect(result.east).toBe(500)
  expect(result.north).toBe(600)  // +100 (1000m / 10)
})

// Korrektur
test('applyCorrection - right 50m', () => {
  const result = applyCorrection(
    { east: 500, north: 500, height: 0 },
    { leftRight: 50, addDrop: 0, currentAzimuth: 0, currentDistance: 1000 }
  )
  expect(result.east).toBe(505)  // +5 (50m / 10)
  expect(result.north).toBe(500)
})
```

---

## Bekannte Limitierungen

1. **Höhenwinkel**: Aktuell optional, Vector 21 liefert nur Distanz + Azimut
2. **MIL-Korrektur**: Nicht direkt unterstützt (nur Meter-Eingabe)
3. **Mehrfach-Spotter**: Nur ein Spotter gleichzeitig
4. **Auto-Berechnung**: Keine automatische Neuberechnung bei Änderung

---

## Zukünftige Erweiterungen

### Mögliche Features:

1. **MIL-Input-Modus**: Alternative Eingabe in MIL statt Meter
2. **Auto-Correction**: Korrektur wird automatisch auf Schuss angewendet
3. **Multi-Spotter**: Mehrere Beobachter mit Triangulation
4. **Voice-Integration**: Korrektur-Ansagen als Text-to-Speech
5. **Impact-Marker**: Einschlag-Positionen auf Karte markieren
6. **Correction-Graph**: Visuelle Darstellung der Korrektur-Historie

---

## Status

- [x] SpotterToggle.tsx
- [x] SpotterPositionInput.tsx
- [x] VectorMeasurementInput.tsx
- [x] CalculateTargetButton.tsx
- [x] CorrectionInput.tsx
- [x] CorrectionHistory.tsx
- [x] CorrectionPanel.tsx
- [x] SpotterPanel.tsx
- [x] Integration in App.tsx
- [x] Store Actions verbunden
- [x] Library-Funktionen genutzt
- [x] Styling (Spotter-Theme)
- [x] Documentation

**Phase 5.7 - ABGESCHLOSSEN**

---

## Datei-Übersicht

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| SpotterPanel.tsx | 97 | Haupt-Container |
| SpotterToggle.tsx | 43 | Mode Toggle |
| SpotterPositionInput.tsx | 110 | GPS Eingabe |
| VectorMeasurementInput.tsx | 85 | Vector 21 Messung |
| CalculateTargetButton.tsx | 63 | Ziel berechnen |
| CorrectionPanel.tsx | 97 | Korrektur-Container |
| CorrectionInput.tsx | 200 | L/R + A/D Input |
| CorrectionHistory.tsx | 117 | Historie |
| index.ts | 12 | Barrel Export |
| **GESAMT** | **824** | **9 Dateien** |

---

**Erstellt:** 2025-12-15
**Agent:** Spotter Integration Specialist
**Projekt:** ARAC (Arma Reforger Artillery Calculator)
