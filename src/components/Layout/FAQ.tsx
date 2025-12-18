/**
 * FAQ Component - Help section explaining how to use the app
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Wie setze ich die Mörser-Position?',
    answer: 'Linksklick auf die Karte setzt die Mörser-Position (blauer Marker). Die Höhe wird automatisch aus den Kartendaten ermittelt.'
  },
  {
    question: 'Wie setze ich das Ziel?',
    answer: 'Rechtsklick oder Shift+Klick auf die Karte setzt die Ziel-Position (roter Marker). Alternativ: Ctrl+Klick oder Alt+Klick.'
  },
  {
    question: 'Was bedeuten die farbigen Kreise?',
    answer: 'Die Kreise zeigen die Reichweiten der verschiedenen Ladungsstufen (Ring 0-4). Grün = nah, Rot = weit. Der aktive Ring wird farbig gefüllt.'
  },
  {
    question: 'Was ist die Totzone?',
    answer: 'Der dunkelrote innere Kreis markiert die Mindestreichweite. Ziele in diesem Bereich können nicht getroffen werden.'
  },
  {
    question: 'Wie funktioniert die automatische Ringwahl?',
    answer: 'Der optimale Ring wird basierend auf der Entfernung zum Ziel automatisch berechnet. Niedrigere Ringe = kürzere Flugzeit = höhere Präzision.'
  },
  {
    question: 'Was bedeuten Azimut und Elevation?',
    answer: 'Azimut = Richtung in MIL (0-6400). Elevation = Höhenwinkel in MIL. Diese Werte am Mörser einstellen.'
  },
  {
    question: 'Wie speichere ich Positionen?',
    answer: 'Nutze die "Stationen" und "Missionen" Panels um häufig verwendete Positionen zu speichern und schnell wieder aufzurufen.'
  }
]

export function FAQ() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

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
            Hilfe / FAQ
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
            <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm text-gray-200 font-medium pr-2">
                  {item.question}
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
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Quick Reference */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-xs text-blue-300 font-medium mb-2">Schnellreferenz:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-gray-400">Linksklick = Mörser</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-400">Rechtsklick = Ziel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
