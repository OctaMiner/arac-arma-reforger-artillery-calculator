/**
 * useInitialize Hook
 *
 * Manages app initialization by loading all persisted data
 * and applying default settings to the app store.
 *
 * Usage:
 * const { isInitialized, isLoading, error } = useInitialize();
 *
 * Features:
 * - Loads settings, user profile, missions, stations, history
 * - Applies default values from settings to app store
 * - Parallel data loading for optimal performance
 * - Single source of truth for initialization state
 */

import { useEffect, useState } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useMissionsStore } from '../stores/useMissionsStore';
import { useStationsStore } from '../stores/useStationsStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useAppStore } from '../stores/useAppStore';

interface InitializeState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initialize the application by loading all persisted data
 *
 * Initialization sequence:
 * 1. Load settings and user profile in parallel
 * 2. Load missions, stations, and history in parallel
 * 3. Apply default settings to app store
 * 4. Mark as initialized
 */
export const useInitialize = (): InitializeState => {
  const [state, setState] = useState<InitializeState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  // Store actions
  const loadSettings = useUserStore((s) => s.loadSettings);
  const loadUserProfile = useUserStore((s) => s.loadUserProfile);
  const loadMissions = useMissionsStore((s) => s.loadMissions);
  const loadStations = useStationsStore((s) => s.loadStations);
  const loadHistory = useHistoryStore((s) => s.loadHistory);

  // Settings for applying defaults
  const settings = useUserStore((s) => s.settings);

  // App store actions to apply defaults
  const setMortarType = useAppStore((s) => s.setMortarType);
  const setAmmoType = useAppStore((s) => s.setAmmoType);
  const setCharge = useAppStore((s) => s.setCharge);
  const setShowGrid = useAppStore((s) => s.setShowGrid);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setState({
          isInitialized: false,
          isLoading: true,
          error: null,
        });

        // Phase 1: Load settings and user profile first
        // These are critical for configuring the rest of the app
        await Promise.all([
          loadSettings(),
          loadUserProfile(),
        ]);

        // Phase 2: Load all other data in parallel
        // These can be loaded simultaneously for better performance
        await Promise.all([
          loadMissions(),
          loadStations(),
          loadHistory(50, 0), // Load first 50 history entries
        ]);

        // Only update state if component is still mounted
        if (!mounted) return;

        // Phase 3: Apply default settings to app store
        // This ensures the calculator starts with user's preferred settings
        setMortarType(settings.defaultMortarType);
        setAmmoType(settings.defaultAmmo);
        setCharge(settings.defaultCharge);
        setShowGrid(settings.showGrid);

        // Mark as initialized
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (!mounted) return;

        setState({
          isInitialized: false,
          isLoading: false,
          error: err instanceof Error
            ? err.message
            : 'Fehler beim Laden der Anwendungsdaten',
        });
      }
    };

    initialize();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Empty deps - only run once on mount

  return state;
};

/**
 * Selector for initialization status
 * Can be used to conditionally render loading screens
 */
export const useInitializeStatus = () => {
  const { isInitialized, isLoading } = useInitialize();
  return { isInitialized, isLoading };
};
