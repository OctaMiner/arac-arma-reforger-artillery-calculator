/**
 * User Store - Manages user profile and app settings
 *
 * Handles:
 * - User profile data and statistics
 * - App settings (theme, language, defaults)
 * - Persistence via Electron API
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  UserProfile,
  AppSettings,
  MortarType,
  AmmoType,
  RingCount,
} from '../types';

interface UserState {
  // State
  userProfile: UserProfile | null;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;

  // Actions - Profile
  loadUserProfile: () => Promise<void>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  updateStatistics: (update: Partial<UserProfile['statistics']>) => void;
  incrementShots: () => void;
  incrementMissions: () => void;
  incrementStations: () => void;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: 'de' | 'en') => void;
  toggleGrid: () => void;
  setDefaultMortarType: (type: MortarType) => void;
  setDefaultAmmo: (ammo: AmmoType) => void;
  setDefaultCharge: (charge: RingCount) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 4,
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userProfile: null,
        settings: DEFAULT_SETTINGS,
        isLoading: false,
        error: null,

        // --- Profile Actions ---

        // Load user profile from Electron
        loadUserProfile: async () => {
          set({ isLoading: true, error: null }, false, 'loadUserProfile/start');

          try {
            if (!window.api) {
              throw new Error('Electron API nicht verfügbar');
            }

            const profile = await window.api.loadUserProfile();

            set(
              {
                userProfile: profile,
                isLoading: false,
                error: null,
              },
              false,
              'loadUserProfile/success'
            );
          } catch (err) {
            set(
              {
                isLoading: false,
                error: err instanceof Error ? err.message : 'Fehler beim Laden',
              },
              false,
              'loadUserProfile/error'
            );
          }
        },

        // Save user profile
        saveUserProfile: async (profile) => {
          set({ isLoading: true, error: null }, false, 'saveUserProfile/start');

          try {
            if (!window.api) {
              throw new Error('Electron API nicht verfügbar');
            }

            await window.api.saveUserProfile(profile);

            set(
              {
                userProfile: profile,
                isLoading: false,
                error: null,
              },
              false,
              'saveUserProfile/success'
            );
          } catch (err) {
            set(
              {
                isLoading: false,
                error:
                  err instanceof Error ? err.message : 'Fehler beim Speichern',
              },
              false,
              'saveUserProfile/error'
            );
          }
        },

        // Update statistics
        updateStatistics: (update) => {
          const state = get();
          if (!state.userProfile) return;

          const updatedProfile: UserProfile = {
            ...state.userProfile,
            statistics: {
              ...state.userProfile.statistics,
              ...update,
            },
          };

          set({ userProfile: updatedProfile }, false, 'updateStatistics');

          // Save to Electron asynchronously (fire and forget)
          if (window.api) {
            window.api.saveUserProfile(updatedProfile).catch(console.error);
          }
        },

        // Increment shot counter
        incrementShots: () => {
          const state = get();
          if (!state.userProfile) return;

          state.updateStatistics({
            totalShots: state.userProfile.statistics.totalShots + 1,
          });
        },

        // Increment missions created counter
        incrementMissions: () => {
          const state = get();
          if (!state.userProfile) return;

          state.updateStatistics({
            missionsCreated: state.userProfile.statistics.missionsCreated + 1,
          });
        },

        // Increment stations created counter
        incrementStations: () => {
          const state = get();
          if (!state.userProfile) return;

          state.updateStatistics({
            stationsCreated: state.userProfile.statistics.stationsCreated + 1,
          });
        },

        // --- Settings Actions ---

        // Load settings from Electron
        loadSettings: async () => {
          set({ isLoading: true, error: null }, false, 'loadSettings/start');

          try {
            if (!window.api) {
              // Fallback to default settings if no Electron API
              set(
                {
                  settings: DEFAULT_SETTINGS,
                  isLoading: false,
                  error: null,
                },
                false,
                'loadSettings/fallback'
              );
              return;
            }

            const settings = await window.api.loadSettings();

            set(
              {
                settings,
                isLoading: false,
                error: null,
              },
              false,
              'loadSettings/success'
            );
          } catch (err) {
            set(
              {
                settings: DEFAULT_SETTINGS,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Fehler beim Laden',
              },
              false,
              'loadSettings/error'
            );
          }
        },

        // Save settings
        saveSettings: async (partialSettings) => {
          const state = get();
          const newSettings = { ...state.settings, ...partialSettings };

          // Update state immediately
          set({ settings: newSettings }, false, 'saveSettings');

          // Save to Electron asynchronously
          try {
            if (window.api) {
              await window.api.saveSettings(newSettings);
            }
          } catch (err) {
            set(
              {
                error:
                  err instanceof Error ? err.message : 'Fehler beim Speichern',
              },
              false,
              'saveSettings/error'
            );
          }
        },

        // Set theme
        setTheme: (theme) => {
          const state = get();
          state.saveSettings({ theme });
        },

        // Set language
        setLanguage: (language) => {
          const state = get();
          state.saveSettings({ language });
        },

        // Toggle grid
        toggleGrid: () => {
          const state = get();
          state.saveSettings({ showGrid: !state.settings.showGrid });
        },

        // Set default mortar type
        setDefaultMortarType: (type) => {
          const state = get();
          state.saveSettings({ defaultMortarType: type });
        },

        // Set default ammo type
        setDefaultAmmo: (ammo) => {
          const state = get();
          state.saveSettings({ defaultAmmo: ammo });
        },

        // Set default charge
        setDefaultCharge: (charge) => {
          const state = get();
          state.saveSettings({ defaultCharge: charge });
        },
      }),
      {
        name: 'user-storage',
        // Only persist settings, not profile (profile is in Electron DB)
        partialize: (state) => ({ settings: state.settings }),
      }
    ),
    {
      name: 'user-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors - Profile
export const selectUserProfile = (state: UserState) => state.userProfile;
export const selectStatistics = (state: UserState) =>
  state.userProfile?.statistics;

// Selectors - Settings
export const selectSettings = (state: UserState) => state.settings;
export const selectTheme = (state: UserState) => state.settings.theme;
export const selectLanguage = (state: UserState) => state.settings.language;
export const selectShowGrid = (state: UserState) => state.settings.showGrid;
export const selectDefaultMortarType = (state: UserState) =>
  state.settings.defaultMortarType;
export const selectDefaultAmmo = (state: UserState) =>
  state.settings.defaultAmmo;
export const selectDefaultCharge = (state: UserState) =>
  state.settings.defaultCharge;

// Selectors - Loading state
export const selectUserLoading = (state: UserState) => state.isLoading;
export const selectUserError = (state: UserState) => state.error;
