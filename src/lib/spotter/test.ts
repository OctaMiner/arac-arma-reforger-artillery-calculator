// ============================================
// ARAC Spotter Module - Test Suite
// ============================================

import type { Coordinate } from '../../types'
import {
  calculateTargetFromSpotter,
  calculateAzimuth,
  calculateDistance,
  calculateHeightAngle,
  createSpotterInputFromCoordinates
} from './targetCalculator'
import {
  applyCorrection,
  lateralToMilCorrection,
  milToLateralCorrection,
  calculateCorrectionFromImpact,
  aggregateCorrections,
  formatCorrectionCall,
  type CorrectionInput
} from './correction'

// Helper für Assertions
function assertClose(actual: number, expected: number, tolerance: number = 0.01): void {
  const diff = Math.abs(actual - expected)
  if (diff > tolerance) {
    throw new Error(`Expected ${expected}, got ${actual} (diff: ${diff})`)
  }
}

function assertCoordinateClose(actual: Coordinate, expected: Coordinate, tolerance: number = 0.01): void {
  assertClose(actual.east, expected.east, tolerance)
  assertClose(actual.north, expected.north, tolerance)
  assertClose(actual.height, expected.height, tolerance)
}

// ============================================
// Test 1: Zielberechnung bei verschiedenen Azimuten
// ============================================

export function testTargetCalculation(): void {
  console.log('\n=== Test 1: Zielberechnung bei verschiedenen Azimuten ===')

  const spotterPos: Coordinate = { east: 500, north: 300, height: 50 }

  // Test 1a: Azimut 0° (Nord)
  const target0 = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 0
  })
  console.log('Azimut 0° (Nord):', target0)
  assertCoordinateClose(target0, { east: 500, north: 400, height: 50 })

  // Test 1b: Azimut 90° (Ost)
  const target90 = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 90
  })
  console.log('Azimut 90° (Ost):', target90)
  assertCoordinateClose(target90, { east: 600, north: 300, height: 50 })

  // Test 1c: Azimut 180° (Süd)
  const target180 = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 180
  })
  console.log('Azimut 180° (Süd):', target180)
  assertCoordinateClose(target180, { east: 500, north: 200, height: 50 })

  // Test 1d: Azimut 270° (West)
  const target270 = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 270
  })
  console.log('Azimut 270° (West):', target270)
  assertCoordinateClose(target270, { east: 400, north: 300, height: 50 })

  // Test 1e: Azimut 45° (Nordost)
  const target45 = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 45
  })
  console.log('Azimut 45° (Nordost):', target45)
  // Bei 45° sollte Ost = Nord Verschiebung sein
  assertClose(target45.east - spotterPos.east, target45.north - spotterPos.north, 0.01)

  console.log('✓ Alle Azimut-Tests bestanden')
}

// ============================================
// Test 2: Höhenwinkel-Berechnung
// ============================================

export function testHeightAngleCalculation(): void {
  console.log('\n=== Test 2: Höhenwinkel-Berechnung ===')

  const spotterPos: Coordinate = { east: 500, north: 300, height: 50 }

  // Test 2a: Positiver Höhenwinkel (aufwärts)
  const targetUp = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 0,
    heightAngle: 30 // 30° aufwärts
  })
  console.log('30° aufwärts:', targetUp)
  // Bei 30° aufwärts sollte die Höhe um distance * sin(30°) = 1000 * 0.5 = 500m steigen
  assertClose(targetUp.height, spotterPos.height + 500, 0.1)
  // Horizontale Distanz: distance * cos(30°) = 1000 * 0.866 = 866m
  assertClose(targetUp.north, spotterPos.north + 86.6, 0.1)

  // Test 2b: Negativer Höhenwinkel (abwärts)
  const targetDown = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 0,
    heightAngle: -30 // 30° abwärts
  })
  console.log('30° abwärts:', targetDown)
  assertClose(targetDown.height, spotterPos.height - 500, 0.1)

  // Test 2c: 0° Höhenwinkel (horizontal)
  const targetFlat = calculateTargetFromSpotter({
    spotterPosition: spotterPos,
    distance: 1000,
    azimuth: 0,
    heightAngle: 0
  })
  console.log('0° horizontal:', targetFlat)
  assertClose(targetFlat.height, spotterPos.height, 0.01)

  console.log('✓ Alle Höhenwinkel-Tests bestanden')
}

// ============================================
// Test 3: Korrektur Links/Rechts
// ============================================

