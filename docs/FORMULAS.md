# Ballistische Formeln - Arma Reforger Mörser

Quelle: Steam Guide + In-Game Artillery Tables + Excel-Analyse

---

## 1. Grundlegende Berechnungen

### 1.1 Entfernung (Distance)

```
Entfernung = √((Ost₁ - Ost₂)² + (Nord₁ - Nord₂)²) × 10
```

- Koordinaten sind in 10m-Einheiten (wie auf der In-Game Karte)
- Multiplikation mit 10 ergibt Meter

**TypeScript:**
```typescript
function calculateDistance(mortar: Coord, target: Coord): number {
  const dE = (mortar.east - target.east) * 10;
  const dN = (mortar.north - target.north) * 10;
  return Math.sqrt(dE * dE + dN * dN);
}
```

---

### 1.2 Azimut (Direction)

Der Azimut ist die Richtung vom Mörser zum Ziel.

**Einheiten:**
- Grad: 0-360° (0° = Nord, 90° = Ost)
- MIL: 0-6400 (NATO Standard)
- Umrechnung: `MIL = Grad / 360 × 6400`

**Formel mit Quadranten-Korrektur:**
```
wenn ΔNord < 0:           // Ziel im Süden
    wenn ΔOst > 0: Azimut = 360 + atan(ΔOst/ΔNord)
    sonst:         Azimut = atan(ΔOst/ΔNord)
sonst:                    // Ziel im Norden
    Azimut = 180 + atan(ΔOst/ΔNord)
```

**TypeScript:**
```typescript
function calculateAzimuth(mortar: Coord, target: Coord): { deg: number; mil: number } {
  const dE = target.east - mortar.east;
  const dN = target.north - mortar.north;

  let deg: number;
  if (dN < 0) {
    deg = dE > 0
      ? 360 + Math.atan(dE / dN) * 180 / Math.PI
      : Math.atan(dE / dN) * 180 / Math.PI;
  } else {
    deg = 180 + Math.atan(dE / dN) * 180 / Math.PI;
  }

  // Normalisieren
  if (deg < 0) deg += 360;
  if (deg >= 360) deg -= 360;

  return { deg, mil: deg / 360 * 6400 };
}
```

---

## 2. Elevation (Höhenwinkel)

### 2.1 Basis-Elevation aus Tabelle

Die Elevation wird aus der ballistischen Tabelle abgelesen oder interpoliert.

**Lineare Interpolation zwischen Tabellenwerten:**
```
g = ELEV_lower - ELEV_upper    // Differenz zwischen Stützstellen
adjustment = g ÷ 100 × (range - lower_range)
ELEV = ELEV_lower - adjustment
```

**Beispiel:** Reichweite 1945m (zwischen 1900m und 2000m bei Ring 4)
- ELEV bei 1900m = 1238 MIL
- ELEV bei 2000m = 1214 MIL
- Differenz g = 1238 - 1214 = 24 MIL
- Adjustment = 24 ÷ 100 × 45 = 10.8 MIL
- **ELEV = 1238 - 10.8 ≈ 1227 MIL**

**TypeScript:**
```typescript
function interpolateElevation(table: BallisticEntry[], range: number): number {
  // Finde umgebende Einträge
  let lower = table[0];
  let upper = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].range <= range && table[i + 1].range >= range) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }

  const rangeDiff = upper.range - lower.range;
  const elevDiff = lower.elevation - upper.elevation;
  const ratio = (range - lower.range) / rangeDiff;

  return lower.elevation - (elevDiff * ratio);
}
```

---

### 2.2 Höhenkorrektur (Delta ELEV)

Wenn Mörser und Ziel auf unterschiedlichen Höhen sind, muss die Elevation korrigiert werden.

**Aus Steam Guide:**
```
e = h × d

wobei:
  h = Höhendifferenz (Ziel - Mörser) in Metern
  d = D ELEV per 100m aus Tabelle (MIL pro 100m Höhe)
  e = Elevation-Anpassung in MIL
```

**Korrektur anwenden:**
```
ELEV_final = ELEV_basis ± e

- Ziel HÖHER als Mörser: ELEV_final = ELEV_basis - e  (weniger Elevation)
- Ziel TIEFER als Mörser: ELEV_final = ELEV_basis + e  (mehr Elevation)
```

**Beispiel:** Mörser auf 95m, Ziel auf 145m, Entfernung 2300m (Ring 4)
- Höhendifferenz h = 145 - 95 = 50m
- D ELEV bei 2300m = 36 MIL/100m (aus Tabelle)
- e = 50 × (36/100) = 18 MIL
- ELEV_basis bei 2300m = 1134 MIL
- **ELEV_final = 1134 - 18 = 1116 MIL** (Ziel ist höher)

