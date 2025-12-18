/**
 * Preload Script - Context Bridge
 *
 * Exposed die IPC Handler sicher an den Renderer Process.
 * WICHTIG: Keine direkten Node.js APIs exposen!
 *
 * Security Settings (in main.ts):
 * - contextIsolation: true
 * - nodeIntegration: false
 * - sandbox: true
 */

import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './types/ipc'
import type {
  AppSettings,
  UserProfile,
  FireMission,
  MortarStation,
  HistoryEntry
} from '../src/types'

// ============================================
// API Definition (Type-Safe)
// ============================================

const api = {
  // --- App Info ---
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  getAppPath: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_APP_PATH),

  // --- Settings ---
  loadSettings: (): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_SETTINGS),

  saveSettings: (settings: AppSettings): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),

  // --- User Profile ---
  loadUserProfile: (): Promise<UserProfile | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_USER_PROFILE),

  saveUserProfile: (profile: UserProfile): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_USER_PROFILE, profile),

  // --- Missions ---
  loadMissions: (): Promise<FireMission[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_MISSIONS),

  saveMission: (mission: FireMission): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_MISSION, mission),

  updateMission: (mission: FireMission): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_MISSION, mission),

  deleteMission: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.DELETE_MISSION, id),

  // --- Stations ---
  loadStations: (): Promise<MortarStation[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_STATIONS),

  saveStation: (station: MortarStation): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_STATION, station),

  deleteStation: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.DELETE_STATION, id),

  // --- History ---
  getHistory: (params?: { limit?: number; offset?: number }): Promise<HistoryEntry[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_HISTORY, params),

  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.ADD_HISTORY, entry),

  clearHistory: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.CLEAR_HISTORY)
} as const

// ============================================
// Expose to Renderer (Context Bridge)
// ============================================

contextBridge.exposeInMainWorld('api', api)

// ============================================
// Type Export für window.d.ts
// ============================================

export type ElectronAPI = typeof api
