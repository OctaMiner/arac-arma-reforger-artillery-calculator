# Projekt-Dokumentation
# Arma Reforger Artillery Calculator (ARAC)

## Projektübersicht

Ein Desktop-Mörser-Rechner für Arma Reforger, der präzise ballistische Berechnungen mit einer interaktiven Kartenansicht kombiniert.

---

## 1. Quelldaten-Analyse

### 1.1 Gene's Ballistic Tables (`Arma Reforger Mortar Calc.xlsx`)

#### Struktur
- **Sheet "Calculation"**: Eingabemaske für Fire Mission Parameter
- **Sheet "Range Data"**: Ballistische Tabellen

#### Verfügbare Daten
| Mörser-Typ | Munition | Ring Count | Reichweite |
|------------|----------|------------|------------|
| RUS | HE | 0 | 50-500m |
| RUS | HE | 1 | 100-800m |
| RUS | HE | 2 | 200-1400m |
| RUS | HE | 3 | 300-1800m |
| RUS | HE | 4 | 400-2300m |
| RUS | Illumination | 1-4 | variabel |
| RUS | Smoke | 1-4 | variabel |
| US | HE | 0 | 50-400m |
| US | HE | 1 | 100-900m |
| US | HE | 2 | 200-1600m |
| US | HE | 3 | 300-2200m |
| US | HE | 4 | 400-2900m |
| US | Illumination | 1-4 | variabel |
| US | Smoke | 1-4 | variabel |

#### Tabellen-Format (Range Data)
```
Mortar Type | Shell Type | Ring Count | Range (m) | Elevation (mil) | Time of Flight (sec) | D Elev (mil) | ToF per 100m (sec)
```

### 1.2 Marcel's Berechnungen (`Berechnungen Mor-ohne Map.xlsx`)

#### Kernfunktionen

**Entfernungsberechnung**
```
Entfernung = √((Ost_Mörser - Ost_Ziel)² + (Nord_Mörser - Nord_Ziel)²) × 10
```
- Koordinaten sind in 10m-Einheiten
- Multiplikation mit 10 ergibt Meter

**Azimut-Berechnung**
```
Winkel (Grad) = Quadranten-korrigierter ATAN2
Winkel (MIL) = Grad / 360 × 6400
```
Quadranten-Logik:
- NE-Quadrant: 0° + atan
- SE-Quadrant: 180° + atan
- SW-Quadrant: 180° + atan
- NW-Quadrant: 360° + atan

**Elevation (Polynomial)**
```
ELEV = a₀ + a₁×x + a₂×x² + a₃×x³ + a₄×x⁴ + a₅×x⁵
```
wobei x = Entfernung in Metern

**Polynomial-Koeffizienten (Beispiel US HE Ring 4)**
| Koeffizient | Wert |
|-------------|------|
| a₀ | 1652.31 |
| a₁ | -0.430979 |
| a₂ | 0.000459 |
| a₃ | ~0 |
| a₄ | ~0 |
| a₅ | ~0 |

**Delta-ELEV (Höhenkorrektur)**
```
Δ ELEV = f(Höhendifferenz, Entfernung, Ring Count)
```
- Höheres Ziel: niedrigere Elevation nötig
- Tieferes Ziel: höhere Elevation nötig

**Korrigierte Elevation**
```
ELEV_gesamt = ELEV_basis - Δ ELEV (wenn Ziel höher)
ELEV_gesamt = ELEV_basis + Δ ELEV (wenn Ziel tiefer)
```

### 1.3 Referenz-Berechnung (Validierung)

**Input:**
- Mörser: Ost 481 (= 4810m), Nord 473 (= 4730m), Höhe 95m
- Ziel: Ost 707 (= 7070m), Nord 428 (= 4280m), Höhe 145m
- US Mörser, HE, 4 Ringe