**TypeScript:**
```typescript
function calculateDeltaElevation(
  heightDiff: number,  // Meter (positiv = Ziel höher)
  dElevPer100m: number // aus Tabelle
): number {
  return heightDiff * (dElevPer100m / 100);
}

function applyHeightCorrection(
  baseElevation: number,
  deltaElev: number,
  targetHigher: boolean
): number {
  return targetHigher
    ? baseElevation - deltaElev  // Weniger Elevation
    : baseElevation + deltaElev; // Mehr Elevation
}
```

---

## 3. Feuerkorrektur

Nach Beobachtung des Einschlags kann korrigiert werden.

### 3.1 Manuelle Korrektur (Karte)

Messe auf der Karte die Abweichung zwischen Einschlag und Ziel.

```
Entfernungskorrektur:
- Einschlag VOR Ziel: Elevation ERHÖHEN
- Einschlag HINTER Ziel: Elevation VERRINGERN

Seitenkorrektur:
- Einschlag LINKS vom Ziel: Azimut ERHÖHEN (mehr nach rechts)
- Einschlag RECHTS vom Ziel: Azimut VERRINGERN (mehr nach links)
```

### 3.2 Vector 21 Korrektur

Der Vector 21 Artillery-Modus gibt direkte Korrekturwerte:

```
r. XX = XX Meter nach RECHTS korrigieren (Azimut erhöhen)
l. XX = XX Meter nach LINKS korrigieren (Azimut verringern)
A. XX = XX Meter WEITER schießen (mehr Reichweite)
D. XX = XX Meter KÜRZER schießen (weniger Reichweite)
```

**Azimut-Korrektur (lateral):**
```
ΔAzimut (MIL) = Seitenabweichung (m) / Entfernung (m) × 1000

Beispiel: 20m nach rechts bei 2000m Entfernung
ΔAzimut = 20 / 2000 × 1000 = 10 MIL
```

**Elevation-Korrektur (range):**
```
Nutze die interpolierte Elevation für die korrigierte Entfernung:

Beispiel: "A. 30" bei ursprünglich 2000m
Neue Entfernung = 2000 + 30 = 2030m
→ Neue Elevation interpolieren für 2030m
```

---

## 4. Flugzeit (Time of Flight)

Die Flugzeit ist wichtig für:
- Timing von Feuerschlägen
- Führung auf bewegliche Ziele

**Interpolation wie bei Elevation:**
```typescript
function interpolateFlightTime(table: BallisticEntry[], range: number): number {
  // Analog zu interpolateElevation
  // ...
}
```

**Höhenkorrektur der Flugzeit:**
```
ToF_korrigiert = ToF_basis ± (heightDiff × tofPer100m / 100)
```

---

## 5. Reichweiten-Grenzen

### US Mörser (M821)
| Ring Count | HE Range | Smoke/Illum Range |
|------------|----------|-------------------|
| 0 | 50-400m | - |
| 1 | 100-900m | 100-800m |
| 2 | 200-1600m | 200-1400m |
| 3 | 300-2200m | 300-1800m |
| 4 | 400-2900m | 400-2400m |

### RUS Mörser
| Ring Count | HE Range | Smoke/Illum Range |
|------------|----------|-------------------|
| 0 | 50-500m | - |
| 1 | 100-800m | 100-600m |
| 2 | 200-1400m | 200-1100m |
| 3 | 300-1800m | 300-1600m |
| 4 | 400-2300m | 400-2200m |

---

## 6. Optimale Ring-Auswahl

Wähle die niedrigste Ring-Zahl, die die Entfernung abdeckt:
- Niedrigere Ringe = Kürzere Flugzeit
- Höhere Genauigkeit
- Bessere Reaktionsfähigkeit

**TypeScript:**
```typescript
function findOptimalRingCount(
  mortarType: 'US' | 'RUS',
  ammoType: 'HE' | 'Smoke' | 'Illumination',
  range: number
): number {
  const ranges = RANGE_TABLE[mortarType][ammoType];

  for (let ring = 0; ring <= 4; ring++) {
    if (range >= ranges[ring].min && range <= ranges[ring].max) {
      return ring;
    }
  }

  return -1; // Außer Reichweite
}
```

---

## 7. Zusammenfassung Fire Solution

```typescript
interface FireSolution {
  // Richtung
  azimuthDeg: number;      // 0-360°
  azimuthMil: number;      // 0-6400 MIL

  // Höhenwinkel
  elevationBase: number;   // MIL (ohne Höhenkorrektur)
  elevationAdj: number;    // MIL (mit Höhenkorrektur)
  deltaElev: number;       // Korrekturwert

  // Meta
  distance: number;        // Meter
  flightTime: number;      // Sekunden
  ringCount: number;       // 0-4
  inRange: boolean;        // Ziel erreichbar?
}
```
