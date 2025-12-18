# useKeyboardShortcuts Hook

**Phase:** 4.2.8
**Status:** Implemented
**Location:** `/src/hooks/useKeyboardShortcuts.ts`

## Übersicht

Der `useKeyboardShortcuts` Hook verwaltet globale Tastatur-Shortcuts für die ARAC-Anwendung. Er ermöglicht schnelle Aktionen ohne Mausinteraktion.

## Features

### Implementierte Shortcuts

| Shortcut | Aktion | Beschreibung |
|----------|--------|--------------|
| `Ctrl+S` / `Cmd+S` | Speichern | Öffnet den Save-Dialog oder speichert automatisch |
| `Ctrl+N` / `Cmd+N` | Neue Mission | Setzt den Calculator zurück (mit Bestätigung) |
| `Escape` | Dialog schließen | Schließt offene Dialoge/Modals |
| `1` - `5` | Ring Count | Schnellwahl für Ring Count 0-4 |
| `0` | Ring Count 0 | Setzt Ring Count auf 0 |

### Intelligentes Verhalten

- **Input-Field Detection:** Shortcuts werden deaktiviert, wenn der Benutzer in einem Input-Feld tippt (außer Escape)
- **Platform-Aware:** Nutzt `Cmd` auf macOS und `Ctrl` auf Windows/Linux
- **Event Prevention:** Verhindert Browser-Standard-Verhalten (z.B. Speichern-Dialog)
- **Cleanup:** Automatisches Entfernen der Event Listener beim Unmount

## API

### Typen

```typescript
interface UseKeyboardShortcutsOptions {
  enabled?: boolean;           // Default: true
  onEscape?: () => void;       // Callback für Escape-Taste
  onSaveShortcut?: () => void; // Callback für Save-Shortcut
  autoSave?: boolean;          // Auto-save auf Ctrl+S (Default: false)
  defaultMissionName?: string; // Name für Auto-save (Default: "Quick Save")
}
```

### Rückgabewert

```typescript
{
  enabled: boolean;  // Aktiver Status
}
```

## Verwendung

### Basis-Integration (App.tsx)

```tsx
import { useKeyboardShortcuts } from './hooks';

function App() {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useKeyboardShortcuts({
    enabled: true,
    onEscape: () => setShowSaveDialog(false),
    onSaveShortcut: () => setShowSaveDialog(true),
  });

  return <div>...</div>;
}
```

### Auto-Save Mode

```tsx
useKeyboardShortcuts({
  enabled: true,
  autoSave: true,
  defaultMissionName: 'Auto-saved Mission',
});
```

### Conditional Shortcuts

```tsx
const [isEditMode, setIsEditMode] = useState(false);

useKeyboardShortcuts({
  enabled: !isEditMode, // Deaktiviert im Edit-Modus
  onEscape: () => setIsEditMode(false),
});
```

### Shortcut Hints anzeigen

```tsx
import { getShortcutHint } from './hooks';

function SaveButton() {
  return (
    <button>
      Save <kbd>{getShortcutHint('save')}</kbd>
    </button>
  );
}
```

## Implementierungsdetails

### Ring Count Selection

```typescript
// Ring shortcuts setzen MANUAL MODE
const handleRingShortcut = (ring: RingCount) => {
  setManualChargeOverride(ring);  // Aktiviert manuellen Modus
  setCharge(ring);                 // Setzt die Ladung
};
```

Dies bedeutet:
- User drückt `3` → Ring Count wird auf 2 gesetzt (0-indexed)
- Calculation wechselt von Auto-Mode zu Manual Mode
- UI zeigt die manuelle Auswahl an

### Save Workflow

```typescript
// 1. User drückt Ctrl+S
// 2. Hook prüft autoSave flag:
//    - true  → Speichert direkt mit Zeitstempel
//    - false → Ruft onSaveShortcut() callback auf
// 3. Callback öffnet Save-Dialog für Namen-Eingabe
```

### Input Field Detection

```typescript
const isInputField =
  target.tagName === 'INPUT' ||
  target.tagName === 'TEXTAREA' ||
  target.isContentEditable;

if (isInputField && event.key !== 'Escape') {
  return; // Shortcuts deaktiviert
}
```

## Store-Integration

Der Hook nutzt folgende Stores:

### useAppStore
- `setCharge()` - Ring Count setzen
- `reset()` - Calculator zurücksetzen
- `setManualChargeOverride()` - Manuellen Modus aktivieren

### useMissions
- `saveCurrent()` - Aktuelle Mission speichern
- `canSaveCurrent` - Prüft ob speicherbar

## Testing

### Unit Tests (`useKeyboardShortcuts.test.ts`)

