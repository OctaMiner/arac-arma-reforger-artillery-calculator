# ARAC Spotter Module

## Überblick

Das Spotter-Modul ermöglicht die Integration von Vector 21 Fernglas-Daten für präzise Zielerfassung und Feuerkorrektur.

## Features

### 1. Zielberechnung (`targetCalculator.ts`)

Berechnet Zielkoordinaten aus Vector 21 Fernglas-Messungen:

```typescript
import { calculateTargetFromSpotter, type SpotterInput } from './spotter'

const spotterData: SpotterInput = {
  spotterPosition: { east: 500, north: 300, height: 50 },
  distance: 1000,        // Laser-Entfernung (R-Taste)
  azimuth: 45,          // Kompass-Azimut (V-Taste)
  heightAngle: 5        // Optional: Höhenwinkel
}

const target = calculateTargetFromSpotter(spotterData)
// Ergebnis: { east: 570.7, north: 370.7, height: 137.2 }
```

#### Hilfsfunktionen

```typescript
// Azimut zwischen zwei Punkten berechnen
const azimuth = calculateAzimuth(from, to)  // 0-360°

// Horizontale Entfernung berechnen
const distance = calculateDistance(from, to)  // Meter

// Höhenwinkel berechnen
const heightAngle = calculateHeightAngle(from, to)  // -90 bis +90°

// SpotterInput aus bekannten Koordinaten erstellen (für Tests)
const input = createSpotterInputFromCoordinates(spotterPos, targetPos)
```

### 2. Feuerkorrektur (`correction.ts`)

Wendet Spotter-Korrekturen auf Zielkoordinaten an:

```typescript
import { applyCorrection, type CorrectionInput } from './spotter'

const correction: CorrectionInput = {
  leftRight: 20,          // 20m rechts (negativ = links)
  addDrop: 30,           // 30m zu kurz (negativ = zu weit)
  currentAzimuth: 45,    // Aktueller Schuss-Azimut
  currentDistance: 1000  // Aktuelle Entfernung
}

const correctedTarget = applyCorrection(currentTarget, correction)
```

#### Korrektur-Konvertierung

```typescript
// Seitenabweichung in MIL-Korrektur umrechnen
const mils = lateralToMilCorrection(10, 1000)  // 10 MIL

// MIL-Korrektur in Meter umrechnen
const meters = milToLateralCorrection(10, 1000)  // 10m
```

#### Automatische Korrektur aus Einschlagpunkt

```typescript
// Berechne Korrektur aus bekanntem Einschlag
const correction = calculateCorrectionFromImpact(
  target,     // Gewünschtes Ziel
  impact,     // Tatsächlicher Einschlag
  azimuth     // Schuss-Azimut
)

// Wende die Korrektur an
const newTarget = applyCorrection(target, correction)
```

#### Mehrfache Korrekturen aggregieren

```typescript
const corrections = [
  { leftRight: 10, addDrop: 20, ... },
  { leftRight: -5, addDrop: 10, ... },
  { leftRight: 2, addDrop: -5, ... }
]

const totalCorrection = aggregateCorrections(corrections)
// Ergebnis: { leftRight: 7, addDrop: 25, ... }
```

#### Korrektur-Ansagen formatieren

```typescript
const call = formatCorrectionCall(correction)
// Ergebnisse:
// "Korrektur: 20 rechts, 30 Add"
// "Korrektur: 15 links, 25 Drop"
// "Korrektur: Auf Ziel"
```

## Mathematische Grundlagen

### Zielberechnung

```
Horizontale Distanz = Schrägdistanz × cos(Höhenwinkel)
Δ_ost  = Horizontale Distanz × sin(Azimut)
Δ_nord = Horizontale Distanz × cos(Azimut)
Δ_höhe = Schrägdistanz × sin(Höhenwinkel)

Ziel_Ost   = Spotter_Ost + (Δ_ost / 10)    // Arma-Einheiten
Ziel_Nord  = Spotter_Nord + (Δ_nord / 10)
Ziel_Höhe  = Spotter_Höhe + Δ_höhe
```

### Feuerkorrektur

**Links/Rechts** (senkrecht zum Azimut):
```
Korrektur_Winkel = Azimut + 90°
Δ_ost_lr  = Links_Rechts × sin(Korrektur_Winkel)
Δ_nord_lr = Links_Rechts × cos(Korrektur_Winkel)
```

**Add/Drop** (entlang des Azimuts):
```
Δ_ost_ad  = Add_Drop × sin(Azimut)
Δ_nord_ad = Add_Drop × cos(Azimut)
```

**Gesamt-Korrektur**:
```
Neues_Ziel_Ost  = Altes_Ziel_Ost + (Δ_ost_lr + Δ_ost_ad) / 10
Neues_Ziel_Nord = Altes_Ziel_Nord + (Δ_nord_lr + Δ_nord_ad) / 10
```

### MIL-Konvertierung

```
MIL = (Abweichung_in_Metern / Entfernung_in_Metern) × 1000

Meter = (MIL × Entfernung_in_Metern) / 1000
```

## Typische Workflows

### Workflow 1: Vector 21 Daten zu Zielkoordinaten

