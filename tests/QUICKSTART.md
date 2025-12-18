# Vitest Quick Start Guide

Schnelleinstieg für das Test-Framework.

## Tests ausführen

```bash
# Alle Tests einmalig ausführen
npm test

# Tests im Watch-Mode (automatisches Re-Run bei Änderungen)
npm run test:watch

# UI-Dashboard (Browser-Interface)
npm run test:ui

# Coverage-Report generieren
npm run test:coverage
```

## Neuen Test erstellen

### 1. Unit-Test für Funktion

```typescript
// tests/unit/ballistics/myFunction.test.ts
import { describe, test, expect } from 'vitest'
import { myFunction } from '../../../src/lib/ballistics/myFunction.js'

describe('myFunction', () => {
  test('should calculate correct result', () => {
    const result = myFunction(10, 20)
    expect(result).toBe(30)
  })

  test('should handle edge case', () => {
    const result = myFunction(0, 0)
    expect(result).toBe(0)
  })
})
```

### 2. Component-Test

```typescript
// tests/components/MyComponent.test.tsx
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../../src/components/MyComponent.js'

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Wichtige Matcher

```typescript
// Gleichheit
expect(value).toBe(42)
expect(value).toEqual({ a: 1, b: 2 })

// Numerische Vergleiche
expect(3.14159).toBeCloseTo(3.14, 2)  // ±0.01 Toleranz
expect(value).toBeGreaterThan(10)
expect(value).toBeLessThan(100)

// Boolean
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeDefined()
expect(value).toBeNull()

// Arrays/Objects
expect(array).toContain('item')
expect(array).toHaveLength(5)
expect(obj).toHaveProperty('key', 'value')

// DOM (für React Components)
expect(element).toBeInTheDocument()
expect(element).toHaveClass('active')
expect(element).toHaveTextContent('Hello')
```

## Mock-Daten verwenden

```typescript
import { marcelReferenceScenario } from '../fixtures/mockData.js'

test('uses reference data', () => {
  const distance = calculateDistance(
    marcelReferenceScenario.mortar,
    marcelReferenceScenario.target
  )

  expect(distance).toBeCloseTo(
    marcelReferenceScenario.expected.distance,
    1
  )
})
```

## Electron API mocken

```typescript
import { vi } from 'vitest'

test('calls Electron API', async () => {
  // Mock Response definieren
  vi.mocked(window.api.missions.load).mockResolvedValue([
    { id: '1', name: 'Test Mission' }
  ])

  // Funktion testen
  const missions = await window.api.missions.load()

  expect(missions).toHaveLength(1)
  expect(missions[0].name).toBe('Test Mission')
})
```

## Wichtige Hinweise

1. **Import Extensions**: Immer `.js` verwenden, auch für `.ts` Dateien (ESM)
   ```typescript
   import { myFunc } from './myFunc.js'  // ✓ Richtig
   import { myFunc } from './myFunc'     // ✗ Falsch
   ```

2. **Koordinaten**: Grid-Units, nicht Meter!
   ```typescript
   // 481 grid = 4810m absolut
   // Distance gibt Grid-Units zurück
   const distance = calculateDistance(mortar, target) // 230.43
   const meters = distance * 10                       // 2304.3m
   ```

3. **Async Tests**:
   ```typescript
   test('async function', async () => {
     const result = await asyncFunction()
     expect(result).toBe('done')
   })
   ```

4. **Multiple Assertions**:
   ```typescript
   test('multiple checks', () => {
     const result = calculate()

     expect(result.distance).toBeCloseTo(2304, 0)
     expect(result.azimuth).toBeCloseTo(101, 1)
     expect(result.inRange).toBe(true)
   })
   ```

## Troubleshooting

### Test findet Module nicht

Prüfe Import-Extension:
```typescript
// Muss .js sein, nicht .ts
import { fn } from './file.js'
```

### Coverage zu niedrig

Prüfe `vitest.config.ts`:
```typescript
coverage: {
  include: ['src/lib/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.d.ts']
}
```

### Tests sind flaky

Verwende `toBeCloseTo` statt `toBe` für Floating-Point:
```typescript
expect(3.14159).toBeCloseTo(3.14, 2)  // ✓
expect(3.14159).toBe(3.14)            // ✗
```

## Weitere Infos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [tests/README.md](./README.md) - Ausführliche Projektdokumentation
- [VITEST_SETUP_SUMMARY.md](../VITEST_SETUP_SUMMARY.md) - Setup-Details
