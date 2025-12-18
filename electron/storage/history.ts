import type { HistoryEntry } from '../../src/types';
import { saveToFile, loadFromFile, withErrorHandling } from '../storage';
import { randomUUID } from 'crypto';

const HISTORY_FILE = 'history.json';
const MAX_HISTORY_ENTRIES = 1000;

export async function addToHistory(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): Promise<void> {
  return withErrorHandling(async () => {
    const history = await getHistory();

    // Create full entry
    const fullEntry: HistoryEntry = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Add to beginning (newest first)
    history.unshift(fullEntry);

    // Limit size
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES);
    }

    await saveToFile(HISTORY_FILE, history);
  }, 'Failed to add history entry');
}

export async function getHistory(
  limit?: number,
  offset: number = 0
): Promise<HistoryEntry[]> {
  return withErrorHandling(async () => {
    const history = await loadFromFile<HistoryEntry[]>(HISTORY_FILE);

    if (!history || history.length === 0) {
      return [];
    }

    // Apply pagination
    const start = offset;
    const end = limit ? start + limit : undefined;

    return history.slice(start, end);
  }, 'Failed to get history');
}

export async function clearHistory(): Promise<void> {
  return withErrorHandling(async () => {
    await saveToFile(HISTORY_FILE, []);
  }, 'Failed to clear history');
}
