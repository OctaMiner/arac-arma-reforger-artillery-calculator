#!/usr/bin/env python3
"""
Ballistic Data Analysis Script
Compares legacy data with current JSON tables
"""

import json
import sys
from pathlib import Path

def analyze_delev_values():
    """Analyze dElev values across all tables"""

    print('=' * 80)
    print('BALLISTIC DATA ANALYSIS - dElev Values')
    print('=' * 80)
    print()

    # Load US HE Ring 4 data from both sources
    with open('data/ballistics/us_m821_he_ring4.json', 'r') as f:
        legacy_data = json.load(f)

    with open('src/lib/ballistics/data/us-he-ring4.json', 'r') as f:
        current_data = json.load(f)

    print('1. US HE RING 4 - DATA COMPARISON')
    print('-' * 80)
    print(f'Legacy file entries: {len(legacy_data["data"])}')
    print(f'Current file entries: {len(current_data["entries"])}')
    print()

    # Check all dElev values
    print('Complete dElev Comparison:')
    print(f"{'Range':<8} {'Elev':<8} {'TOF':<8} {'Legacy dElev':<15} {'Current dElev':<15} {'Match':<8}")
    print('-' * 80)

    mismatches = 0
    for legacy in legacy_data['data']:
        current_entry = next((e for e in current_data['entries'] if e['range'] == legacy['range']), None)
        if current_entry:
            match = '✓' if legacy['dElevPer100m'] == current_entry['dElev'] else '✗ DIFF'
            if legacy['dElevPer100m'] != current_entry['dElev']:
                mismatches += 1
            print(f"{legacy['range']:<8} {legacy['elevation']:<8} {legacy['timeOfFlight']:<8.1f} "
                  f"{legacy['dElevPer100m']:<15} {current_entry['dElev']:<15} {match:<8}")
        else:
            print(f"{legacy['range']:<8} - MISSING IN CURRENT DATA")
            mismatches += 1

    print()
    print(f'Total mismatches: {mismatches}')
    print()

    # Analyze dElev ranges
    current_delevs = [e['dElev'] for e in current_data['entries']]
    print('2. dElev VALUE STATISTICS')
    print('-' * 80)
    print(f'Minimum dElev: {min(current_delevs)}')
    print(f'Maximum dElev: {max(current_delevs)}')
    print(f'Average dElev: {sum(current_delevs)/len(current_delevs):.2f}')
    print()

    # Show extreme values
    print('3. EXTREME dElev VALUES (>40):')
    print('-' * 80)
    print(f"{'Range':<8} {'Elevation':<12} {'dElev':<10}")
    for entry in current_data['entries']:
        if entry['dElev'] > 40:
            print(f"{entry['range']:<8} {entry['elevation']:<12} {entry['dElev']:<10}")
    print()

def analyze_all_ring_counts():
    """Analyze dElev values across all ring counts"""

    print('4. dElev RANGES BY RING COUNT')
    print('-' * 80)

    ring_files = {
        0: 'us-he-ring0.json',
        1: 'us-he-ring1.json',
        2: 'us-he-ring2.json',
        3: 'us-he-ring3.json',
        4: 'us-he-ring4.json'
    }

    print(f"{'Ring':<6} {'Min dElev':<12} {'Max dElev':<12} {'Avg dElev':<12} {'Coefficient':<15}")
    print('-' * 80)

    # Load coefficients
    with open('src/lib/ballistics/data/delta-elev-coefficients.json', 'r') as f:
        coeffs = json.load(f)

    for ring, filename in ring_files.items():
        filepath = f'src/lib/ballistics/data/{filename}'
        with open(filepath, 'r') as f:
            data = json.load(f)

        delevs = [e['dElev'] for e in data['entries'] if e['dElev'] > 0]
        if delevs:
            coeff = coeffs['coefficients'][f'ring{ring}']['coefficient']
            print(f"Ring {ring:<2} {min(delevs):<12} {max(delevs):<12} {sum(delevs)/len(delevs):<12.2f} {coeff:<15.2f}")

    print()

