/**
 * MortarTypeSelector Component
 * Toggle between US and RUS mortar types
 */

import { Target } from 'lucide-react';
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
      <label className="section-header mb-2 block">Mörser-Typ</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('US')}
          disabled={disabled}
          className={`
            btn-toggle flex items-center justify-center gap-2
            ${value === 'US' ? 'active' : ''}
          `}
        >
          <Target className="w-4 h-4" />
          <span>US M252</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('RUS')}
          disabled={disabled}
          className={`
            btn-toggle flex items-center justify-center gap-2
            ${value === 'RUS' ? 'active' : ''}
          `}
        >
          <Target className="w-4 h-4" />
          <span>RUS 2B14</span>
        </button>
      </div>
    </div>
  );
}
