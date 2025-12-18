# Profile Components - ARAC Phase 5.10

Diese Components implementieren das User Profile System für ARAC.

## Komponenten

### 📦 ProfilePanel.tsx
**Hauptkomponente** - Container für alle Profile-Features

- Panel Header mit User Icon
- Integriert alle Unter-Komponenten
- Konsistentes Styling mit anderen Panels
- Platzierung in Sidebar (zwischen HistoryPanel und FAQ)

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/components/Profile/ProfilePanel.tsx
```

---

### 👤 UsernameInput.tsx
**Inline-Edit Komponente** für Benutzername

**Features:**
- Anzeige mit User Icon und Edit-Button (hover)
- Click to Edit - inline editing
- Save: Enter oder Blur
- Cancel: Escape oder Cancel-Button
- Speichert automatisch im UserStore

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/components/Profile/UsernameInput.tsx
```

---

### 📊 ProfileStats.tsx
**Statistik-Anzeige** - Zeigt User-Statistiken

**Anzeigt:**
- Anzahl gespeicherter Missionen (aus MissionsStore)
- Anzahl berechneter Schüsse (aus UserProfile.statistics)
- Anzahl gespeicherter Stellungen (aus StationsStore)

**Layout:**
- Grid mit 3 Cards
- Jede Card: Icon + Label + Wert
- Farbcodiert (amber, red, blue)

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/components/Profile/ProfileStats.tsx
```

---

### ⬇️ ProfileExport.tsx
**Export-Funktion** - Profil als JSON herunterladen

**Features:**
- Button mit Download Icon
- Sammelt Daten aus allen Stores:
  - UserProfile
  - AppSettings
  - Missions
  - Stations
  - History
- Generiert JSON-Blob
- Löst Browser-Download aus
- Dateiname: `arac-{username}-{timestamp}.json`

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/components/Profile/ProfileExport.tsx
```

---

### ⬆️ ProfileImport.tsx
**Import-Funktion** - Profil aus JSON laden

**Features:**
- File Input (versteckt, als Button gestylt)
- JSON Validierung
- Bestätigungs-Dialog mit Vorschau
- Warnung: Daten werden überschrieben
- Importiert in alle Stores über Electron API
- Reload der Stores nach Import
- Fehlerbehandlung

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/components/Profile/ProfileImport.tsx
```

---

## Integration

### App.tsx
ProfilePanel wurde in die Sidebar eingefügt:

```tsx
import { ProfilePanel } from './components/Profile'

<Sidebar>
  {/* ... andere Panels */}
  <HistoryPanel />
  <ProfilePanel />  // <- NEU
  <FAQ />
</Sidebar>
```

**Dateipfad:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/App.tsx
```

---

## i18n Strings

### Hinzugefügte Strings in beiden Sprachen (de.json / en.json):

**Dateipfade:**
```
/Users/jann/Desktop/Armar Refroger Mörser/src/i18n/locales/de.json
/Users/jann/Desktop/Armar Refroger Mörser/src/i18n/locales/en.json
```

**Neue Section:**
```json
"profile": {
  "title": "Profil" / "Profile",
  "username": "Benutzername" / "Username",
  "usernamePlaceholder": "Dein Name..." / "Your name...",
  "editUsername": "Namen bearbeiten" / "Edit name",
  "statistics": "Statistiken" / "Statistics",
  "missions": "Missionen" / "Missions",
  "shots": "Schüsse" / "Shots",
  "stations": "Stellungen" / "Stations",
  "totalMissions": "Gespeicherte Missionen" / "Saved Missions",
  "totalShots": "Berechnete Schüsse" / "Calculated Shots",
  "totalStations": "Gespeicherte Stellungen" / "Saved Stations",
  "export": "Profil exportieren" / "Export Profile",
  "import": "Profil importieren" / "Import Profile",
  "exportDesc": "Alle Daten als JSON herunterladen" / "Download all data as JSON",
  "importDesc": "Daten aus JSON-Datei laden" / "Load data from JSON file",
  "importWarning": "Achtung: Vorhandene Daten werden überschrieben!" / "Warning: Existing data will be overwritten!",
  "importSuccess": "Profil erfolgreich importiert" / "Profile imported successfully",
  "importError": "Fehler beim Import" / "Import error",
  "invalidFile": "Ungültige Datei" / "Invalid file",
  "selectFile": "Datei auswählen" / "Select file",
  "dataManagement": "Datenverwaltung" / "Data Management",
  "noProfile": "Kein Profil vorhanden" / "No profile available",
  "createProfile": "Profil erstellen" / "Create Profile"
}
```

---

## Verwendete Stores

### useUserStore
- `userProfile` - Profil mit Name und Statistiken
- `settings` - App-Einstellungen
- `saveUserProfile()` - Profil speichern
- `saveSettings()` - Einstellungen speichern

### useMissionsStore
- `missions` - Array aller Missionen
- `loadMissions()` - Missionen neu laden

### useStationsStore
- `stations` - Array aller Stellungen
- `loadStations()` - Stellungen neu laden

### useHistoryStore
- `history` - Array aller History-Einträge
- `loadHistory()` - History neu laden

---

## Verwendete Icons (Lucide)

- `User` - Profil/Username
- `Edit2` - Edit-Button
- `Check` - Save
- `X` - Cancel
- `Target` - Missions
- `Crosshair` - Shots
- `MapPin` - Stations
- `Download` - Export
- `Upload` - Import
- `AlertTriangle` - Import Warning

---

## Export/Import Format

### Export Struktur (JSON)

```typescript
interface ExportData {
  version: string              // "1.0.0"
  exportDate: string           // ISO timestamp
  profile: UserProfile | null
  settings: AppSettings
  missions: FireMission[]
  stations: MortarStation[]
  history: HistoryEntry[]
}
```

### Import Validierung

- Prüft ob JSON gültig ist
- Prüft ob mindestens eine Sektion vorhanden ist
- Zeigt Vorschau vor Import
- Warnt vor Überschreiben

---

## Styling

- **Theme:** Dark (TailwindCSS)
- **Konsistent mit:** MissionPanel, StationPanel, HistoryPanel
- **Panel Header:** `bg-gray-800/50 rounded-lg border border-gray-700`
- **Cards:** `bg-gray-700/50 rounded-lg border border-gray-600/50`
- **Buttons:** Primary Blue für Export, Secondary Gray für Import

---

## Testing Checklist

- [ ] Username bearbeiten und speichern
- [ ] Statistiken werden korrekt angezeigt
- [ ] Export erstellt gültiges JSON
- [ ] Import lädt Daten korrekt
- [ ] Import-Dialog zeigt Warnung
- [ ] Import Cancel funktioniert
- [ ] i18n Strings in beiden Sprachen
- [ ] Icons werden angezeigt
- [ ] Responsive Layout

---

## Phase 5.10 - Abgeschlossen

Alle Tasks wurden implementiert:

- ✅ 5.10.1 ProfilePanel.tsx
- ✅ 5.10.2 UsernameInput (editierbar)
- ✅ 5.10.3 ProfileStats (Statistik-Anzeige)
- ✅ 5.10.4 ProfileExport (JSON Download)
- ✅ 5.10.5 ProfileImport (JSON Upload mit Validierung)
- ✅ i18n Strings (de + en)
- ✅ Integration in App.tsx
- ✅ Barrel Index (index.ts)
