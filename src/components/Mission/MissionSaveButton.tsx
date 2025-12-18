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
import { Save } from 'lucide-react';
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
        className="btn-primary w-full"
        title={
          canSave ? 'Mission speichern' : 'Berechne zuerst eine Feuerlösung'
        }
      >
        <div className="flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          <span>Mission speichern</span>
        </div>
      </button>

      {/* Save Dialog */}
      {showDialog && <MissionSaveDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}
