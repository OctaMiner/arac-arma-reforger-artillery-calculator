# ARAC Ballistics Examples

Praktische Beispiele für die Nutzung der Ballistics Engine.

## Quick Start

```typescript
import { calculateFireSolution } from '@/lib/ballistics';

const solution = calculateFireSolution({
  mortar: { east: 481, north: 473, height: 95 },
  target: { east: 707, north: 428, height: 145 },
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 4,
});

console.log(`Azimuth: ${solution.azimuthMil} MIL`);
console.log(`Elevation: ${solution.elevationAdj} MIL`);
console.log(`Flight Time: ${solution.flightTime}s`);
```

## Szenario 1: Standard-Feuerauftrag

```typescript
import { calculateFireSolutionAuto } from '@/lib/ballistics';

// Automatische Ladungsauswahl
const solution = calculateFireSolutionAuto({
  mortar: { east: 500, north: 500, height: 100 },
  target: { east: 650, north: 450, height: 120 },
  mortarType: 'US',
  ammoType: 'HE',
});

if (solution.inRange) {
  console.log('FIRE MISSION');
  console.log('=============');
  console.log(`Distance: ${solution.distance}m`);
  console.log(
    `Direction: ${solution.azimuthDeg.toFixed(1)}° (${solution.azimuthMil.toFixed(0)} MIL)`
  );
  console.log(`Elevation: ${solution.elevationAdj} MIL`);
  console.log(`Charge: ${solution.ringCount} rings`);
  console.log(`Time of Flight: ${solution.flightTime}s`);
  console.log(`Height Correction: ${solution.deltaElev} MIL`);
} else {
  console.log('TARGET OUT OF RANGE');
  console.log(`Try charge ${solution.recommendedCharge}`);
}
```

## Szenario 2: Mehrere Ziele mit gleicher Ladung

```typescript
import { calculateFireSolution, findOptimalRingCount } from '@/lib/ballistics';

const mortarPos = { east: 500, north: 500, height: 100 };
const targets = [
  { id: 'T1', pos: { east: 600, north: 600, height: 110 } },
  { id: 'T2', pos: { east: 650, north: 550, height: 105 } },
  { id: 'T3', pos: { east: 580, north: 620, height: 115 } },
];

// Finde optimale Ladung für alle Ziele
const distances = targets.map((t) =>
  Math.sqrt(
    Math.pow((mortarPos.east - t.pos.east) * 10, 2) +
      Math.pow((mortarPos.north - t.pos.north) * 10, 2)
  )
);

const maxDist = Math.max(...distances);
const optimalCharge = findOptimalRingCount(maxDist, 'US', 'HE');

console.log(`Using charge ${optimalCharge} for all targets`);
console.log();

// Berechne für jedes Ziel
targets.forEach((target) => {
  const sol = calculateFireSolution({
    mortar: mortarPos,
    target: target.pos,
    mortarType: 'US',
    ammoType: 'HE',
    ringCount: optimalCharge,
  });

  console.log(`Target ${target.id}:`);
  console.log(`  Azimuth: ${sol.azimuthMil.toFixed(0)} MIL`);
  console.log(`  Elevation: ${sol.elevationAdj} MIL`);
  console.log(`  Distance: ${sol.distance}m`);
  console.log();
});
```

## Szenario 3: Rauch-Granaten für Sichtschutz

```typescript
import { calculateFireSolution } from '@/lib/ballistics';

const mortar = { east: 500, north: 500, height: 100 };
const smokePosition = { east: 620, north: 480, height: 95 };

const solution = calculateFireSolution({
  mortar,
  target: smokePosition,
  mortarType: 'US',
  ammoType: 'Smoke',
  ringCount: 2,
});

console.log('SMOKE MISSION');
console.log('=============');
console.log(`Azimuth: ${solution.azimuthMil.toFixed(0)} MIL`);
console.log(`Elevation: ${solution.elevationAdj} MIL`);
console.log(`Charge: ${solution.ringCount} rings`);
console.log(`Time to smoke: ${solution.flightTime}s`);
console.log();
console.log(`Infantry, smoke will be active in ${solution.flightTime}s!`);
```

## Szenario 4: Beleuchtung für Nachtoperationen

```typescript
import { calculateFireSolution } from '@/lib/ballistics';

const mortar = { east: 500, north: 500, height: 100 };
const illuminationPoint = { east: 700, north: 550, height: 0 };

const solution = calculateFireSolution({
  mortar,
  target: illuminationPoint,
  mortarType: 'US',
  ammoType: 'Illumination',
  ringCount: 3,
});

console.log('ILLUMINATION MISSION');
console.log('====================');
console.log(`Azimuth: ${solution.azimuthMil.toFixed(0)} MIL`);
console.log(`Elevation: ${solution.elevationAdj} MIL`);
console.log(`Charge: ${solution.ringCount} rings`);
console.log(`Flight Time: ${solution.flightTime}s`);
console.log();
console.log(
  `Flare will illuminate area at ${illuminationPoint.east}/${illuminationPoint.north}`
);
```

## Szenario 5: Reichweiten-Check vor Mission

```typescript
import { getMaximumRange, getMinimumRange, checkRange } from '@/lib/ballistics';

const mortarType = 'RUS';
const ammoType = 'HE';

console.log('MORTAR CAPABILITIES');
console.log('===================');
console.log(`Type: ${mortarType} ${ammoType}`);
console.log(`Min Range: ${getMinimumRange(mortarType, ammoType)}m`);
console.log(`Max Range: ${getMaximumRange(mortarType, ammoType)}m`);
console.log();

// Check specific target
const targetDistance = 1750;

const rangeCheck = checkRange(
  targetDistance,
  getMinimumRange(mortarType, ammoType),
  getMaximumRange(mortarType, ammoType)
);

if (rangeCheck.inRange) {
  console.log(`Target at ${targetDistance}m is IN RANGE`);
} else {
  console.log(`Target at ${targetDistance}m is OUT OF RANGE`);
  console.log(rangeCheck.warning);
}
```