```typescript
describe('useKeyboardShortcuts', () => {
  it('should trigger save on Ctrl+S', () => {
    const onSave = jest.fn();
    renderHook(() => useKeyboardShortcuts({ onSaveShortcut: onSave }));

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it('should set ring count on number press', () => {
    renderHook(() => useKeyboardShortcuts());

    fireEvent.keyDown(window, { key: '3' });
    expect(useAppStore.getState().mortarConfig.charge).toBe(2);
  });

  it('should ignore shortcuts in input fields', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    const onSave = jest.fn();
    renderHook(() => useKeyboardShortcuts({ onSaveShortcut: onSave }));

    fireEvent.keyDown(input, { key: 's', ctrlKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
test('keyboard shortcuts work end-to-end', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Set positions
  await page.click('[data-testid="map-mortar"]');
  await page.click('[data-testid="map-target"]');

  // Press 3 for ring count
  await page.keyboard.press('3');
  await expect(page.locator('[data-testid="ring-count"]')).toHaveText('2');

  // Press Ctrl+S to save
  await page.keyboard.press('Control+S');
  await expect(page.locator('[data-testid="save-dialog"]')).toBeVisible();

  // Press Escape to close
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="save-dialog"]')).not.toBeVisible();
});
```

## Performance

- **Event Listener:** Nur 1 globaler Listener
- **Callback Memoization:** useCallback für alle Handler
- **Cleanup:** Automatisch beim Unmount
- **Debouncing:** Nicht nötig, da Keyboard Events bereits debounced sind

## Browser-Kompatibilität

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Vollständig unterstützt |
| Firefox | 88+     | ✅ Vollständig unterstützt |
| Safari  | 14+     | ✅ Vollständig unterstützt |
| Edge    | 90+     | ✅ Vollständig unterstützt |

### Platform Detection

```typescript
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifier = isMac ? event.metaKey : event.ctrlKey;
```

## Accessibility

- **Keyboard-Only Navigation:** Ermöglicht vollständige Steuerung ohne Maus
- **Standard-Shortcuts:** Nutzt bekannte Shortcuts (Ctrl+S, Ctrl+N, Escape)
- **Visual Hints:** getShortcutHint() für Tooltip/Badge-Anzeige
- **Screen Readers:** Shortcuts sollten in Aria-Labels erwähnt werden

## Best Practices

### DO ✅

```typescript
// Callbacks memoizen
const handleEscape = useCallback(() => {
  closeDialog();
}, []);

useKeyboardShortcuts({ onEscape: handleEscape });
```

### DON'T ❌

```typescript
// Inline-Functions vermeiden (Re-render bei jedem Render)
useKeyboardShortcuts({
  onEscape: () => closeDialog(),  // ❌ Neu bei jedem Render
});
```

## Troubleshooting

### Problem: Shortcuts funktionieren nicht

**Lösung:**
1. Prüfe `enabled` Option
2. Prüfe ob Fokus in Input-Field ist
3. Prüfe Browser-Konsole für Event-Logs
4. Prüfe ob andere Libraries Events abfangen

### Problem: Escape schließt Dialog nicht

**Lösung:**
1. Stelle sicher `onEscape` Callback ist gesetzt
2. Prüfe ob Dialog State korrekt aktualisiert wird
3. Prüfe Event Propagation

### Problem: Ring Count wird nicht gesetzt

**Lösung:**
1. Prüfe ob useAppStore korrekt initialisiert ist
2. Prüfe DevTools → Zustand Store
3. Prüfe ob Auto-Calculate aktiv ist

## Erweiterungen

### Zukünftige Features

- [ ] **Konfigurierbare Shortcuts:** User kann Shortcuts anpassen
- [ ] **Shortcut Cheatsheet:** `?` zeigt alle Shortcuts
- [ ] **Vim-Mode:** `hjkl` für Map-Navigation
- [ ] **Multi-Key Shortcuts:** `g` → `s` = "go to stations"

### Beispiel: Custom Shortcuts

```typescript
interface CustomShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

const useCustomShortcuts = (shortcuts: CustomShortcut[]) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        if (e.key === shortcut.key &&
            e.ctrlKey === !!shortcut.ctrlKey &&
            e.shiftKey === !!shortcut.shiftKey) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
};
```

## Dependencies

- **React:** 18.x
- **Zustand:** 4.x
- **TypeScript:** 5.x

## Related Hooks

- `useCalculation` - Wird durch Ring Count Shortcuts beeinflusst
- `useMissions` - Wird durch Save Shortcut genutzt
- `useAppStore` - Store für Configuration

## Migration Guide

### Von manuellen Event Listenern

**Vorher:**
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 's' && e.ctrlKey) {
      saveMission();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**Nachher:**
```tsx
useKeyboardShortcuts({
  onSaveShortcut: saveMission,
});
```

## Changelog

### v1.0.0 (2025-12-18)
- Initial implementation
- Ctrl+S/N shortcuts
- Ring count shortcuts (1-5)
- Escape handling
- Platform-aware modifiers
- Input field detection
