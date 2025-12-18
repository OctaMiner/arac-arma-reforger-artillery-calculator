/**
 * Coordinate Transformation Utilities
 *
 * Converts between Arma Reforger game coordinates and Leaflet map coordinates.
 *
 * Arma Reforger coordinate system:
 * - Origin at BOTTOM-LEFT (South-West corner)
 * - East increases to the right (X-axis)
 * - North increases upward (Y-axis)
 * - 1 unit = 1 meter
 *
 * Leaflet L.CRS.Simple coordinate system (with bounds [[0,0], [h,w]]):
 * - Origin at BOTTOM-LEFT (same as Arma!)
 * - lng (X) increases to the right
 * - lat (Y) increases upward
 *
 * Conversion formulas:
 * - Game to Leaflet: lat = north, lng = east (direct mapping!)
 * - Leaflet to Game: north = lat, east = lng (direct mapping!)
 */

/**
 * Convert Arma game coordinates to Leaflet lat/lng
 *
 * In Leaflet CRS.Simple with bounds [[0,0], [height, width]]:
 * - Origin (0,0) is at BOTTOM-LEFT (same as Arma!)
 * - lat increases going UP (same as Arma's north!)
 * - lng increases going RIGHT (same as Arma's east!)
 *
 * NO inversion needed - coordinate systems are aligned!
 *
 * @param east - East coordinate in meters (X)
 * @param north - North coordinate in meters (Y)
 * @param mapHeight - Total map height in meters (unused, kept for API compatibility)
 * @returns Leaflet [lat, lng] tuple
 */
export function gameToLeaflet(
  east: number,
  north: number,
  _mapHeight: number
): [number, number] {
  // Direct mapping - no inversion needed!
  // Leaflet CRS.Simple origin is bottom-left, same as Arma
  const lat = north;
  const lng = east;
  return [lat, lng];
}

/**
 * Convert Leaflet lat/lng to Arma game coordinates
 *
 * @param lat - Leaflet latitude (Y coordinate, 0 at bottom in CRS.Simple)
 * @param lng - Leaflet longitude (X coordinate)
 * @param mapHeight - Total map height in meters (unused, kept for API compatibility)
 * @returns Object with east, north coordinates
 */
export function leafletToGame(
  lat: number,
  lng: number,
  _mapHeight: number
): { east: number; north: number } {
  // Direct mapping - no inversion needed!
  const north = lat;
  const east = lng;
  return { east: Math.round(east), north: Math.round(north) };
}

/**
 * Get Leaflet LatLng for a game position
 * Convenience function for marker positioning
 */
export function getLeafletLatLng(
  position: { east: number; north: number },
  mapHeight: number
): [number, number] {
  return gameToLeaflet(position.east, position.north, mapHeight);
}

/**
 * Format coordinate as 3-digit grid reference (Arma Reforger style)
 *
 * Arma Reforger Grid System:
 * - Map is divided into 10m x 10m fields
 * - 3-digit coordinate: ABC where
 *   - A = 1000m position (0-9)
 *   - B = 100m position within that (0-9)
 *   - C = 10m position within that (0-9)
 * - Example: Position 1234m → grid "123" (represents 1230-1240m)
 *
 * Formula: grid = floor(meters / 10)
 * - 10m → 001
 * - 100m → 010
 * - 1000m → 100
 *
 * @param meters - Coordinate value in meters
 * @returns 3-digit grid string (000-999, rolls over at 10000m)
 */
export function formatGrid3(meters: number): string {
  // Standard 3-digit military grid reference with 10m precision
  // floor(meters / 10) gives which 10m field we're in
  // % 1000 handles rollover for maps > 10km
  const gridValue = Math.floor(Math.abs(meters) / 10) % 1000;
  return gridValue.toString().padStart(3, '0');
}

/**
 * Format position as Arma Reforger grid string
 * Example: { east: 8113, north: 2700 } → "811 270"
 */
export function formatGridPosition(position: {
  east: number;
  north: number;
}): string {
  return `${formatGrid3(position.east)} ${formatGrid3(position.north)}`;
}

/**
 * Format coordinate as Ingame-style grid with decimal precision
 *
 * Ingame shows 3-digit grid (100m precision), we add decimal for 10m precision
 * Example: 4980m → "049,8" (49.8 × 100m = 4980m)
 * Example: 3850m → "038,5" (38.5 × 100m = 3850m)
 * Example: 12345m → "123,4"
 *
 * @param meters - Coordinate value in meters
 * @returns Grid string in format "XXX,X" (German decimal notation)
 */
export function formatGridIngame(meters: number): string {
  // Convert to 100m units with 1 decimal (10m precision)
  const gridValue = Math.abs(meters) / 100;
  // Handle rollover at 10000m (100 × 100m units)
  const wrapped = gridValue % 1000;
  // Format: 3 digits, comma, 1 decimal
  const intPart = Math.floor(wrapped);
  const decPart = Math.floor((wrapped - intPart) * 10);
  return `${intPart.toString().padStart(3, '0')},${decPart}`;
}