**Erwartete Ergebnisse:**
| Parameter | Wert | Einheit |
|-----------|------|---------|
| Entfernung | 2304.37 | m |
| Azimut | 101.26 | ° |
| Azimut | 1800.20 | MIL |
| ELEV (Basis) | 1134.60 | MIL |
| Δ ELEV | 9.11 | MIL |
| ELEV (korrigiert) | 1125.49 | MIL |
| Flugzeit | 32.7 | sec |

---

## 2. Architektur-Entscheidungen

### 2.1 Technologie-Wahl: Electron + React

**Begründung:**
1. **Cross-Platform**: Primär Windows, aber erweiterbar
2. **Moderne UI**: React + TailwindCSS ermöglichen schnelle Entwicklung
3. **Karten-Integration**: Leaflet.js ist battle-tested
4. **Community**: Große Electron/React Community
5. **Antivirus-Kompatibilität**: Bekannte, vertrauenswürdige Technologie

**Alternativen evaluiert:**
- Tauri: Kleiner, aber weniger Karten-Libs
- PyQt: Python weniger für UI geeignet
- .NET WPF: Microsoft-spezifisch

### 2.2 Offline-First Design

- Keine Internet-Verbindung erforderlich
- Karten-Tiles werden lokal gespeichert
- Ballistische Tabellen als JSON eingebettet
- Einstellungen/Missionen lokal in AppData

### 2.3 Sicherheits-Design

```
┌──────────────────────────────────────┐
│           Electron Main              │
│  ┌────────────────────────────────┐  │
│  │        Preload Script          │  │
│  │   (contextBridge whitelist)    │  │
│  └────────────────────────────────┘  │
│               │                      │
│               ▼                      │
│  ┌────────────────────────────────┐  │
│  │     Renderer Process           │  │
│  │   (Kein Node, Kein FS)         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 3. Datei-Struktur (geplant)

```
arma-reforger-artillery-calc/
├── docs/
│   ├── PRD.md               # Product Requirements
│   ├── ARCHITECTURE.md      # System Design
│   └── DOCUMENTATION.md     # Diese Datei
├── .claude/
│   └── commands/            # Agent-Definitionen
│       ├── agents.md        # Übersicht
│       ├── lead.md          # Project Lead
│       ├── ballistics.md    # Ballistics Engineer
│       ├── frontend.md      # Frontend Developer
│       ├── electron.md      # Electron Specialist
│       ├── map.md           # Map Specialist
│       ├── design.md        # UI Designer
│       └── qa.md            # QA Tester
├── electron/
│   ├── main.ts              # Main Process
│   ├── preload.ts           # IPC Bridge
│   └── ipc/                 # IPC Handlers
├── src/
│   ├── components/          # React Components
│   ├── hooks/               # Custom Hooks
│   ├── lib/                 # Business Logic
│   │   ├── ballistics/      # Berechnungs-Engine
│   │   ├── coordinates/     # Koordinaten-Utils
│   │   └── storage/         # Persistenz
│   ├── types/               # TypeScript Types
│   └── assets/              # Statische Dateien
└── tests/                   # Test-Suite
```

---

## 4. Berechnungs-Algorithmen

### 4.1 Entfernungsberechnung

```typescript
function calculateDistance(
  mortarPos: { east: number; north: number },
  targetPos: { east: number; north: number }
): number {
  const deltaEast = (mortarPos.east - targetPos.east) * 10;  // In Meter
  const deltaNorth = (mortarPos.north - targetPos.north) * 10;
  return Math.sqrt(deltaEast ** 2 + deltaNorth ** 2);
}
```

### 4.2 Azimut-Berechnung

```typescript
function calculateAzimuth(
  mortarPos: { east: number; north: number },
  targetPos: { east: number; north: number }
): { deg: number; mil: number } {
  const deltaEast = targetPos.east - mortarPos.east;
  const deltaNorth = targetPos.north - mortarPos.north;

  let azimuthDeg: number;

  if (deltaNorth < 0) {
    // Südliche Hälfte
    if (deltaEast > 0) {
      azimuthDeg = 360 + Math.atan(deltaEast / deltaNorth) * 180 / Math.PI;
    } else {
      azimuthDeg = Math.atan(deltaEast / deltaNorth) * 180 / Math.PI;
    }
  } else {
    // Nördliche Hälfte
    azimuthDeg = 180 + Math.atan(deltaEast / deltaNorth) * 180 / Math.PI;
  }

  // Normalisieren auf 0-360
  if (azimuthDeg < 0) azimuthDeg += 360;
  if (azimuthDeg >= 360) azimuthDeg -= 360;

  const azimuthMil = azimuthDeg / 360 * 6400;

  return { deg: azimuthDeg, mil: azimuthMil };
}
```

### 4.3 Elevation-Interpolation

```typescript
interface PolynomialCoeffs {
  a0: number;
  a1: number;
  a2: number;
  a3: number;
  a4: number;
  a5: number;
}

