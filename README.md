# ARAC - Arma Reforger Artillery Calculator

Ein präziser Mörser-Ballistik-Rechner für Arma Reforger mit interaktiver Kartenansicht.

## Features

- **Interaktive Karte**: Mörser- und Zielposition per Klick setzen
- **Präzise Berechnung**: Azimut, Elevation und Flugzeit
- **Mehrere Mörser**: US und RUS Mörser unterstützt
- **Munitionstypen**: HE, Smoke, Illumination
- **Höhenkompensation**: Automatische Korrektur für Höhenunterschiede
- **Schnelle Updates**: Echtzeit-Berechnung beim Ziehen der Marker
- **Fire Missions**: Ziele speichern und schnell laden
- **Offline**: Keine Internetverbindung erforderlich

## Screenshots

*Coming soon*

## Installation

### Windows

1. Lade die neueste Version von [Releases](../../releases) herunter
2. Führe den Installer aus oder nutze die portable Version
3. Starte ARAC

### Aus dem Quellcode

```bash
# Repository klonen
git clone https://github.com/YOUR_USERNAME/arma-reforger-artillery-calc.git
cd arma-reforger-artillery-calc

# Dependencies installieren
npm install

# Entwicklungsmodus starten
npm run dev

# Für Produktion bauen
npm run build
npm run electron:build
```

## Verwendung

1. **Karte auswählen**: Wähle die aktuelle Spielkarte (z.B. Everon)
2. **Mörser-Position**: Klicke auf die Karte um deine Mörser-Position zu setzen
3. **Ziel-Position**: Ctrl+Klick um das Ziel zu setzen
4. **Konfiguration**: Wähle Mörser-Typ (US/RUS), Munition und Ladung
5. **Höhen eingeben**: Trage die Höhen von Mörser und Ziel ein
6. **Ablesen**: Azimut und Elevation werden automatisch berechnet

### Feuerkommando

Nach der Berechnung erhältst du:
- **Azimut** (MIL): Richtung zum Ziel
- **Elevation** (MIL): Höhenwinkel für die Distanz
- **Flugzeit** (Sek): Zeit bis zum Einschlag

## Berechnungsgrundlage

Die Berechnungen basieren auf:
- Offiziellen In-Game Tabellen
- Polynomial-Interpolation für präzise Zwischenwerte
- Höhenkorrektur basierend auf ballistischen Formeln

### Genauigkeit

Bei korrekter Eingabe der Koordinaten und Höhen liegt die Abweichung bei unter 5 Metern auf 2000m Entfernung.

## Bekannte Limitierungen

- **Wind**: Wind-Korrektur ist experimentell und muss noch kalibriert werden
- **Höhendaten**: Terrain-Höhen müssen manuell eingegeben werden

## Roadmap

- [x] MVP: Basis-Berechnung und Kartenansicht
- [ ] Spotter-Modus (Vektor-Fernglas Eingabe)
- [ ] Wind-Korrektur
- [ ] Weitere Karten (Arland, etc.)
- [ ] Feuerkorrektur-Assistent

## Tech Stack

- **Electron**: Desktop-Framework
- **React**: UI-Framework
- **TypeScript**: Typsichere Entwicklung
- **Leaflet.js**: Kartenvisualisierung
- **TailwindCSS**: Styling

## Mitwirken

Beiträge sind willkommen! Bitte lies zuerst die Dokumentation in `/docs`.

### Entwicklung

```bash
# Development Server starten
npm run dev

# Tests ausführen
npm run test

# Linting
npm run lint
```

### Projektstruktur

```
├── docs/            # Dokumentation (PRD, Architektur)
├── .claude/         # Claude Code Agent-Definitionen
├── electron/        # Electron Main Process
├── src/
│   ├── components/  # React Komponenten
│   ├── lib/         # Business Logic (Berechnung)
│   └── assets/      # Karten, Icons
└── tests/           # Test-Suite
```

## Credits

- **Gene**: Ballistische Tabellen und Range Data
- **Marcel**: Polynomial-Berechnungen und Formeln
- **iZurvive**: Karten-Referenz

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

## Disclaimer

Dieses Projekt ist ein Fan-Projekt und steht in keiner Verbindung zu Bohemia Interactive.
Arma Reforger ist ein eingetragenes Warenzeichen von Bohemia Interactive.
