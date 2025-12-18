import { ipcMain, app } from 'electron';
import { getStoragePath } from './storage';
import * as storage from './storage/index';
import type { AppSettings, UserProfile, FireMission, MortarStation, HistoryEntry } from '../src/types';

/**
 * IPC Handler Setup
 * Registriert alle IPC-Handler für die Kommunikation zwischen Renderer und Main Process
 *
 * Security:
 * - Alle Inputs werden validiert
 * - contextIsolation = true (in main.ts)
 * - nodeIntegration = false (in main.ts)
 */

// ============================================
// Input Validation
// ============================================

function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateSettings(settings: unknown): settings is AppSettings {
  if (!isValidObject(settings)) return false;

  const s = settings as Record<string, unknown>;
  return (
    (s.theme === 'dark' || s.theme === 'light') &&
    (s.language === 'de' || s.language === 'en') &&
    typeof s.showGrid === 'boolean' &&
    (s.defaultMortarType === 'US' || s.defaultMortarType === 'RUS') &&
    (s.defaultAmmo === 'HE' || s.defaultAmmo === 'Smoke' || s.defaultAmmo === 'Illumination') &&
    [0, 1, 2, 3, 4].includes(s.defaultCharge as number)
  );
}

function validateUserProfile(profile: unknown): profile is UserProfile {
  if (!isValidObject(profile)) return false;

  const p = profile as Record<string, unknown>;
  return (
    isValidString(p.name) &&
    isValidString(p.createdAt) &&
    isValidObject(p.preferences) &&
    isValidObject(p.statistics)
  );
}

function validateMission(mission: unknown): mission is FireMission {
  if (!isValidObject(mission)) return false;

  const m = mission as Record<string, unknown>;
  return (
    isValidString(m.id) &&
    isValidString(m.name) &&
    isValidString(m.mapId) &&
    isValidObject(m.mortarConfig) &&
    isValidObject(m.mortarPos) &&
    isValidObject(m.targetPos) &&
    isValidObject(m.fireSolution)
  );
}

function validateStation(station: unknown): station is MortarStation {
  if (!isValidObject(station)) return false;

  const s = station as Record<string, unknown>;
  return (
    isValidString(s.id) &&
    isValidString(s.name) &&
    isValidString(s.mapId) &&
    isValidObject(s.position) &&
    isValidString(s.createdAt)
  );
}

function validateHistoryEntry(entry: unknown): entry is Omit<HistoryEntry, 'id' | 'timestamp'> {
  if (!isValidObject(entry)) return false;

  const e = entry as Record<string, unknown>;
  return (
    isValidObject(e.mortarConfig) &&
    isValidObject(e.mortarPos) &&
    isValidObject(e.targetPos) &&
    isValidObject(e.fireSolution)
  );
}

// ============================================
// IPC Handler Registration
// ============================================

