/**
 * MissionDeleteConfirm Component - Confirmation dialog for deleting missions
 *
 * Features:
 * - Shows mission name being deleted
 * - Confirm/Cancel buttons
 * - Calls deleteMission store action
 * - ESC to cancel
 */

import { useEffect } from 'react';
import type { FireMission } from '../../types';
import { useMissionsStore } from '../../stores/useMissionsStore';

interface MissionDeleteConfirmProps {
  mission: FireMission;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MissionDeleteConfirm({
  mission,
  onConfirm,
  onCancel,
}: MissionDeleteConfirmProps) {
  const deleteMission = useMissionsStore((state) => state.deleteMission);
  const isLoading = useMissionsStore((state) => state.isLoading);

  const handleDelete = async () => {
    await deleteMission(mission.id);
    onConfirm();
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl border border-red-500/30 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
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
            Mission löschen
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-300 mb-3">
            Möchtest du diese Mission wirklich löschen?
          </p>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="font-semibold text-white">{mission.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              Erstellt am{' '}
              {new Date(mission.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Lösche...' : 'Löschen'}
          </button>
        </div>
      </div>
    </div>
  );
}
