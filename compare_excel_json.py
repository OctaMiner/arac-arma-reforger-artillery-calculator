#!/usr/bin/env python3
"""
Compare Excel data with JSON data
"""

import openpyxl
import json

def compare_us_he_ring4():
    """Compare US HE Ring 4 Excel vs JSON"""

    wb = openpyxl.load_workbook('Arma Reforger Mortar Calc.xlsx', data_only=True)
    sheet = wb['Range Data']

    print('US HE RING 4 - EXCEL vs JSON Comparison:')
    print('=' * 100)

    # Extract US HE Ring 4 from Excel
    excel_data = []
    for row in sheet.iter_rows(min_row=2, max_row=300, values_only=True):
        if row[0] == 'US' and row[1] == 'HE' and row[2] == 4.0:
            excel_data.append({
                'range': int(row[3]),
                'elevation': int(row[4]),
                'tof': row[5],
                'dElev': int(row[6]) if row[6] else 0
            })

    print(f'Excel entries: {len(excel_data)}')

    # Load JSON data
    with open('src/lib/ballistics/data/us-he-ring4.json', 'r') as f:
        json_data = json.load(f)

    print(f'JSON entries: {len(json_data["entries"])}')
    print()

    # Compare
    headers = ['Range', 'Excel Elev', 'JSON Elev', 'Excel dElev', 'JSON dElev', 'Match']
    print(f"{headers[0]:<8} {headers[1]:<12} {headers[2]:<12} {headers[3]:<13} {headers[4]:<12} {headers[5]:<8}")
    print('-' * 100)

    all_match = True
    for excel_entry in excel_data:
        json_entry = next((e for e in json_data['entries'] if e['range'] == excel_entry['range']), None)
        if json_entry:
            elev_match = excel_entry['elevation'] == json_entry['elevation']
            delev_match = excel_entry['dElev'] == json_entry['dElev']
            overall_match = 'OK' if (elev_match and delev_match) else 'DIFF'

            if not (elev_match and delev_match):
                all_match = False
                marker = ' <- MISMATCH'
            else:
                marker = ''

            print(f"{excel_entry['range']:<8} {excel_entry['elevation']:<12} {json_entry['elevation']:<12} "
                  f"{excel_entry['dElev']:<13} {json_entry['dElev']:<12} {overall_match:<8}{marker}")

    print()
    print(f'Overall: {"ALL MATCH" if all_match else "MISMATCHES FOUND"}')
    print()

    # Show dElev statistics from Excel
    excel_delevs = [e['dElev'] for e in excel_data if e['dElev'] > 0]
    print('Excel dElev Statistics:')
    print(f'  Min: {min(excel_delevs)}')
    print(f'  Max: {max(excel_delevs)}')
    print(f'  Avg: {sum(excel_delevs)/len(excel_delevs):.2f}')
    print()

    # Show JSON dElev statistics
    json_delevs = [e['dElev'] for e in json_data['entries'] if e['dElev'] > 0]
    print('JSON dElev Statistics:')
    print(f'  Min: {min(json_delevs)}')
    print(f'  Max: {max(json_delevs)}')
    print(f'  Avg: {sum(json_delevs)/len(json_delevs):.2f}')

if __name__ == '__main__':
    compare_us_he_ring4()
