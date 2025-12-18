# ARAC Electron Architecture

Übersicht der Electron-Architektur für ARAC Artillery Calculator

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ELECTRON APP                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │   MAIN PROCESS  │        │ RENDERER PROCESS │            │
│  │   (Node.js)     │◄──────►│   (Chromium)     │            │
│  │                 │  IPC   │                  │            │
│  │  electron/      │        │  React + Vite    │            │
│  │  - main.ts      │        │  src/            │            │
│  │  - ipc-handlers │        │  - components/   │            │
│  │  - storage/     │        │  - lib/          │            │
│  └─────────────────┘        └─────────────────┘            │
│         │                            ▲                       │
│         │                            │                       │
│         │                    ┌───────┴───────┐              │
│         │                    │ PRELOAD SCRIPT│              │
│         │                    │ electron/     │              │
│         │                    │ - preload.ts  │              │
│         │                    └───────────────┘              │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────┐                                        │
│  │  FILE SYSTEM    │                                        │
│  │  userData/      │                                        │
│  │  - settings     │                                        │
│  │  - missions     │                                        │
│  │  - stations     │                                        │
│  │  - history      │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## Process Communication Flow

### Main Process → Renderer (via Preload)

```
RENDERER CODE                PRELOAD SCRIPT              MAIN PROCESS
─────────────                ──────────────              ────────────

window.api.loadSettings()
    │
    └──► ipcRenderer.invoke()
              │
              └──► IPC Channel
                      │
                      └──► ipcMain.handle()
                              │
                              └──► loadSettings()
                                      │
                                      └──► fs.readFile()
                                              │
                                              └──► Return Data
```

### Security Boundaries

```
┌──────────────────────────────────────────────────────────┐
│                     SECURITY MODEL                        │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  RENDERER (Sandboxed)                                     │
│  ┌────────────────────────────────────────────────┐      │
│  │ • No Node.js APIs                              │      │
│  │ • No file system access                        │      │
│  │ • Only window.api exposed by preload           │      │
│  │ • Runs in Chromium sandbox                     │      │
│  └────────────────────────────────────────────────┘      │
│                        ▲                                   │
│                        │ contextBridge                     │
│                        │ (secure boundary)                 │
│  PRELOAD (Bridge)      ▼                                   │
│  ┌────────────────────────────────────────────────┐      │
│  │ • Access to both contexts                      │      │
│  │ • Exposes validated API                        │      │
│  │ • No direct access to ipcRenderer              │      │
│  └────────────────────────────────────────────────┘      │
│                        ▲                                   │
│                        │ IPC                               │
│                        │                                   │
│  MAIN PROCESS          ▼                                   │
│  ┌────────────────────────────────────────────────┐      │
│  │ • Full Node.js access                          │      │
│  │ • File system operations                       │      │
│  │ • System APIs                                  │      │
│  │ • Validates all IPC requests                   │      │
│  └────────────────────────────────────────────────┘      │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## File Structure

```
armar-refroger-morser/
├── electron/
│   ├── main.ts              # Main Process Entry Point
│   ├── preload.ts           # Preload Script (Bridge)
│   ├── ipc-handlers.ts      # IPC Handler Registration
│   └── storage/             # Storage Implementation
│       ├── settings.ts
│       ├── missions.ts
│       ├── stations.ts
│       ├── history.ts
│       └── user-profile.ts
│
├── src/                     # Renderer Process
│   ├── components/          # React Components
│   ├── lib/                 # Business Logic
│   ├── hooks/               # React Hooks
│   └── types/               # TypeScript Types
│
├── dist-electron/           # Built Electron Code
│   ├── main.js
│   └── preload.js
│
├── dist/                    # Built Renderer Code
│   └── index.html
│
└── public/
    └── icons/               # App Icons
```

## Data Flow

### Settings Example

```
USER ACTION
    │
    ├─► "Save Settings" Button Clicked
    │
    ▼
REACT COMPONENT
    │
    ├─► await window.api.saveSettings(settings)
    │
    ▼
PRELOAD SCRIPT
    │
    ├─► ipcRenderer.invoke('save-settings', settings)
    │
    ▼
IPC CHANNEL
    │
    ├─► Event: 'save-settings'
    │
    ▼
MAIN PROCESS HANDLER
    │
    ├─► Validate settings data
    ├─► Generate file path
    ├─► Write to userData directory
    │
    ▼
