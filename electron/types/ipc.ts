/**
 * IPC Type Definitions
 *
 * Diese Typen definieren die IPC-Kommunikation zwischen:
 * - Main Process (electron/main.ts)
 * - Preload Script (electron/preload.ts)
 * - Renderer Process (React App)
 */

import type {
  AppSettings,
  UserProfile,
  FireMission,
  MortarStation,
  HistoryEntry,
} from '../../src/types';

// ============================================
// IPC Channel Names
// ============================================

/**
 * Alle verfügbaren IPC-Channel
 * Wird vom Preload Script und den Handlern verwendet
 */
export const IPC_CHANNELS = {
  // Settings
  SAVE_SETTINGS: 'save-settings',
  LOAD_SETTINGS: 'load-settings',

  // User Profile
  SAVE_USER_PROFILE: 'save-user-profile',
  LOAD_USER_PROFILE: 'load-user-profile',

  // Missions
  SAVE_MISSION: 'save-mission',
  LOAD_MISSIONS: 'load-missions',
  DELETE_MISSION: 'delete-mission',
  UPDATE_MISSION: 'update-mission',

  // Stations
  SAVE_STATION: 'save-station',
  LOAD_STATIONS: 'load-stations',
  DELETE_STATION: 'delete-station',

  // History
  ADD_HISTORY: 'add-history',
  GET_HISTORY: 'get-history',
  CLEAR_HISTORY: 'clear-history',

  // App Info
  GET_APP_VERSION: 'get-app-version',
  GET_APP_PATH: 'get-app-path',
} as const;

// Type für IPC Channel Namen
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// ============================================
// Request/Response Types
// ============================================

/**
 * Settings Handler
 */
export interface SaveSettingsRequest {
  settings: AppSettings;
}

export interface LoadSettingsResponse {
  settings: AppSettings;
}

/**
 * User Profile Handler
 */
export interface SaveUserProfileRequest {
  profile: UserProfile;
}

export interface LoadUserProfileResponse {
  profile: UserProfile | null;
}

/**
 * Mission Handler
 */
export interface SaveMissionRequest {
  mission: FireMission;
}

export interface LoadMissionsResponse {
  missions: FireMission[];
}

export interface DeleteMissionRequest {
  id: string;
}

export interface UpdateMissionRequest {
  mission: FireMission;
}

/**
 * Station Handler
 */
export interface SaveStationRequest {
  station: MortarStation;
}

export interface LoadStationsResponse {
  stations: MortarStation[];
}

export interface DeleteStationRequest {
  id: string;
}

/**
 * History Handler
 */
export interface AddHistoryRequest {
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>;
}

export interface GetHistoryRequest {
  limit?: number;
  offset?: number;
}

export interface GetHistoryResponse {
  entries: HistoryEntry[];
}

/**
 * App Info Handler
 */
export interface GetAppVersionResponse {
  version: string;
}

export interface GetAppPathResponse {
  path: string;
}

// ============================================
// IPC Handler Type Map
// ============================================

/**
 * Mapping von Channel-Namen zu ihren Request/Response Types
 * Wird für Type-Safe IPC verwendet
 */
export interface IpcHandlerMap {
  // Settings
  [IPC_CHANNELS.SAVE_SETTINGS]: {
    request: AppSettings;
    response: void;
  };
  [IPC_CHANNELS.LOAD_SETTINGS]: {
    request: void;
    response: AppSettings;
  };

  // User Profile
  [IPC_CHANNELS.SAVE_USER_PROFILE]: {
    request: UserProfile;
    response: void;
  };
  [IPC_CHANNELS.LOAD_USER_PROFILE]: {
    request: void;
    response: UserProfile | null;
  };

  // Missions
  [IPC_CHANNELS.SAVE_MISSION]: {
    request: FireMission;
    response: void;
  };
  [IPC_CHANNELS.LOAD_MISSIONS]: {
    request: void;
    response: FireMission[];
  };
  [IPC_CHANNELS.DELETE_MISSION]: {
    request: string;
    response: void;
  };
  [IPC_CHANNELS.UPDATE_MISSION]: {
    request: FireMission;
    response: void;
  };

  // Stations
  [IPC_CHANNELS.SAVE_STATION]: {
    request: MortarStation;
    response: void;
  };
  [IPC_CHANNELS.LOAD_STATIONS]: {
    request: void;
    response: MortarStation[];
  };
  [IPC_CHANNELS.DELETE_STATION]: {
    request: string;
    response: void;
  };

  // History
  [IPC_CHANNELS.ADD_HISTORY]: {
    request: Omit<HistoryEntry, 'id' | 'timestamp'>;
    response: void;
  };
  [IPC_CHANNELS.GET_HISTORY]: {
    request: { limit?: number; offset?: number };
    response: HistoryEntry[];
  };
  [IPC_CHANNELS.CLEAR_HISTORY]: {
    request: void;
    response: void;
  };

  // App Info
  [IPC_CHANNELS.GET_APP_VERSION]: {
    request: void;
    response: string;
  };
  [IPC_CHANNELS.GET_APP_PATH]: {
    request: void;
    response: string;
  };
}

// ============================================
// Helper Types
// ============================================

/**
 * Extrahiert Request-Type für einen Channel
 */
export type IpcRequest<T extends IpcChannel> = T extends keyof IpcHandlerMap
  ? IpcHandlerMap[T]['request']
  : never;

/**
 * Extrahiert Response-Type für einen Channel
 */
export type IpcResponse<T extends IpcChannel> = T extends keyof IpcHandlerMap
  ? IpcHandlerMap[T]['response']
  : never;

/**
 * Generic IPC Handler Function Type
 */
export type IpcHandler<T extends IpcChannel> = (
  request: IpcRequest<T>
) => Promise<IpcResponse<T>>;