export function setupIpcHandlers(): void {
  console.log('[IPC] Setting up handlers...');

  // ============================================
  // Settings
  // ============================================
  ipcMain.handle('save-settings', async (_, settings: unknown) => {
    try {
      if (!validateSettings(settings)) {
        throw new Error('Invalid settings data');
      }
      return await storage.saveSettings(settings);
    } catch (error) {
      console.error('[IPC] save-settings error:', error);
      throw error;
    }
  });

  ipcMain.handle('load-settings', async () => {
    try {
      return await storage.loadSettings();
    } catch (error) {
      console.error('[IPC] load-settings error:', error);
      throw error;
    }
  });

  // ============================================
  // User Profile
  // ============================================
  ipcMain.handle('save-user-profile', async (_, profile: unknown) => {
    try {
      if (!validateUserProfile(profile)) {
        throw new Error('Invalid user profile data');
      }
      return await storage.saveUserProfile(profile);
    } catch (error) {
      console.error('[IPC] save-user-profile error:', error);
      throw error;
    }
  });

  ipcMain.handle('load-user-profile', async () => {
    try {
      return await storage.loadUserProfile();
    } catch (error) {
      console.error('[IPC] load-user-profile error:', error);
      throw error;
    }
  });

  // ============================================
  // Missions
  // ============================================
  ipcMain.handle('save-mission', async (_, mission: unknown) => {
    try {
      if (!validateMission(mission)) {
        throw new Error('Invalid mission data');
      }
      return await storage.saveMission(mission);
    } catch (error) {
      console.error('[IPC] save-mission error:', error);
      throw error;
    }
  });

  ipcMain.handle('load-missions', async () => {
    try {
      return await storage.loadMissions();
    } catch (error) {
      console.error('[IPC] load-missions error:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-mission', async (_, id: unknown) => {
    try {
      if (!isValidString(id)) {
        throw new Error('Invalid mission ID');
      }
      return await storage.deleteMission(id);
    } catch (error) {
      console.error('[IPC] delete-mission error:', error);
      throw error;
    }
  });

  ipcMain.handle('update-mission', async (_, mission: unknown) => {
    try {
      if (!validateMission(mission)) {
        throw new Error('Invalid mission data');
      }
      return await storage.updateMission(mission);
    } catch (error) {
      console.error('[IPC] update-mission error:', error);
      throw error;
    }
  });

  // ============================================
  // Stations
  // ============================================
  ipcMain.handle('save-station', async (_, station: unknown) => {
    try {
      if (!validateStation(station)) {
        throw new Error('Invalid station data');
      }
      return await storage.saveStation(station);
    } catch (error) {
      console.error('[IPC] save-station error:', error);
      throw error;
    }
  });

  ipcMain.handle('load-stations', async () => {
    try {
      return await storage.loadStations();
    } catch (error) {
      console.error('[IPC] load-stations error:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-station', async (_, id: unknown) => {
    try {
      if (!isValidString(id)) {
        throw new Error('Invalid station ID');
      }
      return await storage.deleteStation(id);
    } catch (error) {
      console.error('[IPC] delete-station error:', error);
      throw error;
    }
  });

  // ============================================
  // History
  // ============================================
  ipcMain.handle('add-history', async (_, entry: unknown) => {
    try {
      if (!validateHistoryEntry(entry)) {
        throw new Error('Invalid history entry data');
      }
      return await storage.addToHistory(entry);
    } catch (error) {
      console.error('[IPC] add-history error:', error);
      throw error;
    }
  });

  ipcMain.handle('get-history', async (_, params: unknown) => {
    try {
      const { limit, offset } = (params || {}) as { limit?: number; offset?: number };

      // Validate pagination parameters
      const validLimit = typeof limit === 'number' && limit > 0 ? limit : undefined;
      const validOffset = typeof offset === 'number' && offset >= 0 ? offset : 0;

      return await storage.getHistory(validLimit, validOffset);
    } catch (error) {
      console.error('[IPC] get-history error:', error);
      throw error;
    }
  });

  ipcMain.handle('clear-history', async () => {
    try {
      return await storage.clearHistory();
    } catch (error) {
      console.error('[IPC] clear-history error:', error);
      throw error;
    }
  });

  // ============================================
  // App Info
  // ============================================
  ipcMain.handle('get-app-path', async () => {
    try {
      return getStoragePath();
    } catch (error) {
      console.error('[IPC] get-app-path error:', error);
      throw error;
    }
  });

  ipcMain.handle('get-app-version', async () => {
    try {
      return app.getVersion();
    } catch (error) {
      console.error('[IPC] get-app-version error:', error);
      throw error;
    }
  });

  console.log('[IPC] All handlers registered successfully');
  console.log('[IPC] Registered handlers:', [
    'save-settings',
    'load-settings',
    'save-user-profile',
    'load-user-profile',
    'save-mission',
    'load-missions',
    'delete-mission',
    'update-mission',
    'save-station',
    'load-stations',
    'delete-station',
    'add-history',
    'get-history',
    'clear-history',
    'get-app-path',
    'get-app-version'
  ]);
}
