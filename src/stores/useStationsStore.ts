/**
 * Stations Store - Manages mortar stations
 *
 * Handles:
 * - Loading saved mortar positions/stations
 * - Creating, deleting stations
 * - Selecting stations to set mortar position
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { MortarStation, Coordinate, MortarConfig } from '../types'

interface StationsState {
  // State
  stations: MortarStation[]
  selectedStation: MortarStation | null
  isLoading: boolean
  error: string | null

  // Actions
  loadStations: () => Promise<void>
  saveStation: (
    name: string,
    mapId: string,
    position: Coordinate,
    defaultConfig?: MortarConfig
  ) => Promise<void>
  deleteStation: (id: string) => Promise<void>
  selectStation: (id: string | null) => void
  clearSelection: () => void
}

export const useStationsStore = create<StationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      stations: [],
      selectedStation: null,
      isLoading: false,
      error: null,

      // Load all stations from Electron
      loadStations: async () => {
        set({ isLoading: true, error: null }, false, 'loadStations/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          const stations = await window.api.loadStations()

          set(
            {
              stations,
              isLoading: false,
              error: null
            },
            false,
            'loadStations/success'
          )
        } catch (err) {
          set(
            {
              stations: [],
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Laden'
            },
            false,
            'loadStations/error'
          )
        }
      },

      // Save new station
      saveStation: async (name, mapId, position, defaultConfig) => {
        set({ isLoading: true, error: null }, false, 'saveStation/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          // Create station object
          const station: MortarStation = {
            id: crypto.randomUUID(),
            name,
            mapId,
            position,
            defaultConfig,
            createdAt: new Date().toISOString()
          }

          // Save via Electron API
          await window.api.saveStation(station)

          // Update local state
          set(
            (state) => ({
              stations: [...state.stations, station],
              selectedStation: station,
              isLoading: false,
              error: null
            }),
            false,
            'saveStation/success'
          )
        } catch (err) {
          set(
            {
              isLoading: false,
              error:
                err instanceof Error ? err.message : 'Fehler beim Speichern'
            },
            false,
            'saveStation/error'
          )
        }
      },

      // Delete station
      deleteStation: async (id) => {
        set({ isLoading: true, error: null }, false, 'deleteStation/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          // Delete via Electron API
          await window.api.deleteStation(id)

          // Update local state
          set(
            (state) => ({
              stations: state.stations.filter((s) => s.id !== id),
              selectedStation:
                state.selectedStation?.id === id ? null : state.selectedStation,
              isLoading: false,
              error: null
            }),
            false,
            'deleteStation/success'
          )
        } catch (err) {
          set(
            {
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Löschen'
            },
            false,
            'deleteStation/error'
          )
        }
      },

      // Select station by ID
      selectStation: (id) => {
        const state = get()
        const station = state.stations.find((s) => s.id === id)

        set(
          {
            selectedStation: station || null
          },
          false,
          'selectStation'
        )
      },

      // Clear selection
      clearSelection: () =>
        set({ selectedStation: null }, false, 'clearSelection')
    }),
    {
      name: 'stations-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Selectors
export const selectStations = (state: StationsState) => state.stations
export const selectSelectedStation = (state: StationsState) =>
  state.selectedStation
export const selectStationsLoading = (state: StationsState) => state.isLoading
export const selectStationsError = (state: StationsState) => state.error

// Helper to filter stations by map
export const selectStationsByMap = (mapId: string) => (state: StationsState) =>
  state.stations.filter((s) => s.mapId === mapId)
