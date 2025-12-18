/**
 * ProfileExport Component - Export profile data as JSON
 *
 * Features:
 * - Button to export entire profile
 * - Collects data from all stores
 * - Downloads as JSON file
 * - Includes: profile, missions, stations, settings, history
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { useStationsStore } from '../../stores/useStationsStore';
import { useHistoryStore } from '../../stores/useHistoryStore';

interface ExportData {
  version: string;
  exportDate: string;
  profile: ReturnType<typeof useUserStore.getState>['userProfile'];
  settings: ReturnType<typeof useUserStore.getState>['settings'];
  missions: ReturnType<typeof useMissionsStore.getState>['missions'];
  stations: ReturnType<typeof useStationsStore.getState>['stations'];
  history: ReturnType<typeof useHistoryStore.getState>['history'];
}

export function ProfileExport() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const userProfile = useUserStore((state) => state.userProfile);
  const settings = useUserStore((state) => state.settings);
  const missions = useMissionsStore((state) => state.missions);
  const stations = useStationsStore((state) => state.stations);
  const history = useHistoryStore((state) => state.history);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Collect all data
      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        profile: userProfile,
        settings,
        missions,
        stations,
        history,
      };

      // Convert to JSON
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      const username = userProfile?.name || 'profile';
      a.download = `arac-${username}-${timestamp}.json`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white rounded transition-colors"
    >
      <Download className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{t('profile.export')}</div>
        <div className="text-xs text-blue-100/80">
          {t('profile.exportDesc')}
        </div>
      </div>
      {isExporting && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
    </button>
  );
}
