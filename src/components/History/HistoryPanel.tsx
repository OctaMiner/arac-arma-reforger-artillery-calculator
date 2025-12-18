/**
 * HistoryPanel Component - Container for history management
 *
 * Features:
 * - Section header "Schuss-Historie"
 * - Clear History button with confirmation dialog
 * - HistoryList below
 * - Consistent styling with MissionPanel and StationPanel
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { HistoryList } from './HistoryList'

export function HistoryPanel() {
  const { t } = useTranslation()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const history = useHistoryStore((state) => state.history)
  const clearHistory = useHistoryStore((state) => state.clearHistory)
  const isLoading = useHistoryStore((state) => state.isLoading)

  const handleClearHistory = async () => {
    await clearHistory()
    setShowClearConfirm(false)
  }

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('history.title')}
            </h2>

            {/* Clear History Button */}
            {history.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isLoading}
                className="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                title={t('history.clearAll')}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* History List */}
          <div>
            {history.length > 0 && (
              <div className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">
                {t('history.savedHistory')}
              </div>
            )}
            <HistoryList />
          </div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl w-full max-w-md mx-4">
            {/* Dialog Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {t('history.clearAll')}
              </h3>
            </div>

            {/* Dialog Content */}
            <div className="px-6 py-4">
              <p className="text-gray-300 mb-2">{t('history.confirmClear')}</p>
              <p className="text-sm text-gray-400">
                {t('history.confirmClearDesc')}
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="px-6 py-4 bg-gray-900/50 flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:text-gray-400 text-white rounded transition-colors"
              >
                {isLoading ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
