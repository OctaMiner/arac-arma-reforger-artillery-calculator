/**
 * HistoryEntry Component - Single history entry display
 *
 * Features:
 * - Shows timestamp, positions, azimuth, elevation
 * - Optional mission reference
 * - Load button to restore values
 * - Compact card layout
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { HistoryEntry } from '../../types'
import { useAppStore } from '../../stores/useAppStore'
import { useMissionsStore } from '../../stores/useMissionsStore'

interface HistoryEntryProps {
  entry: HistoryEntry
}

export function HistoryEntry({ entry }: HistoryEntryProps) {
  const { t, i18n } = useTranslation()

  // Store actions
  const setMortarPosition = useAppStore((state) => state.setMortarPosition)
  const setTargetPosition = useAppStore((state) => state.setTargetPosition)
  const setMortarConfig = useAppStore((state) => state.setMortarConfig)
  const calculateSolution = useAppStore((state) => state.calculateSolution)

  // Get mission name if referenced
  const missions = useMissionsStore((state) => state.missions)
  const missionName = useMemo(() => {
    if (!entry.missionId) return null
    const mission = missions.find((m) => m.id === entry.missionId)
    return mission?.name || null
  }, [entry.missionId, missions])

  // Format timestamp for display
  const formattedTime = useMemo(() => {
    const date = new Date(entry.timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const entryDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )

    const timeStr = date.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    if (entryDate.getTime() === today.getTime()) {
      return `${t('history.today')} ${t('history.at')} ${timeStr}`
    } else if (entryDate.getTime() === yesterday.getTime()) {
      return `${t('history.yesterday')} ${t('history.at')} ${timeStr}`
    } else {
      const dateStr = date.toLocaleDateString(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
      return `${dateStr} ${t('history.at')} ${timeStr}`
    }
  }, [entry.timestamp, i18n.language, t])

  // Format coordinates for display (like in MissionCard)
  const formatCoord = (value: number) => {
    const major = Math.floor(value / 100)
    const minor = (value % 100) / 10
    return `${major.toString().padStart(3, '0')},${minor.toFixed(1)}`
  }

  // Load history entry into current configuration
  const handleLoadEntry = () => {
    // Load positions and config into app state
    setMortarPosition(entry.mortarPos)
    setTargetPosition(entry.targetPos)
    setMortarConfig(entry.mortarConfig)

    // Recalculate solution
    setTimeout(() => {
      calculateSolution()
    }, 0)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-2 hover:bg-gray-750 transition-all">
      {/* Timestamp + Mission Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">{formattedTime}</p>
          {missionName && (
            <p className="text-xs text-blue-400 truncate">
              {t('history.missionRef')} {missionName}
            </p>
          )}
        </div>
      </div>

      {/* Fire Solution Preview */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400">{t('results.azimuth')}</div>
          <div className="font-mono font-semibold text-blue-400">
            {entry.fireSolution.azimuthMil.toFixed(0)} {t('common.mil')}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400">{t('results.elevation')}</div>
          <div className="font-mono font-semibold text-green-400">
            {entry.fireSolution.elevationAdj.toFixed(0)} {t('common.mil')}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-400 space-y-0.5">
        <div className="flex justify-between">
          <span>{t('results.distance')}:</span>
          <span className="font-mono text-gray-300">
            {entry.fireSolution.distance.toFixed(0)}{t('common.meters')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t('config.charge')}:</span>
          <span className="font-mono text-gray-300">
            {entry.mortarConfig.charge} {t('config.ring')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t('positions.mortar')}:</span>
          <span className="font-mono text-gray-300">
            {formatCoord(entry.mortarPos.east)} / {formatCoord(entry.mortarPos.north)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t('positions.target')}:</span>
          <span className="font-mono text-gray-300">
            {formatCoord(entry.targetPos.east)} / {formatCoord(entry.targetPos.north)}
          </span>
        </div>
        {entry.corrections && entry.corrections.length > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>{t('spotter.correction')}:</span>
            <span className="font-mono">
              {entry.corrections.length}x
            </span>
          </div>
        )}
      </div>

      {/* Load Button */}
      <button
        onClick={handleLoadEntry}
        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
      >
        {t('history.load')}
      </button>
    </div>
  )
}
