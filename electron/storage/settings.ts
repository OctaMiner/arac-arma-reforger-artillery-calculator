import type { AppSettings } from '../../src/types';
import { saveToFile, loadFromFile, withErrorHandling } from '../storage';

const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'de',
  showGrid: true,
  defaultMortarType: 'US',
  defaultAmmo: 'HE',
  defaultCharge: 4,
};

export async function saveSettings(settings: AppSettings): Promise<void> {
  return withErrorHandling(async () => {
    await saveToFile(SETTINGS_FILE, settings);
  }, 'Failed to save settings');
}

export async function loadSettings(): Promise<AppSettings> {
  return withErrorHandling(async () => {
    const settings = await loadFromFile<AppSettings>(SETTINGS_FILE);

    // Return loaded settings or defaults
    if (settings) {
      // Merge with defaults to ensure all fields exist (for backwards compatibility)
      return { ...DEFAULT_SETTINGS, ...settings };
    }

    // First time - save defaults
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }, 'Failed to load settings');
}
