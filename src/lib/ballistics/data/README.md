# Ballistic Data Files

This directory contains all ballistic tables and coefficients extracted from Gene's Excel file (`Arma Reforger Mortar Calc.xlsx`) and Marcel's calculations (`Berechnungen Mor-ohne Map.xlsx`).

## File Structure

### 1. Ballistic Tables (HE Ammunition)

Separate files for each ring count:

- `us-he-ring0.json` to `us-he-ring4.json` - US HE ammunition
- `rus-he-ring0.json` to `rus-he-ring4.json` - RUS HE ammunition

**Format:**

```json
{
  "mortarType": "US" | "RUS",
  "ammoType": "HE",
  "ringCount": 0-4,
  "minRange": number,
  "maxRange": number,
  "entries": [
    {
      "range": number,      // meters
      "elevation": number,  // mil
      "tof": number,        // time of flight in seconds
      "dElev": number       // delta elevation per 100m
    }
  ]
}
```

### 2. Combined Tables (Smoke & Illumination)

All rings in one file:

- `us-smoke.json` - US Smoke rounds
- `us-illumination.json` - US Illumination rounds
- `rus-smoke.json` - RUS Smoke rounds
- `rus-illumination.json` - RUS Illumination rounds

**Format:**

```json
{
  "mortarType": "US" | "RUS",
  "ammoType": "Smoke" | "Illumination",
  "rings": {
    "0": [...entries...],
    "1": [...entries...],
    "2": [...entries...],
    "3": [...entries...],
    "4": [...entries...]
  },
  "minRange": number,
  "maxRange": number
}
```

### 3. Coefficients

- `delta-elev-coefficients.json` - Elevation correction per 100m altitude difference

### 4. Index

- `ballistic-tables-index.json` - Master index of all tables

## Data Statistics

### US Mortar

- **HE**: 79 total entries (8+9+15+21+26 across rings 0-4)
- **Smoke**: 63 entries across 4 rings
- **Illumination**: 63 entries across 4 rings
- **Max Range**: 2900m (Ring 4, HE)

### RUS Mortar

- **HE**: 67 total entries (10+8+13+16+20 across rings 0-4)
- **Smoke**: 40 entries across 4 rings
- **Illumination**: 54 entries across 4 rings
- **Max Range**: 2300m (Ring 4, HE)

## Usage Examples

### Load a specific table

```typescript
import usHeRing4 from './data/us-he-ring4.json';

// Find elevation for 2000m target
const entry = usHeRing4.entries.find((e) => e.range === 2000);
console.log(`Elevation: ${entry.elevation} mil`);
console.log(`Time of Flight: ${entry.tof} sec`);
```

### Interpolate between ranges

```typescript
function interpolateElevation(data, targetRange) {
  const lower = data.entries.findLast((e) => e.range <= targetRange);
  const upper = data.entries.find((e) => e.range > targetRange);

  if (!lower || !upper) return null;

  const ratio = (targetRange - lower.range) / (upper.range - lower.range);
  return lower.elevation + ratio * (upper.elevation - lower.elevation);
}
```

### Apply altitude correction

```typescript
import deltaCoeffs from './data/delta-elev-coefficients.json';

function correctForAltitude(baseElevation, ringCount, altitudeDiff) {
  const coeff = deltaCoeffs.coefficients[`ring${ringCount}`].coefficient;
  return baseElevation + (coeff * altitudeDiff) / 100;
}
```

## Data Validation

All files have been validated for:

- ✓ Correct min/max range values
- ✓ No missing entries
- ✓ No zero values in critical fields
- ✓ Proper JSON structure
- ✓ Consistent data types

Run validation:

```bash
python3 extract_ballistics.py
```

## Source Files

- **Primary Source**: `Arma Reforger Mortar Calc.xlsx` (Gene's tables)
  - Sheet: "Range Data" - All ballistic tables
  - Last updated: December 2024

- **Secondary Source**: `Berechnungen Mor-ohne Map.xlsx` (Marcel's calculations)
  - Sheet: "Tabelle1" - Polynomial coefficients
  - Used for: Delta elevation coefficients

## Notes

1. **Ring Count**: Higher ring counts = more propellant = greater range but flatter trajectory
2. **dElev**: Delta elevation adjustment per 100m altitude difference
3. **TOF**: Time of Flight is critical for leading moving targets
4. **Interpolation**: Linear interpolation is acceptable for ranges between table entries
5. **US vs RUS**: Different ballistic characteristics, always use correct table

## Future Enhancements

- [ ] Add wind correction coefficients
- [ ] Include velocity data for each trajectory point
- [ ] Add impact angle data
- [ ] Create polynomial fitting for smoother interpolation
- [ ] Add temperature/air density corrections
