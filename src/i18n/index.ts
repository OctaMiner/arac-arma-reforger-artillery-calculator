/**
 * i18n Configuration for ARAC
 * Supports German (default) and English
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from './locales/de.json'
import en from './locales/en.json'

// Get saved language from localStorage or default to German
const savedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem('arac-language') || 'de'
  : 'de'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  })

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('arac-language', lng)
  }
})

export default i18n

/**
 * Available languages
 */
export const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
] as const

export type LanguageCode = typeof languages[number]['code']