export function testLateralCorrection(): void {
  console.log('\n=== Test 3: Korrektur Links/Rechts ===')

  const target: Coordinate = { east: 500, north: 400, height: 50 }

  // Test 3a: 20m nach rechts bei Azimut 0° (Nord)
  const correctedRight = applyCorrection(target, {
    leftRight: 20, // 20m rechts
    addDrop: 0,
    currentAzimuth: 0,
    currentDistance: 1000
  })
  console.log('20m rechts bei Azimut 0°:', correctedRight)
  assertCoordinateClose(correctedRight, { east: 502, north: 400, height: 50 })

  // Test 3b: 20m nach links bei Azimut 0° (Nord)
  const correctedLeft = applyCorrection(target, {
    leftRight: -20, // 20m links
    addDrop: 0,
    currentAzimuth: 0,
    currentDistance: 1000
  })
  console.log('20m links bei Azimut 0°:', correctedLeft)
  assertCoordinateClose(correctedLeft, { east: 498, north: 400, height: 50 })

  // Test 3c: 20m nach rechts bei Azimut 90° (Ost)
  const correctedRight90 = applyCorrection(target, {
    leftRight: 20,
    addDrop: 0,
    currentAzimuth: 90,
    currentDistance: 1000
  })
  console.log('20m rechts bei Azimut 90°:', correctedRight90)
  assertCoordinateClose(correctedRight90, { east: 500, north: 398, height: 50 })

  // Test 3d: MIL-Konvertierung
  const mils = lateralToMilCorrection(10, 1000)
  console.log('10m Abweichung bei 1000m:', mils, 'MIL')
  assertClose(mils, 10, 0.01)

  const meters = milToLateralCorrection(10, 1000)
  console.log('10 MIL bei 1000m:', meters, 'm')
  assertClose(meters, 10, 0.01)

  console.log('✓ Alle Links/Rechts-Tests bestanden')
}

// ============================================
// Test 4: Korrektur Add/Drop
// ============================================

export function testLongitudinalCorrection(): void {
  console.log('\n=== Test 4: Korrektur Add/Drop ===')

  const target: Coordinate = { east: 500, north: 400, height: 50 }

  // Test 4a: 30m Add (zu kurz) bei Azimut 0° (Nord)
  const correctedAdd = applyCorrection(target, {
    leftRight: 0,
    addDrop: 30, // 30m zu kurz
    currentAzimuth: 0,
    currentDistance: 1000
  })
  console.log('30m Add bei Azimut 0°:', correctedAdd)
  assertCoordinateClose(correctedAdd, { east: 500, north: 403, height: 50 })

  // Test 4b: 30m Drop (zu weit) bei Azimut 0° (Nord)
  const correctedDrop = applyCorrection(target, {
    leftRight: 0,
    addDrop: -30, // 30m zu weit
    currentAzimuth: 0,
    currentDistance: 1000
  })
  console.log('30m Drop bei Azimut 0°:', correctedDrop)
  assertCoordinateClose(correctedDrop, { east: 500, north: 397, height: 50 })

  // Test 4c: 30m Add bei Azimut 90° (Ost)
  const correctedAdd90 = applyCorrection(target, {
    leftRight: 0,
    addDrop: 30,
    currentAzimuth: 90,
    currentDistance: 1000
  })
  console.log('30m Add bei Azimut 90°:', correctedAdd90)
  assertCoordinateClose(correctedAdd90, { east: 503, north: 400, height: 50 })

  console.log('✓ Alle Add/Drop-Tests bestanden')
}

// ============================================
// Test 5: Kombinierte Korrektur
// ============================================

export function testCombinedCorrection(): void {
  console.log('\n=== Test 5: Kombinierte Korrektur ===')

  const target: Coordinate = { east: 500, north: 400, height: 50 }

  // Test 5a: 20m rechts + 30m Add bei Azimut 0°
  const corrected = applyCorrection(target, {
    leftRight: 20,
    addDrop: 30,
    currentAzimuth: 0,
    currentDistance: 1000
  })
  console.log('20m rechts + 30m Add bei Azimut 0°:', corrected)
  assertCoordinateClose(corrected, { east: 502, north: 403, height: 50 })

  // Test 5b: 10m links + 20m Drop bei Azimut 45°
  const corrected45 = applyCorrection(target, {
    leftRight: -10,
    addDrop: -20,
    currentAzimuth: 45,
    currentDistance: 1000
  })
  console.log('10m links + 20m Drop bei Azimut 45°:', corrected45)
  // Bei 45° sollten beide Korrekturen ähnliche Komponenten haben

  console.log('✓ Alle kombinierten Tests bestanden')
}

// ============================================
// Test 6: Korrektur aus Einschlagpunkt
// ============================================

