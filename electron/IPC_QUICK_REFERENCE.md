# IPC Handler Quick Reference

Schnellreferenz für alle IPC-Handler. Für Details siehe `docs/IPC_API_REFERENCE.md`.

## Settings

```typescript
// Save
await window.api.saveSettings(settings: AppSettings): void

// Load (with defaults)
const settings = await window.api.loadSettings(): AppSettings
```

## User Profile

```typescript
// Save
await window.api.saveUserProfile(profile: UserProfile): void

// Load (can be null)
const profile = await window.api.loadUserProfile(): UserProfile | null
```

## Missions

```typescript
// Save (create/update)
await window.api.saveMission(mission: FireMission): void

// Load all
const missions = await window.api.loadMissions(): FireMission[]

// Delete
await window.api.deleteMission(id: string): void

// Update (throws if not exists)
await window.api.updateMission(mission: FireMission): void
```

## Stations

```typescript
// Save (create/update)
await window.api.saveStation(station: MortarStation): void

// Load all
const stations = await window.api.loadStations(): MortarStation[]

// Delete
await window.api.deleteStation(id: string): void
```

## History

```typescript
// Add (auto-generates id + timestamp)
await window.api.addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void

// Get (optional pagination)
const history = await window.api.getHistory({ limit?: number, offset?: number }): HistoryEntry[]

// Clear all
await window.api.clearHistory(): void
```

## App Info

```typescript
// Version from package.json
const version = await window.api.getAppVersion(): string

// Storage path
const path = await window.api.getAppPath(): string
```

## Handler Count

- Settings: 2 Handler
- User Profile: 2 Handler
- Missions: 4 Handler
- Stations: 3 Handler
- History: 3 Handler
- App Info: 2 Handler

**Total: 16 Handler**

## Files

- Implementation: `electron/ipc-handlers.ts`
- Types: `electron/types/ipc.ts`
- Preload: `electron/preload.ts` (Phase 3.3)
- Storage: `electron/storage/*.ts`
- API Ref: `docs/IPC_API_REFERENCE.md`

## Security

- ✅ contextIsolation: true
- ✅ nodeIntegration: false
- ✅ Input Validation
- ✅ Error Handling
- ✅ No eval/Function

## Storage

```
%APPDATA%/ARAC/data/
├── settings.json
├── profile.json
├── missions.json
├── stations.json
└── history.json
```

## Error Handling

```typescript
try {
  await window.api.saveMission(mission);
} catch (error) {
  console.error('Error:', error);
}
```

## Limits

- History: Max 1000 entries (auto-pruned)
- Missions/Stations: Unlimited
- File Size: No explicit limits

## Status

- ✅ Phase 3.2: IPC Handlers - DONE
- ⏳ Phase 3.3: Preload Script - NEXT
