import type { FireMission } from '../../src/types';
import { saveToFile, loadFromFile, withErrorHandling } from '../storage';

const MISSIONS_FILE = 'missions.json';

export async function saveMission(mission: FireMission): Promise<void> {
  return withErrorHandling(
    async () => {
      const missions = await loadMissions();

      // Check if mission exists
      const existingIndex = missions.findIndex(m => m.id === mission.id);

      if (existingIndex >= 0) {
        // Update existing
        missions[existingIndex] = {
          ...mission,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new
        missions.push(mission);
      }

      await saveToFile(MISSIONS_FILE, missions);
    },
    'Failed to save mission'
  );
}

export async function loadMissions(): Promise<FireMission[]> {
  return withErrorHandling(
    async () => {
      const missions = await loadFromFile<FireMission[]>(MISSIONS_FILE);
      return missions || [];
    },
    'Failed to load missions'
  );
}

export async function deleteMission(missionId: string): Promise<void> {
  return withErrorHandling(
    async () => {
      const missions = await loadMissions();
      const filtered = missions.filter(m => m.id !== missionId);
      await saveToFile(MISSIONS_FILE, filtered);
    },
    'Failed to delete mission'
  );
}

export async function updateMission(mission: FireMission): Promise<void> {
  return withErrorHandling(
    async () => {
      const missions = await loadMissions();
      const index = missions.findIndex(m => m.id === mission.id);

      if (index < 0) {
        throw new Error(`Mission with ID ${mission.id} not found`);
      }

      missions[index] = {
        ...mission,
        updatedAt: new Date().toISOString()
      };

      await saveToFile(MISSIONS_FILE, missions);
    },
    'Failed to update mission'
  );
}
