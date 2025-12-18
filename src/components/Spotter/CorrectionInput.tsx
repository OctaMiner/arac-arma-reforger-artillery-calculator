/**
 * CorrectionInput Component
 * Input for fire correction (Left/Right, Add/Drop)
 */

import { type ChangeEvent, useState } from 'react'
import type { CorrectionData } from '../../types'

interface CorrectionInputProps {
  onApply: (correction: CorrectionData) => void
  disabled?: boolean
}

export function CorrectionInput({
  onApply,
  disabled = false
}: CorrectionInputProps) {
  const [leftRight, setLeftRight] = useState<string>('0')
  const [addDrop, setAddDrop] = useState<string>('0')

  const handleLeftRightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setLeftRight(value)
    }
  }

  const handleAddDropChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
      setAddDrop(value)
    }
  }

  const handlePresetLeftRight = (value: number) => {
    setLeftRight(value.toString())
  }

  const handlePresetAddDrop = (value: number) => {
    setAddDrop(value.toString())
  }

  const handleApply = () => {
    const lr = parseInt(leftRight) || 0
    const ad = parseInt(addDrop) || 0

    onApply({
      leftRight: lr,
      addDrop: ad
    })

    // Reset to 0 after applying
    setLeftRight('0')
    setAddDrop('0')
  }

  const isValid = leftRight !== '' && addDrop !== ''

  return (
    <div className="space-y-3">
      {/* Left/Right Correction */}
      <div>
        <label className="block text-gray-400 text-xs mb-2 flex items-center justify-between">
          <span>Seitenabweichung</span>
          <span className="text-[10px] text-gray-500">L (negativ) / R (positiv)</span>
        </label>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <button
            onClick={() => handlePresetLeftRight(-50)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            L50
          </button>
          <button
            onClick={() => handlePresetLeftRight(-25)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            L25
          </button>
          <button
            onClick={() => handlePresetLeftRight(25)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            R25
          </button>
          <button
            onClick={() => handlePresetLeftRight(50)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            R50
          </button>
        </div>

        {/* Manual Input */}
        <input
          type="text"
          inputMode="numeric"
          value={leftRight}
          onChange={handleLeftRightChange}
          disabled={disabled}
          placeholder="0"
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Negativ = Links, Positiv = Rechts (Meter)
        </p>
      </div>

      {/* Add/Drop Correction */}
      <div>
        <label className="block text-gray-400 text-xs mb-2 flex items-center justify-between">
          <span>Längenabweichung</span>
          <span className="text-[10px] text-gray-500">D (negativ) / A (positiv)</span>
        </label>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <button
            onClick={() => handlePresetAddDrop(-50)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            D50
          </button>
          <button
            onClick={() => handlePresetAddDrop(-25)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            D25
          </button>
          <button
            onClick={() => handlePresetAddDrop(25)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            A25
          </button>
          <button
            onClick={() => handlePresetAddDrop(50)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-mono bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            A50
          </button>
        </div>

        {/* Manual Input */}
        <input
          type="text"
          inputMode="numeric"
          value={addDrop}
          onChange={handleAddDropChange}
          disabled={disabled}
          placeholder="0"
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-600/30 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Negativ = Kürzer (Drop), Positiv = Weiter (Add) (Meter)
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={disabled || !isValid}
        className={`
          w-full px-4 py-2.5 rounded font-semibold text-sm transition-colors
          flex items-center justify-center gap-2
          ${
            disabled || !isValid
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Korrektur anwenden
      </button>
    </div>
  )
}
