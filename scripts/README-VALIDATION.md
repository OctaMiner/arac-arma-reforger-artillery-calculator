# Ballistische Tabellen Validierung

## Übersicht

Das Validierungsskript `validate-ballistic-tables.py` vergleicht alle JSON-Tabellen mit den Excel-Referenzdaten und stellt sicher, dass die Daten korrekt übernommen wurden.

## Verwendung

### Vollständige Validierung

```bash
python3 scripts/validate-ballistic-tables.py
```

Dies führt eine vollständige Validierung durch, inklusive Struktur-Inspektion der Excel-Dateien.

### Schnelle Validierung (ohne Inspektion)

```bash
python3 scripts/validate-ballistic-tables.py --skip-inspection
```

Überspringt die ausführliche Struktur-Analyse und validiert direkt.

## Ausgaben

Das Skript erstellt:

1. **Konsolen-Ausgabe** mit detaillierten Validierungsergebnissen
2. **`validation-report.json`** - Maschinenlesbarer Report
3. **`VALIDATION-REPORT.md`** - Menschenlesbarer Bericht

## Validierte Daten

Für jeden Eintrag werden validiert:

- **Range** (Entfernung in Metern)
- **Elevation** (MIL)
- **Time of Flight** (Sekunden)
- **Delta Elevation** (MIL pro 100m)

## Excel-Referenz

Die Referenzdaten stammen aus:
- `Arma Reforger Mortar Calc.xlsx`, Sheet "Range Data"

## Validierte Tabellen

### Russische Mörser (RUS)
- HE: Ring 0-4 (5 Tabellen)
- Illumination: Ring 1-4 (4 Tabellen)
- Smoke: Ring 1-4 (4 Tabellen)

### US Mörser
- HE: Ring 0-4 (5 Tabellen)
- Illumination: Ring 1-4 (4 Tabellen)
- Smoke: Ring 1-4 (4 Tabellen)

**Gesamt: 14 Tabellen mit 367 Einträgen**

## Anforderungen

```bash
pip install pandas openpyxl
```

## Integration in Testsuite

Die Validierung ist auch als Vitest-Test verfügbar:

```bash
npm test tests/integration/ballistic-tables-validation.test.ts
```

## Fehlerbehebung

### Excel-Datei nicht gefunden

Stelle sicher, dass folgende Dateien im Projekt-Root existieren:
- `Arma Reforger Mortar Calc.xlsx`
- `Berechnungen Mor-ohne Map.xlsx`

### JSON-Dateien nicht gefunden

Prüfe, dass alle JSON-Dateien in `src/lib/ballistics/data/` vorhanden sind.

## Ergebnis

Aktueller Status: ✅ **Alle 14 Tabellen validiert, 0 Fehler**