## Szenario 6: Höhenkorrektur-Analyse

```typescript
import { calculateFireSolution } from '@/lib/ballistics';

const mortar = { east: 500, north: 500, height: 50 }; // Mörser im Tal
const target = { east: 650, north: 550, height: 200 }; // Ziel auf Berg

const solution = calculateFireSolution({
  mortar,
  target,
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 3,
});

const heightDiff = target.height - mortar.height;

console.log('HEIGHT CORRECTION ANALYSIS');
console.log('==========================');
console.log(`Mortar altitude: ${mortar.height}m`);
console.log(`Target altitude: ${target.height}m`);
console.log(
  `Height difference: ${heightDiff}m (${heightDiff > 0 ? 'target higher' : 'target lower'})`
);
console.log();
console.log(`Base elevation: ${solution.elevationBase} MIL`);
console.log(
  `Correction: ${solution.deltaElev} MIL (${solution.deltaElev > 0 ? 'subtract' : 'add'})`
);
console.log(`Final elevation: ${solution.elevationAdj} MIL`);
console.log();
console.log(
  `Tip: Target is ${Math.abs(heightDiff)}m ${heightDiff > 0 ? 'higher' : 'lower'} than mortar`
);
```

## Szenario 7: Feuerkorrektur nach Beobachtung

```typescript
import {
  calculateFireSolution,
  calculateDistance,
  calculateAzimuth,
} from '@/lib/ballistics';

const mortar = { east: 500, north: 500, height: 100 };
const intendedTarget = { east: 650, north: 550, height: 110 };
const impactPoint = { east: 645, north: 555, height: 110 }; // Einschlag zu kurz und links

// Erste Salve
const firstShot = calculateFireSolution({
  mortar,
  target: intendedTarget,
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 3,
});

console.log('FIRST SHOT');
console.log('==========');
console.log(`Azimuth: ${firstShot.azimuthMil.toFixed(0)} MIL`);
console.log(`Elevation: ${firstShot.elevationAdj} MIL`);
console.log();

// Berechne Korrektur
const errorDistance = calculateDistance(impactPoint, intendedTarget);
const correctionAzimuth = calculateAzimuth(mortar, impactPoint);

console.log('OBSERVED IMPACT');
console.log('===============');
console.log(`Impact at: ${impactPoint.east}/${impactPoint.north}`);
console.log(`Error: ${errorDistance.toFixed(0)}m from target`);
console.log();

// Korrigierte Salve
const correctedShot = calculateFireSolution({
  mortar,
  target: intendedTarget,
  mortarType: 'US',
  ammoType: 'HE',
  ringCount: 3,
});

console.log('CORRECTION');
console.log('==========');
console.log(
  `Adjust azimuth: ${(correctedShot.azimuthMil - firstShot.azimuthMil).toFixed(0)} MIL`
);
console.log(`New elevation: ${correctedShot.elevationAdj} MIL`);
```

## Szenario 8: Batch-Berechnung für Planungsphase

```typescript
import { calculateFireSolution } from '@/lib/ballistics';

const mortarPosition = { east: 500, north: 500, height: 100 };

const targets = [
  {
    id: 'OBJ ALPHA',
    pos: { east: 600, north: 600, height: 110 },
    priority: 'HIGH',
  },
  {
    id: 'OBJ BRAVO',
    pos: { east: 650, north: 550, height: 105 },
    priority: 'MEDIUM',
  },
  {
    id: 'OBJ CHARLIE',
    pos: { east: 700, north: 520, height: 115 },
    priority: 'LOW',
  },
];

console.log('FIRE PLAN');
console.log('=========');
console.log(`Mortar Position: ${mortarPosition.east}/${mortarPosition.north}`);
console.log();

targets.forEach((target, index) => {
  const solution = calculateFireSolution({
    mortar: mortarPosition,
    target: target.pos,
    mortarType: 'US',
    ammoType: 'HE',
    ringCount: 4,
  });

  console.log(`Target ${index + 1}: ${target.id} (${target.priority})`);
  console.log(`  Grid: ${target.pos.east}/${target.pos.north}`);
  console.log(`  Range: ${solution.distance}m`);
  console.log(
    `  Azimuth: ${solution.azimuthDeg.toFixed(1)}° (${solution.azimuthMil.toFixed(0)} MIL)`
  );
  console.log(`  Elevation: ${solution.elevationAdj} MIL`);
  console.log(`  Charge: ${solution.ringCount} rings`);
  console.log(`  TOF: ${solution.flightTime}s`);
  console.log(`  Status: ${solution.inRange ? 'IN RANGE' : 'OUT OF RANGE'}`);
  console.log();
});
```

## Performance-Tipps

1. **Table Caching**: Die Tabellen werden automatisch gecacht, wiederholte Berechnungen sind schnell.

2. **Batch-Berechnungen**: Bei vielen Zielen, nutze die gleiche `ringCount` wenn möglich.

3. **Auto-Mode**: Nutze `calculateFireSolutionAuto()` für unbekannte Entfernungen.

4. **Range Pre-Check**: Nutze `getMaximumRange()` und `getMinimumRange()` für schnelle Validierung.
