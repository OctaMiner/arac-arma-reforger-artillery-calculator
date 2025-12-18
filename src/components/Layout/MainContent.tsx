/**
 * MainContent Component - Main content area
 *
 * Features:
 * - Flexible container (takes remaining space)
 * - Flex column layout: Map + ResultsBar
 * - ResultsBar positioned at bottom of map area
 */

interface MainContentProps {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 bg-[#1a1a2e] flex flex-col overflow-hidden">
      {children}
    </main>
  )
}
