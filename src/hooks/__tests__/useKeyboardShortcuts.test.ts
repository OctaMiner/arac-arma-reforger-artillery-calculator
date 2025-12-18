/**
 * Tests for useKeyboardShortcuts Hook
 *
 * Validates:
 * - Ctrl+S triggers save shortcut
 * - Ctrl+N triggers new mission
 * - Escape triggers escape callback
 * - Number keys (0-5) set ring count
 * - Input field detection prevents shortcuts
 * - Platform-aware modifier keys (Ctrl vs Cmd)
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useAppStore } from '../../stores/useAppStore';

// Mock the stores
jest.mock('../../stores/useAppStore');
jest.mock('../useMissions');

describe('useKeyboardShortcuts', () => {
  let mockSetCharge: jest.Mock;
  let mockReset: jest.Mock;
  let mockSetManualChargeOverride: jest.Mock;
  let mockOnEscape: jest.Mock;
  let mockOnSaveShortcut: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockSetCharge = jest.fn();
    mockReset = jest.fn();
    mockSetManualChargeOverride = jest.fn();
    mockOnEscape = jest.fn();
    mockOnSaveShortcut = jest.fn();

    // Mock store
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        setCharge: mockSetCharge,
        reset: mockReset,
        setManualChargeOverride: mockSetManualChargeOverride,
      })
    );

    // Clear window.confirm mock
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Setup', () => {
    it('should register keyboard listener when enabled', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('should not register listener when disabled', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() =>
        useKeyboardShortcuts({
          enabled: false,
        })
      );

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should cleanup listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('Escape Key', () => {
    it('should trigger onEscape callback', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
          onEscape: mockOnEscape,
        })
      );

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(mockOnEscape).toHaveBeenCalledTimes(1);
    });

    it('should work even in input fields', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
          onEscape: mockOnEscape,
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);

      expect(mockOnEscape).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });
  });

  describe('Save Shortcut (Ctrl+S)', () => {
    it('should trigger onSaveShortcut on Ctrl+S', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
          onSaveShortcut: mockOnSaveShortcut,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
      });
      window.dispatchEvent(event);

      expect(mockOnSaveShortcut).toHaveBeenCalledTimes(1);
    });

    it('should trigger onSaveShortcut on Cmd+S (Mac)', () => {
      // Mock Mac platform
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
          onSaveShortcut: mockOnSaveShortcut,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
      });
      window.dispatchEvent(event);

      expect(mockOnSaveShortcut).toHaveBeenCalledTimes(1);
    });

    it('should not trigger when in input field', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
          onSaveShortcut: mockOnSaveShortcut,
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);

      expect(mockOnSaveShortcut).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });
  });

  describe('New Mission Shortcut (Ctrl+N)', () => {
    it('should reset on Ctrl+N with confirmation', () => {
      global.confirm = jest.fn(() => true);

      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
      });
      window.dispatchEvent(event);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should not reset when user cancels confirmation', () => {
      global.confirm = jest.fn(() => false);

      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
      });
      window.dispatchEvent(event);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe('Ring Count Shortcuts (0-5)', () => {
    it('should set ring count 0 on "1" key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const event = new KeyboardEvent('keydown', { key: '1' });
      window.dispatchEvent(event);

      expect(mockSetManualChargeOverride).toHaveBeenCalledWith(0);
      expect(mockSetCharge).toHaveBeenCalledWith(0);
    });

    it('should set ring count 4 on "5" key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const event = new KeyboardEvent('keydown', { key: '5' });
      window.dispatchEvent(event);

      expect(mockSetManualChargeOverride).toHaveBeenCalledWith(4);
      expect(mockSetCharge).toHaveBeenCalledWith(4);
    });

    it('should set ring count 0 on "0" key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const event = new KeyboardEvent('keydown', { key: '0' });
      window.dispatchEvent(event);

      expect(mockSetManualChargeOverride).toHaveBeenCalledWith(0);
      expect(mockSetCharge).toHaveBeenCalledWith(0);
    });

    it('should not trigger in input fields', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: '3',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);

      expect(mockSetCharge).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should not trigger in textarea', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', {
        key: '2',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: textarea,
        enumerable: true,
      });
      window.dispatchEvent(event);

      expect(mockSetCharge).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });
  });

  describe('Input Field Detection', () => {
    it('should detect INPUT elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);

      expect(mockSetCharge).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should detect TEXTAREA elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      const event = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: textarea,
        enumerable: true,
      });
      window.dispatchEvent(event);

      expect(mockSetCharge).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should detect contentEditable elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);

      const event = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: div, enumerable: true });
      window.dispatchEvent(event);

      expect(mockSetCharge).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });

    it('should allow shortcuts on regular elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          enabled: true,
        })
      );

      const div = document.createElement('div');
      document.body.appendChild(div);

      const event = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: div, enumerable: true });
      window.dispatchEvent(event);

      expect(mockSetCharge).toHaveBeenCalledWith(0);

      document.body.removeChild(div);
    });
  });
});
