import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

// Storage-Pfad: %APPDATA%/ARAC/ (Windows) oder ~/Library/Application Support/ARAC/ (macOS)
export const getStoragePath = (): string => {
  return path.join(app.getPath('userData'), 'data');
};

// Initialisiere Storage-Verzeichnis
export async function initStorage(): Promise<void> {
  const storagePath = getStoragePath();
  try {
    await fs.mkdir(storagePath, { recursive: true });
    console.log(`[Storage] Initialized at: ${storagePath}`);
  } catch (error) {
    console.error('[Storage] Failed to initialize:', error);
    throw error;
  }
}

// Generic JSON Writer
export async function saveToFile<T>(filename: string, data: T): Promise<void> {
  const storagePath = getStoragePath();
  const filePath = path.join(storagePath, filename);

  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`[Storage] Saved: ${filename}`);
  } catch (error) {
    console.error(`[Storage] Failed to save ${filename}:`, error);
    throw error;
  }
}

// Generic JSON Reader
export async function loadFromFile<T>(filename: string): Promise<T | null> {
  const storagePath = getStoragePath();
  const filePath = path.join(storagePath, filename);

  try {
    // Check if file exists
    await fs.access(filePath);
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData) as T;
    console.log(`[Storage] Loaded: ${filename}`);
    return data;
  } catch (error: any) {
    // File doesn't exist - return null
    if (error?.code === 'ENOENT') {
      console.log(`[Storage] File not found: ${filename}`);
      return null;
    }
    console.error(`[Storage] Failed to load ${filename}:`, error);
    throw error;
  }
}

// Delete File
export async function deleteFile(filename: string): Promise<void> {
  const storagePath = getStoragePath();
  const filePath = path.join(storagePath, filename);

  try {
    await fs.unlink(filePath);
    console.log(`[Storage] Deleted: ${filename}`);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      console.log(`[Storage] File already deleted: ${filename}`);
      return;
    }
    console.error(`[Storage] Failed to delete ${filename}:`, error);
    throw error;
  }
}

// Error Handling wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[Storage] ${errorMessage}:`, error);
    throw new Error(
      `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
