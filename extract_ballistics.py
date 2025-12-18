#!/usr/bin/env python3
"""
Ballistics Data Extractor
Extrahiert ballistische Daten aus Gene's Excel und erstellt JSON-Dateien
"""

import pandas as pd
import json
from pathlib import Path
from typing import Dict, List, Any

def extract_ballistics_data(excel_file: str, output_dir: str):
    """Extrahiert ballistische Daten und erstellt JSON-Dateien"""

    # Excel einlesen
    df = pd.read_excel(excel_file, sheet_name='Range Data')

    # Output-Verzeichnis erstellen
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Index für alle generierten Dateien
    index = {
        "version": "1.0",
        "source": "Arma Reforger Mortar Calc.xlsx",
        "tables": []
    }

    # Für jede Kombination von Mortar Type, Shell Type und Ring Count
    mortar_types = df['Mortar Type'].unique()
    shell_types = df['Shell Type'].unique()
    ring_counts = sorted(df['Ring Count'].unique())

    for mortar in mortar_types:
        for shell in shell_types:
            # HE: Separate Dateien pro Ring
            if shell == 'HE':
                for ring in ring_counts:
                    create_json_file(df, mortar, shell, ring, output_path, index)
            # Smoke und Illumination: Alle Ringe in einer Datei
            else:
                create_combined_json_file(df, mortar, shell, ring_counts, output_path, index)

    # Polynomial Coefficients extrahieren (falls vorhanden)
    # Diese müssten aus den Formeln oder separaten Daten kommen
    # Für jetzt erstelle ich Platzhalter

    # Index-Datei speichern
    index_file = output_path / 'ballistic-tables-index.json'
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"✓ Ballistische Daten erfolgreich extrahiert!")
    print(f"✓ {len(index['tables'])} Tabellen erstellt")
    print(f"✓ Index: {index_file}")

    return index

def create_json_file(df: pd.DataFrame, mortar: str, shell: str, ring: int, output_path: Path, index: dict):
    """Erstellt eine JSON-Datei für eine spezifische Kombination"""

    # Daten filtern
    filtered = df[(df['Mortar Type'] == mortar) &
                  (df['Shell Type'] == shell) &
                  (df['Ring Count'] == ring)]

    if len(filtered) == 0:
        return

    # Entries erstellen
    entries = []
    for _, row in filtered.iterrows():
        entry = {
            "range": int(row['Range (m)']),
            "elevation": int(row['Elevation (mil)']),
            "tof": float(row['Time of Flight (sec)']),
            "dElev": int(row['D Elev (mil)'])
        }
        entries.append(entry)

    # JSON-Struktur
    data = {
        "mortarType": mortar,
        "ammoType": shell,
        "ringCount": int(ring),
        "minRange": int(filtered['Range (m)'].min()),
        "maxRange": int(filtered['Range (m)'].max()),
        "entries": entries
    }

    # Dateiname generieren
    mortar_short = mortar.lower()
    shell_short = shell.lower()
    filename = f"{mortar_short}-{shell_short}-ring{ring}.json"
    filepath = output_path / filename

    # Speichern
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Zum Index hinzufügen
    index['tables'].append({
        "file": filename,
        "mortarType": mortar,
        "ammoType": shell,
        "ringCount": int(ring),
        "minRange": int(filtered['Range (m)'].min()),
        "maxRange": int(filtered['Range (m)'].max()),
        "entryCount": len(entries)
    })

    print(f"✓ {filename} ({len(entries)} entries)")

def create_combined_json_file(df: pd.DataFrame, mortar: str, shell: str, ring_counts: List, output_path: Path, index: dict):
    """Erstellt eine kombinierte JSON-Datei für Smoke/Illumination (alle Ringe)"""

    # Daten filtern
    filtered = df[(df['Mortar Type'] == mortar) &
                  (df['Shell Type'] == shell)]

    if len(filtered) == 0:
        return

    # Nach Ring gruppieren
    rings_data = {}
    for ring in ring_counts:
        ring_data = filtered[filtered['Ring Count'] == ring]
        if len(ring_data) > 0:
            entries = []
            for _, row in ring_data.iterrows():
                entry = {
                    "range": int(row['Range (m)']),
                    "elevation": int(row['Elevation (mil)']),
                    "tof": float(row['Time of Flight (sec)']),
                    "dElev": int(row['D Elev (mil)'])
                }
                entries.append(entry)
            rings_data[int(ring)] = entries

    # JSON-Struktur
    data = {
        "mortarType": mortar,
        "ammoType": shell,
        "rings": rings_data,
        "minRange": int(filtered['Range (m)'].min()),
        "maxRange": int(filtered['Range (m)'].max())
    }

    # Dateiname generieren
    mortar_short = mortar.lower()
    shell_short = shell.lower()
    filename = f"{mortar_short}-{shell_short}.json"
    filepath = output_path / filename

    # Speichern
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Zum Index hinzufügen
    total_entries = sum(len(entries) for entries in rings_data.values())
    index['tables'].append({
        "file": filename,
        "mortarType": mortar,
        "ammoType": shell,
        "ringCount": "all",
        "minRange": int(filtered['Range (m)'].min()),
        "maxRange": int(filtered['Range (m)'].max()),
        "entryCount": total_entries
    })

    print(f"✓ {filename} ({total_entries} entries across {len(rings_data)} rings)")

if __name__ == '__main__':
    # Pfade
    base_dir = Path(__file__).parent
    excel_file = base_dir / 'Arma Reforger Mortar Calc.xlsx'
    output_dir = base_dir / 'src/lib/ballistics/data'

    # Extrahieren
    index = extract_ballistics_data(str(excel_file), str(output_dir))

    print(f"\n📊 Summary:")
    print(f"   Total tables: {len(index['tables'])}")
    print(f"   Output directory: {output_dir}")
