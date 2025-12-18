/**
 * AmmoTypeSelector Component
 * Select ammunition type (HE, Smoke, Illumination)
 */

import { Flame, Cloud, Lightbulb } from 'lucide-react';
import type { AmmoType } from '../../types';

interface AmmoTypeSelectorProps {
  value: AmmoType;
  onChange: (ammo: AmmoType) => void;
  disabled?: boolean;
}

export function AmmoTypeSelector({
  value,
  onChange,
  disabled = false,
}: AmmoTypeSelectorProps) {
  const ammoOptions: Array<{
    type: AmmoType;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
  }> = [
    {
      type: 'HE',
      label: 'HE',
      icon: <Flame className="w-4 h-4" />,
      colorClass: 'bg-destructive hover:bg-destructive/90 border-destructive/30',
    },
    {
      type: 'Smoke',
      label: 'Smoke',
      icon: <Cloud className="w-4 h-4" />,
      colorClass: 'bg-gray-400 hover:bg-gray-300 border-gray-500/30 text-black',
    },
    {
      type: 'Illumination',
      label: 'Illum',
      icon: <Lightbulb className="w-4 h-4" />,
      colorClass: 'bg-amber-600 hover:bg-amber-700 border-amber-600/30',
    },
  ];

  return (
    <div>
      <label className="section-header mb-2 block">Munitionstyp</label>
      <div className="grid grid-cols-3 gap-2">
        {ammoOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            disabled={disabled}
            className={`
              btn-toggle flex flex-col items-center justify-center gap-1 py-3
              ${value === option.type ? `active ${option.colorClass}` : ''}
            `}
          >
            {option.icon}
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
