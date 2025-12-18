/**
 * React Hook for terrain height data
 * Handles loading, caching, and accessing height data
 */

import { useState, useEffect } from 'react';
import {
  loadHeightData,
  getTerrainHeightSync,
  getTerrainHeightInterpolated,
  hasHeightData,
} from '@/lib/maps/heightService';

/**
 * Coordinate interface
 */
export interface Coordinate {
  east: number;
  north: number;
}

/**
 * Hook result interface
 */
export interface TerrainHeightResult {
  height: number | null;
  loading: boolean;
  error: Error | null;
  hasData: boolean;
  interpolated: number | null;
}

/**
 * Hook to get terrain height at specific coordinates
 * Automatically loads height data when coordinates change
 *
 * @param mapId Map identifier
 * @param coord Coordinate to get height for (null = no coordinate)
 * @param options Hook options
 */
export function useTerrainHeight(
  mapId: string | null,
  coord: Coordinate | null,
  options: {
    /**
     * Enable interpolation for smoother height values
     * Default: false (uses nearest neighbor)
     */
    interpolate?: boolean;
    /**
     * Disable automatic loading (only use cached data)
     * Default: false
     */
    cacheOnly?: boolean;
  } = {}
): TerrainHeightResult {
  const [height, setHeight] = useState<number | null>(null);
  const [interpolated, setInterpolated] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasData = mapId ? hasHeightData(mapId) : false;

  // Load height data and update height when coordinates change
  useEffect(() => {
    // Reset state if no map or coordinate
    if (!mapId || !coord) {
      setHeight(null);
      setInterpolated(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Skip if map has no height data
    if (!hasData) {
      setHeight(null);
      setInterpolated(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Try to get cached data synchronously first
    const cachedHeight = getTerrainHeightSync(mapId, coord.east, coord.north);

    if (cachedHeight !== null) {
      setHeight(cachedHeight);
      setLoading(false);
      setError(null);

      // Get interpolated if requested
      if (options.interpolate) {
        const interpHeight = getTerrainHeightInterpolated(
          mapId,
          coord.east,
          coord.north
        );
        setInterpolated(interpHeight);
      }

      return;
    }

    // If cache only mode, don't load
    if (options.cacheOnly) {
      setHeight(null);
      setInterpolated(null);
      setLoading(false);
      return;
    }

    // Load height data asynchronously
    let cancelled = false;

    setLoading(true);
    setError(null);

    loadHeightData(mapId)
      .then((heightData) => {
        if (cancelled) return;

        if (!heightData) {
          setHeight(null);
          setInterpolated(null);
          setLoading(false);
          return;
        }

        // Get height at coordinate
        const h = getTerrainHeightSync(mapId, coord.east, coord.north);
        setHeight(h);

        // Get interpolated if requested
        if (options.interpolate) {
          const interpHeight = getTerrainHeightInterpolated(
            mapId,
            coord.east,
            coord.north
          );
          setInterpolated(interpHeight);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(err instanceof Error ? err : new Error(String(err)));
        setHeight(null);
        setInterpolated(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    mapId,
    coord?.east,
    coord?.north,
    hasData,
    options.interpolate,
    options.cacheOnly,
  ]);

  return {
    height,
    loading,
    error,
    hasData,
    interpolated,
  };
}

/**
 * Hook to preload height data for a map
 * Useful for loading data in the background
 *
 * @param mapId Map identifier
 */
export function usePreloadHeightData(mapId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);

  const hasData = mapId ? hasHeightData(mapId) : false;

  useEffect(() => {
    if (!mapId || !hasData) {
      setLoading(false);
      setError(null);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    loadHeightData(mapId)
      .then(() => {
        if (cancelled) return;
        setLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mapId, hasData]);

  return { loading, error, loaded, hasData };
}

/**
 * Hook to get height difference between two coordinates
 * Useful for calculating elevation changes
 */
export function useHeightDifference(
  mapId: string | null,
  coord1: Coordinate | null,
  coord2: Coordinate | null,
  options: { interpolate?: boolean } = {}
) {
  const height1Result = useTerrainHeight(mapId, coord1, options);
  const height2Result = useTerrainHeight(mapId, coord2, options);

  const heightDiff =
    height1Result.height !== null && height2Result.height !== null
      ? height2Result.height - height1Result.height
      : null;

  const interpolatedDiff =
    height1Result.interpolated !== null && height2Result.interpolated !== null
      ? height2Result.interpolated - height1Result.interpolated
      : null;

  return {
    diff: heightDiff,
    interpolatedDiff,
    height1: height1Result.height,
    height2: height2Result.height,
    loading: height1Result.loading || height2Result.loading,
    error: height1Result.error || height2Result.error,
    hasData: height1Result.hasData,
  };
}

/**
 * Hook to batch get heights for multiple coordinates
 * More efficient than multiple useTerrainHeight calls
 */
export function useTerrainHeights(
  mapId: string | null,
  coords: Coordinate[],
  options: { interpolate?: boolean } = {}
) {
  const [heights, setHeights] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasData = mapId ? hasHeightData(mapId) : false;

  useEffect(() => {
    if (!mapId || coords.length === 0 || !hasData) {
      setHeights([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    loadHeightData(mapId)
      .then(() => {
        if (cancelled) return;

        const newHeights = coords.map((coord) => {
          if (options.interpolate) {
            return getTerrainHeightInterpolated(mapId, coord.east, coord.north);
          }
          return getTerrainHeightSync(mapId, coord.east, coord.north);
        });

        setHeights(newHeights);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mapId, JSON.stringify(coords), hasData, options.interpolate]);

  return { heights, loading, error, hasData };
}