```typescript
// 1. Spotter liest Vector 21 Daten ab
const spotterData: SpotterInput = {
  spotterPosition: { east: 500, north: 300, height: 50 },
  distance: 1200,      // R-Taste: 1200m
  azimuth: 135,        // V-Taste: 135°
  heightAngle: 3       // Optional
}

// 2. Zielposition berechnen
const target = calculateTargetFromSpotter(spotterData)

// 3. Feuer-Lösung mit ballistischem Rechner erstellen
import { calculateFireSolution } from '../ballistics'
const solution = calculateFireSolution(mortarPos, target, config)
```

### Workflow 2: Feuerkorrektur nach Einschlag

```typescript
// 1. Ersten Schuss abfeuern
const initialTarget = { east: 500, north: 400, height: 50 }

// 2. Spotter beobachtet Einschlag
const impact = { east: 498, north: 397, height: 48 }

// 3. Korrektur berechnen
const correction = calculateCorrectionFromImpact(
  initialTarget,
  impact,
  azimuthToTarget
)

// 4. Ansage formatieren
console.log(formatCorrectionCall(correction))
// "Korrektur: 20 rechts, 30 Add"

// 5. Korrektur anwenden
const correctedTarget = applyCorrection(initialTarget, correction)

// 6. Neue Feuer-Lösung berechnen
const newSolution = calculateFireSolution(mortarPos, correctedTarget, config)
```

### Workflow 3: Manuelle Korrektur vom Spotter

```typescript
// Spotter meldet: "20 rechts, 30 zu kurz"
const correction: CorrectionInput = {
  leftRight: 20,       // 20m nach rechts
  addDrop: 30,         // 30m Add (zu kurz)
  currentAzimuth: 135, // Aktueller Azimut zum Ziel
  currentDistance: 1200
}

// Korrektur anwenden
const correctedTarget = applyCorrection(currentTarget, correction)

// Optional: In MIL umrechnen für alternative Darstellung
const milCorrection = lateralToMilCorrection(correction.leftRight, correction.currentDistance)
console.log(`Azimut-Korrektur: ${milCorrection.toFixed(1)} MIL`)
```

## Integration mit anderen Modulen

### Mit Ballistics-Modul

```typescript
import { calculateFireSolution } from '../ballistics'
import { calculateTargetFromSpotter } from '../spotter'

// Ziel aus Spotter-Daten berechnen
const target = calculateTargetFromSpotter(spotterData)

// Feuer-Lösung berechnen
const solution = calculateFireSolution(mortarPosition, target, mortarConfig)
```

### Mit Fire Mission System

```typescript
import type { FireMission, SpotterData } from '../../types'

// Spotter-Daten in Mission speichern
const mission: FireMission = {
  id: generateId(),
  name: 'Spotter Mission 1',
  targetPos: calculateTargetFromSpotter(spotterData),
  // ... weitere Felder
}
```

## Tests ausführen

```bash
npx tsx src/lib/spotter/test.ts
```

Die Test-Suite umfasst:
- ✓ Zielberechnung bei verschiedenen Azimuten (0°, 90°, 180°, 270°, 45°)
- ✓ Höhenwinkel-Berechnung (aufwärts, abwärts, horizontal)
- ✓ Korrektur Links/Rechts
- ✓ Korrektur Add/Drop
- ✓ Kombinierte Korrekturen
- ✓ Automatische Korrektur aus Einschlagpunkt
- ✓ Rückwärts-Berechnung (Roundtrip-Tests)
- ✓ Mehrfache Korrekturen aggregieren
- ✓ Korrektur-Ansagen formatieren

## Vorzeichenkonvention

| Wert | Positiv (+) | Negativ (-) |
|------|-------------|-------------|
| **Links/Rechts** | Rechts vom Ziel | Links vom Ziel |
| **Add/Drop** | Zu kurz (Add) | Zu weit (Drop) |
| **Höhenwinkel** | Aufwärts | Abwärts |
| **Azimut** | 0-360° (Nord = 0°) | - |

## Koordinatensystem

- **Ost (East)**: X-Achse, in Arma-Einheiten (1 Einheit = 10m)
- **Nord (North)**: Y-Achse, in Arma-Einheiten (1 Einheit = 10m)
- **Höhe (Height)**: Z-Achse, in Metern
- **Azimut**: 0° = Nord, 90° = Ost, 180° = Süd, 270° = West

## Genauigkeit

Die Berechnungen sind auf folgende Genauigkeiten ausgelegt:
- Positionsgenauigkeit: ±0.1 Arma-Einheiten (±1m)
- Winkelgenauigkeit: ±0.01°
- Entfernungsgenauigkeit: ±1m

## Vector 21 Fernglas Referenz

**In-Game Bedienung:**
- **R-Taste**: Laser-Entfernungsmesser aktivieren
- **V-Taste**: Azimut (Kompass) ablesen
- **GPS**: Spotter-Position ablesen

**Typische Messwerte:**
- Entfernung: 50m - 9999m
- Azimut: 0° - 360°
- Höhenwinkel: -90° bis +90° (wenn verfügbar)

## Bekannte Einschränkungen

1. **Höhenkorrektur**: Die Korrektur-Funktionen berücksichtigen nur horizontale Verschiebungen, nicht die Höhe
2. **Erdkrümmung**: Bei sehr großen Entfernungen (>10km) wird die Erdkrümmung nicht berücksichtigt
3. **Gelände**: Höhenwinkel ignorieren Geländesteigung zwischen Spotter und Ziel
