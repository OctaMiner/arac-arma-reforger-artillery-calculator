/**
 * Map configuration types for ARAC
 * Supports multiple Arma Reforger maps via GeNeFRAG's CDN
 *
 * Data source: https://github.com/GeNeFRAG/ArmaReforger/tree/main/maps_core
 * CDN: pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev
 */

/**
 * Raw map data from all_arma_maps.json (GeNeFRAG format)
 * This matches the structure in data/maps/all_arma_maps.json
 */
export interface ArmaMapRaw {
  name: string // Display name (e.g., "Everon")
  namespace: string // Unique ID (e.g., "everon")
  size: [number, number] // [width, height] in pixels (1 pixel ≈ 1 meter)
  max_zoom: number // Maximum zoom level (5-7)
  resources: {
    map_image: string // CDN URL to full satellite image
    height_data?: string // CDN URL to height data JSON (optional)
  }
}

/**
 * Processed map config for internal use
 * Extends raw data with computed bounds and display properties
 */
export interface MapConfig {
  id: string // Same as namespace
  name: string // Same as namespace (internal)
  displayName: string // User-friendly name
  bounds: [[number, number], [number, number]] // [[0, 0], [height, width]] for Leaflet Simple CRS
  center: [number, number] // [height/2, width/2] center point
  size: [number, number] // [width, height] in meters
  imageUrl: string // CDN URL to satellite image
  heightDataUrl?: string // CDN URL to height data (optional)
  hasHeightData: boolean // Quick check for height data availability
  minZoom: number // -2 for overview
  maxZoom: number // From source data (5-7)
  defaultZoom: number // Calculated default
  gridInterval: number // Grid spacing (100m default)
}

/**
 * All available map IDs (namespaces)
 * Full list in data/maps/all_arma_maps.json
 */
export type MapId =
  | 'everon'
  | 'arland'
  | 'kolguev'
  | 'anizay'
  | 'badorb'
  | 'belleau'
  | 'fallujah'
  | 'gogland'
  | 'khanh_trung'
  | 'kunar'
  | 'myccano'
  | 'nizla'
  | 'novka'
  | 'rooikat'
  | 'rostov'
  | 'ruha'
  | 'saigon'
  | 'seitenbuch'
  | 'serhiivka'
  | 'takistan'
  | 'udachne'
  | 'zarichne'
  | 'zimnitrita'

/**
 * Maps with height data available
 */
export const MAPS_WITH_HEIGHT_DATA: MapId[] = [
  'everon',
  'arland',
  'kolguev',
  'anizay',
  'gogland',
  'kunar',
  'saigon',
  'takistan',
  'zarichne',
  'zimnitrita'
]

/**
 * Convert raw map data to processed MapConfig
 */
export function convertRawToMapConfig(raw: ArmaMapRaw): MapConfig {
  const [width, height] = raw.size

  return {
    id: raw.namespace,
    name: raw.namespace,
    displayName: raw.name,
    bounds: [[0, 0], [height, width]], // Leaflet Simple CRS format
    center: [height / 2, width / 2],
    size: raw.size,
    imageUrl: raw.resources.map_image,
    heightDataUrl: raw.resources.height_data,
    hasHeightData: !!raw.resources.height_data,
    minZoom: -3, // Lower min zoom to see full map
    maxZoom: raw.max_zoom,
    defaultZoom: -2, // Start zoomed out to see full map (Gene's approach: fitBounds)
    gridInterval: 100
  }
}

export interface MapTileOptions {
  tileSize: number
  noWrap: boolean
  updateWhenIdle: boolean
  updateWhenZooming: boolean
}

/**
 * Height data structure (from CDN)
 * Format TBD - may be 2D array or sparse object
 */
export interface HeightData {
  [north: number]: {
    [east: number]: number // Height in meters
  }
}
