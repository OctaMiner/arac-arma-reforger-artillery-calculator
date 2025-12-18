// ============================================
// ARAC Spotter Fire Correction
// ============================================
// Berechnet und wendet Feuerkorrekturen an

import type { Coordinate } from '../../types'

/**
 * Korrektur-Input vom Spotter
 */
export interface CorrectionInput {
  leftRight: number       // Seitenabweichung in Metern (+ = rechts, - = links)
  addDrop: number         // Längsabweichung in Metern (+ = zu kurz/Add, - = zu weit/Drop)
  currentAzimuth: number  // Aktueller Azimut zum Ziel in Grad (0-360)
  currentDistance: number // Aktuelle Entfernung zum Ziel in Metern
}

/**
 * Wendet eine Feuerkorrektur auf die Zielposition an
 *
 * @param target - Aktuelle Zielposition
 * @param correction - Korrekturangaben vom Spotter
 * @returns Neue korrigierte Zielposition
 *
 * @example
 * // Einschlag 20m rechts und 30m zu kurz
 * const corrected = applyCorrection(target, {
 *   leftRight: 20,
 *   addDrop: 30,
 *   currentAzimuth: 45,
 *   currentDistance: 1000
 * })
 */
export function applyCorrection(target: Coordinate, correction: CorrectionInput): Coordinate {
  const { leftRight, addDrop, currentAzimuth } = correction

  // Azimut in Radianten konvertieren
  const azimuthRad = (currentAzimuth * Math.PI) / 180

  // Links/Rechts Korrektur (senkrecht zum Azimut)
  // Rechts = Azimut + 90°, Links = Azimut - 90°
  const lateralAngleRad = azimuthRad + Math.PI / 2
  const deltaEastLateral = leftRight * Math.sin(lateralAngleRad)
  const deltaNorthLateral = leftRight * Math.cos(lateralAngleRad)

  // Add/Drop Korrektur (entlang des Azimuts)
  // Add (zu kurz) = in Azimut-Richtung, Drop (zu weit) = gegen Azimut-Richtung
  const deltaEastLongitudinal = addDrop * Math.sin(azimuthRad)
  const deltaNorthLongitudinal = addDrop * Math.cos(azimuthRad)

  // Gesamt-Korrektur in Metern
  const totalDeltaEastMeters = deltaEastLateral + deltaEastLongitudinal
  const totalDeltaNorthMeters = deltaNorthLateral + deltaNorthLongitudinal

  // In Arma-Koordinaten konvertieren (10m Einheiten)
  const deltaEast = totalDeltaEastMeters / 10
  const deltaNorth = totalDeltaNorthMeters / 10

  return {
    east: target.east + deltaEast,
    north: target.north + deltaNorth,
    height: target.height // Höhe bleibt gleich
  }
}

/**
 * Konvertiert Seitenabweichung in MIL-Korrektur
 *
 * @param lateralMeters - Seitenabweichung in Metern
 * @param distance - Entfernung zum Ziel in Metern
 * @returns MIL-Korrektur
 *
 * @example
 * // 10m Abweichung bei 1000m Entfernung
 * const milCorrection = lateralToMilCorrection(10, 1000) // = 10 MIL
 */
export function lateralToMilCorrection(lateralMeters: number, distance: number): number {
  if (distance === 0) {
    return 0
  }
  // MIL = (Abweichung / Entfernung) * 1000
  return (lateralMeters / distance) * 1000
}

/**
 * Konvertiert MIL-Korrektur in Seitenabweichung
 *
 * @param milCorrection - MIL-Korrektur
 * @param distance - Entfernung zum Ziel in Metern
 * @returns Seitenabweichung in Metern
 */
export function milToLateralCorrection(milCorrection: number, distance: number): number {
  // Meter = (MIL * Entfernung) / 1000
  return (milCorrection * distance) / 1000
}

