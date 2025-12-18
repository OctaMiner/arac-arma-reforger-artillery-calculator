/**
 * SettingsModal Component - Main Settings Dialog
 *
 * Features:
 * - Theme toggle (Dark/Light)
 * - Language selector (DE/EN)
 * - Default mortar type
 * - Default ammo type
 * - Grid toggle
 * - Reset to defaults
 * - Dark themed design
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../stores/useUserStore';
import {
  X,
  Globe,
  Moon,
  Sun,
  Target,
  Crosshair,
  Grid3X3,
  RotateCcw,
  Settings,
} from 'lucide-react';
import type { MortarType, AmmoType } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation();

  // User store
  const settings = useUserStore((state) => state.settings);
  const setTheme = useUserStore((state) => state.setTheme);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const toggleGrid = useUserStore((state) => state.toggleGrid);
  const setDefaultMortarType = useUserStore(
    (state) => state.setDefaultMortarType
  );
  const setDefaultAmmo = useUserStore((state) => state.setDefaultAmmo);

  // Local state for form
  const [theme, setThemeLocal] = useState(settings.theme);
  const [language, setLanguageLocal] = useState(settings.language);
  const [showGrid, setShowGridLocal] = useState(settings.showGrid);
  const [defaultMortarType, setDefaultMortarTypeLocal] = useState(
    settings.defaultMortarType
  );
  const [defaultAmmo, setDefaultAmmoLocal] = useState(settings.defaultAmmo);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle theme change
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setThemeLocal(newTheme);
    setTheme(newTheme);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: 'de' | 'en') => {
    setLanguageLocal(newLanguage);
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  // Handle grid toggle
  const handleGridToggle = () => {
    setShowGridLocal(!showGrid);
    toggleGrid();
  };

  // Handle mortar type change
  const handleMortarTypeChange = (type: MortarType) => {
    setDefaultMortarTypeLocal(type);
    setDefaultMortarType(type);
  };

  // Handle ammo type change
  const handleAmmoChange = (ammo: AmmoType) => {
    setDefaultAmmoLocal(ammo);
    setDefaultAmmo(ammo);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    setThemeLocal('dark');
    setLanguageLocal('de');
    setShowGridLocal(true);
    setDefaultMortarTypeLocal('US');
    setDefaultAmmoLocal('HE');

    setTheme('dark');
    setLanguage('de');
    if (!showGrid) toggleGrid();
    setDefaultMortarType('US');
    setDefaultAmmo('HE');

    i18n.changeLanguage('de');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded border border-blue-500/40 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {t('settings.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4" />
              {t('settings.appearance')}
            </h3>

            {/* Theme Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-200">
                    {t('settings.theme')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.themeDesc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  {t('settings.dark')}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-gray-800 border-gray-600 text-gray-600 cursor-not-allowed opacity-50"
                  title={t('settings.lightComingSoon')}
                >
                  <Sun className="w-4 h-4" />
                  {t('settings.light')}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-200">
                    {t('settings.language')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.languageDesc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleLanguageChange('de')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    language === 'de'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">🇩🇪 Deutsch</span>
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    language === 'en'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">🇬🇧 English</span>
                </button>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              {t('settings.map')}
            </h3>

            {/* Grid Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-200">
                  {t('settings.showGrid')}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {t('settings.showGridDesc')}
                </p>
              </div>
              <button
                onClick={handleGridToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showGrid ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showGrid ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Defaults Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('settings.defaults')}
            </h3>

            {/* Default Mortar Type */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-200">
                    {t('settings.defaultMortarType')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.defaultMortarTypeDesc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleMortarTypeChange('US')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all font-mono ${
                    defaultMortarType === 'US'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  M252 (USA)
                </button>
                <button
                  onClick={() => handleMortarTypeChange('RUS')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all font-mono ${
                    defaultMortarType === 'RUS'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  M82 (RUS)
                </button>
              </div>
            </div>

            {/* Default Ammo Type */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-200">
                    {t('settings.defaultAmmo')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.defaultAmmoDesc')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  onClick={() => handleAmmoChange('HE')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    defaultAmmo === 'HE'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Crosshair className="w-4 h-4" />
                  <span className="text-sm font-medium">HE</span>
                </button>
                <button
                  onClick={() => handleAmmoChange('Smoke')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    defaultAmmo === 'Smoke'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {t('config.smoke')}
                  </span>
                </button>
                <button
                  onClick={() => handleAmmoChange('Illumination')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    defaultAmmo === 'Illumination'
                      ? 'bg-yellow-600 border-yellow-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {t('config.illumination')}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3 justify-between">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('settings.resetToDefaults')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
