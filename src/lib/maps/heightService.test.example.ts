/**
 * Height Service Usage Examples
 *
 * This file demonstrates how to use the height service
 * Remove or rename this file in production
 */

import {
  hasHeightData,
  loadHeightData,
  getTerrainHeight,
  getTerrainHeightSync,
  getTerrainHeightInterpolated,
  preloadHeightData,
  clearHeightCache,
  getCacheStats,
} from './heightService';

/**
 * Example 1: Check if map has height data
 */
async function example1_checkHeightData() {
  console.log('Everon has height data:', hasHeightData('everon')); // true
  console.log('Bad Orb has height data:', hasHeightData('badorb')); // false
}

/**
 * Example 2: Load and get height at coordinate
 */
async function example2_getHeight() {
  const mapId = 'everon';
  const east = 6400; // Center of Everon
  const north = 6400;

  // Async method - loads data if not cached
  const height = await getTerrainHeight(mapId, east, north);
  console.log(`Height at (${east}, ${north}):`, height, 'm');
}

/**
 * Example 3: Use cached data only (synchronous)
 */
async function example3_syncAccess() {
  const mapId = 'everon';

  // First load the data
  await loadHeightData(mapId);

  // Now we can use sync access
  const h1 = getTerrainHeightSync(mapId, 6400, 6400);
  const h2 = getTerrainHeightSync(mapId, 7000, 5500);

  console.log('Height at center:', h1, 'm');
  console.log('Height at target:', h2, 'm');
  console.log('Height difference:', h2 && h1 ? h2 - h1 : null, 'm');
}

/**
 * Example 4: Interpolated height (more accurate)
 */
async function example4_interpolation() {
  const mapId = 'everon';

  // Load data first
  await loadHeightData(mapId);

  // Compare nearest neighbor vs interpolated
  const coord = { east: 6432.7, north: 5891.3 };

  const heightNN = getTerrainHeightSync(mapId, coord.east, coord.north);
  const heightInterp = getTerrainHeightInterpolated(
    mapId,
    coord.east,
    coord.north
  );

  console.log('Nearest neighbor:', heightNN, 'm');
  console.log('Interpolated:', heightInterp, 'm');
}

/**
 * Example 5: Preload in background
 */
async function example5_preload() {
  // Start loading in background without waiting
  preloadHeightData('everon');
  preloadHeightData('arland');

  console.log('Loading height data in background...');

  // Do other work...
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Data should be ready now
  const stats = getCacheStats();
  console.log('Cache stats:', stats);
}

/**
 * Example 6: Cache management
 */
async function example6_cacheManagement() {
  // Load some maps
  await loadHeightData('everon');
  await loadHeightData('arland');

  // Check cache stats
  let stats = getCacheStats();
  console.log('Loaded maps:', stats.loaded);
  console.log('Total memory:', stats.totalSizeMB.toFixed(2), 'MB');

  // Clear cache for one map
  clearHeightCache('everon');

  stats = getCacheStats();
  console.log('After clearing Everon:', stats.loaded, 'maps');

  // Clear all cache
  clearHeightCache();
  stats = getCacheStats();
  console.log('After clearing all:', stats.loaded, 'maps');
}

/**
 * Example 7: React Hook usage
 *
 * import { useTerrainHeight } from '@/hooks'
 *
 * function MyComponent() {
 *   const [coord, setCoord] = useState({ east: 6400, north: 6400 })
 *   const { height, loading, error, hasData } = useTerrainHeight('everon', coord)
 *
 *   if (!hasData) return <div>Map has no height data</div>
 *   if (loading) return <div>Loading height data...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return <div>Height: {height}m</div>
 * }
 */

/**
 * Example 8: Calculate elevation angle for artillery
 */
async function example8_artilleryElevation() {
  const mapId = 'everon';
  await loadHeightData(mapId);

  // Mortar position
  const mortarPos = { east: 6400, north: 6400 };
  const mortarHeight = getTerrainHeightInterpolated(
    mapId,
    mortarPos.east,
    mortarPos.north
  );

  // Target position
  const targetPos = { east: 7500, north: 5800 };
  const targetHeight = getTerrainHeightInterpolated(
    mapId,
    targetPos.east,
    targetPos.north
  );

  if (mortarHeight === null || targetHeight === null) {
    console.log('Could not get height data');
    return;
  }

  // Calculate horizontal distance
  const dx = targetPos.east - mortarPos.east;
  const dy = targetPos.north - mortarPos.north;
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy);

  // Height difference
  const heightDiff = targetHeight - mortarHeight;

  // Elevation angle in degrees
  const elevationAngle =
    Math.atan2(heightDiff, horizontalDistance) * (180 / Math.PI);

  console.log('Mortar height:', mortarHeight.toFixed(1), 'm');
  console.log('Target height:', targetHeight.toFixed(1), 'm');
  console.log('Height difference:', heightDiff.toFixed(1), 'm');
  console.log('Horizontal distance:', horizontalDistance.toFixed(1), 'm');
  console.log('Elevation angle:', elevationAngle.toFixed(2), '°');
}

// Export examples
export const examples = {
  example1_checkHeightData,
  example2_getHeight,
  example3_syncAccess,
  example4_interpolation,
  example5_preload,
  example6_cacheManagement,
  example8_artilleryElevation,
};

/**
 * Run all examples (for testing)
 */
export async function runAllExamples() {
  console.log('\n=== Example 1: Check Height Data ===');
  await example1_checkHeightData();

  console.log('\n=== Example 2: Get Height ===');
  await example2_getHeight();

  console.log('\n=== Example 3: Sync Access ===');
  await example3_syncAccess();

  console.log('\n=== Example 4: Interpolation ===');
  await example4_interpolation();

  console.log('\n=== Example 5: Preload ===');
  await example5_preload();

  console.log('\n=== Example 6: Cache Management ===');
  await example6_cacheManagement();

  console.log('\n=== Example 8: Artillery Elevation ===');
  await example8_artilleryElevation();
}
