/**
 * ErrorBoundary Component
 *
 * Catches React errors in component tree and displays
 * user-friendly error message with reload option.
 *
 * Usage:
 * Wrap each main section of the app to isolate errors
 * and prevent complete app crashes.
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Ein Fehler ist aufgetreten',
        fallbackMessage = 'Dieser Bereich konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
      } = this.props;

      return (
        <div className="flex items-center justify-center p-8 bg-bg-secondary border border-border rounded-lg">
          <div className="text-center space-y-6 max-w-md">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            {/* Error Title */}
            <div>
              <h3 className="text-xl font-bold text-destructive mb-2">
                {fallbackTitle}
              </h3>
              <p className="text-sm text-text-secondary">
                {fallbackMessage}
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-bg-tertiary border border-border rounded p-4 max-h-40 overflow-auto">
                <p className="text-xs font-mono text-destructive mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-text-secondary overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-bg-tertiary text-text-primary border border-border rounded-md hover:bg-bg-tertiary/80 transition-colors font-medium"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for ErrorBoundary with preset titles
 * for specific app sections
 */

interface SectionErrorBoundaryProps {
  children: ReactNode;
  section: 'map' | 'config' | 'results' | 'mission' | 'station' | 'spotter';
}

const sectionConfig = {
  map: {
    title: 'Kartenfehler',
    message: 'Die Karte konnte nicht geladen werden. Bitte versuchen Sie es erneut oder wählen Sie eine andere Karte.',
  },
  config: {
    title: 'Konfigurationsfehler',
    message: 'Die Konfiguration konnte nicht geladen werden. Bitte überprüfen Sie Ihre Eingaben.',
  },
  results: {
    title: 'Berechnungsfehler',
    message: 'Die Feuerlösung konnte nicht berechnet werden. Bitte überprüfen Sie Ihre Eingaben.',
  },
  mission: {
    title: 'Missionsfehler',
    message: 'Die Mission konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
  },
  station: {
    title: 'Stationsfehler',
    message: 'Die Stationen konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
  },
  spotter: {
    title: 'Spotter-Fehler',
    message: 'Der Spotter-Bereich konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
  },
};

export function SectionErrorBoundary({ children, section }: SectionErrorBoundaryProps) {
  const config = sectionConfig[section];

  return (
    <ErrorBoundary
      fallbackTitle={config.title}
      fallbackMessage={config.message}
    >
      {children}
    </ErrorBoundary>
  );
}
