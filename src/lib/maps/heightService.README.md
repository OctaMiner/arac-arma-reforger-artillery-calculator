# Height Service Documentation

Terrain height data service for ARAC Artillery Calculator.

## Overview

The height service provides access to terrain elevation data for Arma Reforger maps. It handles:

- Lazy loading from Gene's CDN
- In-memory caching (per map)
- Coordinate-to-height lookups
- Bilinear interpolation for smooth values

## Available Maps

10 maps have height data available:

- Everon (12.8km x 12.8km)
- Arland (4km x 4km)
- Kolguev (12.8km x 12.8km)
- Anizay (10.2km x 10.2km)
- Gogland (12.3km x 12.3km)
- Kunar (4km x 4km)
- Saigon (17.1km x 17.1km)
- Takistan (12.9km x 12.9km)
- Zarichne (4km x 4km)
- Zimnitrita (16.4km x 16.4km)

## Data Format

Height data is stored as 2D arrays on the CDN:

```json
[
  ["0", "1.5", "2.3"],
  ["1.2", "3.4", "5.6"],
  ...
]
```

- Resolution: typically 10-20 meters per data point
- Heights in meters above sea level
- Converted to numbers on load for performance

## API Reference

### Check Availability

```typescript
import { hasHeightData } from '@/lib/maps';

if (hasHeightData('everon')) {
  // Map has height data
}
```

### Load Data

```typescript
import { loadHeightData } from '@/lib/maps';

// Load data (uses cache if available)
const data = await loadHeightData('everon');

if (data) {
  console.log(`Loaded ${data.width}x${data.height} height points`);
  console.log(`Resolution: ${data.resolution}m`);
}
```

### Get Height (Async)

```typescript
import { getTerrainHeight } from '@/lib/maps';

// Automatically loads data if needed
const height = await getTerrainHeight('everon', 6400, 6400);

if (height !== null) {
  console.log(`Height: ${height}m`);
}
```

### Get Height (Sync, Cache Only)

```typescript
import { getTerrainHeightSync } from '@/lib/maps';

// Only works if data already loaded
const height = getTerrainHeightSync('everon', 6400, 6400);
```

### Get Interpolated Height

```typescript
import { getTerrainHeightInterpolated } from '@/lib/maps';

// More accurate (bilinear interpolation)
const height = getTerrainHeightInterpolated('everon', 6432.7, 5891.3);
```

### Preload in Background

```typescript
import { preloadHeightData } from '@/lib/maps';

// Start loading without waiting
preloadHeightData('everon');
preloadHeightData('arland');

// Data will be cached when ready
```

### Cache Management

```typescript
import { clearHeightCache, getCacheStats } from '@/lib/maps';

// Get cache info
const stats = getCacheStats();
console.log(`Loaded: ${stats.loaded} maps, ${stats.totalSizeMB}MB`);

// Clear specific map
clearHeightCache('everon');

// Clear all
clearHeightCache();
```

## React Hooks

### useTerrainHeight

Get height at specific coordinate:

```typescript
import { useTerrainHeight } from '@/hooks'

function MyComponent() {
  const coord = { east: 6400, north: 6400 }
  const { height, loading, error, hasData } = useTerrainHeight('everon', coord)

  if (!hasData) return <div>No height data</div>
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>Height: {height}m</div>
}
```

With interpolation:

```typescript
const { height, interpolated } = useTerrainHeight('everon', coord, {
  interpolate: true,
});

console.log('Nearest:', height);
console.log('Smooth:', interpolated);
```

### usePreloadHeightData

Preload data in background:

```typescript
import { usePreloadHeightData } from '@/hooks'

function MapSelector({ mapId }) {
  const { loading, loaded, error } = usePreloadHeightData(mapId)

  return (
    <div>
      {loading && <Spinner />}
      {loaded && <Check />}
      {error && <Error message={error.message} />}
    </div>
  )
}
```

### useHeightDifference

Calculate elevation between two points:

