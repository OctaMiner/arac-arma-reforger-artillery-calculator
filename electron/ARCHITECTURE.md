# ARAC Electron Architecture

## Überblick

```
┌───────────────────────────────────────────────────────────────┐
│                         ARAC App                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │          React App (Renderer Process)               │     │
│  │                                                      │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │     │
│  │  │  Components  │  │    Hooks     │  │  Stores  │  │     │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  │     │
│  │         │                 │                │        │     │
│  │         └─────────────────┼────────────────┘        │     │
│  │                           │                         │     │
│  │                    useElectronAPI()                 │     │
│  │                           │                         │     │
│  │                    window.api.*                     │     │
│  └───────────────────────────┼─────────────────────────┘     │
│                              │                               │
│  ════════════════════════════╪═══════════════════════════    │
│         Context Bridge       │                               │
│  ════════════════════════════╪═══════════════════════════    │
│                              │                               │
│  ┌───────────────────────────▼─────────────────────────┐     │
│  │          Preload Script (preload.ts)                │     │
│  │                                                      │     │
│  │  contextBridge.exposeInMainWorld('api', {          │     │
│  │    loadSettings: () => invoke('load-settings')     │     │
│  │    saveMission: (m) => invoke('save-mission', m)   │     │
│  │    ...                                              │     │
│  │  })                                                 │     │
│  └───────────────────────────┬─────────────────────────┘     │
│                              │                               │
│                        ipcRenderer.invoke()                  │
│                              │                               │
│  ════════════════════════════╪═══════════════════════════    │
│            IPC Channel       │                               │
│  ════════════════════════════╪═══════════════════════════    │
│                              │                               │
│  ┌───────────────────────────▼─────────────────────────┐     │
│  │       Main Process (main.ts + handlers)             │     │
│  │                                                      │     │
│  │  ┌────────────────────────────────────────────┐     │     │
│  │  │  IPC Handlers (ipc-handlers.ts)           │     │     │
│  │  │                                            │     │     │
│  │  │  ipcMain.handle('load-settings', ...)    │     │     │
│  │  │  ipcMain.handle('save-mission', ...)     │     │     │
│  │  │  ...                                       │     │     │
│  │  └─────────────────┬──────────────────────────┘     │     │
│  │                    │                                │     │
│  │                    ▼                                │     │
│  │  ┌────────────────────────────────────────────┐     │     │
│  │  │  Storage Manager (storage.ts)             │     │     │
│  │  │                                            │     │     │
│  │  │  - missions.json                          │     │     │
│  │  │  - stations.json                          │     │     │
│  │  │  - settings.json                          │     │     │
│  │  │  - history.json                           │     │     │
│  │  │  - user-profile.json                      │     │     │
│  │  └─────────────────┬──────────────────────────┘     │     │
│  │                    │                                │     │
│  │                    ▼                                │     │
│  │           File System (userData/)                   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────┐
│           Security Boundaries                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Renderer Process (React)                       │
│  ┌────────────────────────────────────┐          │
│  │  - NO Node.js APIs                │          │
│  │  - NO require()                   │          │
│  │  - NO fs, path, etc.              │          │
│  │  - ONLY window.api.*              │          │
│  └────────────────────────────────────┘          │
│           ▲                                      │
│           │ contextBridge (SECURE)               │
│           │                                      │
│  ┌────────┴───────────────────────────┐          │
│  │  Context Isolation: true           │          │
│  │  Node Integration: false           │          │
│  │  Sandbox: true                     │          │
│  └────────────────────────────────────┘          │
│           │                                      │
│           ▼                                      │
│  Preload Script                                 │
│  ┌────────────────────────────────────┐          │
│  │  - Has IPC Access                 │          │
│  │  - Whitelisted APIs only          │          │
│  │  - Type-safe Bridge               │          │
│  └────────────────────────────────────┘          │
│           │                                      │
│           ▼                                      │
│  Main Process                                   │
│  ┌────────────────────────────────────┐          │
│  │  - Full Node.js Access            │          │
│  │  - File System                    │          │
│  │  - Input Validation               │          │
│  └────────────────────────────────────┘          │
│                                                  │
└──────────────────────────────────────────────────┘
```

## IPC Flow (Example: Save Mission)

```
1. User clicks "Save Mission"
   │
   ▼
2. React Component
   │
   │  const api = useElectronAPI()
   │  await api.saveMission(mission)
   │
   ▼
3. window.api.saveMission() [From preload.ts]
   │
   │  saveMission: (mission: FireMission) =>
   │    ipcRenderer.invoke('save-mission', mission)
   │
   ▼
4. IPC Channel: 'save-mission'
   │
   ▼
5. Main Process Handler
   │
   │  ipcMain.handle('save-mission', async (_, mission) => {
   │    // Validate mission
   │    validateMission(mission)
   │
   │    // Save to storage
   │    const storage = new StorageManager('missions.json')
   │    await storage.save(mission)
   │  })
   │
   ▼
6. File System
   │
   │  Write to: userData/missions.json
   │
   ▼
7. Success/Error
   │
   │  Response propagiert zurück zum Renderer
   │
   ▼
8. React Component
   │
   │  try {
   │    await api.saveMission(mission)
   │    toast.success('Saved!')
   │  } catch (err) {
   │    toast.error('Failed')
   │  }
```

