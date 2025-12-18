# ARAC Keyboard Shortcuts

Schnelle Referenz für alle verfügbaren Tastatur-Shortcuts in ARAC (Arma Reforger Artillery Calculator).

## Übersicht

| Shortcut | Aktion | Beschreibung |
|----------|--------|--------------|
| `Ctrl+S` / `⌘+S` | Speichern | Öffnet den Save-Dialog für aktuelle Mission |
| `Ctrl+N` / `⌘+N` | Neue Mission | Setzt Calculator zurück (mit Bestätigung) |
| `Escape` | Schließen | Schließt offene Dialoge/Modals |
| `1` - `5` | Ring Count | Schnellwahl für Ring Count 0-4 |
| `0` | Ring Count 0 | Setzt Ring Count auf 0 |

## Detaillierte Beschreibung

### Speichern (Ctrl+S / ⌘+S)

Öffnet den Save-Dialog, um die aktuelle Fire Solution als Mission zu speichern.

**Voraussetzungen:**
- Mörser-Position gesetzt
- Ziel-Position gesetzt
- Fire Solution berechnet

**Hinweis:** Auf macOS wird `⌘+S` (Command+S) verwendet, auf Windows/Linux `Ctrl+S`.

### Neue Mission (Ctrl+N / ⌘+N)

Setzt den Calculator vollständig zurück und startet eine neue Mission.

**Warnung:** Es erscheint eine Bestätigung, da ungespeicherte Änderungen verloren gehen.

**Was wird zurückgesetzt:**
- Mörser-Position
- Ziel-Position
- Fire Solution
- Wind-Daten
- Manual Charge Override

**Was bleibt erhalten:**
- Mörser-Typ
- Munitions-Typ
- Grid-Einstellung
- Gespeicherte Missionen
- Stations

### Dialog schließen (Escape)

Schließt den aktuell geöffneten Dialog oder Modal.

**Funktioniert für:**
- Save Mission Dialog
- Delete Confirmation
- Settings Dialog
- Alle anderen Dialoge

**Besonderheit:** Funktioniert auch wenn der Fokus in einem Input-Feld ist.

### Ring Count Auswahl (1-5, 0)

Schnelle Auswahl der Ring Count (Ladung) ohne Mausklick.

**Zuordnung:**
- `1` → Ring Count 0
- `2` → Ring Count 1
- `3` → Ring Count 2
- `4` → Ring Count 3
- `5` → Ring Count 4
- `0` → Ring Count 0

**Wichtig:**
- Aktiviert automatisch den **Manual Mode**
- Deaktiviert Auto-Charge-Berechnung
- Neue Berechnung wird automatisch ausgelöst

**Beispiel:**
```
User drückt '3'
→ Ring Count wird auf 2 gesetzt
→ Manual Mode wird aktiviert
→ Fire Solution wird neu berechnet
→ UI zeigt manuelle Auswahl an
```

## Intelligentes Verhalten

### Input Field Detection

Shortcuts (außer Escape) werden automatisch deaktiviert, wenn Sie in einem Input-Feld tippen.

**Funktioniert in:**
- `<input>` Feldern
- `<textarea>` Feldern
- ContentEditable Elementen

**Beispiel:**
```
✅ Sie tippen in "Mission Name" Input
→ '1' gibt '1' ein, setzt NICHT Ring Count

❌ Sie sind auf der Karte
→ '1' setzt Ring Count auf 0
```

### Platform-Aware

Die Shortcuts passen sich automatisch an Ihr Betriebssystem an:

| Betriebssystem | Modifier | Beispiel |
|----------------|----------|----------|
| macOS          | `⌘` (Command) | `⌘+S` |
| Windows        | `Ctrl` | `Ctrl+S` |
| Linux          | `Ctrl` | `Ctrl+S` |

### Event Prevention

Alle Shortcuts verhindern das Standard-Browser-Verhalten:

- `Ctrl+S` öffnet NICHT den Browser-Save-Dialog
- `Ctrl+N` öffnet NICHT ein neues Browser-Fenster
- Zahlen scrollen NICHT die Seite

