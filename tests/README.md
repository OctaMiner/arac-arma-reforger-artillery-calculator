# ARAC Test Suite

Test-Framework Setup für das Arma Reforger Artillery Calculator Projekt.

## Test-Framework

- **Vitest**: Unit & Component Tests
- **@testing-library/react**: React Component Tests
- **jsdom**: Browser-Umgebung für Tests
- **@vitest/coverage-v8**: Code Coverage Reports

## Verzeichnisstruktur

```
tests/
├── fixtures/          # Mock-Daten und Test-Fixtures
│   └── mockData.ts    # Referenz-Szenarien (Marcel Excel)
├── unit/              # Unit Tests
│   ├── ballistics/    # Ballistische Berechnungen
│   │   ├── distance.test.ts
│   │   ├── azimuth.test.ts
│   │   ├── elevation.test.ts
│   │   └── fireSolution.test.ts
│   ├── spotter/       # Spotter-Funktionen
│   │   ├── targetCalculation.test.ts
│   │   └── correction.test.ts
│   └── storage/       # LocalStorage/IPC Tests
│       └── missions.test.ts
├── components/        # React Component Tests
│   ├── FireSolution.test.tsx
│   ├── ConfigPanel.test.tsx
│   └── MissionList.test.tsx
├── e2e/              # End-to-End Tests (Playwright)
│   ├── workflow.spec.ts
│   └── missions.spec.ts
├── setup.ts          # Test-Setup (globals, mocks)
└── README.md         # Diese Datei
```

## NPM Scripts

```bash
# Tests einmalig ausführen
npm test

# Tests im Watch-Mode (automatisches Re-Run)
npm run test:watch

# Tests mit UI-Dashboard
npm run test:ui

# Coverage Report generieren
npm run test:coverage
```

## Test-Setup

Die Datei `tests/setup.ts` wird vor allen Tests ausgeführt und enthält:

1. **Globale Test-Utilities**: `expect`, `vi`, `cleanup`
2. **Electron API Mocks**: `window.api` für IPC-Kommunikation
3. **Browser API Mocks**: `matchMedia`, `IntersectionObserver`
4. **Custom Matchers**: `toBeCloseTo` für numerische Vergleiche

## Referenz-Daten

Alle Tests basieren auf verifizierten Berechnungen aus Marcel's Excel-Spreadsheet:

**Referenz-Szenario:**
- Mörser: 481/473/95m (Ost/Nord/Höhe)
- Ziel: 707/428/145m
- Erwartete Resultate:
  - Entfernung: 2304.37m
  - Azimut: 101.26° / 1800 MIL
  - Elevation (US HE Ring4): ~1134 MIL
  - Höhenkorrektur: +9.11 MIL
  - Finale Elevation: ~1125 MIL

## Qualitätsziele

- **Coverage**: > 80% für `src/lib/`
- **Präzision**: < 5m Abweichung bei 2000m Entfernung
- **Performance**: `calculateFireSolution` < 50ms

## Best Practices

1. **Test-Driven**: Jeden Bug als Test reproduzieren BEVOR Fix
2. **Referenz-Werte**: Excel-Daten als Ground Truth verwenden
3. **Edge Cases**: 0, negative, max values testen
4. **Deterministisch**: Keine flaky Tests
5. **Aussagekräftig**: Klare Test-Namen die Intent beschreiben

## TypeScript Types

Tests sind vollständig typisiert. Wichtige Types:

```typescript
import type { Coordinate } from '../src/types/index.js'
import type { FireSolution } from '../src/lib/ballistics/types.js'
```

## Mocking Electron API

In Tests ist `window.api` automatisch gemockt:

```typescript
// Bereits verfügbar in allen Tests
window.api.missions.save()  // vi.fn() Mock
window.api.settings.get()   // vi.fn() Mock
window.api.maps.getHeight() // vi.fn() Mock
```

Eigene Mock-Responses definieren:

```typescript
import { vi } from 'vitest'

vi.mocked(window.api.missions.load).mockResolvedValue([
  // ... mock missions
])
```

## Troubleshooting

### Import-Fehler (.js Extensions)

Alle relativen Imports benötigen `.js` Extension (ESM):

```typescript
// Richtig
import { calculateDistance } from '../lib/calculator.js'

// Falsch
import { calculateDistance } from '../lib/calculator'
```

### Type-Fehler in Tests

Sicherstellen dass `@types/node` installiert ist:

```bash
npm install --save-dev @types/node
```

### Coverage-Reports nicht generiert

Prüfen dass `@vitest/coverage-v8` installiert ist:

```bash
npm install --save-dev @vitest/coverage-v8
```
