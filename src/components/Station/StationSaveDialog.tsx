/**
 * StationSaveDialog Component - Modal for saving new mortar station
 *
 * Features:
 * - Input field for station name
 * - Shows current mortar position preview
 * - Checkbox to save current config as default
 * - Validates input before saving
 * - Calls saveStation store action
 * - Closes on save or cancel
 */

import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { useStationsStore } from '../../stores/useStationsStore'
import { formatGridPosition } from '../../lib/coordinates/transform'

interface StationSaveDialogProps {
  onClose: () => void
}

export function StationSaveDialog({ onClose }: StationSaveDialogProps) {
  const [stationName, setStationName] = useState('')
  const [saveConfig, setSaveConfig] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // App state for current configuration
  const mortarPosition = useAppStore((state) => state.mortarPosition)
  const mortarConfig = useAppStore((state) => state.mortarConfig)
  const selectedMap = useAppStore((state) => state.selectedMap)

  // Station store
  const saveStation = useStationsStore((state) => state.saveStation)
  const isLoading = useStationsStore((state) => state.isLoading)

  // Auto-generate default name
  useEffect(() => {
    const now = new Date()
    const defaultName = `Stellung ${now.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit'
    })} ${now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
    setStationName(defaultName)
  }, [])

  // Validate and save station
  const handleSave = async () => {
    // Validation
    if (!stationName.trim()) {
      setError('Bitte einen Namen eingeben')
      return
    }

    if (!mortarPosition) {
      setError('Keine Mörser-Position gesetzt')
      return
    }

    try {
      setError(null)

      // Save station
      await saveStation(
        stationName.trim(),
        selectedMap,
        mortarPosition,
        saveConfig ? mortarConfig : undefined
      )

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
            Stellung speichern
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Station Name Input */}
          <div>
            <label
              htmlFor="station-name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Stellungsname
            </label>
            <input
              id="station-name"
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="z.B. Everon Nord Stellung"
              autoFocus
            />
          </div>

          {/* Position Preview */}
          {mortarPosition && (
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-gray-400 uppercase">
                Position
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="font-mono text-green-400 text-lg">
                  {formatGridPosition(mortarPosition)}
                </div>
                <span className="text-gray-500">|</span>
                <div>
                  <span className="text-xs text-gray-500">Höhe: </span>
                  <span className="font-mono text-green-400">
                    {mortarPosition.height.toFixed(0)}m
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save Config Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="save-config"
              type="checkbox"
              checked={saveConfig}
              onChange={(e) => setSaveConfig(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-green-600 bg-gray-900 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
            />
            <label htmlFor="save-config" className="flex-1 text-sm text-gray-300">
              Aktuelle Konfiguration als Standard speichern
              {saveConfig && mortarConfig && (
                <div className="text-xs text-gray-400 mt-1 font-mono">
                  {mortarConfig.type} • {mortarConfig.ammo} • Ladung {mortarConfig.charge}
                </div>
              )}
            </label>
          </div>

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
            disabled={isLoading || !stationName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Speichere...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
