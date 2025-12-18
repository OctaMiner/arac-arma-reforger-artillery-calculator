import { saveToFile, loadFromFile, withErrorHandling } from '../storage';

/**
 * Task 3.1.7: Window State Persistence
 *
 * Speichert und lädt die Fensterposition und -größe
 * Speicherort: ~/Library/Application Support/ARAC/data/window-state.json (macOS)
 */

const WINDOW_STATE_FILE = 'window-state.json';

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

const DEFAULT_WINDOW_STATE: WindowState = {
  width: 1400,
  height: 900,
  isMaximized: false,
  isFullScreen: false,
};

/**
 * Speichert den Window State
 */
export async function saveWindowState(state: WindowState): Promise<void> {
  return withErrorHandling(async () => {
    await saveToFile(WINDOW_STATE_FILE, state);
  }, 'Failed to save window state');
}

/**
 * Lädt den gespeicherten Window State
 * Gibt Default-Werte zurück wenn keine gespeichert wurden oder ein Fehler auftritt
 */
export async function loadWindowState(): Promise<WindowState> {
  try {
    const state = await loadFromFile<WindowState>(WINDOW_STATE_FILE);

    if (state && typeof state === 'object') {
      // Validierung der gespeicherten Werte
      return {
        width: Math.max(state.width || DEFAULT_WINDOW_STATE.width, 1024),
        height: Math.max(state.height || DEFAULT_WINDOW_STATE.height, 768),
        x: state.x,
        y: state.y,
        isMaximized: state.isMaximized || false,
        isFullScreen: state.isFullScreen || false,
      };
    }
  } catch (error) {
    console.log('[WindowState] Could not load, using defaults:', error);
  }

  // Erste Nutzung oder Fehler - Defaults zurückgeben
  return DEFAULT_WINDOW_STATE;
}
