/**
 * History Store - Manages calculation history
 *
 * Handles:
 * - Loading calculation history
 * - Adding new history entries
 * - Clearing history
 * - Pagination and filtering
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  HistoryEntry,
  Coordinate,
  MortarConfig,
  FireSolution,
  CorrectionData,
} from '../types';

interface HistoryState {
  // State
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Pagination
  limit: number;
  offset: number;

  // Actions
  loadHistory: (limit?: number, offset?: number) => Promise<void>;
  addToHistory: (
    mortarConfig: MortarConfig,
    mortarPos: Coordinate,
    targetPos: Coordinate,
    fireSolution: FireSolution,
    missionId?: string,
    corrections?: CorrectionData[]
  ) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      history: [],
      isLoading: false,
      error: null,
      hasMore: true,
      limit: 50,
      offset: 0,

      // Load history from Electron
      loadHistory: async (limit = 50, offset = 0) => {
        set(
          { isLoading: true, error: null, limit, offset },
          false,
          'loadHistory/start'
        );

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar');
          }

          const entries = await window.api.getHistory({ limit, offset });

          set(
            {
              history: offset === 0 ? entries : [...get().history, ...entries],
              isLoading: false,
              error: null,
              hasMore: entries.length === limit,
            },
            false,
            'loadHistory/success'
          );
        } catch (err) {
          set(
            {
              history: offset === 0 ? [] : get().history,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Laden',
            },
            false,
            'loadHistory/error'
          );
        }
      },

      // Add new entry to history
      addToHistory: async (
        mortarConfig,
        mortarPos,
        targetPos,
        fireSolution,
        missionId,
        corrections
      ) => {
        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar');
          }

          // Create history entry (without id and timestamp - added by backend)
          const entry = {
            missionId,
            mortarConfig,
            mortarPos,
            targetPos,
            fireSolution,
            corrections,
          };

          // Save via Electron API
          await window.api.addHistory(entry);

          // Reload to get complete entry with ID and timestamp
          // Only reload first page to keep performance
          const state = get();
          await state.loadHistory(state.limit, 0);
        } catch (err) {
          set(
            {
              error:
                err instanceof Error ? err.message : 'Fehler beim Hinzufügen',
            },
            false,
            'addToHistory/error'
          );
        }
      },

      // Clear all history
      clearHistory: async () => {
        set({ isLoading: true, error: null }, false, 'clearHistory/start');

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar');
          }

          await window.api.clearHistory();

          set(
            {
              history: [],
              isLoading: false,
              error: null,
              offset: 0,
              hasMore: false,
            },
            false,
            'clearHistory/success'
          );
        } catch (err) {
          set(
            {
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Löschen',
            },
            false,
            'clearHistory/error'
          );
        }
      },

      // Load next page
      loadMore: async () => {
        const state = get();
        if (!state.hasMore || state.isLoading) return;

        const newOffset = state.offset + state.limit;
        await state.loadHistory(state.limit, newOffset);
      },
    }),
    {
      name: 'history-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors
export const selectHistory = (state: HistoryState) => state.history;
export const selectHistoryLoading = (state: HistoryState) => state.isLoading;
export const selectHistoryError = (state: HistoryState) => state.error;
export const selectHasMoreHistory = (state: HistoryState) => state.hasMore;

// Filter selectors
export const selectHistoryByMission =
  (missionId: string) => (state: HistoryState) =>
    state.history.filter((entry) => entry.missionId === missionId);

export const selectRecentHistory = (count: number) => (state: HistoryState) =>
  state.history.slice(0, count);
