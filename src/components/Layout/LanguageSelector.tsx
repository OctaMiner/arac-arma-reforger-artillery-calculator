/**
 * LanguageSelector - Dropdown for selecting app language
 */

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { languages } from '../../i18n';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <label
          htmlFor="language-select"
          className="text-gray-400 text-xs uppercase font-medium"
        >
          {t('sidebar.language')}
        </label>
      </div>
      <div className="relative">
        <select
          id="language-select"
          value={i18n.language}
          onChange={handleLanguageChange}
          className="
            w-full
            px-3 py-2
            bg-gray-800
            border border-gray-700
            text-white
            rounded
            appearance-none
            cursor-pointer
            transition-all duration-150 ease-in-out
            hover:bg-gray-750
            hover:border-gray-600
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-transparent
            font-medium
            text-sm
          "
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
