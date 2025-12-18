/**
 * TypeScript Declaration für Electron API
 *
 * Diese Datei stellt Type-Safety für window.api sicher
 * und wird automatisch von TypeScript erkannt.
 */

import type { ElectronAPI } from './types';

declare global {
  interface Window {
    /**
     * Electron API exposed via contextBridge in preload.ts
     *
     * Security:
     * - contextIsolation: true
     * - nodeIntegration: false
     * - sandbox: true
     *
     * Alle Methoden sind async und nutzen IPC kommunikation.
     */
    api: ElectronAPI;
  }
}

export {};
