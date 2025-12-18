/**
 * Sidebar Component - MilSim Style Left Panel
 *
 * Features:
 * - Full height (includes header)
 * - Fixed width (360px for better readability)
 * - Scrollable content
 * - Military dark theme
 */

import { Header } from './Header'

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-[360px] bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-hidden">
      {/* Header inside Sidebar */}
      <Header />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </aside>
  )
}
