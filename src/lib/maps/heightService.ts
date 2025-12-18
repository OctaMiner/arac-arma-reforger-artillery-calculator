/**
 * Height Data Service for ARAC
 * Loads and caches terrain height data from Gene's CDN
 *
 * Data format: 2D array of height strings from CDN
 * Example: [["0", "1.5", "2.3"], ["1.2", "3.4", "5.6"], ...]
 *
 * =======================================================================
 * HEIGHT DATA ARRAY INDEXING (verified against arma-mortar.com):
 * =======================================================================
 *
 * The height data is stored as: data[eastIndex][northInvertedIndex]
 *
 * To look up height at game coordinates (east, north):
 *   row = round(east / resolution)
 *   col = gridHeight - 1 - round(north / resolution)
 *   height = data[row][col]
 *
 * Where:
 *   resolution = mapSize / (gridSize - 1)
 *   gridHeight = number of rows in data array
 *
 * This formula works for ALL maps with height data:
 * - Everon, Arland, Kolguev, Anizay, Gogland, Kunar, Saigon,
 *   Takistan, Zarichne, Zimnitrita
 *
 * Verified: E:8245, N:2194 on Everon → data[824][1060] = 224m ✓
 * =======================================================================
 *
 * Implementation notes:
 * - Heights stored as strings in source data (convert to numbers)
 * - Data files can be large (8-10 MB)
 * - Lazy loading: only fetch when needed
 * - In-memory caching per map
 */

import { getMapConfig } from './configs';
import type { MapId } from './types';

/**
 * Raw height data structure from CDN
 * 2D array where array[north][east] = height (as string)
 */
type RawHeightData = string[][];

/**
 * Processed height data with metadata
 */
interface HeightData {
  data: number[][]; // Converted to numbers for faster access
  width: number; // Number of columns (east dimension)
  height: number; // Number of rows (north dimension)
  resolution: number; // Meters per data point
}

/**
 * Cache state for a single map
 */
interface CacheEntry {
  data: HeightData | null;
  loading: Promise<HeightData | null> | null;
  error: Error | null;
  timestamp: number; // For future cache expiration
}

/**
 * In-memory cache: mapId -> height data
 */
const heightCache = new Map<string, CacheEntry>();

/**
 * Cache timeout (30 minutes)
 */
const CACHE_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Check if a map has height data available
 */
export function hasHeightData(mapId: string): boolean {
  const config = getMapConfig(mapId as MapId);
  return config?.hasHeightData ?? false;
}

/**
 * Load height data from CDN with caching
 * Returns null if map has no height data or loading fails
 */
export async function loadHeightData(
  mapId: string
): Promise<HeightData | null> {
  // Check if map has height data
  if (!hasHeightData(mapId)) {
    return null;
  }

  const config = getMapConfig(mapId as MapId);
  if (!config?.heightDataUrl) {
    return null;
  }

  // Check cache
  const cached = heightCache.get(mapId);

  // Return cached data if available and not expired
  if (cached?.data) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TIMEOUT_MS) {
      return cached.data;
    }
  }

  // Return existing loading promise if already loading
  if (cached?.loading) {
    return cached.loading;
  }

  // Start loading
  const loadingPromise = fetchAndProcessHeightData(mapId, config.heightDataUrl);

  // Store loading promise in cache
  heightCache.set(mapId, {
    data: null,
    loading: loadingPromise,
    error: null,
    timestamp: Date.now(),
  });

  try {
    const data = await loadingPromise;

    // Update cache with loaded data
    heightCache.set(mapId, {
      data,
      loading: null,
      error: null,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    // Store error in cache
    const err = error instanceof Error ? error : new Error(String(error));

    heightCache.set(mapId, {
      data: null,
      loading: null,
      error: err,
      timestamp: Date.now(),
    });

    console.error(`Failed to load height data for ${mapId}:`, err);
    return null;
  }
}

/**
 * Fetch and process raw height data from CDN
 */
async function fetchAndProcessHeightData(
  mapId: string,
  url: string
): Promise<HeightData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData: RawHeightData = await response.json();

    // Validate data structure
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid height data structure: not an array');
    }

    const height = rawData.length;
    const width = rawData[0]?.length ?? 0;

    if (width === 0) {
      throw new Error('Invalid height data structure: empty rows');
    }

    // Get map dimensions to calculate resolution
    const config = getMapConfig(mapId as MapId);
    const [mapWidth, mapHeight] = config?.size ?? [width, height];

    // Calculate resolution (meters per data point)
    // Gene's formula: gridSpacing = mapSize / (gridSize - 1)
    // Because N points create N-1 intervals
    const resolutionX = mapWidth / (width - 1);
    const resolutionY = mapHeight / (height - 1);
    const resolution = Math.max(resolutionX, resolutionY);

    // Convert strings to numbers for faster access
    const data = rawData.map((row) =>
      row.map((heightStr) => {
        const h = parseFloat(heightStr);
        return isNaN(h) ? 0 : h;
      })
    );

    // Height data loaded successfully
    // Debug: console.log(`[HeightService] ${mapId}: ${width}x${height} @ ${resolution.toFixed(1)}m/px`)

    return {
      data,
      width,
      height,
      resolution,
    };
  } catch (error) {
    console.error(`Error fetching height data from ${url}:`, error);
    throw error;
  }
}