## Data Flow

```
┌────────────────────────────────────────────────────┐
│                 User Interaction                   │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│            React Component State                   │
│  - useState, useContext, Zustand Store            │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          useElectronAPI Hook                      │
│  - Type-safe API access                           │
│  - Error handling                                 │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          window.api (Context Bridge)              │
│  - 16 exposed methods                             │
│  - Type definitions                               │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          IPC Communication                        │
│  - ipcRenderer.invoke()                           │
│  - Async/Promise-based                            │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          IPC Handlers (Main Process)              │
│  - Validation                                     │
│  - Business Logic                                 │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          Storage Manager                          │
│  - JSON file operations                           │
│  - Atomic writes                                  │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          File System (userData)                   │
│  - Persistent storage                             │
│  - Backup support                                 │
└────────────────────────────────────────────────────┘
```

## Type System Flow

```
┌─────────────────────────────────────────────────┐
│            Type Definitions                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  src/types/index.ts                            │
│  ┌───────────────────────────────────────┐      │
│  │  - AppSettings                       │      │
│  │  - FireMission                       │      │
│  │  - MortarStation                     │      │
│  │  - HistoryEntry                      │      │
│  │  - UserProfile                       │      │
│  │  - ElectronAPI                       │      │
│  └───────────────────────────────────────┘      │
│           │                                     │
│           ├────────────────┬────────────────┐   │
│           ▼                ▼                ▼   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │ React       │  │ Preload     │  │ Main     ││
│  │ Components  │  │ Script      │  │ Process  ││
│  └─────────────┘  └─────────────┘  └──────────┘│
│                                                 │
│  Alle nutzen die gleichen Types!               │
│  → Type-Safety über Process-Grenzen hinweg     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## File Structure

```
ARAC/
├── electron/
│   ├── main.ts                    # Main Process Entry
│   ├── preload.ts                 # Context Bridge (Phase 3.3)
│   ├── ipc-handlers.ts            # IPC Handler Setup (Phase 3.2)
│   ├── storage.ts                 # Storage Manager
│   ├── types/
│   │   └── ipc.ts                 # IPC Type Definitions
│   └── handlers/
│       ├── settings.ts            # Settings Handler
│       ├── missions.ts            # Missions Handler
│       ├── stations.ts            # Stations Handler
│       ├── history.ts             # History Handler
│       └── user-profile.ts        # User Profile Handler
│
├── src/
│   ├── types/
│   │   └── index.ts               # Shared Types (ElectronAPI)
│   ├── electron.d.ts              # Window.api Declaration
│   ├── hooks/
│   │   └── useElectronAPI.ts      # React Hook für API
│   └── components/
│       └── ...
│
└── userData/                       # Runtime (user data directory)
    ├── missions.json
    ├── stations.json
    ├── settings.json
    ├── history.json
    └── user-profile.json
```

## Development vs Production

### Development Mode

```
npm run dev
     ↓
Vite Dev Server (http://localhost:5173)
     ↓
Electron loads: http://localhost:5173
     ↓
Hot Module Replacement aktiv
DevTools geöffnet
```

### Production Mode

```
npm run build
     ↓
Vite build → dist/
electron-builder → ARAC-Setup.exe
     ↓
Electron loads: dist/index.html
     ↓
Optimized, minified, bundled
```

## Security Checklist

- [x] contextIsolation: true
- [x] nodeIntegration: false
- [x] sandbox: true
- [x] webSecurity: true
- [x] Whitelisted API only
- [x] No eval() / new Function()
- [x] Input validation in Main Process
- [x] No sensitive data in Renderer
- [x] Type-safe IPC communication

## Performance Considerations

### IPC Overhead
- Async communication: ~1-5ms per call
- JSON serialization overhead
- Process boundary crossing

### Optimizations
- Batch operations where possible
- Cache frequently accessed data
- Use React Query/SWR for data fetching
- Debounce frequent updates

### Memory
- Renderer: React app memory
- Main: File system buffers
- IPC: Message queue overhead

## Error Handling Strategy

```
Error in Main Process
    ↓
IPC propagates error
    ↓
Promise rejection in Renderer
    ↓
try/catch in Component
    ↓
User notification (Toast/Modal)
```

## Testing Strategy

### Unit Tests
- Storage Manager
- IPC Handlers (mocked FS)
- React Hooks

### Integration Tests
- Full IPC flow
- File system operations
- Error handling

### E2E Tests
- Electron app launch
- User workflows
- Data persistence