## UI-Integration

### Shortcut Hints anzeigen

Komponenten können Shortcut-Hints anzeigen:

```tsx
import { getShortcutHint } from './hooks';

function SaveButton() {
  return (
    <button title={`Save (${getShortcutHint('save')})`}>
      <Save className="w-4 h-4" />
      <span className="ml-2">Save</span>
      <kbd className="ml-auto">{getShortcutHint('save')}</kbd>
    </button>
  );
}
```

### Verfügbare Hints

```typescript
getShortcutHint('save')   // "Ctrl+S" oder "Cmd+S"
getShortcutHint('new')    // "Ctrl+N" oder "Cmd+N"
getShortcutHint('escape') // "Esc"
getShortcutHint('ring0')  // "0"
getShortcutHint('ring1')  // "1"
getShortcutHint('ring2')  // "2"
getShortcutHint('ring3')  // "3"
getShortcutHint('ring4')  // "4"
```

## Accessibility

### Keyboard-Only Navigation

Mit diesen Shortcuts kann die gesamte Anwendung ohne Maus bedient werden:

1. **Tab** - Zwischen Elementen navigieren
2. **1-5** - Ring Count wählen
3. **Enter** - Berechnung starten (wenn fokussiert)
4. **Ctrl+S** - Mission speichern
5. **Escape** - Dialog schließen
6. **Ctrl+N** - Neue Mission

### Screen Reader Support

Alle Shortcuts sollten in Aria-Labels erwähnt werden:

```tsx
<button aria-label="Save mission (Ctrl+S)">
  Save
</button>
```

## Troubleshooting

### Problem: Shortcuts funktionieren nicht

**Mögliche Ursachen:**

1. **Fokus in Input-Feld**
   - Lösung: Klicken Sie außerhalb des Input-Feldes oder drücken Sie Tab

2. **Browser Extension blockiert**
   - Lösung: Deaktivieren Sie Browser-Extensions die Shortcuts abfangen

3. **Anderes Modal ist offen**
   - Lösung: Schließen Sie alle Dialoge mit Escape

### Problem: Ring Count wird nicht gesetzt

**Mögliche Ursachen:**

1. **Auto-Calculate ist deaktiviert**
   - Lösung: Aktivieren Sie Auto-Calculate in den Settings

2. **Store-Fehler**
   - Lösung: Öffnen Sie DevTools → Console und prüfen Sie auf Fehler

### Problem: Escape schließt Dialog nicht

**Mögliche Ursachen:**

1. **Dialog ist nicht registriert**
   - Lösung: Prüfen Sie dass der Dialog `onEscape` Callback nutzt

2. **Event wird abgefangen**
   - Lösung: Prüfen Sie Event Propagation in DevTools

## Best Practices

### DO ✅

- Nutzen Sie Shortcuts für häufige Aktionen
- Zeigen Sie Shortcut-Hints in der UI
- Testen Sie Shortcuts auf verschiedenen Betriebssystemen
- Dokumentieren Sie Custom-Shortcuts

### DON'T ❌

- Überschreiben Sie keine Standard-Browser-Shortcuts
- Verwenden Sie keine komplexen Multi-Key-Kombinationen
- Vergessen Sie nicht die Input-Field-Detection
- Ignorieren Sie nicht die Platform-Unterschiede

## Zukünftige Erweiterungen

Geplante Features für zukünftige Versionen:

- [ ] **Cheatsheet:** `?` zeigt Shortcuts-Overlay
- [ ] **Custom Shortcuts:** User kann Shortcuts anpassen
- [ ] **Vim-Mode:** `hjkl` für Map-Navigation
- [ ] **Multi-Key:** `g` → `s` = "go to stations"
- [ ] **Quick Actions:** `q` öffnet Quick-Action-Menu

## Feedback

Haben Sie Vorschläge für weitere Shortcuts?
Öffnen Sie ein Issue auf GitHub oder kontaktieren Sie das Team.

---

**Version:** 1.0.0
**Letzte Aktualisierung:** 2025-12-18
**Status:** Produktiv
