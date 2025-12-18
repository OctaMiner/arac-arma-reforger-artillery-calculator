/**
 * MissionSaveButton Component - Button to open save dialog
 *
 * Features:
 * - Opens MissionSaveDialog on click
 * - Disabled when no fire solution available
 * - Shows tooltip when disabled
 * - Prominent CTA styling
 */

import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { MissionSaveDialog } from './MissionSaveDialog';

export function MissionSaveButton() {
  const [showDialog, setShowDialog] = useState(false);

  // Check if we have a valid fire solution
  const fireSolution = useAppStore((state) => state.fireSolution);
  const mortarPosition = useAppStore((state) => state.mortarPosition);
  const targetPosition = useAppStore((state) => state.targetPosition);

  const canSave = !!(fireSolution && mortarPosition && targetPosition);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={!canSave}
        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors shadow-lg disabled:shadow-none disabled:cursor-not-allowed group"
        title={
          canSave ? 'Mission speichern' : 'Berechne zuerst eine Feuerlösung'
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
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          <span>Mission speichern</span>
        </div>
      </button>

      {/* Save Dialog */}
      {showDialog && <MissionSaveDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}
