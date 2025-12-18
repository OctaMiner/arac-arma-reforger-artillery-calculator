// ============================================
// ARAC Spotter Target Calculator
// ============================================
// Berechnet die Ziel-Koordinaten aus Vector 21 Fernglas-Daten

import type { Coordinate } from '../../types'

/**
 * Input-Daten vom Spotter/Vector 21 Fernglas
 */
export interface SpotterInput {
  spotterPosition: Coordinate  // GPS-Position des Spotters
  distance: number             // Laser-Entfernung zum Ziel in Metern
  azimuth: number              // Kompass-Azimut zum Ziel in Grad (0-360)
  heightAngle?: number         // Optional: Höhenwinkel in Grad (-90 bis +90)
}

/**
 * Berechnet die Zielposition aus Spotter-Daten
 *
 * @param input - Spotter-Eingabedaten (Position, Entfernung, Azimut, Höhenwinkel)
 * @returns Die berechnete Zielposition als Coordinate
 *
 * @example
 * const target = calculateTargetFromSpotter({
 *   spotterPosition: { east: 500, north: 300, height: 50 },
 *   distance: 1000,
 *   azimuth: 45,
 *   heightAngle: 5
 * })
 */
export function calculateTargetFromSpotter(input: SpotterInput): Coordinate {
  const { spotterPosition, distance, azimuth, heightAngle } = input

  // Azimut von Grad in Radianten konvertieren
  const azimuthRad = (azimuth * Math.PI) / 180

  // Horizontale Distanz bei Höhenwinkel berechnen
  let horizontalDistance = distance
  if (heightAngle !== undefined) {
    const heightAngleRad = (heightAngle * Math.PI) / 180
    horizontalDistance = distance * Math.cos(heightAngleRad)
  }

  // Ost- und Nord-Verschiebung berechnen (in Metern)
  const deltaEastMeters = horizontalDistance * Math.sin(azimuthRad)
  const deltaNorthMeters = horizontalDistance * Math.cos(azimuthRad)

  // In Arma-Koordinaten konvertieren (10m Einheiten)
  const deltaEast = deltaEastMeters / 10
  const deltaNorth = deltaNorthMeters / 10

  // Höhenänderung berechnen
  let deltaHeight = 0
  if (heightAngle !== undefined) {
    const heightAngleRad = (heightAngle * Math.PI) / 180
    deltaHeight = distance * Math.sin(heightAngleRad)
  }

  // Zielposition berechnen
  return {
    east: spotterPosition.east + deltaEast,
    north: spotterPosition.north + deltaNorth,
    height: spotterPosition.height + deltaHeight
  }
}

/**
 * Berechnet den Azimut von einem Punkt zum anderen
 *
 * @param from - Ausgangspunkt
 * @param to - Zielpunkt
 * @returns Azimut in Grad (0-360)
 */
export function calculateAzimuth(from: Coordinate, to: Coordinate): number {
  // Differenzen in Metern berechnen
  const deltaEastMeters = (to.east - from.east) * 10
  const deltaNorthMeters = (to.north - from.north) * 10

  // Azimut in Radianten berechnen
  let azimuthRad = Math.atan2(deltaEastMeters, deltaNorthMeters)

  // In Grad konvertieren und normalisieren (0-360)
  let azimuthDeg = (azimuthRad * 180) / Math.PI
  if (azimuthDeg < 0) {
    azimuthDeg += 360
  }

  return azimuthDeg
}

/**
 * Berechnet die horizontale Entfernung zwischen zwei Koordinaten
 *
 * @param from - Ausgangspunkt
 * @param to - Zielpunkt
 * @returns Entfernung in Metern (horizontal)
 */
export function calculateDistance(from: Coordinate, to: Coordinate): number {
  // Differenzen in Metern berechnen
  const deltaEastMeters = (to.east - from.east) * 10
  const deltaNorthMeters = (to.north - from.north) * 10

  // Pythagoras für horizontale Entfernung
  return Math.sqrt(deltaEastMeters * deltaEastMeters + deltaNorthMeters * deltaNorthMeters)
}

/**
 * Berechnet den Höhenwinkel von einem Punkt zum anderen
 *
 * @param from - Ausgangspunkt
 * @param to - Zielpunkt
 * @returns Höhenwinkel in Grad (-90 bis +90)
 */
export function calculateHeightAngle(from: Coordinate, to: Coordinate): number {
  const horizontalDistance = calculateDistance(from, to)
  const heightDiff = to.height - from.height

  if (horizontalDistance === 0) {
    return heightDiff > 0 ? 90 : heightDiff < 0 ? -90 : 0
  }

  const angleRad = Math.atan(heightDiff / horizontalDistance)
  return (angleRad * 180) / Math.PI
}

/**
 * Rekonstruiert SpotterInput aus bekannten Koordinaten (für Tests/Simulation)
 *
 * @param spotterPosition - Position des Spotters
 * @param targetPosition - Position des Ziels
 * @returns SpotterInput-Objekt
 */
export function createSpotterInputFromCoordinates(
  spotterPosition: Coordinate,
  targetPosition: Coordinate
): SpotterInput {
  const horizontalDistance = calculateDistance(spotterPosition, targetPosition)
  const azimuth = calculateAzimuth(spotterPosition, targetPosition)
  const heightAngle = calculateHeightAngle(spotterPosition, targetPosition)

  // Schrägdistanz berechnen
  const heightDiff = targetPosition.height - spotterPosition.height
  const distance = Math.sqrt(
    horizontalDistance * horizontalDistance + heightDiff * heightDiff
  )

  return {
    spotterPosition,
    distance,
    azimuth,
    heightAngle
  }
}
