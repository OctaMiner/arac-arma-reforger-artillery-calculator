# ARAC Ballistics Engine

Vollständige ballistische Berechnungs-Engine für Arma Reforger Mörser.

## Architektur

```
ballistics/
├── calculator.ts       - Basis-Berechnungen (Entfernung, Azimut, Konvertierungen)
├── interpolation.ts    - Tabellenabfragen und lineare Interpolation
├── elevation.ts        - Höhenkorrektur-Berechnungen
├── range.ts           - Reichweiten-Checks und Ladungsauswahl
├── fireSolution.ts    - Haupt-Berechnungsfunktion
├── tableLoader.ts     - JSON-Tabellen-Loader
├── index.ts           - Barrel-Export aller Funktionen
├── test.ts            - Validierungstests
└── data/              - Ballistische Tabellen (JSON)
```

## Hauptfunktionen

### Fire Solution (Komplett-Berechnung)

```typescript
import { calculateFireSolution } from '@/lib/ballistics'

const solution = calculateFireSolution({
  mortar: { east: 481, north: 473, height: 95 },
  target: { east: 707, north: 428, height: 145 },
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 4
})

console.log(solution)
// {
//   azimuthDeg: 101.26,
//   azimuthMil: 1800,
//   elevationBase: 1133,
//   elevationAdj: 1125,
//   deltaElev: 8,
//   distance: 2304,
//   flightTime: 32.7,
//   ringCount: 4,
//   inRange: true
// }
```

### Automatische Ladungsauswahl

```typescript
import { calculateFireSolutionAuto } from '@/lib/ballistics'

const solution = calculateFireSolutionAuto({
  mortar: { east: 481, north: 473, height: 95 },
  target: { east: 707, north: 428, height: 145 },
  mortarType: 'US',
  ammoType: 'HE'
  // ringCount wird automatisch gewählt
})
```

## Einzelne Berechnungen

### Entfernung

```typescript
import { calculateDistance } from '@/lib/ballistics'

const distance = calculateDistance(
  { east: 481, north: 473, height: 95 },
  { east: 707, north: 428, height: 145 }
)
// 2304 (Meter)
```

### Azimut (Richtung)

```typescript
import { calculateAzimuth } from '@/lib/ballistics'

const azimuth = calculateAzimuth(
  { east: 481, north: 473, height: 95 },
  { east: 707, north: 428, height: 145 }
)
// { degrees: 101.26, mils: 1800 }
```

### Elevation (Höhenwinkel)

```typescript
import { loadBallisticTable, interpolateElevation } from '@/lib/ballistics'

const table = loadBallisticTable('US', 'HE', 4)
const elevation = interpolateElevation(2304, table.entries)
// 1133 MIL
```

### Höhenkorrektur

```typescript
import {
  interpolateDeltaElev,
  calculateDeltaElevationFromTable,
  applyHeightCorrection
} from '@/lib/ballistics'

// Höhendifferenz: Ziel 145m - Mörser 95m = 50m
const heightDiff = 50

// Delta ELEV aus Tabelle holen
const dElevPer100m = interpolateDeltaElev(2304, table.entries)

// Korrekturwert berechnen
const deltaElev = calculateDeltaElevationFromTable(heightDiff, dElevPer100m)
// 8 MIL

// Korrektur anwenden
const correctedElevation = applyHeightCorrection(1133, deltaElev)
// 1125 MIL
```

### Reichweiten-Check

```typescript
import { checkRange, findOptimalRingCount } from '@/lib/ballistics'

// Prüfen ob in Reichweite
const rangeCheck = checkRange(2304, 400, 2900)
// { inRange: true, minRange: 400, maxRange: 2900 }

// Optimale Ladung finden
const optimalRing = findOptimalRingCount(2304, 'US', 'HE')
// 4
```

## Unit Conversions

```typescript
import { degToMil, milToDeg } from '@/lib/ballistics'

const mils = degToMil(90)    // 1600 MIL
const deg = milToDeg(3200)   // 180°
```

## Ballistic Tables

Die Engine nutzt präzise ballistische Tabellen aus den offiziellen Arma Reforger Artillery Tables:

- **US M821**: HE, Smoke, Illumination (Ring 0-4)
- **RUS**: HE, Smoke, Illumination (Ring 0-4)

Tabellen werden automatisch geladen und gecacht.

## Interpolation

Alle Werte (Elevation, Flugzeit, Delta ELEV) werden linear zwischen Tabellenwerten interpoliert:

```
g = value_lower - value_upper
ratio = (range - lower_range) / (upper_range - lower_range)
result = value_lower - (g × ratio)
```

## Höhenkorrektur

**Formel:**
```
deltaElev = heightDiff × (dElevPer100m / 100)
elevationFinal = elevationBase - deltaElev
```

**Regeln:**
- Ziel HÖHER als Mörser: Elevation verringern (- deltaElev)
- Ziel TIEFER als Mörser: Elevation erhöhen (+ deltaElev)

## Testing

```bash
npx tsx src/lib/ballistics/test.ts
```

Validiert gegen Referenzwerte aus `docs/FORMULAS.md`:
- Entfernung: ~2304m
- Azimut: ~101.26° / ~1800 MIL
- Elevation: ~1134 MIL (Ring 4, vor Höhenkorrektur)

## Datenquellen

- **Ballistische Tabellen**: Excel "Berechnungen Mor-ohne Map.xlsx"
- **Formeln**: Steam Guide + In-Game Artillery Tables
- **Delta ELEV Koeffizienten**: Marcel's Berechnungen

## Typensicherheit

Alle Funktionen sind vollständig typisiert mit TypeScript für maximale Sicherheit.
