/**
 * Footer Component - App Footer with Version and Links
 *
 * Features:
 * - Shows app version from package.json
 * - Links to GitHub, Docs, etc.
 * - Compact, unobtrusive design
 * - Placed at bottom of sidebar
 */

import { Github, BookOpen, ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  // Version from package.json (hardcoded for now, can be dynamic with Electron API)
  const version = '0.1.0';

  return (
    <footer
      className={`border-t border-sidebar-border px-4 py-3 ${className}`}
    >
      <div className="space-y-3">
        {/* Version Info */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-mono">ARAC v{version}</span>
          <span className="text-muted-foreground">BETA</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/arma-reforger/arac"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-blue transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <span className="text-gray-700">•</span>

          <a
            href="https://docs.arac.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-blue transition-colors"
            title="Documentation"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[10px] text-muted-foreground font-mono">
          Arma Reforger Artillery Calculator © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
