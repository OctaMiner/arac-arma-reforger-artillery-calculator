/**
 * StationSaveButton Component - Button to open save dialog
 *
 * Features:
 * - Opens StationSaveDialog on click
 * - Disabled when no mortar position set
 * - Shows tooltip when disabled
 * - Prominent green CTA styling
 */

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { StationSaveDialog } from './StationSaveDialog';

export function StationSaveButton() {
  const [showDialog, setShowDialog] = useState(false);

  // Check if we have a valid mortar position
  const mortarPosition = useAppStore((state) => state.mortarPosition);

  const canSave = !!mortarPosition;

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={!canSave}
        className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600 border-emerald-600/30"
        title={
          canSave ? 'Stellung speichern' : 'Setze zuerst eine Mörser-Position'
        }
      >
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5" />
          <span>Stellung speichern</span>
        </div>
      </button>

      {/* Save Dialog */}
      {showDialog && <StationSaveDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}
