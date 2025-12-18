/**
 * ProfilePanel Component - User profile container
 *
 * Features:
 * - Panel header with User icon
 * - Username display/edit
 * - Statistics display
 * - Export/Import buttons
 * - Consistent styling with other panels (MissionPanel, StationPanel, HistoryPanel)
 */

import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { UsernameInput } from './UsernameInput'
import { ProfileStats } from './ProfileStats'
import { ProfileExport } from './ProfileExport'
import { ProfileImport } from './ProfileImport'

export function ProfilePanel() {
  const { t } = useTranslation()

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          {t('profile.title')}
        </h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Username Section */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">
            {t('profile.username')}
          </div>
          <UsernameInput />
        </div>

        {/* Statistics Section */}
        <ProfileStats />

        {/* Data Management Section */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t('profile.dataManagement')}
          </div>

          {/* Export Button */}
          <ProfileExport />

          {/* Import Button */}
          <ProfileImport />
        </div>
      </div>
    </div>
  )
}
