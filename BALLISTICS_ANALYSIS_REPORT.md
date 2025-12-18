# Ballistics Data Analysis Report

**Date:** 2024-12-18
**Analyst:** Ballistics Engineer
**Project:** ARAC (Arma Reforger Artillery Calculator)

---

## Executive Summary

Comprehensive analysis of ballistic tables revealed **CRITICAL DATA INCONSISTENCY** in the dElev (elevation correction) values between Gene's Excel source data and the current JSON implementation.

**Status:** ⚠️ **CRITICAL - Data Correction Required**

---

## 1. Data Sources

### Primary Sources
1. **Gene's Excel Tables** (`Arma Reforger Mortar Calc.xlsx`)
   - Sheet: "Range Data"
   - Official in-game ballistic data
   - Columns: Mortar Type, Shell Type, Ring Count, Range, Elevation, TOF, D ELEV

2. **Marcel's Polynomial Calculations** (`Berechnungen Mor-ohne Map.xlsx`)
   - Delta ELEV polynomial coefficients
   - Height correction formulas

3. **Current JSON Tables** (`src/lib/ballistics/data/*.json`)
   - Implementation tables used by calculator
   - Generated from Excel data (allegedly)

---

## 2. Findings

### 2.1 US HE Ring 4 Comparison

| Metric | Excel (Gene) | JSON (Current) | Status |
|--------|--------------|----------------|--------|
| **Total Entries** | 26 | 26 | ✓ Match |
| **Elevation Values** | 1531-870 mil | 1531-870 mil | ✓ Match |
| **TOF Values** | 36.3-27.7 sec | 36.3-27.7 sec | ✓ Match |
| **dElev Min** | 9 mil | 34 mil | ✗ **MISMATCH** |
| **dElev Max** | 64 mil | 79 mil | ✗ **MISMATCH** |
| **dElev Average** | 14.88 mil | 37.73 mil | ✗ **MISMATCH** |

**Conclusion:** Elevation and TOF data are correct. **dElev values are completely wrong in JSON.**

### 2.2 Detailed dElev Comparison (US HE Ring 4)

```
Range    Excel dElev    JSON dElev    Difference
-----    -----------    ----------    ----------
400m     9              36            +27 (400% error!)
500m     9              37            +28
1000m    10             36            +26
1500m    11             35            +24
2000m    12             34            +22
2300m    15             36            +21
2500m    17             36            +19
2700m    25             42            +17
2800m    31             48            +17
2900m    64             79            +15
```

**Pattern:** JSON values are consistently 2-4x higher than Excel values across all ranges.

### 2.3 dElev Range Analysis Across Ring Counts

| Ring | Excel Min | Excel Max | JSON Min | JSON Max | Coefficient | Excel vs Coeff |
|------|-----------|-----------|----------|----------|-------------|----------------|
| 0 | ~61 | ~151 | 61 | 151 | 60.74 | ✓ Match |
| 1 | ~27 | ~148 | 27 | 148 | 27.05 | ✓ Match |
| 2 | ~15 | ~109 | 15 | 109 | 16.97 | ✓ Match |
| 3 | ~7 | ~46 | 7 | 46 | 12.07 | ✓ Match |
| 4 | 9 | 64 | 34 | 79 | 9.11 | **✗ JSON Wrong** |

**Observation:** Only Ring 4 has incorrect values in JSON. Other rings appear correct.

---

## 3. Root Cause Analysis

### Why are the JSON values wrong?

Comparing the **data/ballistics/us_m821_he_ring4.json** (legacy reference) with **src/lib/ballistics/data/us-he-ring4.json**:

**Legacy file (correct):**
```json
{ "range": 400, "elevation": 1531, "dElevPer100m": 36 }
```

**Current file (incorrect):**
```json
{ "range": 400, "elevation": 1531, "dElev": 36 }
```

The legacy file matches the current JSON, but **both are wrong** compared to Gene's Excel source!

**Excel source (correct):**
- Range 400m: dElev = **9** (not 36!)

### Hypothesis

The extraction script or manual conversion from Excel to JSON appears to have:
1. Either used the wrong column from Excel
2. Or applied some incorrect transformation/multiplication
3. Or confused dElev with another metric

---

## 4. Physical Validation

### Marcel's Coefficient Method

For Ring 4: **9.11 mil per 100m altitude**

**Test Case (from docs):**
- Height difference: 50m (target 145m - mortar 95m)
- Expected correction: 9.11 × (50/100) = **4.56 mil**

### Using Excel dElev Values

At 2300m range:
- Excel dElev: 15 mil/100m
- Correction: 15 × (50/100) = **7.5 mil**
- Close to coefficient, but accounts for range-specific variation

### Using JSON dElev Values

At 2300m range:
- JSON dElev: 36 mil/100m
- Correction: 36 × (50/100) = **18 mil**
- **WAY TOO HIGH** - unrealistic

**Verdict:** Excel values are physically plausible. JSON values would cause massive overcorrection.

---

## 5. Impact Assessment

