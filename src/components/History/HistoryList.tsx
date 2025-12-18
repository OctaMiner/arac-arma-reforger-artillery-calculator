/**
 * HistoryList Component - Displays all history entries
 *
 * Features:
 * - Loads history from store on mount
 * - Shows empty state when no history exists
 * - Scrollable list of HistoryEntry components
 * - Load more button for pagination
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { HistoryEntry } from './HistoryEntry'

export function HistoryList() {
  const { t } = useTranslation()

  // Store state
  const history = useHistoryStore((state) => state.history)
  const isLoading = useHistoryStore((state) => state.isLoading)
  const error = useHistoryStore((state) => state.error)
  const hasMore = useHistoryStore((state) => state.hasMore)
  const loadHistory = useHistoryStore((state) => state.loadHistory)
  const loadMore = useHistoryStore((state) => state.loadMore)

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Loading state (initial load)
  if (isLoading && history.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">{t('common.loading')}</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-red-400 text-sm">
          {t('common.error')}: {error}
        </p>
      </div>
    )
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium">{t('history.empty')}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('history.emptyDesc')}
          </p>
        </div>
      </div>
    )
  }

  // History list
  return (
    <div className="space-y-3">
      {/* Entries List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {history.map((entry) => (
          <HistoryEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-medium rounded transition-colors"
        >
          {isLoading ? t('common.loading') : t('history.loadMore')}
        </button>
      )}
    </div>
  )
}
