/**
 * useKeyboardShortcuts - Global keyboard shortcuts handler
 *
 * Implements:
 * - Ctrl+S / Cmd+S: Save current mission
 * - Ctrl+N / Cmd+N: New mission (reset)
 * - Escape: Close dialogs (via callback)
 * - 1-5: Quick ring count selection
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useMissions } from './useMissions';
import type { RingCount } from '../types';

interface UseKeyboardShortcutsOptions {
  /**
   * Enable keyboard shortcuts
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when Escape is pressed
   * Use this to close dialogs/modals
   */
  onEscape?: () => void;

  /**
   * Callback when save shortcut is triggered
   * Use this to open save dialog instead of auto-saving
   */
  onSaveShortcut?: () => void;

  /**
   * Auto-save mission on Ctrl+S
   * If false, onSaveShortcut will be called instead
   * @default false
   */
  autoSave?: boolean;

  /**
   * Default mission name when auto-saving
   * @default "Quick Save"
   */
  defaultMissionName?: string;
}

/**
 * Hook for global keyboard shortcuts
 *
 * @example
 * ```tsx
 * const App = () => {
 *   const [showDialog, setShowDialog] = useState(false)
 *
 *   useKeyboardShortcuts({
 *     enabled: true,
 *     onEscape: () => setShowDialog(false),
 *     onSaveShortcut: () => setShowDialog(true)
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export const useKeyboardShortcuts = (
  options: UseKeyboardShortcutsOptions = {}
) => {
  const {
    enabled = true,
    onEscape,
    onSaveShortcut,
    autoSave = false,
    defaultMissionName = 'Quick Save',
  } = options;

  // Store Actions
  const setCharge = useAppStore((state) => state.setCharge);
  const reset = useAppStore((state) => state.reset);
  const setManualChargeOverride = useAppStore(
    (state) => state.setManualChargeOverride
  );

  // Missions
  const { saveCurrent, canSaveCurrent } = useMissions({ autoLoad: false });

  /**
   * Handle save shortcut (Ctrl+S / Cmd+S)
   */
  const handleSave = useCallback(async () => {
    if (autoSave && canSaveCurrent) {
      try {
        const timestamp = new Date().toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        await saveCurrent(`${defaultMissionName} - ${timestamp}`);
      } catch (error) {
        console.error('Failed to save mission:', error);
      }
    } else if (onSaveShortcut) {
      onSaveShortcut();
    }
  }, [autoSave, canSaveCurrent, saveCurrent, defaultMissionName, onSaveShortcut]);

  /**
   * Handle new mission shortcut (Ctrl+N / Cmd+N)
   */
  const handleNew = useCallback(() => {
    if (confirm('Neue Mission starten? Ungespeicherte Änderungen gehen verloren.')) {
      reset();
    }
  }, [reset]);

  /**
   * Handle ring count shortcuts (1-5)
   */
  const handleRingShortcut = useCallback(
    (ring: RingCount) => {
      setManualChargeOverride(ring);
      setCharge(ring);
    },
    [setCharge, setManualChargeOverride]
  );

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Escape always works, even in input fields
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }

      // Don't trigger shortcuts when typing in input fields
      if (isInputField) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl+S / Cmd+S - Save
      if (ctrlOrCmd && event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+N / Cmd+N - New mission
      if (ctrlOrCmd && event.key === 'n') {
        event.preventDefault();
        handleNew();
        return;
      }

      // 1-5 - Ring count selection
      if (event.key >= '1' && event.key <= '5') {
        event.preventDefault();
        const ring = (parseInt(event.key, 10) - 1) as RingCount;
        handleRingShortcut(ring);
        return;
      }

      // 0 - Ring count 0
      if (event.key === '0') {
        event.preventDefault();
        handleRingShortcut(0);
        return;
      }
    },
    [onEscape, handleSave, handleNew, handleRingShortcut]
  );

  // Register event listener
  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    enabled,
  };
};

/**
 * Helper to get keyboard shortcut hint text
 */
export const getShortcutHint = (action: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifier = isMac ? 'Cmd' : 'Ctrl';

  const shortcuts: Record<string, string> = {
    save: `${modifier}+S`,
    new: `${modifier}+N`,
    escape: 'Esc',
    ring0: '0',
    ring1: '1',
    ring2: '2',
    ring3: '3',
    ring4: '4',
  };

  return shortcuts[action] || '';
};