```typescript
import { useHeightDifference } from '@/hooks'

function ElevationDisplay({ mortar, target }) {
  const { diff, height1, height2, loading } = useHeightDifference(
    'everon',
    mortar,
    target,
    { interpolate: true }
  )

  if (loading) return <div>Calculating...</div>

  return (
    <div>
      <div>Mortar: {height1}m</div>
      <div>Target: {height2}m</div>
      <div>Elevation: {diff > 0 ? '+' : ''}{diff}m</div>
    </div>
  )
}
```

### useTerrainHeights

Batch get heights for multiple coordinates:

```typescript
import { useTerrainHeights } from '@/hooks'

function FlightPath({ waypoints }) {
  const { heights, loading } = useTerrainHeights('everon', waypoints)

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {waypoints.map((point, i) => (
        <li key={i}>
          ({point.east}, {point.north}) - {heights[i]}m
        </li>
      ))}
    </ul>
  )
}
```

## Performance Considerations

### Memory Usage

Height data files are large (8-10 MB per map):

- In-memory cache after loading
- ~40-80 MB RAM per loaded map
- Use `clearHeightCache()` to free memory

### Loading Time

First load takes 1-5 seconds depending on connection:

- Subsequent access is instant (cached)
- Preload in background for better UX
- Cache timeout: 30 minutes

### Lookup Performance

Height lookups are very fast:

- Sync lookup: < 1ms
- Interpolated lookup: < 2ms
- Suitable for real-time updates

## Artillery Calculations

### Elevation Angle

```typescript
async function calculateElevation(mapId, mortar, target) {
  await loadHeightData(mapId);

  const h1 = getTerrainHeightInterpolated(mapId, mortar.east, mortar.north);
  const h2 = getTerrainHeightInterpolated(mapId, target.east, target.north);

  if (h1 === null || h2 === null) return null;

  const dx = target.east - mortar.east;
  const dy = target.north - mortar.north;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const heightDiff = h2 - h1;

  const angleRad = Math.atan2(heightDiff, distance);
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}
```

### Line of Sight

```typescript
async function hasLineOfSight(mapId, mortar, target, samples = 20) {
  await loadHeightData(mapId);

  const h1 = getTerrainHeightSync(mapId, mortar.east, mortar.north);
  const h2 = getTerrainHeightSync(mapId, target.east, target.north);

  if (h1 === null || h2 === null) return false;

  // Sample points along line
  for (let i = 1; i < samples; i++) {
    const t = i / samples;
    const east = mortar.east + t * (target.east - mortar.east);
    const north = mortar.north + t * (target.north - mortar.north);

    const terrainHeight = getTerrainHeightSync(mapId, east, north);
    const lineHeight = h1 + t * (h2 - h1);

    if (terrainHeight && terrainHeight > lineHeight) {
      return false; // Terrain blocks line
    }
  }

  return true;
}
```

## Error Handling

The service handles errors gracefully:

```typescript
try {
  const height = await getTerrainHeight('everon', 6400, 6400);

  if (height === null) {
    // No data available or out of bounds
  }
} catch (error) {
  // Network error or invalid data
  console.error('Failed to load height data:', error);
}
```

React hooks return errors in result:

```typescript
const { height, error } = useTerrainHeight('everon', coord);

if (error) {
  // Handle error in UI
  console.error(error);
}
```

## CDN Data Source

Height data is hosted on Gene's CDN:

- Base URL: `https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev`
- Path: `/height_data/{mapId}_height.json`
- Example: `everon_height.json`, `arland_height.json`

Data is from GeNeFRAG's ArmaReforger repository.

## Future Enhancements

Potential improvements:

1. **Compression**: Use binary format or gzip
2. **Tiling**: Load height data in chunks
3. **Web Workers**: Parse data in background thread
4. **IndexedDB**: Persistent client-side cache
5. **Streaming**: Progressive loading for large maps
6. **LOD**: Multiple resolution levels

## Testing

See `heightService.test.example.ts` for usage examples.

Run examples:

```typescript
import { runAllExamples } from '@/lib/maps/heightService.test.example';

// In browser console:
runAllExamples();
```

## License

Height data from GeNeFRAG's ArmaReforger project.