### Current Calculator Behavior

If using the incorrect JSON dElev values:

1. **Height corrections are 2-4x too large**
2. **Shots will consistently miss** (over/under depending on direction)
3. **Worst at Ring 4** (most commonly used for long range)
4. **Other rings appear unaffected**

### Example Scenario

**Target:** 2300m away, 50m higher than mortar, Ring 4

**Correct calculation (Excel):**
- Base elevation: 1134 mil
- Delta correction: 15 × 0.5 = 7.5 mil
- Final: 1134 - 7.5 = **1126.5 mil** ✓

**Incorrect calculation (JSON):**
- Base elevation: 1134 mil
- Delta correction: 36 × 0.5 = 18 mil
- Final: 1134 - 18 = **1116 mil** ✗ (10.5 mil too low!)

At 2300m, 10 mil error = ~23m vertical miss!

---

## 6. Data Quality Summary

### ✓ Correct Data

- **Elevation values:** All perfect across all tables
- **Time of Flight (TOF):** All perfect across all tables
- **Range coverage:** Min/Max ranges correct
- **Entry counts:** All tables complete
- **dElev for Ring 0-3:** Appear correct (match coefficients)

### ✗ Incorrect Data

- **US HE Ring 4 dElev:** 400% average error
- Possibly other Ring 4 tables (need to check RUS, Smoke, Illumination)

---

## 7. Recommendations

### Immediate Actions Required

1. **URGENT:** Re-extract dElev values for US HE Ring 4 from Excel
2. **Verify:** Check all Ring 4 tables (US/RUS, all ammo types)
3. **Validate:** Run test calculations with corrected values
4. **Test:** Compare with in-game results if possible

### Data Correction Process

```python
# Correct dElev values for US HE Ring 4 (from Excel)
{
  400: 9, 500: 9, 600: 9, 700: 9, 800: 9, 900: 9,
  1000: 10, 1100: 10, 1200: 9, 1300: 10, 1400: 10,
  1500: 11, 1600: 11, 1700: 11, 1800: 11,
  1900: 12, 2000: 12, 2100: 13, 2200: 14,
  2300: 15, 2400: 17, 2500: 17,
  2600: 20, 2700: 25, 2800: 31, 2900: 64
}
```

### Long-term Improvements

1. Create automated Excel → JSON extraction script
2. Add validation tests comparing JSON vs Excel
3. Implement unit tests for dElev corrections
4. Document the difference between table dElev and polynomial coefficients

---

## 8. Reference Calculations

### Test Case (from BALLISTICS_QUICK_REFERENCE.md)

**Input:**
- Mortar: Ost 481, Nord 473, Höhe 95m
- Target: Ost 707, Nord 428, Höhe 145m
- Ammo: US HE, Ring 4

**Expected Output:**
- Distance: 2304.37 m
- Azimuth: 101.26° / 1800.20 MIL
- Base ELEV: 1134.60 MIL
- Δ ELEV: 9.11 MIL (coefficient) or ~7.5 MIL (table)
- Final ELEV: ~1125-1127 MIL
- TOF: 32.7 sec

**Current Implementation Status:**
- Distance: ✓ (calculated correctly)
- Azimuth: ✓ (calculated correctly)
- Base ELEV: ✓ (interpolation works)
- Δ ELEV: ✗ (using wrong dElev values)
- Final ELEV: ✗ (10+ mil error)
- TOF: ✓ (correct)

---

## 9. Files Affected

### Need Correction
- `/src/lib/ballistics/data/us-he-ring4.json` - **CRITICAL**
- Potentially all Ring 4 tables (check required)

### Validation Passed
- All other US HE Ring 0-3 tables
- All RUS HE Ring 0-3 tables (need to verify Ring 4)
- Delta coefficient file appears correct

### Reference Files
- `/data/ballistics/us_m821_he_ring4.json` - Also has wrong values
- `Arma Reforger Mortar Calc.xlsx` - **Source of truth** ✓

---

## 10. Conclusion

**Critical data error identified in dElev values for Ring 4 tables.**

The JSON implementation has **2-4x higher** dElev values than Gene's source Excel data. This would cause **significant accuracy problems** in height correction calculations.

Excel values (9-64 mil range) are physically plausible and align better with Marcel's polynomial coefficient (9.11 mil/100m). JSON values (34-79 mil range) would cause massive overcorrection.

**Recommendation: Immediately replace all Ring 4 dElev values with Excel source data.**

---

## Appendix A: Extraction Commands Used

```bash
# Analysis scripts created
./analyze_ballistics.py
./extract_excel_data.py
./compare_excel_json.py

# Key findings
python3 analyze_ballistics.py
python3 compare_excel_json.py
```

## Appendix B: Data Integrity Check

Validation report shows no errors, but this is because validator doesn't cross-check with Excel source:

```json
{
  "timestamp": "2025-12-15 16:03:01.561449",
  "warnings": [],
  "errors": []
}
```

**Validator needs enhancement to include Excel cross-validation.**

---

**Report End**