FILE SYSTEM
    │
    ├─► %APPDATA%/ARAC/settings.json
    │
    ▼
RETURN RESULT
    │
    └─► Success/Error back to React
```

## Storage Architecture

```
USER DATA DIRECTORY
├── settings.json
├── user-profile.json
├── missions.json
├── stations.json
├── history.json
└── logs/
    └── app.log

Windows: %APPDATA%/ARAC/
macOS:   ~/Library/Application Support/ARAC/
Linux:   ~/.config/ARAC/
```

## Build Process

### Development Mode

```
1. Vite Dev Server starts (Port 5173)
2. Electron Main Process starts
3. Main Process loads http://localhost:5173
4. Hot Module Replacement active
5. DevTools open automatically
```

### Production Build

```
1. Vite builds React app → dist/
2. Electron builds main.ts → dist-electron/
3. electron-builder packages everything
4. Creates installer/portable executable
```

## Process Lifecycle

```
APP START
    │
    ├─► app.whenReady()
    │
    ├─► initStorage()         # Create userData directory
    │
    ├─► setupIpcHandlers()    # Register IPC handlers
    │
    ├─► createWindow()        # Create BrowserWindow
    │
    ├─► Load Renderer         # Load React app
    │
    ▼
APP RUNNING
    │
    ├─► User Interactions
    ├─► IPC Communication
    ├─► Storage Operations
    │
    ▼
APP SHUTDOWN
    │
    ├─► window-all-closed
    │
    ├─► Cleanup (if needed)
    │
    └─► app.quit()
```

## Window States

```
INITIAL STATE
    │
    ├─► createWindow()
    │       • Size: 1400x900
    │       • Position: Centered
    │       • Visible: true
    │
    ▼
USER INTERACTIONS
    │
    ├─► Resize (min: 1024x768)
    ├─► Move
    ├─► Minimize
    ├─► Maximize
    │
    ▼
WINDOW CLOSED
    │
    ├─► mainWindow = null
    │
    └─► app.quit() (Windows/Linux)
        or
        App keeps running (macOS)
```

## IPC Channels

### Implemented in Phase 3.1

```
CHANNEL NAME              DIRECTION       PURPOSE
─────────────────────────────────────────────────────────
get-app-version          Main → Renderer  Get Electron version
get-app-path             Main → Renderer  Get app paths
```

### To be implemented in Phase 3.2

```
CHANNEL NAME              DIRECTION       PURPOSE
─────────────────────────────────────────────────────────
load-settings            Main ← Renderer  Load settings.json
save-settings            Main ← Renderer  Save settings.json

load-missions            Main ← Renderer  Load missions.json
save-mission             Main ← Renderer  Save single mission
update-mission           Main ← Renderer  Update mission
delete-mission           Main ← Renderer  Delete mission

load-stations            Main ← Renderer  Load stations.json
save-station             Main ← Renderer  Save single station
delete-station           Main ← Renderer  Delete station

get-history              Main ← Renderer  Get calculation history
add-history              Main ← Renderer  Add history entry
clear-history            Main ← Renderer  Clear all history

load-user-profile        Main ← Renderer  Load user profile
save-user-profile        Main ← Renderer  Save user profile
```

## Security Layers

```
LAYER 1: Sandbox
    └─► Chromium sandbox isolates renderer from system

LAYER 2: Context Isolation
    └─► Separate JavaScript contexts prevent direct access

LAYER 3: Node Integration Disabled
    └─► No Node.js APIs in renderer

LAYER 4: Preload API Whitelist
    └─► Only specific functions exposed to renderer

LAYER 5: IPC Validation
    └─► All inputs validated in main process handlers

LAYER 6: File System Restrictions
    └─► Only userData directory accessible
```

## Performance Considerations

### Main Process
- Single-threaded event loop
- Heavy operations should be async
- File I/O is async (fs.promises)

### Renderer Process
- React rendering optimizations
- Memoization for expensive calculations
- Virtual scrolling for large lists

### IPC Communication
- Avoid sending large data frequently
- Use debouncing for user input
- Cache data in renderer when possible

## Debugging

### Development
```bash
# Main Process logs
console.log() → Terminal

# Renderer Process logs
console.log() → DevTools Console
```

### Production
```bash
# Main Process logs
→ userData/logs/app.log

# Renderer Process
→ No console available
→ Use remote logging if needed
```

## References

- [Electron Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
