/**
 * Header Component - MilSim Style (Inside Sidebar)
 *
 * Features:
 * - Military stencil-style ARAC logo
 * - Mortar type badge
 * - Version info
 * - Settings button
 * - Compact design
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { Target, Settings } from 'lucide-react';
import { SettingsModal } from '../Settings/SettingsModal';

export function Header() {
  const { t } = useTranslation();
  const mortarType = useAppStore((state) => state.mortarConfig.type);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="border-b border-sidebar-border px-4 py-4 mb-4">
        {/* Logo & Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded border border-primary/40 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1
                className="text-2xl font-black text-primary tracking-[0.2em] uppercase"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {t('header.title')}
              </h1>
              <p className="section-header text-[10px] tracking-[0.25em]">
                {t('header.subtitle')} v0.1
              </p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-primary"
            aria-label={t('settings.title')}
            title={t('settings.title')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Mortar Type Badge */}
        <div className="flex items-center gap-2">
          <span className="section-header text-[10px]">
            {t('config.mortarType')}
          </span>
          <span
            className={`badge ${mortarType === 'US' ? 'badge-primary' : 'bg-destructive/20 text-destructive border-destructive/40'}`}
          >
            {mortarType === 'US' ? 'M252 (USA)' : 'M82 (RUS)'}
          </span>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
}
