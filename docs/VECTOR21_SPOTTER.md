# Vector 21 Fernglas - Spotter Integration

## Übersicht

Das **RHS Vector 21** ist ein Laser-Entfernungsmesser mit integriertem 3D-Kompass. Es bietet 7x Vergrößerung und kann Entfernungen bis zu 12 km messen.

**Mod erforderlich**: RHS Status Quo
**Dokumentation**: https://docs.rhsmods.org/rhs-status-quo-user-documentation/arma-reforger/rhs-status-quo/blufor/gadgets/vector-21

---

## Retikel-System

- **10-MIL Linienabstand**
- **5-MIL Linie-Punkt-Abstand**
- **Messprinzip**: 1 MIL = 1 Meter Abstand bei 1 km Entfernung
  - Beispiel: Ein 1m hohes Objekt bei 100m = 10 MIL im Retikel

---

## Steuerung & Funktionen

| Funktion | Tasten | Ausgabe |
|----------|--------|---------|
| **Entfernung messen** | `R` halten (~2 Sek) | Meter zum Ziel |
| **Azimut messen** | `V` halten (~2 Sek) | Grad zum Ziel |
| **Beides messen** | `R + V` gleichzeitig | Entfernung + Azimut |
| **Zwei-Punkt-Distanz** | `R` halten, `C` tippen (Punkt 1), bewegen, loslassen | Distanz zwischen Punkten |
| **Horizontal/Vertikal** | `R` tippen, `R` halten, `C` tippen, bewegen, loslassen | Getrennte Messungen |
| **Azimut + Neigung** | `V` tippen, `V` halten (~2 Sek) | Winkel + Neigung |
| **Artillerie-Korrektur** | `V` halten, `C` tippen (Ziel), zu Einschlag bewegen, loslassen | Korrekturwerte |

---

## Artillerie-Korrektur-Modus

Der wichtigste Modus für Mörser-Unterstützung!

### Ablauf
1. `V` gedrückt halten
2. Auf das **Ziel** zielen und `C` tippen (speichert Zielpunkt)
3. Auf den **Einschlagpunkt** zielen
4. `V` loslassen

### Ausgabe
Das Display zeigt Korrekturwerte:
- `r.` = rechts (right)
- `l.` = links (left)
- `A.` = hinzufügen (add = weiter schießen)
- `D.` = abziehen (drop = kürzer schießen)

Mit Distanzangaben in Metern!

**Beispiel-Ausgabe**: `r. 15  A. 30`
= 15m nach rechts korrigieren, 30m weiter schießen

---

## Integration in ARAC

### Spotter-Modus Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    SPOTTER INPUT                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Spotter Position (GPS):  [____] Ost  [____] Nord            │
│                                                              │
│  ─────────────── Zielerfassung ───────────────               │
│  Entfernung zum Ziel:     [____] m    (R-Taste)              │
│  Azimut zum Ziel:         [____] °    (V-Taste)              │
│  Höhendifferenz:          [____] m    (optional)             │
│                                                              │
│  [Ziel berechnen]                                            │
│                                                              │
│  ─────────────── Feuerkorrektur ───────────────              │
│  Links/Rechts Korrektur:  [____] m    (l./r.)                │
│  Add/Drop Korrektur:      [____] m    (A./D.)                │
│                                                              │
│  [Korrektur anwenden]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Ziel-Berechnung aus Spotter-Daten

```typescript
interface SpotterInput {
  spotterPos: { east: number; north: number };
  distanceToTarget: number;  // Meter (R-Taste)
  azimuthToTarget: number;   // Grad (V-Taste)
  heightDiff?: number;       // Optional
}

function calculateTargetFromSpotter(input: SpotterInput): { east: number; north: number } {
  // Azimut in Radiant umrechnen
  const azimuthRad = input.azimuthToTarget * Math.PI / 180;

  // Zielposition berechnen
  // Ost = Spotter_Ost + sin(Azimut) * Entfernung
  // Nord = Spotter_Nord + cos(Azimut) * Entfernung
  const targetEast = input.spotterPos.east + Math.sin(azimuthRad) * input.distanceToTarget / 10;
  const targetNorth = input.spotterPos.north + Math.cos(azimuthRad) * input.distanceToTarget / 10;

  return {
    east: Math.round(targetEast),
    north: Math.round(targetNorth)
  };
}
```

