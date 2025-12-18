# Electron Security Checklist

Kritische Sicherheitseinstellungen für ARAC Artillery Calculator

## Status: FULLY IMPLEMENTED

Alle kritischen Sicherheitseinstellungen sind korrekt implementiert in `electron/main.ts`.

## Critical Security Settings

### 1. Context Isolation (KRITISCH!)

```typescript
contextIsolation: true
```

**Status:** AKTIVIERT

**Was es macht:**
- Trennt Renderer Process von Node.js Context
- Renderer hat keinen direkten Zugriff auf Node.js APIs
- Verhindert XSS Attacks die Node.js ausnutzen

**Warum kritisch:**
Ohne Context Isolation kann ein XSS-Angriff im Renderer direkt Node.js APIs aufrufen und z.B.:
- Dateien lesen/schreiben
- System-Commands ausführen
- Netzwerk-Zugriff ohne Beschränkungen

**NIEMALS auf false setzen!**

### 2. Node Integration (KRITISCH!)

```typescript
nodeIntegration: false
```

**Status:** DEAKTIVIERT (korrekt!)

**Was es macht:**
- Deaktiviert Node.js APIs im Renderer
- Renderer läuft wie normale Webseite
- Keine require(), process, fs, etc. im Renderer

**Warum kritisch:**
Mit nodeIntegration: true kann jeder JavaScript-Code im Renderer:
- Dateisystem manipulieren
- Child Processes starten
- Betriebssystem-Befehle ausführen

**NIEMALS auf true setzen!**

### 3. Sandbox Mode

```typescript
sandbox: true
```

**Status:** AKTIVIERT

**Was es macht:**
- Aktiviert Chromium Sandbox
- Isoliert Renderer Process vom System
- Zusätzliche Schutzschicht gegen Privilege Escalation

**Vorteil:**
Selbst wenn ein Angreifer Code im Renderer ausführen kann, ist er durch den Sandbox eingeschränkt.

### 4. Additional Security Settings

```typescript
webSecurity: true                    // CSP und Same-Origin Policy aktiv
allowRunningInsecureContent: false   // Keine Mixed Content (HTTP in HTTPS)
experimentalFeatures: false          // Keine experimentellen Chrome-Features
```

## Sichere IPC-Kommunikation

### Preload Script mit contextBridge

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('api', {
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  // ... weitere APIs
})
```

**Wichtig:**
- Nur spezifische, validierte Funktionen exposen
- Keine generischen "eval" oder "execute" Funktionen
- Keine direkten ipcRenderer Referenzen an Renderer übergeben

### IPC Handler mit Validierung

```typescript
// electron/ipc-handlers.ts
ipcMain.handle('save-settings', async (event, settings) => {
  // IMMER Eingaben validieren!
  if (!isValidSettings(settings)) {
    throw new Error('Invalid settings data')
  }
  return await saveSettings(settings)
})
```

## Antivirus False Positives vermeiden

### DO NOT USE:
- `eval()`, `new Function()`
- `child_process` (außer für Build-Tools)
- Registry-Zugriff (Windows)
- Keyboard Hooks
- System-weite Shortcuts

### USE INSTEAD:
- Nur `app.getPath('userData')` für Dateizugriff
- Standard Electron APIs
- Keine nativen Module (außer gut bekannte wie better-sqlite3)

## Security Audit Commands

```bash
# Check für unsichere Praktiken
npm audit

# Dependency Check
npm outdated

# Security Headers prüfen (im Production Build)
# CSP, X-Frame-Options, etc.
```

## Threat Model

### Was wir verhindern:
1. **XSS Attacks** → Context Isolation + Content Security Policy
2. **Code Injection** → Node Integration disabled + Sandbox
3. **File System Access** → Nur via validierte IPC Calls
4. **Remote Code Execution** → Kein eval, kein child_process
5. **Privilege Escalation** → Sandbox Mode aktiv

### Was wir NICHT verhindern:
- Physischer Zugriff auf das System
- Debugging mit DevTools (nur in Dev Mode verfügbar)
- Manipulation des Storage-Verzeichnisses durch andere Apps

## Testing Security

### Development
```bash
# Electron Security Warnings im Console prüfen
npm run electron:dev
# → Keine Warnungen sollten erscheinen
```

### Production Build
```bash
# Build testen
npm run electron:build

# Binary testen
./dist/ARAC-*.exe  # Windows
```

## Security Checklist

- [x] contextIsolation: true
- [x] nodeIntegration: false
- [x] sandbox: true
- [x] webSecurity: true
- [x] allowRunningInsecureContent: false
- [x] Preload Script verwendet contextBridge
- [x] IPC Handler validieren alle Eingaben
- [x] Keine eval() oder new Function()
- [x] Keine hardcodierten Secrets/API Keys
- [x] Keine child_process außer Build-Tools
- [x] app.getPath('userData') für alle File Operations
- [x] DevTools nur im Development Mode

## Incident Response

Falls ein Sicherheitsproblem entdeckt wird:

1. **NICHT** einfach Settings ändern
2. Issue dokumentieren mit Reproduktion
3. Security Advisory prüfen: https://www.electronjs.org/docs/latest/tutorial/security
4. Alternativen evaluieren die Security nicht kompromittieren
5. Tests schreiben die das Problem verifizieren
6. Patch implementieren
7. Security Audit durchführen

## Referenzen

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [OWASP Electron Security](https://cheatsheetseries.owasp.org/cheatsheets/Electron_Cheat_Sheet.html)

## Kontakt

Bei Sicherheitsfragen oder -bedenken:
- Dokumentation prüfen
- Electron Security Issues: https://github.com/electron/electron/security
- Keine Sicherheitsdetails öffentlich posten!
