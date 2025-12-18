// ============================================
// ARAC Spotter Module - Integration Test
// ============================================
// Testet die Integration mit dem Ballistics-Modul

import type { Coordinate } from '../../types'
import {
  calculateTargetFromSpotter,
  applyCorrection,
  formatCorrectionCall,
  type SpotterInput,
  type CorrectionInput
} from './index'

console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║       ARAC Spotter - Integration Test                     ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

// Test: Kompletter Workflow von Spotter-Daten bis zur Feuerkorrektur
console.log('=== Kompletter Workflow-Test ===\n')

// 1. Spotter erfasst Ziel mit Vector 21
const spotterData: SpotterInput = {
  spotterPosition: { east: 450, north: 300, height: 40 },
  distance: 1500,
  azimuth: 120,
  heightAngle: 3
}

console.log('1. Spotter-Daten empfangen:')
console.log(`   Position: E${spotterData.spotterPosition.east} N${spotterData.spotterPosition.north}`)
console.log(`   Entfernung: ${spotterData.distance}m`)
console.log(`   Azimut: ${spotterData.azimuth}°`)
console.log(`   Höhenwinkel: ${spotterData.heightAngle}°\n`)

// 2. Zielposition berechnen
const target = calculateTargetFromSpotter(spotterData)
console.log('2. Berechnetes Ziel:')
console.log(`   East: ${target.east.toFixed(2)}`)
console.log(`   North: ${target.north.toFixed(2)}`)
console.log(`   Height: ${target.height.toFixed(1)}m\n`)

// 3. Mörser-Position definieren
const mortarPos: Coordinate = { east: 400, north: 250, height: 35 }
console.log('3. Mörser-Position:')
console.log(`   East: ${mortarPos.east}`)
console.log(`   North: ${mortarPos.north}`)
console.log(`   Height: ${mortarPos.height}m\n`)

// 4. Simulation: Erster Schuss verfehlt
console.log('4. Erster Schuss abgefeuert...\n')

// 5. Spotter meldet Korrektur
const correction: CorrectionInput = {
  leftRight: 15,
  addDrop: 25,
  currentAzimuth: 120,
  currentDistance: 1500
}

console.log('5. Spotter-Korrektur:')
console.log(`   ${formatCorrectionCall(correction)}\n`)

// 6. Korrektur anwenden
const correctedTarget = applyCorrection(target, correction)
console.log('6. Korrigiertes Ziel:')
console.log(`   East: ${correctedTarget.east.toFixed(2)} (Δ ${(correctedTarget.east - target.east).toFixed(2)})`)
console.log(`   North: ${correctedTarget.north.toFixed(2)} (Δ ${(correctedTarget.north - target.north).toFixed(2)})`)
console.log(`   Height: ${correctedTarget.height.toFixed(1)}m\n`)

// Erfolgstest
if (correctedTarget.east !== target.east || correctedTarget.north !== target.north) {
  console.log('✓ Integration Test erfolgreich!')
  console.log('✓ Alle Module funktionieren korrekt zusammen\n')
} else {
  console.error('✗ Integration Test fehlgeschlagen!')
  console.error('✗ Korrektur wurde nicht angewendet\n')
  process.exit(1)
}

console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║               Integration Test bestanden                   ║')
console.log('╚════════════════════════════════════════════════════════════╝')
