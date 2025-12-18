/**
 * Toast Component - Notification system
 *
 * Features:
 * - Auto-dismiss after 3 seconds
 * - Different types: success, error, warning, info
 * - Smooth animations
 * - Click to dismiss
 * - Stacks multiple toasts
 */

import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '../../stores/useToastStore';

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClass = 'w-5 h-5 flex-shrink-0';

  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-accent-green`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-accent-red`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-accent-yellow`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-accent-blue`} />;
  }
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  // Border color based on type
  const borderColor = {
    success: 'border-accent-green',
    error: 'border-accent-red',
    warning: 'border-accent-yellow',
    info: 'border-accent-blue',
  }[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg
        bg-bg-secondary border-l-4 ${borderColor}
        shadow-lg backdrop-blur-sm
        animate-toast-in
        hover:scale-105 transition-transform duration-200
        cursor-pointer
      `}
      onClick={() => removeToast(toast.id)}
    >
      <ToastIcon type={toast.type} />
      <p className="flex-1 text-sm text-text-primary font-sans">{toast.message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Schließen"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * ToastContainer - Renders all active toasts
 * Place this component once in your app root
 */
export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="
        fixed bottom-4 right-4 z-50
        flex flex-col gap-2
        max-w-md w-full
        pointer-events-none
      "
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

/**
 * Hook to easily show toasts from any component
 *
 * @example
 * const toast = useToast();
 * toast.success('Mission saved!');
 * toast.error('Failed to load data');
 */
export const useToast = () => {
  return useToastStore((state) => ({
    success: state.success,
    error: state.error,
    warning: state.warning,
    info: state.info,
  }));
};
