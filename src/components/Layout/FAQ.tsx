/**
 * FAQ Component - Help section explaining how to use the app
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const faqItems: FAQItem[] = [
  { questionKey: 'faq.q_coordinates', answerKey: 'faq.a_coordinates' },
  { questionKey: 'faq.q_mortarPos', answerKey: 'faq.a_mortarPos' },
  { questionKey: 'faq.q_targetPos', answerKey: 'faq.a_targetPos' },
  { questionKey: 'faq.q_circles', answerKey: 'faq.a_circles' },
  { questionKey: 'faq.q_deadzone', answerKey: 'faq.a_deadzone' },
  { questionKey: 'faq.q_autoRing', answerKey: 'faq.a_autoRing' },
  {
    questionKey: 'faq.q_azimuthElevation',
    answerKey: 'faq.a_azimuthElevation',
  },
  { questionKey: 'faq.q_savePositions', answerKey: 'faq.a_savePositions' },
];

export function FAQ() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-gray-700">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <span className="text-lg font-semibold text-blue-400 uppercase tracking-wide">
            {t('faq.title')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedItem(expandedItem === index ? null : index)
                }
                className="w-full flex items-center justify-between p-3 text-left bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm text-gray-200 font-medium pr-2">
                  {t(item.questionKey)}
                </span>
                {expandedItem === index ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {expandedItem === index && (
                <div className="p-3 bg-gray-900/50 border-t border-gray-700">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t(item.answerKey)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Quick Reference - Mouse */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-xs text-blue-300 font-medium mb-2">
              {t('faq.quickRef')}:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-gray-400">{t('map.leftClick')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-400">{t('map.rightClick')}</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-300 font-medium mb-2">
              {t('faq.shortcuts', 'Tastenkürzel')}:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px]">Ctrl+S</kbd>
                <span className="text-gray-400">{t('faq.shortcut_save', 'Mission speichern')}</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px]">Ctrl+N</kbd>
                <span className="text-gray-400">{t('faq.shortcut_new', 'Neue Mission')}</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px]">Esc</kbd>
                <span className="text-gray-400">{t('faq.shortcut_escape', 'Dialog schließen')}</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-[10px]">1-5</kbd>
                <span className="text-gray-400">{t('faq.shortcut_charge', 'Ladung wählen')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
