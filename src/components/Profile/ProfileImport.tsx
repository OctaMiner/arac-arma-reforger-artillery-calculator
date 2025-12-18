/**
 * ProfileImport Component - Import profile data from JSON
 *
 * Features:
 * - File input for JSON upload
 * - Validates JSON structure
 * - Confirmation dialog before import
 * - Imports data to all stores
 * - Shows success/error messages
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { useStationsStore } from '../../stores/useStationsStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import type {
  UserProfile,
  AppSettings,
  FireMission,
  MortarStation,
  HistoryEntry,
} from '../../types';

interface ImportData {
  version?: string;
  exportDate?: string;
  profile?: UserProfile;
  settings?: AppSettings;
  missions?: FireMission[];
  stations?: MortarStation[];
  history?: HistoryEntry[];
}

export function ProfileImport() {
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveUserProfile = useUserStore((state) => state.saveUserProfile);
  const saveSettings = useUserStore((state) => state.saveSettings);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data: ImportData = JSON.parse(json);

        // Basic validation
        if (
          !data.profile &&
          !data.settings &&
          !data.missions &&
          !data.stations
        ) {
          throw new Error(t('profile.invalidFile'));
        }

        setImportData(data);
        setShowConfirm(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.importError'));
      }
    };

    reader.onerror = () => {
      setError(t('profile.importError'));
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    setError(null);

    try {
      // Import user profile
      if (importData.profile) {
        await saveUserProfile(importData.profile);
      }

      // Import settings
      if (importData.settings) {
        await saveSettings(importData.settings);
      }

      // Import missions
      if (importData.missions && window.api) {
        for (const mission of importData.missions) {
          await window.api.saveMission(mission);
        }
        // Reload missions store
        const missionsStore = useMissionsStore.getState();
        await missionsStore.loadMissions();
      }

      // Import stations
      if (importData.stations && window.api) {
        for (const station of importData.stations) {
          await window.api.saveStation(station);
        }
        // Reload stations store
        const stationsStore = useStationsStore.getState();
        await stationsStore.loadStations();
      }

      // Import history
      if (importData.history && window.api) {
        for (const entry of importData.history) {
          const { id, timestamp, ...entryData } = entry;
          await window.api.addHistory(entryData);
        }
        // Reload history store
        const historyStore = useHistoryStore.getState();
        await historyStore.loadHistory();
      }

      // Success
      setShowConfirm(false);
      setImportData(null);

      // Show success message (you could use a toast here)
      alert(t('profile.importSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.importError'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setImportData(null);
    setError(null);
  };

  return (
    <>
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
          id="profile-import"
        />
        <label
          htmlFor="profile-import"
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
        >
          <Upload className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="font-medium">{t('profile.import')}</div>
            <div className="text-xs text-gray-300">
              {t('profile.importDesc')}
            </div>
          </div>
        </label>

        {error && (
          <div className="px-3 py-2 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl w-full max-w-md mx-4">
            {/* Dialog Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                {t('profile.import')}
              </h3>
            </div>

            {/* Dialog Content */}
            <div className="px-6 py-4">
              <p className="text-gray-300 mb-3 font-medium">
                {t('profile.importWarning')}
              </p>

              {/* Show what will be imported */}
              <div className="space-y-1.5 text-sm text-gray-400">
                {importData?.profile && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Profil: {importData.profile.name}</span>
                  </div>
                )}
                {importData?.missions && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span>
                      {importData.missions.length} {t('profile.missions')}
                    </span>
                  </div>
                )}
                {importData?.stations && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>
                      {importData.stations.length} {t('profile.stations')}
                    </span>
                  </div>
                )}
                {importData?.history && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <span>
                      {importData.history.length} {t('profile.shots')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="px-6 py-4 bg-gray-900/50 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isImporting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:text-gray-400 text-white rounded transition-colors"
              >
                {isImporting ? t('common.loading') : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