function polynomialElevation(distance: number, coeffs: PolynomialCoeffs): number {
  return coeffs.a0
    + coeffs.a1 * distance
    + coeffs.a2 * Math.pow(distance, 2)
    + coeffs.a3 * Math.pow(distance, 3)
    + coeffs.a4 * Math.pow(distance, 4)
    + coeffs.a5 * Math.pow(distance, 5);
}

// Alternative: Lineare Interpolation aus Tabelle
function linearInterpolation(
  table: { range: number; elevation: number }[],
  distance: number
): number {
  // Finde die zwei nächsten Einträge
  let lower = table[0];
  let upper = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].range <= distance && table[i + 1].range >= distance) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }

  // Lineare Interpolation
  const ratio = (distance - lower.range) / (upper.range - lower.range);
  return lower.elevation + ratio * (upper.elevation - lower.elevation);
}
```

### 4.4 Höhenkorrektur

```typescript
function calculateDeltaElevation(
  heightDiff: number,  // Ziel-Höhe minus Mörser-Höhe
  distance: number,
  chargeCount: number
): number {
  // Polynomial-Koeffizienten für Delta-ELEV (aus Marcel's Tabelle)
  const coeffs = DELTA_ELEV_COEFFICIENTS[chargeCount];

  // Berechnung basiert auf Höhendifferenz und Entfernung
  // Vereinfachte Formel (muss validiert werden):
  const deltaElev = coeffs.a0
    + coeffs.a1 * heightDiff
    + coeffs.a2 * Math.pow(heightDiff, 2);

  return deltaElev;
}
```

---

## 5. Zusätzliche Quellen

### 5.1 RHS Vector 21 Fernglas (Mod)

**Dokumentation**: https://docs.rhsmods.org/rhs-status-quo-user-documentation/arma-reforger/rhs-status-quo/blufor/gadgets/vector-21

**Kernfunktionen für Artillerie:**
- `R` halten: Entfernung messen (Meter)
- `V` halten: Azimut messen (Grad)
- `R + V`: Beide gleichzeitig
- **Artillery Correction Mode**: `V` halten → `C` auf Ziel → zu Einschlag schwenken → loslassen
  - Ausgabe: `r.`/`l.` (rechts/links) + `A.`/`D.` (add/drop) in Metern

Siehe: `docs/VECTOR21_SPOTTER.md`

### 5.2 Steam Guide - Mortar Fire

**Quelle**: https://steamcommunity.com/sharedfiles/filedetails/?id=3453139368

**Wichtige Formeln:**
- Höhenkorrektur: `e = h × d` (Höhendiff × D ELEV per 100m)
- Interpolation: `g ÷ 100 × distance_diff`
- Feuerkorrektur: `(x < t) - (y > t) = g`, dann `g × a = b`

**Bestätigt:**
- **Kein Wind-Effekt dokumentiert** (auch im Guide nicht erwähnt)

Siehe: `docs/FORMULAS.md`

### 5.3 In-Game Artillery Table (Screenshot)

**Datei**: `i-made-a-python-script-to-calculate-mortar-ranging-v0-qwutfrte1fhe1.webp`

**Extrahierte Daten (M821 HE, 4 Rings):**
- Range: 400-2900m
- Average Dispersion: 15m
- Enthält: ELEV, ToF, D ELEV per 100m, ToF per 100m

Siehe: `data/ballistics/us_m821_he_ring4.json`

---

## 6. Offene Punkte & Bekannte Limitierungen

### 6.1 Wind-Berechnung

**Status**: Nicht implementiert

**Erkenntnis**: Auch der ausführliche Steam Guide erwähnt **keine Wind-Mechanik**. Möglicherweise hat Wind in Arma Reforger keinen signifikanten Einfluss auf Mörser, oder die Mechanik ist nicht dokumentiert.

**Lösungsansatz**:
1. Empirische Tests im Spiel durchführen
2. Wind-Faktoren experimentell ermitteln
3. Community nach Erfahrungswerten fragen

**Vermutete Formel** (unbestätigt):
```typescript
interface WindCorrection {
  azimuthOffset: number;  // MIL
  rangeOffset: number;    // Meter
}

