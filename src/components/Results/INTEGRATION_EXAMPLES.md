# Results Components - Integration Examples

Verschiedene Möglichkeiten, die Results Components in die App zu integrieren.

## Aktueller Stand

Die App nutzt derzeit `ResultsBar` für eine kompakte, horizontale Anzeige am unteren Rand der Karte.

```tsx
// App.tsx (aktuell)
<MainContent>
  <div className="flex-1 relative overflow-hidden">
    <MapView />
  </div>
  <ResultsBar />
</MainContent>
```

## Integration-Optionen für FireSolutionPanel

### Option 1: Als Modal/Dialog (Empfohlen)

Zeige die detaillierte Ansicht bei Bedarf als Overlay.

```tsx
import { FireSolutionPanel } from './components/Results';
import { useState } from 'react';

function App() {
  const [showDetailedView, setShowDetailedView] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar>
        <ConfigPanel />
        {/* Button zum Öffnen der Detail-Ansicht */}
        <button onClick={() => setShowDetailedView(true)}>
          Show Detailed Fire Solution
        </button>
      </Sidebar>

      <MainContent>
        <MapView />
        <ResultsBar />
      </MainContent>

      {/* Modal mit FireSolutionPanel */}
      {showDetailedView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-primary w-4/5 h-4/5 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-mono font-bold text-text-primary">
                Fire Solution Details
              </h2>
              <button
                onClick={() => setShowDetailedView(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>
            <FireSolutionPanel />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Option 2: Als Tabbed View

Wechsel zwischen Karte und Detail-Ansicht.

```tsx
function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'details'>('map');

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar>
        <ConfigPanel />
      </Sidebar>

      <MainContent>
        {/* Tab Header */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('map')}
            className={activeTab === 'map' ? 'active' : ''}
          >
            Map View
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={activeTab === 'details' ? 'active' : ''}
          >
            Fire Solution
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' ? (
          <>
            <div className="flex-1 relative overflow-hidden">
              <MapView />
            </div>
            <ResultsBar />
          </>
        ) : (
          <FireSolutionPanel />
        )}
      </MainContent>
    </div>
  );
}
```

### Option 3: Als Split View (Große Bildschirme)

Zeige Karte und Details nebeneinander.

```tsx
function App() {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar>
        <ConfigPanel />
      </Sidebar>

      <MainContent>
        <div className="flex-1 flex">
          {/* Map - 60% */}
          <div className="w-3/5 flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <MapView />
            </div>
            <ResultsBar />
          </div>

          {/* Fire Solution - 40% */}
          <div className="w-2/5 border-l-2 border-border">
            <FireSolutionPanel />
          </div>
        </div>
      </MainContent>
    </div>
  );
}
```

### Option 4: Als Popover (Hover/Click)

Zeige Details bei Click auf ResultsBar.

```tsx
import { useState, useRef } from 'react';

function App() {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar>
        <ConfigPanel />
      </Sidebar>

      <MainContent>
        <div className="flex-1 relative overflow-hidden">
          <MapView />
        </div>

        {/* ResultsBar mit Click Handler */}
        <div onClick={() => setShowPopover(!showPopover)}>
          <ResultsBar />
        </div>

        {/* Popover */}
        {showPopover && (
          <div className="absolute bottom-20 right-4 w-[800px] h-[600px] bg-bg-primary border-2 border-accent-blue rounded-lg shadow-2xl">
            <FireSolutionPanel />
          </div>
        )}
      </MainContent>
    </div>
  );
}
```

### Option 5: Als Print View

Exportiere Fire Solution für Druck/PDF.

```tsx
import { useRef } from 'react';
import { FireSolutionPanel } from './components/Results';

function PrintableFiringSolution() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  return (
    <>
      <button onClick={handlePrint}>Print Fire Mission</button>

      <div ref={printRef} className="print:block hidden">
        <h1>FIRE MISSION</h1>
        <FireSolutionPanel />
        {/* Zusätzliche Infos für Ausdruck */}
        <div className="mt-8">
          <p>Created: {new Date().toISOString()}</p>
          <p>Operator: [Name]</p>
        </div>
      </div>
    </>
  );
}
```

## Verwendung einzelner Components

### Custom Layout

Erstelle eigene Layouts mit individuellen Components.

```tsx
import {
  AzimuthDisplay,
  ElevationDisplay,
  RingCountDisplay,
  RangeWarning,
} from './components/Results';

function CustomFireSolution() {
  const fireSolution = useAppStore((state) => state.fireSolution);
  const mortarConfig = useAppStore((state) => state.mortarConfig);

  if (!fireSolution) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Nur die wichtigsten Werte */}
      <AzimuthDisplay
        azimuthMil={fireSolution.azimuthMil}
        azimuthDeg={fireSolution.azimuthDeg}
      />

      <ElevationDisplay
        elevationAdj={fireSolution.elevationAdj}
        deltaElev={fireSolution.deltaElev}
      />

      <RingCountDisplay
        ringCount={fireSolution.ringCount}
        recommendedCharge={fireSolution.recommendedCharge}
      />

      {!fireSolution.inRange && (
        <div className="col-span-3">
          <RangeWarning
            distance={fireSolution.distance}
            minRange={minRange}
            maxRange={maxRange}
            mortarType={mortarConfig.type}
            ammoType={mortarConfig.ammo}
          />
        </div>
      )}
    </div>
  );
}
```

### Minimal Display (nur kritische Werte)

```tsx
function MinimalFireSolution() {
  const fireSolution = useAppStore((state) => state.fireSolution);

  if (!fireSolution) return null;

  return (
    <div className="flex gap-8 items-center justify-center">
      <AzimuthDisplay azimuthMil={fireSolution.azimuthMil} />
      <ElevationDisplay elevationAdj={fireSolution.elevationAdj} />
    </div>
  );
}
```

## Best Practices

### 1. State Management

Die Components holen sich die Daten direkt aus dem Store (via `useAppStore`), daher musst du keine Props durchreichen.

### 2. Responsive Design

Bei kleineren Bildschirmen solltest du die Grid-Layout anpassen:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Components */}</div>
```

### 3. Loading States

FireSolutionPanel handhabt Loading States intern, aber bei eigenen Layouts:

```tsx
const isCalculating = useAppStore((state) => state.isCalculating);

{
  isCalculating ? <LoadingSpinner /> : <AzimuthDisplay {...props} />;
}
```

### 4. Animation

Füge Transitions hinzu für smooth UX:

```tsx
<div className="transition-opacity duration-300">
  <FireSolutionPanel />
</div>
```

## Nächste Schritte

1. Entscheide, welche Integration am besten zu deinem Workflow passt
2. Implementiere die gewählte Option in `App.tsx`
3. Teste mit verschiedenen Fire Solutions
4. Füge ggf. Keyboard Shortcuts hinzu (z.B. `D` für Details)
5. Implementiere Export/Print Funktionalität
