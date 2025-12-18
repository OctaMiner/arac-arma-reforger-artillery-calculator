/**
 * AmmoTypeSelector Component
 * Select ammunition type (HE, Smoke, Illumination)
 */

import type { AmmoType } from '../../types'

interface AmmoTypeSelectorProps {
  value: AmmoType
  onChange: (ammo: AmmoType) => void
  disabled?: boolean
}

export function AmmoTypeSelector({
  value,
  onChange,
  disabled = false
}: AmmoTypeSelectorProps) {
  const ammoOptions: Array<{
    type: AmmoType
    label: string
    color: string
    activeColor: string
  }> = [
    {
      type: 'HE',
      label: 'HE',
      color: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
      activeColor: 'bg-red-600 text-white shadow-lg shadow-red-900/50'
    },
    {
      type: 'Smoke',
      label: 'Smoke',
      color: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
      activeColor: 'bg-gray-500 text-white shadow-lg shadow-gray-800/50'
    },
    {
      type: 'Illumination',
      label: 'Illum',
      color: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
      activeColor: 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/50'
    }
  ]

  return (
    <div>
      <label className="block text-gray-400 text-xs uppercase mb-2 font-medium">
        Munitionstyp
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ammoOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            disabled={disabled}
            className={`
              px-3 py-3 rounded font-semibold text-xs uppercase tracking-wide
              transition-all duration-150 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              ${value === option.type ? option.activeColor : option.color}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
