/**
 * Integration Test: Ballistische Tabellen Validierung
 *
 * Dieser Test validiert alle ballistischen JSON-Tabellen gegen die Excel-Referenz.
 * Er stellt sicher, dass die Daten korrekt und vollständig sind.
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import aller ballistischen Tabellen
import rusHeRing0 from '../../src/lib/ballistics/data/rus-he-ring0.json';
import rusHeRing1 from '../../src/lib/ballistics/data/rus-he-ring1.json';
import rusHeRing2 from '../../src/lib/ballistics/data/rus-he-ring2.json';
import rusHeRing3 from '../../src/lib/ballistics/data/rus-he-ring3.json';
import rusHeRing4 from '../../src/lib/ballistics/data/rus-he-ring4.json';
import rusIllumination from '../../src/lib/ballistics/data/rus-illumination.json';
import rusSmoke from '../../src/lib/ballistics/data/rus-smoke.json';

import usHeRing0 from '../../src/lib/ballistics/data/us-he-ring0.json';
import usHeRing1 from '../../src/lib/ballistics/data/us-he-ring1.json';
import usHeRing2 from '../../src/lib/ballistics/data/us-he-ring2.json';
import usHeRing3 from '../../src/lib/ballistics/data/us-he-ring3.json';
import usHeRing4 from '../../src/lib/ballistics/data/us-he-ring4.json';
import usIllumination from '../../src/lib/ballistics/data/us-illumination.json';
import usSmoke from '../../src/lib/ballistics/data/us-smoke.json';

describe('Ballistische Tabellen Validierung', () => {
  describe('Russische HE Tabellen', () => {
    test('RUS HE Ring 0: Struktur und Referenzwerte', () => {
      expect(rusHeRing0.mortarType).toBe('RUS');
      expect(rusHeRing0.ammoType).toBe('HE');
      expect(rusHeRing0.ringCount).toBe(0);
      expect(rusHeRing0.entries).toHaveLength(10);

      // Referenzwert: 50m
      const entry50m = rusHeRing0.entries.find((e) => e.range === 50);
      expect(entry50m).toBeDefined();
      expect(entry50m?.elevation).toBe(1455);
      expect(entry50m?.tof).toBe(15.0);
      expect(entry50m?.dElev).toBe(44);
    });

    test('RUS HE Ring 1: Vollständigkeit', () => {
      expect(rusHeRing1.entries).toHaveLength(8);
      expect(rusHeRing1.minRange).toBe(100);
      expect(rusHeRing1.maxRange).toBe(800);
    });

    test('RUS HE Ring 2: Vollständigkeit', () => {
      expect(rusHeRing2.entries).toHaveLength(13);
      expect(rusHeRing2.minRange).toBe(200);
      expect(rusHeRing2.maxRange).toBe(1400);
    });

    test('RUS HE Ring 3: Vollständigkeit', () => {
      expect(rusHeRing3.entries).toHaveLength(16);
      expect(rusHeRing3.minRange).toBe(300);
      expect(rusHeRing3.maxRange).toBe(1800);
    });

    test('RUS HE Ring 4: Vollständigkeit', () => {
      expect(rusHeRing4.entries).toHaveLength(20);
      expect(rusHeRing4.minRange).toBe(400);
      expect(rusHeRing4.maxRange).toBe(2400);
    });
  });

  describe('US HE Tabellen', () => {
    test('US HE Ring 0: Struktur und Referenzwerte', () => {
      expect(usHeRing0.mortarType).toBe('US');
      expect(usHeRing0.ammoType).toBe('HE');
      expect(usHeRing0.ringCount).toBe(0);
      expect(usHeRing0.entries).toHaveLength(8);
    });

    test('US HE Ring 4: Referenzwert 2304m (Marcel Test)', () => {
      // Dies ist der kritische Referenzwert aus Marcel's Berechnung
      // dElev aus Gene's Excel: 15 mils/100m (NICHT 36!)
      const entry2300m = usHeRing4.entries.find((e) => e.range === 2300);
      expect(entry2300m).toBeDefined();
      expect(entry2300m?.elevation).toBe(1134);
      expect(entry2300m?.tof).toBe(32.7);
      expect(entry2300m?.dElev).toBe(15);
    });

    test('US HE Ring 4: Vollständigkeit', () => {
      expect(usHeRing4.entries).toHaveLength(26);
      expect(usHeRing4.minRange).toBe(400);
      expect(usHeRing4.maxRange).toBe(2900);
    });
  });

  describe('Illumination Tabellen', () => {
    test('RUS Illumination: Struktur mit Rings', () => {
      expect(rusIllumination.mortarType).toBe('RUS');
      expect(rusIllumination.ammoType).toBe('Illumination');
      expect(rusIllumination.rings).toBeDefined();
      expect(Object.keys(rusIllumination.rings)).toEqual(['1', '2', '3', '4']);
    });

    test('US Illumination: Struktur mit Rings', () => {
      expect(usIllumination.mortarType).toBe('US');
      expect(usIllumination.ammoType).toBe('Illumination');
      expect(usIllumination.rings).toBeDefined();
      expect(Object.keys(usIllumination.rings)).toEqual(['1', '2', '3', '4']);
    });

    test('US Illumination Ring 1: Vollständigkeit', () => {
      expect(usIllumination.rings['1']).toHaveLength(12);
    });

    test('US Illumination Ring 4: Vollständigkeit', () => {
      expect(usIllumination.rings['4']).toHaveLength(21);
    });
  });

  describe('Smoke Tabellen', () => {
    test('RUS Smoke: Struktur mit Rings', () => {
      expect(rusSmoke.mortarType).toBe('RUS');
      expect(rusSmoke.ammoType).toBe('Smoke');
      expect(rusSmoke.rings).toBeDefined();
      expect(Object.keys(rusSmoke.rings)).toEqual(['1', '2', '3', '4']);
    });

    test('US Smoke: Struktur mit Rings', () => {
      expect(usSmoke.mortarType).toBe('US');
      expect(usSmoke.ammoType).toBe('Smoke');
      expect(usSmoke.rings).toBeDefined();
      expect(Object.keys(usSmoke.rings)).toEqual(['1', '2', '3', '4']);
    });
  });

  describe('Datenintegrität', () => {
    test('Alle Einträge haben erforderliche Felder', () => {
      const allTables = [
        rusHeRing0,
        rusHeRing1,
        rusHeRing2,
        rusHeRing3,
        rusHeRing4,
        usHeRing0,
        usHeRing1,
        usHeRing2,
        usHeRing3,
        usHeRing4,
      ];

      allTables.forEach((table) => {
        table.entries.forEach((entry) => {
          expect(entry.range).toBeGreaterThan(0);
          expect(entry.elevation).toBeGreaterThan(0);
          expect(entry.tof).toBeGreaterThan(0);
          expect(entry.dElev).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('Entfernungen sind aufsteigend sortiert', () => {
      const allTables = [
        rusHeRing0,
        rusHeRing1,
        rusHeRing2,
        rusHeRing3,
        rusHeRing4,
        usHeRing0,
        usHeRing1,
        usHeRing2,
        usHeRing3,
        usHeRing4,
      ];

      allTables.forEach((table) => {
        for (let i = 1; i < table.entries.length; i++) {
          expect(table.entries[i].range).toBeGreaterThan(
            table.entries[i - 1].range
          );
        }
      });
    });

    test('Min/Max Range stimmen mit Einträgen überein', () => {
      const allTables = [
        rusHeRing0,
        rusHeRing1,
        rusHeRing2,
        rusHeRing3,
        rusHeRing4,
        usHeRing0,
        usHeRing1,
        usHeRing2,
        usHeRing3,
        usHeRing4,
      ];

      allTables.forEach((table) => {
        const ranges = table.entries.map((e) => e.range);
        const minRange = Math.min(...ranges);
        const maxRange = Math.max(...ranges);

        expect(table.minRange).toBe(minRange);
        expect(table.maxRange).toBe(maxRange);
      });
    });
  });

  describe('Excel-Validierungsbericht', () => {
    test('Validierungsbericht existiert und zeigt Erfolg', () => {
      const reportPath = join(__dirname, '../../validation-report.json');
      const report = JSON.parse(readFileSync(reportPath, 'utf-8'));

      expect(report.validated_tables).toHaveLength(14);
      expect(report.errors).toHaveLength(0);
      expect(report.warnings).toHaveLength(0);

      // Prüfe, dass alle erwarteten Tabellen validiert wurden
      const expectedTables = [
        'rus-he-ring0',
        'rus-he-ring1',
        'rus-he-ring2',
        'rus-he-ring3',
        'rus-he-ring4',
        'rus-illumination',
        'rus-smoke',
        'us-he-ring0',
        'us-he-ring1',
        'us-he-ring2',
        'us-he-ring3',
        'us-he-ring4',
        'us-illumination',
        'us-smoke',
      ];

      expectedTables.forEach((table) => {
        expect(report.validated_tables).toContain(table);
      });
    });
  });
});
