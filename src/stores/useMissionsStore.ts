/**
 * Missions Store - Manages saved fire missions
 *
 * Handles:
 * - Loading missions from Electron persistence
 * - Creating, updating, deleting missions
 * - Selecting missions
 * - Auto-save functionality
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FireMission } from '../types'

interface MissionsState {
  // State
  missions: FireMission[]
  selectedMission: FireMission | null
  isLoading: boolean
  error: string | null

  // Actions
  loadMissions: () => Promise<void>
  saveMission: (mission: Omit<FireMission, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateMission: (mission: FireMission) => Promise<void>
  deleteMission: (id: string) => Promise<void>
  selectMission: (id: string | null) => void
  clearSelection: () => void
}

export const useMissionsStore = create<MissionsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      missions: [],
      selectedMission: null,
      isLoading: false,
      error: null,

      // Load all missions from Electron
      loadMissions: async () => {
        set({ isLoading: true, error: null }, false, 'loadMissions/start')

        try {
          // Check if running in Electron
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          const missions = await window.api.loadMissions()

          set(
            {
              missions,
              isLoading: false,
              error: null
            },
            false,
            'loadMissions/success'
          )
        } catch (err) {
          set(
            {
              missions: [],
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Laden'
            },
            false,
            'loadMissions/error'
          )
        }
      },

      // Save new mission
      saveMission: async (missionData) => {
        set({ isLoading: true, error: null }, false, 'saveMission/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          // Create complete mission object
          const now = new Date().toISOString()
          const mission: FireMission = {
            ...missionData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
          }

          // Save via Electron API
          await window.api.saveMission(mission)

          // Update local state
          set(
            (state) => ({
              missions: [...state.missions, mission],
              selectedMission: mission,
              isLoading: false,
              error: null
            }),
            false,
            'saveMission/success'
          )
        } catch (err) {
          set(
            {
              isLoading: false,
              error:
                err instanceof Error ? err.message : 'Fehler beim Speichern'
            },
            false,
            'saveMission/error'
          )
        }
      },

      // Update existing mission
      updateMission: async (mission) => {
        set({ isLoading: true, error: null }, false, 'updateMission/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          // Update timestamp
          const updatedMission: FireMission = {
            ...mission,
            updatedAt: new Date().toISOString()
          }

          // Save via Electron API
          await window.api.updateMission(updatedMission)

          // Update local state
          set(
            (state) => ({
              missions: state.missions.map((m) =>
                m.id === updatedMission.id ? updatedMission : m
              ),
              selectedMission:
                state.selectedMission?.id === updatedMission.id
                  ? updatedMission
                  : state.selectedMission,
              isLoading: false,
              error: null
            }),
            false,
            'updateMission/success'
          )
        } catch (err) {
          set(
            {
              isLoading: false,
              error:
                err instanceof Error
                  ? err.message
                  : 'Fehler beim Aktualisieren'
            },
            false,
            'updateMission/error'
          )
        }
      },

      // Delete mission
      deleteMission: async (id) => {
        set({ isLoading: true, error: null }, false, 'deleteMission/start')

        try {
          if (!window.api) {
            throw new Error('Electron API nicht verfügbar')
          }

          // Delete via Electron API
          await window.api.deleteMission(id)

          // Update local state
          set(
            (state) => ({
              missions: state.missions.filter((m) => m.id !== id),
              selectedMission:
                state.selectedMission?.id === id ? null : state.selectedMission,
              isLoading: false,
              error: null
            }),
            false,
            'deleteMission/success'
          )
        } catch (err) {
          set(
            {
              isLoading: false,
              error: err instanceof Error ? err.message : 'Fehler beim Löschen'
            },
            false,
            'deleteMission/error'
          )
        }
      },

      // Select mission by ID
      selectMission: (id) => {
        const state = get()
        const mission = state.missions.find((m) => m.id === id)

        set(
          {
            selectedMission: mission || null
          },
          false,
          'selectMission'
        )
      },

      // Clear selection
      clearSelection: () => set({ selectedMission: null }, false, 'clearSelection')
    }),
    {
      name: 'missions-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// Selectors
export const selectMissions = (state: MissionsState) => state.missions
export const selectSelectedMission = (state: MissionsState) =>
  state.selectedMission
export const selectMissionsLoading = (state: MissionsState) => state.isLoading
export const selectMissionsError = (state: MissionsState) => state.error