/**
 * Get terrain height at specific coordinates
 * Returns null if:
 * - Map has no height data
 * - Height data not loaded yet
 * - Coordinates out of bounds
 *
 * @param mapId Map identifier
 * @param east East coordinate (meters)
 * @param north North coordinate (meters)
 */
export async function getTerrainHeight(
  mapId: string,
  east: number,
  north: number
): Promise<number | null> {
  // Load height data (uses cache if available)
  const heightData = await loadHeightData(mapId);

  if (!heightData) {
    return null;
  }

  // Convert coordinates to array indices
  // IMPORTANT: Data is stored as data[east][north_inverted]!
  // - row = east / spacing (axes swapped!)
  // - col = gridSize - 1 - north / spacing (north inverted!)
  const row = Math.round(east / heightData.resolution);
  const col = heightData.height - 1 - Math.round(north / heightData.resolution);

  // Check bounds
  if (
    row < 0 ||
    row >= heightData.width ||
    col < 0 ||
    col >= heightData.height
  ) {
    return null;
  }

  // Get height at index (data stored as data[east][north_inverted])
  const height = heightData.data[row]?.[col];

  return height ?? null;
}

/**
 * Get terrain height at coordinates (synchronous, uses cache only)
 * Returns null if data not loaded yet
 * Use this for real-time updates where you don't want to wait for loading
 */
export function getTerrainHeightSync(
  mapId: string,
  east: number,
  north: number
): number | null {
  const cached = heightCache.get(mapId);

  if (!cached?.data) {
    return null;
  }

  const heightData = cached.data;
  // Data is stored as data[east][north_inverted]
  const row = Math.round(east / heightData.resolution);
  const col = heightData.height - 1 - Math.round(north / heightData.resolution);

  if (
    row < 0 ||
    row >= heightData.width ||
    col < 0 ||
    col >= heightData.height
  ) {
    return null;
  }

  return heightData.data[row]?.[col] ?? null;
}

/**
 * Get interpolated height using bilinear interpolation
 * More accurate than nearest neighbor, but slower
 */
export function getTerrainHeightInterpolated(
  mapId: string,
  east: number,
  north: number
): number | null {
  const cached = heightCache.get(mapId);

  if (!cached?.data) {
    return null;
  }

  const heightData = cached.data;
  const res = heightData.resolution;

  // Data is stored as data[east][north_inverted]
  // row = east / res, col = gridSize - 1 - north / res
  const rowF = east / res;
  const northIdx = north / res;

  const row0 = Math.floor(rowF);
  const row1 = row0 + 1;
  const n0 = Math.floor(northIdx);
  const n1 = n0 + 1;

  // Invert north for column index
  const col0 = heightData.height - 1 - n0;
  const col1 = heightData.height - 1 - n1;

  // Check bounds
  if (
    row0 < 0 ||
    row1 >= heightData.width ||
    col1 < 0 ||
    col0 >= heightData.height
  ) {
    return null;
  }

  // Get heights at four corners
  const h00 = heightData.data[row0]?.[col0] ?? 0;
  const h10 = heightData.data[row1]?.[col0] ?? 0;
  const h01 = heightData.data[row0]?.[col1] ?? 0;
  const h11 = heightData.data[row1]?.[col1] ?? 0;

  // Bilinear interpolation
  const fx = rowF - row0;
  const fy = northIdx - n0;

  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;
  const height = h0 * (1 - fy) + h1 * fy;

  return height;
}

