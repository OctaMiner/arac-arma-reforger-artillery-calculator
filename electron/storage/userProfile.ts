import type { UserProfile } from '../../src/types';
import { saveToFile, loadFromFile, withErrorHandling } from '../storage';

const PROFILE_FILE = 'profile.json';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  return withErrorHandling(async () => {
    await saveToFile(PROFILE_FILE, profile);
  }, 'Failed to save user profile');
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  return withErrorHandling(async () => {
    return await loadFromFile<UserProfile>(PROFILE_FILE);
  }, 'Failed to load user profile');
}
