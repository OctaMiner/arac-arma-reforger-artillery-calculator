# Layout Components - Quick Reference

## Import

```tsx
import { Header, Sidebar, MainContent, ResultsBar } from './components/Layout'
```

## Header

```tsx
<Header onSettingsClick={() => console.log('Settings')} />
```

**Props:**
- `onSettingsClick?: () => void` - Callback für Settings-Button

**Features:**
- Logo "ARAC" mit Subtitle
- Map-Selector (disabled, Phase 5.3)
- Settings-Button mit Icon

---

## Sidebar

```tsx
<Sidebar>
  <div>Your config panels here</div>
</Sidebar>
```

**Props:**
- `children: React.ReactNode` - Inhalt der Sidebar

**Features:**
- Fixe Breite: 320px
- Auto-Scroll bei langem Content
- Padding und Spacing integriert

---

## MainContent

```tsx
<MainContent>
  <div>Your map here</div>
</MainContent>
```

**Props:**
- `children: React.ReactNode` - Inhalt des Main-Bereichs

**Features:**
- Nimmt restlichen Platz (flex-1)
- Relative Positionierung
- Overflow hidden

---

## ResultsBar

```tsx
<ResultsBar />
```

**Props:** Keine (nutzt useAppStore direkt)

**Store Dependencies:**
- `useAppStore.fireSolution` - Fire Solution Daten
- `useAppStore.isCalculating` - Loading State
- `useAppStore.error` - Error Message

**Displays:**
- Azimuth (MIL) - Blue
- Elevation (MIL) - Green
- Flight Time (sec) - Yellow
- Distance (m) - White
- In-Range Indicator - Green/Red Dot
- Error Messages

**Features:**
- Fixed am unteren Rand
- Große, lesbare Zahlen
- Loading Animation (pulse)
- Error Display
- Zero-padded Numbers

---

## Layout Structure

```tsx
function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header onSettingsClick={handleSettings} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          {/* Config Components */}
        </Sidebar>

        <MainContent>
          {/* Map Component */}
        </MainContent>
      </div>

      <ResultsBar />
    </div>
  )
}
```

---

## Styling

All components use TailwindCSS with custom colors:

```css
Primary BG:   #1a1a2e
Secondary BG: #16213e
Border:       border-gray-700
Text:         text-white, text-gray-400
```

---

## TypeScript

All components are fully typed:
- Props interfaces defined
- React.ReactNode for children
- Optional callbacks with ?

---

## Performance

- ResultsBar uses Zustand selectors (no unnecessary re-renders)
- Sidebar with overflow-y-auto (virtual scrolling later)
- Memoization ready (add React.memo if needed)

---

## Customization

### Header
Change logo, add more buttons, modify map selector

### Sidebar
Adjust width (currently w-80 = 320px)

### ResultsBar
Modify displayed values, add more metrics

---

## Next Steps (Phase 5.2)

1. Create Config Components
2. Add to Sidebar
3. Connect to useAppStore

---

**Created:** 2025-12-15
**Phase:** 5.1 Layout Components
