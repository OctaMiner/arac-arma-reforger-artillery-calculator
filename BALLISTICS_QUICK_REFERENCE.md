# Ballistic Data Quick Reference

## File Locations

```
src/lib/ballistics/
├── data/
│   ├── us-he-ring0.json ... us-he-ring4.json
│   ├── rus-he-ring0.json ... rus-he-ring4.json
│   ├── us-smoke.json
│   ├── us-illumination.json
│   ├── rus-smoke.json
│   ├── rus-illumination.json
│   ├── delta-elev-coefficients.json
│   ├── ballistic-tables-index.json
│   └── README.md
└── types.ts
```

## Quick Import Examples

```typescript
// HE ammunition (single ring)
import usHeRing4 from '@/lib/ballistics/data/us-he-ring4.json';

// Smoke/Illumination (all rings)
import rusSmoke from '@/lib/ballistics/data/rus-smoke.json';

// Coefficients
import deltaCoeffs from '@/lib/ballistics/data/delta-elev-coefficients.json';

// Types
import { BallisticTable, FireSolution } from '@/lib/ballistics/types';
```

## Range Lookup

```typescript
// Direct lookup (exact range)
const entry = usHeRing4.entries.find(e => e.range === 2000);
console.log(`Elevation: ${entry.elevation} mil, TOF: ${entry.tof}s`);

// Interpolation (between ranges)
function interpolate(table: BallisticTable, targetRange: number) {
  const entries = table.entries;
  const lower = entries.findLast(e => e.range <= targetRange);
  const upper = entries.find(e => e.range > targetRange);

  if (!lower || !upper) return null;

  const ratio = (targetRange - lower.range) / (upper.range - lower.range);

  return {
    elevation: lower.elevation + ratio * (upper.elevation - lower.elevation),
    tof: lower.tof + ratio * (upper.tof - lower.tof),
    dElev: lower.dElev + ratio * (upper.dElev - lower.dElev)
  };
}
```

## Altitude Correction

```typescript
function correctForAltitude(
  baseElevation: number,
  ringCount: RingCount,
  mortarAlt: number,
  targetAlt: number
): number {
  const altDiff = targetAlt - mortarAlt;
  const coeff = deltaCoeffs.coefficients[`ring${ringCount}`].coefficient;
  return baseElevation + (coeff * altDiff / 100);
}

// Example: Target is 200m higher than mortar, Ring 4
const adjusted = correctForAltitude(1214, 4, 100, 300);
// Returns: 1214 + (9.11 * 200/100) = 1232.22 mil
```

## Ring Selection

```typescript
function selectOptimalRing(targetRange: number, mortarType: MortarType): RingCount | null {
  // Load index
  const index = require('@/lib/ballistics/data/ballistic-tables-index.json');

  // Filter for HE tables of correct mortar type
  const tables = index.tables.filter(
    t => t.mortarType === mortarType && t.ammoType === 'HE'
  );

  // Find smallest ring that can reach target
  for (const table of tables.sort((a, b) => a.ringCount - b.ringCount)) {
    if (table.minRange <= targetRange && targetRange <= table.maxRange) {
      return table.ringCount as RingCount;
    }
  }

  return null; // Out of range
}
```

## Complete Fire Solution

```typescript
function calculateFireSolution(
  mortarPos: { x: number; y: number; alt: number },
  targetPos: { x: number; y: number; alt: number },
  mortarType: MortarType,
  ammoType: AmmoType
): FireSolution {
  // Calculate range and azimuth
  const dx = targetPos.x - mortarPos.x;
  const dy = targetPos.y - mortarPos.y;
  const range = Math.sqrt(dx * dx + dy * dy);
  const azimuth = Math.atan2(dx, dy) * 1000; // Convert to mil

  // Select optimal ring
  const ringCount = selectOptimalRing(range, mortarType);
  if (ringCount === null) {
    return { inRange: false, /* ... */ };
  }

  // Load table and get ballistic data
  const table = loadTable(mortarType, ammoType, ringCount);
  const ballistics = interpolate(table, range);

  // Apply altitude correction
  const adjustedElevation = correctForAltitude(
    ballistics.elevation,
    ringCount,
    mortarPos.alt,
    targetPos.alt
  );

  return {
    range,
    azimuth,
    elevation: ballistics.elevation,
    adjustedElevation,
    timeOfFlight: ballistics.tof,
    ringCount,
    inRange: true
  };
}
```

## Data Statistics at a Glance

| Mortar | Ammo Type    | Min Range | Max Range | Ring Counts | Total Entries |
|--------|--------------|-----------|-----------|-------------|---------------|
| US     | HE           | 50m       | 2900m     | 0-4         | 79            |
| US     | Smoke        | 200m      | 2400m     | 1-4         | 63            |
| US     | Illumination | 200m      | 2400m     | 1-4         | 63            |
| RUS    | HE           | 50m       | 2300m     | 0-4         | 67            |
| RUS    | Smoke        | 50m       | 1700m     | 1-4         | 40            |
| RUS    | Illumination | 100m      | 2200m     | 1-4         | 54            |

## Delta Elevation Coefficients

| Ring | Coefficient (mil/100m) | Description           |
|------|------------------------|-----------------------|
| 0    | 60.74                  | Highest trajectory    |
| 1    | 27.05                  | High trajectory       |
| 2    | 16.97                  | Medium trajectory     |
| 3    | 12.07                  | Low trajectory        |
| 4    | 9.11                   | Lowest trajectory     |

**Note**: Higher ring counts have lower coefficients due to flatter trajectories.

## Validation Checklist

When implementing ballistic calculations:

- [ ] Check if target is within min/max range for selected ring
- [ ] Apply linear interpolation for ranges between table values
- [ ] Include altitude correction using delta-elev coefficients
- [ ] Validate ring count is available for selected ammo type
- [ ] Handle out-of-range cases gracefully
- [ ] Round final values to appropriate precision (elevation: 1 mil, tof: 0.1s)
- [ ] Account for azimuth wrapping (0-6400 mil)

## Common Pitfalls

1. **Forgetting altitude correction** - Always apply when mortar and target are at different altitudes
2. **Wrong table for ammo type** - Smoke/Illumination use combined tables, HE uses per-ring tables
3. **No interpolation** - Don't just use nearest value, interpolate between entries
4. **Ring 0 for long range** - Ring 0 has very limited range, check table before using
5. **Mixing mortar types** - US and RUS have different ballistics, never mix

## Testing Data Points

Good values for unit tests:

```typescript
// US HE Ring 4, 2000m (exact table entry)
expect(elevation).toBe(1214);
expect(tof).toBe(33.8);

// RUS HE Ring 0, 50m (minimum range)
expect(elevation).toBe(1455);
expect(tof).toBe(15.0);

// Interpolation test: US HE Ring 4, 2050m (between 2000-2100)
expect(elevation).toBe(1201); // Interpolated
expect(tof).toBeCloseTo(33.65, 1);
```

## Source Files

- `Arma Reforger Mortar Calc.xlsx` - Gene's ballistic tables (primary source)
- `Berechnungen Mor-ohne Map.xlsx` - Marcel's calculations (coefficients)
- Generated: December 15, 2024
- Extraction script: `extract_ballistics.py`

---

**Need more details?** See `src/lib/ballistics/data/README.md` for complete documentation.
