// ============================================
// ARAC Spotter Module - Beispiele
// ============================================

import type { Coordinate } from '../../types';
import {
  calculateTargetFromSpotter,
  calculateAzimuth,
  calculateDistance,
  type SpotterInput,
} from './targetCalculator';
import {
  applyCorrection,
  lateralToMilCorrection,
  calculateCorrectionFromImpact,
  formatCorrectionCall,
  type CorrectionInput,
} from './correction';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║      ARAC Spotter Module - Praktische Beispiele           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ============================================
// Beispiel 1: Vector 21 Daten zu Zielkoordinaten
// ============================================

console.log('=== Beispiel 1: Vector 21 Fernglas-Daten verarbeiten ===\n');

const spotterPosition: Coordinate = {
  east: 482.5, // Spotter bei Grid 4825 / 3150
  north: 315.0,
  height: 45, // 45m über Meeresspiegel
};

console.log('Spotter-Position:');
console.log(
  `  Grid: ${Math.floor(spotterPosition.east)}${Math.floor(
    spotterPosition.north % 100
  )
    .toString()
    .padStart(2, '0')} / ${Math.floor(spotterPosition.north)}${Math.floor(
    spotterPosition.north % 100
  )
    .toString()
    .padStart(2, '0')}`
);
console.log(`  Höhe: ${spotterPosition.height}m\n`);

// Spotter liest Vector 21 ab
console.log('Vector 21 Messung:');
console.log('  R-Taste (Entfernung): 1450m');
console.log('  V-Taste (Azimut): 127°');
console.log('  Höhenwinkel: 2.5° (leicht aufwärts)\n');

const spotterInput: SpotterInput = {
  spotterPosition,
  distance: 1450,
  azimuth: 127,
  heightAngle: 2.5,
};

const target = calculateTargetFromSpotter(spotterInput);

console.log('Berechnetes Ziel:');
console.log(
  `  East: ${target.east.toFixed(2)} (${Math.floor(target.east * 10)}m)`
);
console.log(
  `  North: ${target.north.toFixed(2)} (${Math.floor(target.north * 10)}m)`
);
console.log(`  Height: ${target.height.toFixed(1)}m`);
console.log(
  `  Grid: ${Math.floor(target.east)}${Math.floor((target.east % 1) * 100)
    .toString()
    .padStart(2, '0')} / ${Math.floor(target.north)}${Math.floor(
    (target.north % 1) * 100
  )
    .toString()
    .padStart(2, '0')}\n`
);

// ============================================
// Beispiel 2: Feuer-Mission mit Spotter-Korrektur
// ============================================

console.log('\n=== Beispiel 2: Feuer-Mission mit Korrektur ===\n');

const mortarPosition: Coordinate = {
  east: 420.0,
  north: 280.0,
  height: 30,
};

console.log('Mörser-Position:');
console.log(
  `  Grid: ${Math.floor(mortarPosition.east)}00 / ${Math.floor(mortarPosition.north)}00`
);
console.log(`  Höhe: ${mortarPosition.height}m\n`);

// Initiales Ziel
console.log('Initiales Ziel:');
console.log(
  `  Grid: ${Math.floor(target.east)}${Math.floor((target.east % 1) * 100)
    .toString()
    .padStart(2, '0')} / ${Math.floor(target.north)}${Math.floor(
    (target.north % 1) * 100
  )
    .toString()
    .padStart(2, '0')}`
);

const distanceToTarget = calculateDistance(mortarPosition, target);
const azimuthToTarget = calculateAzimuth(mortarPosition, target);

console.log(`  Entfernung: ${distanceToTarget.toFixed(0)}m`);
console.log(`  Azimut: ${azimuthToTarget.toFixed(1)}°\n`);

// Erster Schuss - Spotter beobachtet Einschlag
console.log('Spotter-Meldung nach 1. Schuss:');
console.log('  "Einschlag 25 Meter rechts, 40 Meter zu kurz!"\n');

const correction1: CorrectionInput = {
  leftRight: 25, // 25m rechts
  addDrop: 40, // 40m zu kurz (Add)
  currentAzimuth: azimuthToTarget,
  currentDistance: distanceToTarget,
};

// MIL-Korrektur berechnen (für alternative Darstellung)
const azimuthCorrectionMil = lateralToMilCorrection(
  correction1.leftRight,
  correction1.currentDistance
);
console.log('Berechnete Korrektur:');
console.log(`  ${formatCorrectionCall(correction1)}`);
console.log(`  Azimut-Korrektur: ${azimuthCorrectionMil.toFixed(1)} MIL\n`);

// Korrektur anwenden
const target2 = applyCorrection(target, correction1);
console.log('Korrigiertes Ziel (Schuss 2):');
console.log(`  East: ${target2.east.toFixed(2)}`);
console.log(`  North: ${target2.north.toFixed(2)}\n`);

// Zweiter Schuss
console.log('Spotter-Meldung nach 2. Schuss:');
console.log('  "Einschlag 8 Meter links, 12 Meter zu weit!"\n');

const correction2: CorrectionInput = {
  leftRight: -8, // 8m links
  addDrop: -12, // 12m zu weit (Drop)
  currentAzimuth: azimuthToTarget,
  currentDistance: distanceToTarget,
};