/**
 * Berechnet automatisch die Korrektur aus bekanntem Einschlagpunkt
 *
 * @param target - Gewünschte Zielposition
 * @param impact - Tatsächlicher Einschlagpunkt
 * @param azimuth - Azimut vom Mörser zum ursprünglichen Ziel
 * @returns CorrectionInput mit berechneten Korrekturwerten
 *
 * @example
 * const correction = calculateCorrectionFromImpact(target, impact, 45)
 * // Kann dann mit applyCorrection() verwendet werden
 */
export function calculateCorrectionFromImpact(
  target: Coordinate,
  impact: Coordinate,
  azimuth: number
): CorrectionInput {
  // Differenz in Metern berechnen
  const deltaEastMeters = (target.east - impact.east) * 10
  const deltaNorthMeters = (target.north - impact.north) * 10

  // Azimut in Radianten konvertieren
  const azimuthRad = (azimuth * Math.PI) / 180

  // Zerlegung in Längs- und Seitenkomponente
  // Längsrichtung: entlang des Azimuts
  const longitudinal =
    deltaEastMeters * Math.sin(azimuthRad) + deltaNorthMeters * Math.cos(azimuthRad)

  // Seitenrichtung: senkrecht zum Azimut (Azimut + 90°)
  const lateralAngleRad = azimuthRad + Math.PI / 2
  const lateral =
    deltaEastMeters * Math.sin(lateralAngleRad) + deltaNorthMeters * Math.cos(lateralAngleRad)

  // Entfernung für MIL-Berechnung
  const distance = Math.sqrt(deltaEastMeters * deltaEastMeters + deltaNorthMeters * deltaNorthMeters)

  return {
    leftRight: lateral,
    addDrop: longitudinal,
    currentAzimuth: azimuth,
    currentDistance: distance
  }
}

/**
 * Berechnet die Gesamtkorrektur aus mehreren aufeinanderfolgenden Korrekturen
 *
 * @param corrections - Array von CorrectionInput-Objekten
 * @returns Aggregierte Gesamtkorrektur
 */
export function aggregateCorrections(corrections: CorrectionInput[]): CorrectionInput {
  if (corrections.length === 0) {
    return {
      leftRight: 0,
      addDrop: 0,
      currentAzimuth: 0,
      currentDistance: 0
    }
  }

  // Verwende den Azimut der letzten Korrektur
  const lastCorrection = corrections[corrections.length - 1]

  // Summiere alle Korrekturen
  const totalLeftRight = corrections.reduce((sum, c) => sum + c.leftRight, 0)
  const totalAddDrop = corrections.reduce((sum, c) => sum + c.addDrop, 0)

  return {
    leftRight: totalLeftRight,
    addDrop: totalAddDrop,
    currentAzimuth: lastCorrection.currentAzimuth,
    currentDistance: lastCorrection.currentDistance
  }
}

/**
 * Formatiert eine Korrektur als lesbare Ansage (z.B. für Voice Comms)
 *
 * @param correction - Korrektur-Daten
 * @returns Formatierte Ansage
 *
 * @example
 * formatCorrectionCall({ leftRight: 20, addDrop: -30, ... })
 * // "Korrektur: 20 rechts, 30 Drop"
 */
export function formatCorrectionCall(correction: CorrectionInput): string {
  const parts: string[] = []

  // Seitenkorrektur
  if (correction.leftRight !== 0) {
    const absLR = Math.abs(correction.leftRight)
    const direction = correction.leftRight > 0 ? 'rechts' : 'links'
    parts.push(`${absLR.toFixed(0)} ${direction}`)
  }

  // Längskorrektur
  if (correction.addDrop !== 0) {
    const absAD = Math.abs(correction.addDrop)
    const direction = correction.addDrop > 0 ? 'Add' : 'Drop'
    parts.push(`${absAD.toFixed(0)} ${direction}`)
  }

  if (parts.length === 0) {
    return 'Korrektur: Auf Ziel'
  }

  return 'Korrektur: ' + parts.join(', ')
}
