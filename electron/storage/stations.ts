import type { MortarStation } from '../../src/types';
import { saveToFile, loadFromFile, withErrorHandling } from '../storage';

const STATIONS_FILE = 'stations.json';

export async function saveStation(station: MortarStation): Promise<void> {
  return withErrorHandling(async () => {
    const stations = await loadStations();

    // Check if station exists
    const existingIndex = stations.findIndex((s) => s.id === station.id);

    if (existingIndex >= 0) {
      // Update existing
      stations[existingIndex] = station;
    } else {
      // Add new
      stations.push(station);
    }

    await saveToFile(STATIONS_FILE, stations);
  }, 'Failed to save station');
}

export async function loadStations(): Promise<MortarStation[]> {
  return withErrorHandling(async () => {
    const stations = await loadFromFile<MortarStation[]>(STATIONS_FILE);
    return stations || [];
  }, 'Failed to load stations');
}

export async function deleteStation(stationId: string): Promise<void> {
  return withErrorHandling(async () => {
    const stations = await loadStations();
    const filtered = stations.filter((s) => s.id !== stationId);
    await saveToFile(STATIONS_FILE, filtered);
  }, 'Failed to delete station');
}
