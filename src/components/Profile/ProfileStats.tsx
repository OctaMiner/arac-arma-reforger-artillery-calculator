/**
 * ProfileStats Component - Display user statistics
 *
 * Features:
 * - Shows total missions, shots, stations
 * - Fetches counts from respective stores
 * - Clean card layout with icons
 */

import { useTranslation } from 'react-i18next';
import { Target, Crosshair, MapPin } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useMissionsStore } from '../../stores/useMissionsStore';
import { useStationsStore } from '../../stores/useStationsStore';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded ${color} flex-shrink-0`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">
            {label}
          </div>
          <div className="text-2xl font-bold text-white mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function ProfileStats() {
  const { t } = useTranslation();

  const userProfile = useUserStore((state) => state.userProfile);
  const missions = useMissionsStore((state) => state.missions);
  const stations = useStationsStore((state) => state.stations);

  // Get statistics
  const totalShots = userProfile?.statistics.totalShots || 0;
  const totalMissions = missions.length;
  const totalStations = stations.length;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {t('profile.statistics')}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          icon={<Target className="w-5 h-5 text-amber-200" />}
          label={t('profile.totalMissions')}
          value={totalMissions}
          color="bg-amber-500/20"
        />

        <StatCard
          icon={<Crosshair className="w-5 h-5 text-red-200" />}
          label={t('profile.totalShots')}
          value={totalShots}
          color="bg-red-500/20"
        />

        <StatCard
          icon={<MapPin className="w-5 h-5 text-blue-200" />}
          label={t('profile.totalStations')}
          value={totalStations}
          color="bg-blue-500/20"
        />
      </div>
    </div>
  );
}