function calculateWindCorrection(
  windSpeed: number,      // m/s
  windDirection: number,  // Grad (0 = Nord)
  azimuth: number,        // Schussrichtung
  flightTime: number      // Sekunden
): WindCorrection {
  const relativeWindAngle = windDirection - azimuth;

  // Seitenwind-Komponente
  const crosswind = Math.sin(relativeWindAngle * Math.PI / 180) * windSpeed;

  // Gegen-/Rückenwind-Komponente
  const headwind = Math.cos(relativeWindAngle * Math.PI / 180) * windSpeed;

  // PLACEHOLDER FAKTOREN - müssen kalibriert werden!
  return {
    azimuthOffset: crosswind * flightTime * 0.5,  // MIL pro m/s pro Sekunde
    rangeOffset: headwind * flightTime * 1.0      // Meter pro m/s pro Sekunde
  };
}
```

### 6.2 Terrain-Höhendaten

**Status**: Manuelle Eingabe erforderlich

**Problem**: Keine API für In-Game Terrain-Höhen verfügbar.

**Workaround**: Benutzer muss Höhen manuell eingeben (aus Spiel ablesen).

### 6.3 Karten-Tiles

**Status**: Quelle noch zu klären

**Optionen**:
1. iZurvive API nutzen (falls erlaubt)
2. Eigene Screenshots + Tile-Generator
3. Community-Ressourcen

---

## 6. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **Azimut** | Horizontaler Richtungswinkel (0° = Nord, 90° = Ost) |
| **MIL / Strich** | Militärische Winkeleinheit (6400 MIL = 360°) |
| **Elevation** | Vertikaler Höhenwinkel des Rohres |
| **ELEV** | Kurzform für Elevation |
| **Δ ELEV** | Delta/Korrektur der Elevation für Höhenunterschied |
| **Ring Count** | Anzahl der Treibladungs-Ringe (0-4, mehr = weiter) |
| **HE** | High Explosive (Spreng-Munition) |
| **ToF** | Time of Flight (Flugzeit) |
| **Fire Solution** | Berechnete Feuerparameter (Azimut + Elevation) |
| **Fire Mission** | Gespeichertes Ziel mit allen Parametern |

---

## 7. Versions-Historie

| Version | Datum | Änderungen |
|---------|-------|------------|
| 0.1.0 | - | Initiales PRD und Architektur |
| - | - | MVP-Entwicklung |
| - | - | Erste Tests |

---

## 8. Mitwirkende

- **Gene**: Ballistische Tabellen
- **Marcel**: Polynomial-Berechnungen und Azimut-Formeln
- **Jann**: Projekt-Initiator

---

## 9. Lizenz & Distribution

- Open Source auf GitHub
- Keine privaten/persönlichen Daten im Repository
- Keine API-Keys oder Credentials committen
