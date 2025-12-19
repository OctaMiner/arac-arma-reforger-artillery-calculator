// ============================================
// ARAC Type Definitions
// ============================================

// --- Koordinaten ---
export interface Coordinate {
  east: number; // Ost-Wert in Metern
  north: number; // Nord-Wert in Metern
  height: number; // Höhe in Metern
  heightDiff?: number; // Optional: Höhendifferenz für Spotter-Berechnungen
}

// --- Mörser-Konfiguration ---
export type MortarType = 'US' | 'RUS';
export type AmmoType = 'HE' | 'Smoke' | 'Illumination';
export type RingCount = 0 | 1 | 2 | 3 | 4;

export interface MortarConfig {
  type: MortarType;
  ammo: AmmoType;
  charge: RingCount;
}

// --- Ballistische Daten ---
export interface BallisticEntry {
  range: number; // Entfernung in Metern
  elevation: number; // Elevation in MIL
  timeOfFlight: number; // Flugzeit in Sekunden
  dElevPer100m: number; // Delta ELEV pro 100m Höhendifferenz
  tofPer100m: number | null; // ToF Änderung pro 100m (optional)
}

export interface BallisticTable {
  weapon: string;
  shell: string;
  ringCount: RingCount;
  data: BallisticEntry[];
}

// --- Fire Solution (Berechnungsergebnis) ---
export interface FireSolution {
  // Richtung
  azimuthDeg: number; // 0-360°
  azimuthMil: number; // 0-6400 MIL

  // Höhenwinkel
  elevationBase: number; // MIL (ohne Höhenkorrektur)
  elevationAdj: number; // MIL (mit Höhenkorrektur)
  deltaElev: number; // Korrekturwert für Höhe

  // Meta
  distance: number; // Entfernung in Metern
  flightTime: number; // Flugzeit in Sekunden
  ringCount: RingCount; // Verwendete Ladung
  inRange: boolean; // Ziel erreichbar?

  // Wind-Korrektur (optional)
  windCorrection?: WindCorrection;
  azimuthWithWind?: number; // Azimut mit Wind-Korrektur in MIL
  elevationWithWind?: number; // Elevation mit Wind-Korrektur in MIL

  // Optional
  recommendedCharge?: RingCount;
}

// --- Fire Solution with Terrain Analysis (erweitert) ---
export interface FireSolutionWithTerrain extends FireSolution {
  /** Indicates if trajectory is blocked by terrain */
  trajectoryBlocked: boolean;

  /** Original ring was blocked (auto-corrected to different ring) */
  originalRingBlocked?: boolean;

  /** Suggested alternative if terrain collision detected */
  suggestedAlternative?: {
    /** Recommended ring count to clear obstacle */
    ring: RingCount;
    /** Optional azimuth correction in MIL (positive = right) */
    azimuthCorrection?: number;
    /** Reason for suggestion */
    reason: string;
  };

  /** Details about terrain blockage */
  blockageInfo?: {
    /** Distance from mortar where blockage occurs (meters) */
    distance: number;
    /** Terrain height at blockage point (meters) */
    terrainHeight: number;
    /** Trajectory height at blockage point (meters) */
    trajectoryHeight: number;
    /** Minimum apex height needed to clear (meters) */
    minApexNeeded: number;
    /** East coordinate of collision point */
    east?: number;
    /** North coordinate of collision point */
    north?: number;
  };

  /** Error message if no solution possible */
  errorMessage?: string;
}

// --- Fire Mission (Gespeicherte Mission) ---
export interface FireMission {
  id: string;
  name: string;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  mapId: string; // z.B. "everon"

  mortarConfig: MortarConfig;
  mortarPos: Coordinate;
  targetPos: Coordinate;

  fireSolution: FireSolution;
}

// --- Mortar Station (Vordefinierte Stellung) ---
export interface MortarStation {
  id: string;
  name: string;
  mapId: string;
  position: Coordinate;
  defaultConfig?: MortarConfig;
  createdAt: string;
}

// --- Wind Daten ---
export interface WindData {
  speed: number; // Windgeschwindigkeit in m/s
  direction: number; // Windrichtung in Grad (0-360, woher der Wind kommt)
}

export interface WindCorrection {
  azimuthCorrection: number; // Azimut-Korrektur in MIL (positiv = rechts zielen)
  rangeCorrection: number; // Reichweiten-Korrektur in Metern
  crosswind: number; // Seitenwind-Komponente in m/s
  headwind: number; // Gegenwind-Komponente in m/s
}

// --- Spotter Daten ---
export interface SpotterData {
  spotterPos: Coordinate;
  distanceToTarget: number; // Meter (R-Taste Vector 21)
  azimuthToTarget: number; // Grad (V-Taste Vector 21)
  heightDiff?: number; // Optional: Höhendifferenz
}

export interface CorrectionData {
  leftRight: number; // Meter (positiv = rechts, negativ = links)
  addDrop: number; // Meter (positiv = weiter, negativ = kürzer)
}

// --- History Entry ---
export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO Date
  missionId?: string; // Referenz zur Mission
  mortarConfig: MortarConfig;
  mortarPos: Coordinate;
  targetPos: Coordinate;
  fireSolution: FireSolution;
  corrections?: CorrectionData[];
}

// --- User Profile ---
export interface UserProfile {
  name: string;
  createdAt: string;
  preferences: {
    defaultMortarType: MortarType;
    defaultAmmo: AmmoType;
  };
  statistics: {
    totalShots: number;
    missionsCreated: number;
    stationsCreated: number;
  };
}

// --- App Settings ---
export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'de' | 'en';
  showGrid: boolean;
  defaultMortarType: MortarType;
  defaultAmmo: AmmoType;
  defaultCharge: RingCount;
}

// --- Map Configuration ---
export interface MapConfig {
  id: string;
  name: string;
  bounds: {
    southWest: [number, number];
    northEast: [number, number];
  };
  tileUrl: string;
  maxZoom: number;
  minZoom: number;
}

// --- Window API (Electron Preload) ---
/**
 * API exposed durch electron/preload.ts via contextBridge
 * Alle Methoden sind async und nutzen IPC
 */
export interface ElectronAPI {
  // App Info
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;

  // Settings
  loadSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;

  // User Profile
  loadUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;

  // Missions
  loadMissions: () => Promise<FireMission[]>;
  saveMission: (mission: FireMission) => Promise<void>;
  updateMission: (mission: FireMission) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;

  // Stations
  loadStations: () => Promise<MortarStation[]>;
  saveStation: (station: MortarStation) => Promise<void>;
  deleteStation: (id: string) => Promise<void>;

  // History
  getHistory: (params?: {
    limit?: number;
    offset?: number;
  }) => Promise<HistoryEntry[]>;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

// Extend Window interface
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
