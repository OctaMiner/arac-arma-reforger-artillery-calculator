/**
 * UsernameInput Component - Inline editable username
 *
 * Features:
 * - Display username with User icon
 * - Click to edit (inline edit mode)
 * - Save on Enter or blur
 * - Cancel on Escape
 * - Updates user profile via store
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Edit2, Check, X } from 'lucide-react'
import { useUserStore } from '../../stores/useUserStore'

export function UsernameInput() {
  const { t } = useTranslation()

  const userProfile = useUserStore((state) => state.userProfile)
  const saveUserProfile = useUserStore((state) => state.saveUserProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const currentName = userProfile?.name || t('profile.noProfile')

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditValue(currentName)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!userProfile) return

    const trimmedValue = editValue.trim()
    if (!trimmedValue) {
      setIsEditing(false)
      return
    }

    if (trimmedValue !== currentName) {
      await saveUserProfile({
        ...userProfile,
        name: trimmedValue
      })
    }

    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={t('profile.usernamePlaceholder')}
            className="flex-1 bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleSave}
            className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors"
            title={t('common.save')}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title={t('common.cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartEdit}
      className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-700/50 transition-colors group"
      title={t('profile.editUsername')}
    >
      <User className="w-5 h-5 text-blue-400 flex-shrink-0" />
      <span className="flex-1 text-left text-white font-medium">
        {currentName}
      </span>
      <Edit2 className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
