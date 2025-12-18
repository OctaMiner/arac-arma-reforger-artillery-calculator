# Electron Main Process Setup

Dokumentation für Phase 3.1 - Electron Main Process Setup

## Übersicht

Der Electron Main Process ist in `electron/main.ts` implementiert und steuert die Desktop-Anwendung.

## Implementierte Features

### Task 3.1.1: main.ts Grundstruktur

```typescript
// electron/main.ts
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { initStorage } from './storage'
import { setupIpcHandlers } from './ipc-handlers'
```

**Komponenten:**
- `app`: Electron Application Lifecycle
- `BrowserWindow`: Fenster-Management
- `initStorage()`: Initialisiert Storage-System beim App-Start
- `setupIpcHandlers()`: Registriert IPC Handler für Renderer Communication

### Task 3.1.2: BrowserWindow Konfiguration

```typescript
mainWindow = new BrowserWindow({
  width: 1400,          // Standard-Breite
  height: 900,          // Standard-Höhe
  minWidth: 1024,       // Minimum Breite
  minHeight: 768,       // Minimum Höhe
  title: 'ARAC - Artillery Calculator',
  backgroundColor: '#1a1a2e',  // Verhindert weißen Flash beim Laden
  frame: true,          // Standard OS Frame mit Window Controls
})
```

**Begründung der Werte:**
- `1400x900`: Optimal für Artillery Calculator UI mit Map + Controls
- `minWidth: 1024, minHeight: 768`: Minimum für lesbare UI ohne Scrolling
- `backgroundColor`: Matcht Dark Theme, verhindert Flash beim Laden
- `frame: true`: Native Window Controls (Minimize/Maximize/Close)

### Task 3.1.3 & 3.1.4: Security Settings (KRITISCH!)

```typescript
webPreferences: {
  contextIsolation: true,    // MUSS true sein!
  nodeIntegration: false,    // MUSS false sein!
  sandbox: true,             // Zusätzliche Sicherheit
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false
}
```

**Sicherheitsmodell:**

1. **contextIsolation: true**
   - Trennt Renderer Process von Node.js Context
   - Renderer kann nicht direkt auf Node.js APIs zugreifen
   - Verhindert XSS Attacks die Node.js ausnutzen

2. **nodeIntegration: false**
   - Deaktiviert Node.js APIs im Renderer
   - Renderer läuft wie normale Webseite
   - Zusätzlicher Schutz gegen Code Injection

3. **sandbox: true**
   - Aktiviert Chromium Sandbox
   - Isoliert Renderer Process vom System
   - Schützt vor Privilege Escalation

**WARNUNG:** Diese Einstellungen NIEMALS ändern! Sicherheitsrisiko!

### Task 3.1.5: Preload Script Setup

```typescript
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
}
```

- Preload Script läuft VOR Renderer Code
- Hat Zugriff auf Node.js UND Renderer Context
- Verwendet `contextBridge` um sichere API zu exposen
- Implementation in `electron/preload.ts`

### Task 3.1.6: DevTools nur im Dev-Mode

```typescript
function isDevelopment(): boolean {
  return !app.isPackaged || process.env.NODE_ENV === 'development'
}

if (isDevelopment()) {
  mainWindow.loadURL('http://localhost:5173')
  mainWindow.webContents.openDevTools()
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}
```

**DevTools Logik:**
- `!app.isPackaged`: True wenn mit `electron .` gestartet (Development)
- `process.env.NODE_ENV === 'development'`: Zusätzlicher Check für Vite Dev Server
- DevTools öffnen sich automatisch nur im Development Mode
- Production Build hat keine DevTools

## App Lifecycle

```typescript
app.whenReady().then(async () => {
  await initStorage()      // 1. Storage initialisieren
  setupIpcHandlers()       // 2. IPC Handler registrieren
  createWindow()           // 3. Fenster erstellen
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()             // Windows/Linux: App beenden
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()         // macOS: Fenster neu erstellen bei Dock-Click
  }
})
```

**Platform-spezifisches Verhalten:**
- **macOS**: App läuft weiter auch wenn alle Fenster geschlossen
- **Windows/Linux**: App beendet sich wenn letztes Fenster geschlossen wird

## Icon Setup

**Status:** Vorbereitet, aber noch nicht aktiviert

```typescript
// Auskommentiert in main.ts:
// icon: path.join(__dirname, '../public/icons/icon.png'),
```

**Icon-Struktur:**
```
public/icons/
├── README.md          # Icon-Dokumentation
├── icon.ico          # Windows Icon (noch nicht vorhanden)
├── icon.icns         # macOS Icon (noch nicht vorhanden)
└── icon.png          # Fallback PNG (noch nicht vorhanden)
```

Siehe `public/icons/README.md` für Icon-Anforderungen.

## Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| URL | http://localhost:5173 | file://dist/index.html |
| DevTools | Automatisch geöffnet | Nicht verfügbar |
| Hot Reload | Ja (via Vite) | Nein |
| Source Maps | Ja | Optional |

## Testen

**Development Mode:**
```bash
npm run electron:dev
```

**Production Build:**
```bash
npm run electron:build
```

## Troubleshooting

### Problem: "contextIsolation" Warnung
**Lösung:** Bereits korrekt konfiguriert (true)

### Problem: DevTools öffnen sich nicht
**Lösung:** Prüfe ob `!app.isPackaged` true ist

### Problem: White Flash beim Laden
**Lösung:** Bereits gelöst durch `backgroundColor: '#1a1a2e'`

### Problem: Icon wird nicht angezeigt
**Lösung:** Icons noch nicht erstellt, siehe `public/icons/README.md`

## Nächste Schritte (Phase 3.2)

1. IPC Handler für Settings implementieren
2. IPC Handler für Missions implementieren
3. IPC Handler für Stations implementieren
4. IPC Handler für History implementieren
5. IPC Handler für User Profile implementieren

## Sicherheits-Checkliste

- [x] contextIsolation: true
- [x] nodeIntegration: false
- [x] sandbox: true
- [x] webSecurity: true
- [x] allowRunningInsecureContent: false
- [x] Preload Script verwendet contextBridge
- [x] Keine eval() oder new Function() im Code
- [x] Keine hardcodierten Secrets

## Referenzen

- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [contextIsolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Preload Scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)
