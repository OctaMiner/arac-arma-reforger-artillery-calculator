/**
 * useThrottledCallback Hook
 *
 * Throttles a callback to execute at most once per specified interval.
 * Perfect for drag events to limit calculations to 60fps (16ms).
 *
 * Features:
 * - Guarantees callback won't execute more than once per interval
 * - Executes immediately on first call (no delay)
 * - Executes final call after interval ends (trailing call)
 * - Cleans up on unmount
 * - TypeScript generic for type safety
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Creates a throttled version of the callback function
 *
 * @param callback - Function to throttle
 * @param delay - Minimum time between executions in ms (default: 16ms = 60fps)
 * @returns Throttled callback
 *
 * @example
 * ```tsx
 * const handleDrag = useThrottledCallback((position) => {
 *   updatePosition(position);
 *   calculateSolution();
 * }, 16); // 60fps
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 16 // 60fps default
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);
  const pendingArgsRef = useRef<any[] | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If enough time has passed, execute immediately
      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
        pendingArgsRef.current = null;
      } else {
        // Otherwise, schedule for later (trailing call)
        pendingArgsRef.current = args;
        const remainingTime = delay - timeSinceLastCall;

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          if (pendingArgsRef.current) {
            callback(...pendingArgsRef.current);
            pendingArgsRef.current = null;
          }
        }, remainingTime);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Creates a debounced version of the callback function
 * Waits for activity to stop before executing
 *
 * @param callback - Function to debounce
 * @param delay - Time to wait after last call in ms
 * @returns Debounced callback
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query) => {
 *   performSearch(query);
 * }, 300);
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}
