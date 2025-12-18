/**
 * StationSaveButton Component - Button to open save dialog
 *
 * Features:
 * - Opens StationSaveDialog on click
 * - Disabled when no mortar position set
 * - Shows tooltip when disabled
 * - Prominent green CTA styling
 */

import { useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { StationSaveDialog } from './StationSaveDialog'

export function StationSaveButton() {
  const [showDialog, setShowDialog] = useState(false)

  // Check if we have a valid mortar position
  const mortarPosition = useAppStore((state) => state.mortarPosition)

  const canSave = !!mortarPosition

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={!canSave}
        className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors shadow-lg disabled:shadow-none disabled:cursor-not-allowed group"
        title={
          canSave
            ? 'Stellung speichern'
            : 'Setze zuerst eine Mörser-Position'
        }
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Stellung speichern</span>
        </div>
      </button>

      {/* Save Dialog */}
      {showDialog && <StationSaveDialog onClose={() => setShowDialog(false)} />}
    </>
  )
}
