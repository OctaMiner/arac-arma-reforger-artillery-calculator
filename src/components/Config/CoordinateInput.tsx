/**
 * CoordinateInput Component
 * Reusable component for East/North coordinate input
 * Uses Arma Reforger 3-digit grid format (10m precision)
 *
 * Supports two input modes:
 * 1. Grid format (3 digits): "824" = 8240m
 * 2. Meter format (with 'm'): "8245m" = 8245m
 */

import { useState, useEffect, type ChangeEvent, type KeyboardEvent, type FocusEvent } from 'react'
import type { Coordinate } from '../../types'
import { formatGrid3 } from '../../lib/coordinates/transform'

interface CoordinateInputProps {
  label: string
  position: Coordinate | null
  onChange: (position: Coordinate) => void
  disabled?: boolean
}

/**
 * Convert 3-digit grid to meters
 * Grid format: ABC where A=1000m, B=100m, C=10m
 * "824" → 8240m
 */
function gridToMeters(grid: string): number {
  if (!grid || grid.length === 0) return 0
  // Parse as a number and multiply by 10
  const gridNum = parseInt(grid, 10)
  if (isNaN(gridNum)) return 0
  return gridNum * 10
}

/**
 * Parse input value - supports both grid and meter formats
 * "824" → 8240m (grid format)
 * "8245" → 8245m (if > 3 digits, treat as meters)
 * "8245m" → 8245m (explicit meter format)
 */
function parseInput(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0

  // Check for explicit meter format (ends with 'm')
  if (trimmed.toLowerCase().endsWith('m')) {
    const meters = parseInt(trimmed.slice(0, -1), 10)
    return isNaN(meters) ? 0 : meters
  }

  // If 3 or fewer digits, treat as grid
  if (/^\d{1,3}$/.test(trimmed)) {
    return gridToMeters(trimmed)
  }

  // If more than 3 digits, treat as meters
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10)
  }

  return 0
}

export function CoordinateInput({
  label,
  position,
  onChange,
  disabled = false
}: CoordinateInputProps) {
  // Local state for input values (allows free editing)
  const [eastInput, setEastInput] = useState('')
  const [northInput, setNorthInput] = useState('')
  const [isEditingEast, setIsEditingEast] = useState(false)
  const [isEditingNorth, setIsEditingNorth] = useState(false)

  // Sync local state with position prop when not editing
  useEffect(() => {
    if (!isEditingEast) {
      setEastInput(position ? formatGrid3(position.east) : '')
    }
  }, [position?.east, isEditingEast])

  useEffect(() => {
    if (!isEditingNorth) {
      setNorthInput(position ? formatGrid3(position.north) : '')
    }
  }, [position?.north, isEditingNorth])

  // Handle East input
  const handleEastChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow digits and optional 'm' suffix
    if (value === '' || /^\d*m?$/i.test(value)) {
      setEastInput(value)
    }
  }

  const handleEastFocus = () => {
    setIsEditingEast(true)
  }

  const handleEastBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditingEast(false)
    const east = parseInput(e.target.value)
    const oldEast = position?.east ?? 0
    // Reset height to 0 if coordinates changed, so auto-height can reload
    const heightChanged = east !== oldEast
    onChange({
      east,
      north: position?.north ?? 0,
      height: heightChanged ? 0 : (position?.height ?? 0)
    })
  }

  const handleEastKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  // Handle North input
  const handleNorthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*m?$/i.test(value)) {
      setNorthInput(value)
    }
  }

  const handleNorthFocus = () => {
    setIsEditingNorth(true)
  }

  const handleNorthBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditingNorth(false)
    const north = parseInput(e.target.value)
    const oldNorth = position?.north ?? 0
    // Reset height to 0 if coordinates changed, so auto-height can reload
    const coordChanged = north !== oldNorth
    onChange({
      east: position?.east ?? 0,
      north,
      height: coordChanged ? 0 : (position?.height ?? 0)
    })
  }

  const handleNorthKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <div>
      <label className="block text-gray-400 text-xs uppercase mb-2 font-medium">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {/* East Input */}
        <div>
          <label className="block text-gray-500 text-[10px] uppercase mb-1">
            Ost (E)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={eastInput}
            onChange={handleEastChange}
            onFocus={handleEastFocus}
            onBlur={handleEastBlur}
            onKeyDown={handleEastKeyDown}
            disabled={disabled}
            placeholder="000"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="text-[10px] text-gray-600 mt-1 text-center">
            {position ? `${position.east}m` : '—'}
          </div>
        </div>

        {/* North Input */}
        <div>
          <label className="block text-gray-500 text-[10px] uppercase mb-1">
            Nord (N)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={northInput}
            onChange={handleNorthChange}
            onFocus={handleNorthFocus}
            onBlur={handleNorthBlur}
            onKeyDown={handleNorthKeyDown}
            disabled={disabled}
            placeholder="000"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-center font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="text-[10px] text-gray-600 mt-1 text-center">
            {position ? `${position.north}m` : '—'}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 mt-2">
        Eingabe: 3-stellig (Grid) oder mit "m" (z.B. 8245m)
      </div>
    </div>
  )
}