console.log('Berechnete Korrektur:');
console.log(`  ${formatCorrectionCall(correction2)}\n`);

const target3 = applyCorrection(target2, correction2);
console.log('Korrigiertes Ziel (Schuss 3):');
console.log(`  East: ${target3.east.toFixed(2)}`);
console.log(`  North: ${target3.north.toFixed(2)}\n`);

// Dritter Schuss
console.log('Spotter-Meldung nach 3. Schuss:');
console.log('  "Volltreffer! Feuer effektiv!"\n');

// ============================================
// Beispiel 3: Automatische Korrektur aus Einschlagpunkt
// ============================================

console.log('\n=== Beispiel 3: Automatische Korrektur aus GPS-Daten ===\n');

// Angenommen, der Spotter hat GPS-Koordinaten des Einschlags
const desiredTarget: Coordinate = {
  east: 550.0,
  north: 420.0,
  height: 60,
};

const observedImpact: Coordinate = {
  east: 547.5, // 25m zu weit westlich
  north: 416.0, // 40m zu weit südlich
  height: 58,
};

console.log('Gewünschtes Ziel:');
console.log(
  `  Grid: ${Math.floor(desiredTarget.east)}00 / ${Math.floor(desiredTarget.north)}00\n`
);

console.log('Beobachteter Einschlag:');
console.log(
  `  Grid: ${Math.floor(observedImpact.east)}${Math.floor(
    (observedImpact.east % 1) * 100
  )
    .toString()
    .padStart(2, '0')} / ${Math.floor(observedImpact.north)}${Math.floor(
    (observedImpact.north % 1) * 100
  )
    .toString()
    .padStart(2, '0')}\n`
);

const azimuthForCorrection = calculateAzimuth(mortarPosition, desiredTarget);
const autoCorrection = calculateCorrectionFromImpact(
  desiredTarget,
  observedImpact,
  azimuthForCorrection
);

console.log('Automatisch berechnete Korrektur:');
console.log(`  ${formatCorrectionCall(autoCorrection)}`);
console.log(`  Links/Rechts: ${autoCorrection.leftRight.toFixed(1)}m`);
console.log(`  Add/Drop: ${autoCorrection.addDrop.toFixed(1)}m\n`);

const autoCorrectedTarget = applyCorrection(observedImpact, autoCorrection);
console.log('Korrigiertes Ziel:');
console.log(
  `  East: ${autoCorrectedTarget.east.toFixed(2)} (Differenz: ${(autoCorrectedTarget.east - desiredTarget.east).toFixed(2)})`
);
console.log(
  `  North: ${autoCorrectedTarget.north.toFixed(2)} (Differenz: ${(autoCorrectedTarget.north - desiredTarget.north).toFixed(2)})\n`
);

// ============================================
// Beispiel 4: Integration mehrerer Spotter
// ============================================

console.log('\n=== Beispiel 4: Mehrere Spotter triangulieren Ziel ===\n');

const spotter1Pos: Coordinate = { east: 450, north: 300, height: 40 };
const spotter2Pos: Coordinate = { east: 520, north: 350, height: 55 };

console.log('Spotter 1 (Alpha):');
console.log(
  `  Position: ${Math.floor(spotter1Pos.east)}00 / ${Math.floor(spotter1Pos.north)}00`
);
console.log('  Vector 21: 1200m, Azimut 85°\n');

const targetAlpha = calculateTargetFromSpotter({
  spotterPosition: spotter1Pos,
  distance: 1200,
  azimuth: 85,
});

console.log('Spotter 2 (Bravo):');
console.log(
  `  Position: ${Math.floor(spotter2Pos.east)}00 / ${Math.floor(spotter2Pos.north)}00`
);
console.log('  Vector 21: 950m, Azimut 165°\n');

const targetBravo = calculateTargetFromSpotter({
  spotterPosition: spotter2Pos,
  distance: 950,
  azimuth: 165,
});

console.log('Berechnete Zielpositionen:');
console.log(
  `  Alpha: East ${targetAlpha.east.toFixed(1)}, North ${targetAlpha.north.toFixed(1)}`
);
console.log(
  `  Bravo: East ${targetBravo.east.toFixed(1)}, North ${targetBravo.north.toFixed(1)}`
);

// Durchschnitt bilden für präzisere Zielerfassung
const avgTarget: Coordinate = {
  east: (targetAlpha.east + targetBravo.east) / 2,
  north: (targetAlpha.north + targetBravo.north) / 2,
  height: (targetAlpha.height + targetBravo.height) / 2,
};

const deviation = calculateDistance(targetAlpha, targetBravo);
console.log(`\nAbweichung zwischen Messungen: ${deviation.toFixed(1)}m`);
console.log('Gemittelte Zielposition:');
console.log(`  East: ${avgTarget.east.toFixed(2)}`);
console.log(`  North: ${avgTarget.north.toFixed(2)}`);
console.log(
  `  Grid: ${Math.floor(avgTarget.east)}${Math.floor((avgTarget.east % 1) * 100)
    .toString()
    .padStart(2, '0')} / ${Math.floor(avgTarget.north)}${Math.floor(
    (avgTarget.north % 1) * 100
  )
    .toString()
    .padStart(2, '0')}\n`
);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                   Beispiele abgeschlossen                  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