def check_reference_calculation():
    """Check reference calculation from BALLISTICS_QUICK_REFERENCE"""

    print('5. REFERENCE CALCULATION VALIDATION')
    print('-' * 80)
    print('Test Case from docs:')
    print('  Mortar: Ost 481 (*10=4810m), Nord 473 (*10=4730m), Höhe 95m')
    print('  Target: Ost 707 (*10=7070m), Nord 428 (*10=4280m), Höhe 145m')
    print('  Ammo: US HE, Ring 4')
    print()

    # Calculate distance
    import math
    dx = (707 - 481) * 10
    dy = (428 - 473) * 10
    distance = math.sqrt(dx**2 + dy**2)

    print(f'Calculated distance: {distance:.2f} m')
    print('Expected: 2304.37 m')
    print()

    # Load table and find elevation at 2304m
    with open('src/lib/ballistics/data/us-he-ring4.json', 'r') as f:
        data = json.load(f)

    # Interpolate
    target_range = 2304.37
    entries = data['entries']
    lower = [e for e in entries if e['range'] <= target_range][-1]
    upper = [e for e in entries if e['range'] > target_range][0]

    ratio = (target_range - lower['range']) / (upper['range'] - lower['range'])
    base_elev = lower['elevation'] + ratio * (upper['elevation'] - lower['elevation'])
    base_tof = lower['tof'] + ratio * (upper['tof'] - lower['tof'])
    base_delev = lower['dElev'] + ratio * (upper['dElev'] - lower['dElev'])

    print(f'Interpolation between {lower["range"]}m and {upper["range"]}m')
    print(f'Base Elevation: {base_elev:.2f} MIL')
    print(f'Expected: 1134.60 MIL')
    print()

    # Height correction
    height_diff = 145 - 95  # 50m
    with open('src/lib/ballistics/data/delta-elev-coefficients.json', 'r') as f:
        coeffs = json.load(f)

    coeff = coeffs['coefficients']['ring4']['coefficient']
    delta_elev_correction = coeff * height_diff / 100

    print(f'Height difference: {height_diff} m')
    print(f'Coefficient (Ring 4): {coeff:.2f} mil/100m')
    print(f'Delta ELEV correction: {delta_elev_correction:.2f} MIL')
    print(f'Expected Δ ELEV: 9.11 MIL (from coefficient)')
    print()

    # Using table dElev value
    table_correction = base_delev * height_diff / 100
    print(f'Table dElev value: {base_delev:.2f}')
    print(f'Table-based correction: {table_correction:.2f} MIL')
    print()

    final_elev_coeff = base_elev - delta_elev_correction
    final_elev_table = base_elev - table_correction

    print(f'Final Elevation (coefficient): {final_elev_coeff:.2f} MIL')
    print(f'Final Elevation (table dElev): {final_elev_table:.2f} MIL')
    print(f'Expected: 1125.49 MIL')
    print()
    print(f'Time of Flight: {base_tof:.1f} sec')
    print(f'Expected: 32.7 sec')
    print()

def analyze_range_coverage():
    """Analyze range coverage for all tables"""

    print('6. RANGE COVERAGE ANALYSIS')
    print('-' * 80)

    print(f"{'Mortar':<8} {'Ammo':<12} {'Ring':<6} {'Min Range':<12} {'Max Range':<12} {'Entries':<10}")
    print('-' * 80)

    data_dir = Path('src/lib/ballistics/data')

    # HE tables
    for mortar in ['us', 'rus']:
        for ring in range(5):
            filepath = data_dir / f'{mortar}-he-ring{ring}.json'
            with open(filepath, 'r') as f:
                data = json.load(f)
            print(f"{mortar.upper():<8} {'HE':<12} {ring:<6} {data['minRange']:<12} {data['maxRange']:<12} {len(data['entries']):<10}")

    print()

    # Smoke/Illumination (multi-ring format)
    for mortar in ['us', 'rus']:
        for ammo in ['smoke', 'illumination']:
            filepath = data_dir / f'{mortar}-{ammo}.json'
            with open(filepath, 'r') as f:
                data = json.load(f)

            total_entries = sum(len(entries) for entries in data['rings'].values())
            print(f"{mortar.upper():<8} {ammo.title():<12} {'1-4':<6} {data['minRange']:<12} {data['maxRange']:<12} {total_entries:<10}")

    print()

if __name__ == '__main__':
    analyze_delev_values()
    analyze_all_ring_counts()
    check_reference_calculation()
    analyze_range_coverage()

    print('=' * 80)
    print('ANALYSIS COMPLETE')
    print('=' * 80)