### Feuerkorrektur-Berechnung

```typescript
interface CorrectionInput {
  currentTargetPos: { east: number; north: number };
  leftRightCorrection: number;  // Positiv = rechts, Negativ = links
  addDropCorrection: number;    // Positiv = weiter, Negativ = kürzer
  currentAzimuth: number;       // Aktuelle Schussrichtung
}

function applyCorrection(input: CorrectionInput): { east: number; north: number } {
  const azimuthRad = input.currentAzimuth * Math.PI / 180;

  // Seitenkorrektur (senkrecht zur Schussrichtung)
  const lateralAzimuth = azimuthRad + Math.PI / 2; // 90° nach rechts
  const lateralEast = Math.sin(lateralAzimuth) * input.leftRightCorrection / 10;
  const lateralNorth = Math.cos(lateralAzimuth) * input.leftRightCorrection / 10;

  // Entfernungskorrektur (in Schussrichtung)
  const rangeEast = Math.sin(azimuthRad) * input.addDropCorrection / 10;
  const rangeNorth = Math.cos(azimuthRad) * input.addDropCorrection / 10;

  return {
    east: Math.round(input.currentTargetPos.east + lateralEast + rangeEast),
    north: Math.round(input.currentTargetPos.north + lateralNorth + rangeNorth)
  };
}
```

---

## Typischer Einsatz-Workflow

### Phase 1: Zielerfassung (Spotter)
1. Spotter meldet eigene GPS-Position (vom Spiel ablesen)
2. Spotter visiert Ziel an mit Vector 21
3. Spotter misst: `R + V` gleichzeitig → Entfernung + Azimut
4. Spotter meldet: "Ziel, 1200 Meter, Azimut 45 Grad"

### Phase 2: Berechnung (ARAC)
1. Spotter-Position eingeben
2. Messwerte eingeben
3. ARAC berechnet Zielkoordinaten
4. ARAC berechnet Feuerkommando für Mörser

### Phase 3: Feuer (Mörser)
1. Mörser stellt Azimut und Elevation ein
2. Feuer!

### Phase 4: Korrektur (Spotter)
1. Spotter beobachtet Einschlag
2. Spotter nutzt Artillery-Korrektur-Modus:
   - `V` halten, `C` auf Ziel, zu Einschlag schwenken, loslassen
3. Spotter meldet: "Rechts 20, Add 15"
4. ARAC wendet Korrektur an
5. Neues Feuerkommando

### Phase 5: Wirkung (Fire for Effect)
- Nach erfolgreicher Korrektur: Feuerschlag

---

## UI-Mockup für Spotter-Panel

```
┌─────────────────────────────────────────┐
│ SPOTTER MODE                    [X]     │
├─────────────────────────────────────────┤
│                                         │
│ Spotter GPS:                            │
│ ┌─────────┐  ┌─────────┐                │
│ │  5420   │  │  3180   │                │
│ └─────────┘  └─────────┘                │
│     Ost          Nord                   │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Ziel-Messung (Vector 21):               │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│ │  1200   │  │   45    │  │   +15   │   │
│ └─────────┘  └─────────┘  └─────────┘   │
│   Entf. m      Azimut °    Höhe m       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │         ZIEL BERECHNEN              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Berechnetes Ziel:                       │
│ Ost: 6269  Nord: 4028                   │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Feuerkorrektur:                         │
│ ┌─────────┐  ┌─────────┐                │
│ │   +20   │  │   +15   │                │
│ └─────────┘  └─────────┘                │
│   L/R (m)      Add/Drop                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │       KORREKTUR ANWENDEN            │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```
