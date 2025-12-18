/**
 * MortarTypeSelector Component
 * Toggle between US and RUS mortar types
 */

import type { MortarType } from '../../types';

interface MortarTypeSelectorProps {
  value: MortarType;
  onChange: (type: MortarType) => void;
  disabled?: boolean;
}

export function MortarTypeSelector({
  value,
  onChange,
  disabled = false,
}: MortarTypeSelectorProps) {
  return (
    <div>
      <label className="block text-gray-400 text-xs uppercase mb-2 font-medium">
        Mörser-Typ
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('US')}
          disabled={disabled}
          className={`
            px-4 py-3 rounded font-semibold text-sm uppercase tracking-wide
            transition-all duration-150 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'US'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          US M252
        </button>
        <button
          type="button"
          onClick={() => onChange('RUS')}
          disabled={disabled}
          className={`
            px-4 py-3 rounded font-semibold text-sm uppercase tracking-wide
            transition-all duration-150 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              value === 'RUS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          RUS 2B14
        </button>
      </div>
    </div>
  );
}