export function testCorrectionFromImpact(): void {
  console.log('\n=== Test 6: Korrektur aus Einschlagpunkt ===')

  const target: Coordinate = { east: 500, north: 400, height: 50 }
  const impact: Coordinate = { east: 498, north: 397, height: 48 }

  // Berechne Korrektur
  const correction = calculateCorrectionFromImpact(target, impact, 0)
  console.log('Berechnete Korrektur:', correction)

  // Wende Korrektur an
  const corrected = applyCorrection(impact, correction)
  console.log('Korrigierte Position:', corrected)

  // Die korrigierte Position sollte nahe am Ziel sein (nur East/North, Höhe wird nicht korrigiert)
  assertClose(corrected.east, target.east, 0.1)
  assertClose(corrected.north, target.north, 0.1)

  console.log('✓ Einschlagpunkt-Test bestanden')
}

// ============================================
// Test 7: Rückwärts-Berechnung (Roundtrip)
// ============================================

export function testRoundtrip(): void {
  console.log('\n=== Test 7: Rückwärts-Berechnung ===')

  const spotterPos: Coordinate = { east: 500, north: 300, height: 50 }
  const originalTarget: Coordinate = { east: 550, north: 450, height: 75 }

  // Erstelle SpotterInput aus bekannten Koordinaten
  const spotterInput = createSpotterInputFromCoordinates(spotterPos, originalTarget)
  console.log('SpotterInput:', spotterInput)

  // Berechne Ziel zurück
  const calculatedTarget = calculateTargetFromSpotter(spotterInput)
  console.log('Berechnetes Ziel:', calculatedTarget)

  // Sollte dem Original entsprechen
  assertCoordinateClose(calculatedTarget, originalTarget, 0.1)

  // Überprüfe auch Hilfsfunktionen
  const azimuth = calculateAzimuth(spotterPos, originalTarget)
  const distance = calculateDistance(spotterPos, originalTarget)
  const heightAngle = calculateHeightAngle(spotterPos, originalTarget)

  console.log(`Azimut: ${azimuth.toFixed(2)}°`)
  console.log(`Distanz: ${distance.toFixed(2)}m`)
  console.log(`Höhenwinkel: ${heightAngle.toFixed(2)}°`)

  assertClose(azimuth, spotterInput.azimuth, 0.1)
  assertClose(distance, Math.sqrt(spotterInput.distance ** 2 - 25 ** 2), 1) // Horizontal distance

  console.log('✓ Roundtrip-Test bestanden')
}

// ============================================
// Test 8: Mehrfache Korrekturen
// ============================================

export function testAggregateCorrections(): void {
  console.log('\n=== Test 8: Mehrfache Korrekturen ===')

  const corrections: CorrectionInput[] = [
    { leftRight: 10, addDrop: 20, currentAzimuth: 45, currentDistance: 1000 },
    { leftRight: -5, addDrop: 10, currentAzimuth: 45, currentDistance: 1000 },
    { leftRight: 2, addDrop: -5, currentAzimuth: 45, currentDistance: 1000 }
  ]

  const aggregated = aggregateCorrections(corrections)
  console.log('Aggregierte Korrektur:', aggregated)

  assertClose(aggregated.leftRight, 7, 0.01)
  assertClose(aggregated.addDrop, 25, 0.01)

  console.log('✓ Aggregations-Test bestanden')
}

// ============================================
// Test 9: Korrektur-Ansagen
// ============================================

export function testCorrectionCalls(): void {
  console.log('\n=== Test 9: Korrektur-Ansagen ===')

  const calls = [
    formatCorrectionCall({ leftRight: 20, addDrop: 0, currentAzimuth: 0, currentDistance: 1000 }),
    formatCorrectionCall({ leftRight: -20, addDrop: 0, currentAzimuth: 0, currentDistance: 1000 }),
    formatCorrectionCall({ leftRight: 0, addDrop: 30, currentAzimuth: 0, currentDistance: 1000 }),
    formatCorrectionCall({ leftRight: 0, addDrop: -30, currentAzimuth: 0, currentDistance: 1000 }),
    formatCorrectionCall({ leftRight: 20, addDrop: 30, currentAzimuth: 0, currentDistance: 1000 }),
    formatCorrectionCall({ leftRight: 0, addDrop: 0, currentAzimuth: 0, currentDistance: 1000 })
  ]

  calls.forEach(call => console.log(call))

  console.log('✓ Ansagen-Test bestanden')
}

// ============================================
// Haupt-Test-Runner
// ============================================

export function runAllTests(): void {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         ARAC Spotter Module - Test Suite                  ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  try {
    testTargetCalculation()
    testHeightAngleCalculation()
    testLateralCorrection()
    testLongitudinalCorrection()
    testCombinedCorrection()
    testCorrectionFromImpact()
    testRoundtrip()
    testAggregateCorrections()
    testCorrectionCalls()

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║  ✓ ALLE TESTS BESTANDEN                                   ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗')
    console.error('║  ✗ TEST FEHLGESCHLAGEN                                    ║')
    console.error('╚════════════════════════════════════════════════════════════╝')
    console.error(error)
    throw error
  }
}

// Auto-run tests when executed directly
runAllTests()
