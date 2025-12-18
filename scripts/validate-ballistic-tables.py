#!/usr/bin/env python3
"""
Validiert alle ballistischen JSON-Tabellen gegen Excel-Referenzdaten
"""

import pandas as pd
import json
from pathlib import Path
from typing import Dict, List, Tuple
import sys

class BallisticTableValidator:
    def __init__(self):
        self.base_path = Path('/Users/jann/Desktop/Armar Refroger Mörser')
        self.excel1_path = self.base_path / 'Arma Reforger Mortar Calc.xlsx'
        self.excel2_path = self.base_path / 'Berechnungen Mor-ohne Map.xlsx'
        self.json_data_path = self.base_path / 'src/lib/ballistics/data'

        self.errors = []
        self.warnings = []
        self.validated_tables = []

    def load_excel_data(self) -> Dict:
        """Lädt alle relevanten Excel-Sheets"""
        print("📊 Lade Excel-Referenzdaten...")

        excel_data = {}

        # Erste Excel-Datei
        xls1 = pd.ExcelFile(self.excel1_path)
        print(f"  Datei 1: {self.excel1_path.name}")
        print(f"  Sheets: {xls1.sheet_names}")

        for sheet_name in xls1.sheet_names:
            df = pd.read_excel(self.excel1_path, sheet_name=sheet_name, header=None)
            excel_data[f"calc_{sheet_name}"] = df
            print(f"    - {sheet_name}: {df.shape}")

        # Zweite Excel-Datei
        xls2 = pd.ExcelFile(self.excel2_path)
        print(f"\n  Datei 2: {self.excel2_path.name}")
        print(f"  Sheets: {xls2.sheet_names}")

        for sheet_name in xls2.sheet_names:
            df = pd.read_excel(self.excel2_path, sheet_name=sheet_name, header=None)
            excel_data[f"berechnung_{sheet_name}"] = df
            print(f"    - {sheet_name}: {df.shape}")

        return excel_data

    def load_json_tables(self) -> Dict:
        """Lädt alle JSON-Tabellen"""
        print("\n📁 Lade JSON-Tabellen...")

        json_tables = {}
        json_files = list(self.json_data_path.glob('*.json'))

        for json_file in sorted(json_files):
            if json_file.name == 'ballistic-tables-index.json':
                continue
            if json_file.name == 'delta-elev-coefficients.json':
                continue

            with open(json_file, 'r') as f:
                data = json.load(f)
                json_tables[json_file.stem] = data
                print(f"  ✓ {json_file.name}: {len(data) if isinstance(data, list) else 'N/A'} entries")

        return json_tables

    def inspect_excel_structure(self, excel_data: Dict):
        """Analysiert die Struktur der Excel-Dateien"""
        print("\n🔍 Analysiere Excel-Struktur...")

        for key, df in excel_data.items():
            print(f"\n=== {key} ===")
            print(f"Shape: {df.shape}")
            print("\nErste 15 Zeilen:")
            print(df.head(15).to_string())

            # Suche nach Tabellen-Headern
            print("\n🔎 Suche nach 'Range', 'Elevation', 'Time'...")
            for idx, row in df.iterrows():
                row_str = ' '.join([str(x) for x in row.values if pd.notna(x)])
                if 'Range' in row_str or 'Elevation' in row_str or 'MIL' in row_str:
                    print(f"  Zeile {idx}: {row_str[:100]}")
                if idx > 30:  # Nur erste 30 Zeilen scannen
                    break

    def parse_range_data_sheet(self, df: pd.DataFrame) -> Dict:
        """Parst das 'Range Data' Sheet aus der Excel-Datei"""
        # Header ist in Zeile 0
        # Daten ab Zeile 1

        tables = {}

        for idx, row in df.iterrows():
            if idx == 0:  # Header-Zeile überspringen
                continue

            mortar_type = row[0]
            ammo_type = row[1]
            ring_count = row[2]
            range_m = row[3]
            elevation_mil = row[4]
            tof_sec = row[5]
            d_elev_mil = row[6]

            # NaN-Werte überspringen
            if pd.isna(mortar_type) or pd.isna(range_m):
                continue

            # Tabellen-Key erstellen
            key = f"{mortar_type}_{ammo_type}_ring{int(ring_count)}"

            if key not in tables:
                tables[key] = []

            tables[key].append({
                'range': int(range_m),
                'elevation': int(elevation_mil),
                'tof': float(tof_sec) if not pd.isna(tof_sec) else None,
                'dElev': int(d_elev_mil) if not pd.isna(d_elev_mil) else 0
            })

        return tables

    def validate_table(self, json_data: Dict, excel_tables: Dict, table_name: str):
        """Validiert eine einzelne Tabelle"""
        print(f"\n{'='*70}")
        print(f"🔍 Validiere: {table_name}")
        print(f"{'='*70}")

        # JSON-Key zu Excel-Key mapping
        # Excel verwendet: "HE", "Illumination", "Smoke" (nicht vollständig uppercase!)
        mortar = json_data.get('mortarType', '').upper()
        ammo = json_data.get('ammoType', '')  # NICHT uppercase!

        # Prüfe ob alte Struktur (mit ringCount) oder neue (mit rings-Objekt)
        if 'ringCount' in json_data:
            # Alte Struktur (HE)
            ring = json_data.get('ringCount', 0)
            excel_key = f"{mortar}_{ammo}_ring{ring}"

            if excel_key not in excel_tables:
                self.warnings.append(f"{table_name}: Keine Excel-Referenz gefunden ({excel_key})")
                print(f"  ⚠️  Excel-Key '{excel_key}' nicht gefunden")
                print(f"  📋 Verfügbare Keys: {list(excel_tables.keys())[:5]}...")
                return

            excel_entries = excel_tables[excel_key]
            json_entries = json_data.get('entries', [])
            has_errors = self._compare_entries(json_entries, excel_entries, table_name, f"Ring {ring}")

            if not has_errors:
                self.validated_tables.append(table_name)

        elif 'rings' in json_data:
            # Neue Struktur (Illumination, Smoke)
            rings = json_data.get('rings', {})
            all_validated = True

            for ring_num, json_entries in rings.items():
                ring_int = int(ring_num)
                excel_key = f"{mortar}_{ammo}_ring{ring_int}"

                print(f"\n  📍 Ring {ring_num}:")

                if excel_key not in excel_tables:
                    self.warnings.append(f"{table_name} Ring {ring_num}: Keine Excel-Referenz gefunden ({excel_key})")
                    print(f"    ⚠️  Excel-Key '{excel_key}' nicht gefunden")
                    all_validated = False
                    continue

                excel_entries = excel_tables[excel_key]
                has_errors = self._compare_entries(json_entries, excel_entries, table_name, f"Ring {ring_num}")

                if has_errors:
                    all_validated = False

            if all_validated:
                self.validated_tables.append(table_name)

        else:
            self.warnings.append(f"{table_name}: Unbekannte JSON-Struktur")
            print(f"  ⚠️  Unbekannte JSON-Struktur")

    def _compare_entries(self, json_entries: List, excel_entries: List, table_name: str, ring_label: str):
        """Vergleicht JSON- und Excel-Einträge"""
        print(f"    📊 JSON Einträge: {len(json_entries)}")
        print(f"    📊 Excel Einträge: {len(excel_entries)}")

        # Vergleiche jeden Eintrag
        discrepancies = []
        matched = 0

        for json_entry in json_entries:
            json_range = json_entry['range']

            # Finde entsprechenden Excel-Eintrag
            excel_entry = next((e for e in excel_entries if e['range'] == json_range), None)

            if excel_entry is None:
                discrepancies.append({
                    'range': json_range,
                    'issue': 'Nicht in Excel gefunden',
                    'json_value': json_entry,
                    'excel_value': None
                })
                continue

            # Vergleiche Werte
            issues = []

            if json_entry['elevation'] != excel_entry['elevation']:
                issues.append(f"Elevation: JSON={json_entry['elevation']}, Excel={excel_entry['elevation']}")

            if json_entry.get('tof') != excel_entry.get('tof'):
                json_tof = json_entry.get('tof')
                excel_tof = excel_entry.get('tof')
                if json_tof is not None and excel_tof is not None:
                    diff = abs(json_tof - excel_tof)
                    if diff > 0.1:  # Toleranz von 0.1s
                        issues.append(f"ToF: JSON={json_tof}, Excel={excel_tof}")

            if json_entry.get('dElev', 0) != excel_entry.get('dElev', 0):
                issues.append(f"dElev: JSON={json_entry.get('dElev')}, Excel={excel_entry.get('dElev')}")

            if issues:
                discrepancies.append({
                    'range': json_range,
                    'issues': issues,
                    'json_value': json_entry,
                    'excel_value': excel_entry
                })
            else:
                matched += 1

        # Prüfe auf Excel-Einträge, die nicht in JSON sind
        for excel_entry in excel_entries:
            excel_range = excel_entry['range']
            json_entry = next((e for e in json_entries if e['range'] == excel_range), None)

            if json_entry is None:
                discrepancies.append({
                    'range': excel_range,
                    'issue': 'Nicht in JSON gefunden',
                    'json_value': None,
                    'excel_value': excel_entry
                })

        # Ergebnis
        if discrepancies:
            print(f"\n    ❌ {len(discrepancies)} Abweichungen gefunden:")
            for disc in discrepancies[:5]:  # Nur erste 5 anzeigen
                print(f"      Range {disc['range']}m:")
                if 'issue' in disc:
                    print(f"        {disc['issue']}")
                else:
                    for issue in disc['issues']:
                        print(f"        {issue}")

            if len(discrepancies) > 5:
                print(f"      ... und {len(discrepancies) - 5} weitere")

            self.errors.append({
                'table': f"{table_name} ({ring_label})",
                'count': len(discrepancies),
                'details': discrepancies
            })
            return True  # Hat Fehler
        else:
            print(f"    ✅ Alle {matched} Einträge korrekt!")
            return False  # Keine Fehler

    def generate_report(self):
        """Erstellt den Validierungsbericht"""
        print("\n" + "="*80)
        print("📋 VALIDIERUNGSBERICHT - BALLISTISCHE TABELLEN")
        print("="*80)

        total_tables = len(self.validated_tables) + len(self.errors) + len(self.warnings)

        print(f"\n📊 Zusammenfassung:")
        print(f"  Gesamt getestete Tabellen: {total_tables}")
        print(f"  ✅ Validiert: {len(self.validated_tables)}")
        print(f"  ❌ Mit Fehlern: {len(self.errors)}")
        print(f"  ⚠️  Warnungen: {len(self.warnings)}")

        if self.validated_tables:
            print(f"\n✅ Erfolgreich validierte Tabellen ({len(self.validated_tables)}):")
            for table in sorted(self.validated_tables):
                print(f"  ✓ {table}")

        if self.warnings:
            print(f"\n⚠️  Warnungen ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  ! {warning}")

        if self.errors:
            print(f"\n❌ Tabellen mit Abweichungen ({len(self.errors)}):")
            for error in self.errors:
                table_name = error['table']
                count = error['count']
                print(f"  ✗ {table_name}: {count} Abweichungen")

                # Details der ersten 3 Abweichungen anzeigen
                for disc in error['details'][:3]:
                    print(f"      Range {disc['range']}m:")
                    if 'issue' in disc:
                        print(f"        {disc['issue']}")
                    else:
                        for issue in disc['issues']:
                            print(f"        {issue}")

                if len(error['details']) > 3:
                    print(f"      ... und {len(error['details']) - 3} weitere")
        else:
            print("\n✅✅✅ Alle Tabellen korrekt validiert! Keine Abweichungen gefunden!")

        print("\n" + "="*80)

        # Speichere Bericht als JSON
        report_path = self.base_path / 'validation-report.json'
        report_data = {
            'timestamp': str(pd.Timestamp.now()),
            'validated_tables': self.validated_tables,
            'warnings': self.warnings,
            'errors': self.errors
        }

        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2)

        print(f"\n📄 Detaillierter Bericht gespeichert: {report_path}")

    def run(self, skip_inspection: bool = False):
        """Führt die vollständige Validierung durch"""
        print("🚀 Starte Ballistische Tabellen Validierung\n")

        # 1. Excel-Daten laden
        excel_data = self.load_excel_data()

        # 2. JSON-Tabellen laden
        json_tables = self.load_json_tables()

        # 3. Excel-Struktur inspizieren (optional)
        if not skip_inspection:
            self.inspect_excel_structure(excel_data)

        # 4. Range Data Sheet parsen
        print("\n📊 Parse Range Data Sheet...")
        range_data_df = excel_data.get('calc_Range Data')
        if range_data_df is None:
            print("❌ 'Range Data' Sheet nicht gefunden!")
            return

        excel_tables = self.parse_range_data_sheet(range_data_df)
        print(f"  ✓ {len(excel_tables)} Tabellen gefunden")
        print(f"  📋 Tabellen: {list(excel_tables.keys())}")

        # 5. Validiere alle JSON-Tabellen
        print("\n" + "="*80)
        print("🔍 STARTE VALIDIERUNG")
        print("="*80)

        for table_name, json_data in sorted(json_tables.items()):
            self.validate_table(json_data, excel_tables, table_name)

        # 6. Bericht generieren
        self.generate_report()

if __name__ == '__main__':
    import sys
    skip_inspection = '--skip-inspection' in sys.argv

    validator = BallisticTableValidator()
    validator.run(skip_inspection=skip_inspection)
