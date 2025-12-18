/**
 * MissionSaveDialog Component - Modal for saving new missions
 *
 * Features:
 * - Input field for mission name
 * - Shows preview of current configuration
 * - Validates input before saving
 * - Calls saveMission store action
 * - Closes on save or cancel
 */

import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { useMissionsStore } from '../../stores/useMissionsStore'

interface MissionSaveDialogProps {
  onClose: () => void
}

export function MissionSaveDialog({ onClose }: MissionSaveDialogProps) {
  const [missionName, setMissionName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // App state for current configuration
  const mortarPosition = useAppStore((state) => state.mortarPosition)
  const targetPosition = useAppStore((state) => state.targetPosition)
  const mortarConfig = useAppStore((state) => state.mortarConfig)
  const fireSolution = useAppStore((state) => state.fireSolution)
  const selectedMap = useAppStore((state) => state.selectedMap)

  // Mission store
  const saveMission = useMissionsStore((state) => state.saveMission)
  const isLoading = useMissionsStore((state) => state.isLoading)

  // Auto-generate default name
  useEffect(() => {
    const now = new Date()
    const defaultName = `Mission ${now.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit'
    })} ${now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
    setMissionName(defaultName)
  }, [])

  // Validate and save mission
  const handleSave = async () => {
    // Validation
    if (!missionName.trim()) {
      setError('Bitte einen Namen eingeben')
      return
    }

    if (!mortarPosition || !targetPosition || !fireSolution) {
      setError('Keine vollständige Feuerlösung vorhanden')
      return
    }

    try {
      setError(null)

      // Save mission
      await saveMission({
        name: missionName.trim(),
        mapId: selectedMap,
        mortarConfig,
        mortarPos: mortarPosition,
        targetPos: targetPosition,
        fireSolution
      })

      // Close dialog on success
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Mission speichern
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Mission Name Input */}
          <div>
            <label
              htmlFor="mission-name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Missionsname
            </label>
            <input
              id="mission-name"
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Mission Everon Nord"
              autoFocus
            />
          </div>

          {/* Preview */}
          {fireSolution && (
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-gray-400 uppercase">
                Vorschau
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Azimut</div>
                  <div className="font-mono text-blue-400">
                    {fireSolution.azimuthMil.toFixed(0)} MIL
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Elevation</div>
                  <div className="font-mono text-green-400">
                    {fireSolution.elevationAdj.toFixed(0)} MIL
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span>Entfernung:</span>
                  <span className="font-mono text-gray-300">
                    {fireSolution.distance.toFixed(0)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Typ:</span>
                  <span className="text-gray-300">
                    {mortarConfig.type} / {mortarConfig.ammo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ladung:</span>
                  <span className="text-gray-300">
                    {mortarConfig.charge} Ringe
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !missionName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Speichere...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