/**
 * Preload height data for a map
 * Use this to start loading in the background
 */
export function preloadHeightData(mapId: string): void {
  if (hasHeightData(mapId)) {
    loadHeightData(mapId).catch((err) => {
      console.warn(`Failed to preload height data for ${mapId}:`, err);
    });
  }
}

/**
 * Clear height cache for a specific map
 * Useful for memory management or forcing reload
 */
export function clearHeightCache(mapId?: string): void {
  if (mapId) {
    heightCache.delete(mapId);
  } else {
    heightCache.clear();
  }
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  const stats = {
    total: heightCache.size,
    loaded: 0,
    loading: 0,
    errors: 0,
    totalSizeMB: 0,
  };

  for (const entry of heightCache.values()) {
    if (entry.data) {
      stats.loaded++;
      // Rough size estimate: width * height * 8 bytes per number
      const sizeMB = (entry.data.width * entry.data.height * 8) / (1024 * 1024);
      stats.totalSizeMB += sizeMB;
    }
    if (entry.loading) stats.loading++;
    if (entry.error) stats.errors++;
  }

  return stats;
}

/**
 * Terrain profile point
 */
export interface TerrainProfilePoint {
  distance: number; // Distance from start (meters)
  height: number; // Terrain height (meters)
  east: number; // East coordinate
  north: number; // North coordinate
}

/**
 * Get terrain profile between two points
 * Samples terrain height at regular intervals along the line
 *
 * @param mapId Map identifier
 * @param startEast Start point east coordinate
 * @param startNorth Start point north coordinate
 * @param endEast End point east coordinate
 * @param endNorth End point north coordinate
 * @param numSamples Number of sample points (default: 50)
 * @returns Array of terrain profile points, or null if no height data
 */
export function getTerrainProfile(
  mapId: string,
  startEast: number,
  startNorth: number,
  endEast: number,
  endNorth: number,
  numSamples: number = 50
): TerrainProfilePoint[] | null {
  const cached = heightCache.get(mapId);

  if (!cached?.data) {
    return null;
  }

  const heightData = cached.data;

  // Calculate total distance
  const deltaEast = endEast - startEast;
  const deltaNorth = endNorth - startNorth;
  const totalDistance = Math.sqrt(
    deltaEast * deltaEast + deltaNorth * deltaNorth
  );

  // Generate sample points
  const profile: TerrainProfilePoint[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;

    // Interpolate position
    const east = startEast + deltaEast * t;
    const north = startNorth + deltaNorth * t;
    const distance = totalDistance * t;

    // Get height at this position using interpolation for smoother results
    const height = getTerrainHeightInterpolated(mapId, east, north);

    if (height !== null) {
      profile.push({
        distance,
        height,
        east,
        north,
      });
    } else {
      // Fallback to nearest neighbor
      const row = Math.round(east / heightData.resolution);
      const col =
        heightData.height - 1 - Math.round(north / heightData.resolution);

      if (
        row >= 0 &&
        row < heightData.width &&
        col >= 0 &&
        col < heightData.height
      ) {
        const h = heightData.data[row]?.[col] ?? 0;
        profile.push({
          distance,
          height: h,
          east,
          north,
        });
      }
    }
  }

  return profile.length > 0 ? profile : null;
}

/**
 * Check if height data is loaded and ready (synchronous check)
 */
export function isHeightDataLoaded(mapId: string): boolean {
  const cached = heightCache.get(mapId);
  return cached?.data !== null && cached?.data !== undefined;
}
