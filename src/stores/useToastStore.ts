/**
 * Toast Store - State management for toast notifications
 *
 * Manages:
 * - Toast messages with auto-dismiss
 * - Different toast types (success, error, warning, info)
 * - Queue system for multiple toasts
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, default 3000
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Convenience methods
  success: (message, duration) =>
    useToastStore.getState().addToast(message, 'success', duration),

  error: (message, duration) =>
    useToastStore.getState().addToast(message, 'error', duration),

  warning: (message, duration) =>
    useToastStore.getState().addToast(message, 'warning', duration),

  info: (message, duration) =>
    useToastStore.getState().addToast(message, 'info', duration),
}));
