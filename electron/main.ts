import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { initStorage } from './storage'
import { setupIpcHandlers } from './ipc-handlers'

// ESM-Kompatibilität: __dirname ist in ES Modules nicht verfügbar
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

/**
 * Prüft ob die App im Development Mode läuft
 */
function isDevelopment(): boolean {
  return !app.isPackaged || process.env.NODE_ENV === 'development'
}

/**
 * Erstellt das Hauptfenster der Anwendung
 *
 * Task 3.1.1: main.ts Grundstruktur
 * Task 3.1.2: BrowserWindow Konfiguration
 * Task 3.1.3: Security - contextIsolation = true
 * Task 3.1.4: Security - nodeIntegration = false
 * Task 3.1.5: Preload Script Setup
 * Task 3.1.6: DevTools nur im Dev-Mode
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    // Task 3.1.2: Fenstergröße und -einstellungen
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'ARAC - Artillery Calculator',
    backgroundColor: '#1a1a2e',

    // Frame-Einstellungen: true = Standard OS Frame mit Minimize/Maximize/Close
    frame: true,

    // Icon-Pfad (wird in Phase 3.1 finalisiert)
    // icon: path.join(__dirname, '../public/icons/icon.png'),

    webPreferences: {
      // Task 3.1.5: Preload Script
      preload: path.join(__dirname, 'preload.js'),

      // Task 3.1.3 & 3.1.4: KRITISCHE SICHERHEITSEINSTELLUNGEN
      // Diese Einstellungen schützen vor XSS und Code Injection
      contextIsolation: true,    // MUSS true sein! Trennt Renderer von Node Context
      nodeIntegration: false,    // MUSS false sein! Verhindert Node.js APIs im Renderer
      sandbox: true,             // Aktiviert Chromium Sandbox für zusätzliche Sicherheit

      // Weitere Sicherheitseinstellungen
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  })

  // Load the app
  if (isDevelopment()) {
    // Task 3.1.6: DevTools nur im Development Mode
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools()
  } else {
    // Production: Lade gebaute HTML Datei
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Window Event Handler
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  // Initialize storage directory
  await initStorage()

  // Setup IPC handlers
  setupIpcHandlers()

  // Create main window
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers sind in ./ipc-handlers.ts definiert
// Storage-System in ./storage.ts und ./storage/*.ts
