# ARAC - Arma Reforger Artillery Calculator

Ein präziser Mörser-Ballistik-Rechner für Arma Reforger mit interaktiver Kartenansicht und automatischer Höhenberechnung.

## Features

- **24 Karten**: Alle offiziellen und Community-Maps unterstützt
- **Automatische Höhendaten**: Terrain-Höhen werden für 10 Maps automatisch geladen
- **Präzise Berechnung**: Azimut, Elevation, Flugzeit und Ringzahl
- **US & RUS Mörser**: Beide Fraktionen mit allen Munitionstypen
- **Spotter-Modus**: Zielerfassung mit Vector 21 Fernglas-Daten
- **Feuerkorrektur**: Einschlag-Korrekturen berechnen
- **Offline-fähig**: Funktioniert ohne Internetverbindung (nach erstem Laden)

---

## Schnellstart

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder höher)
- npm (wird mit Node.js installiert)

### Installation & Start

```bash
# 1. Repository klonen
git clone https://github.com/OctaMiner/arac-arma-reforger-artillery-calculator.git
cd arac-arma-reforger-artillery-calculator

# 2. Dependencies installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Die App öffnet sich automatisch im Browser unter `http://localhost:5173`

### Als Desktop-App (Electron)

```bash
# Entwicklungsmodus mit Electron
npm run electron:dev

# Für Produktion bauen (erstellt .exe/.dmg/.AppImage)
npm run build
npm run electron:build
```

---

## Verwendung

### Schritt 1: Karte auswählen

Wähle oben links die aktuelle Spielkarte aus dem Dropdown (z.B. Everon, Arland, etc.).

### Schritt 2: Mörser-Position setzen

**Linksklick** auf die Karte setzt die Mörser-Position (blauer Marker).

- Die Höhe wird automatisch aus den Kartendaten ermittelt (falls verfügbar)
- Oder: Gib die Höhe manuell im Seitenmenü ein

### Schritt 3: Ziel-Position setzen

**Rechtsklick** oder **Shift+Klick** auf die Karte setzt das Ziel (roter Marker).

- Alternativ: Ctrl+Klick oder Alt+Klick
- Auch hier wird die Höhe automatisch ermittelt

### Schritt 4: Mörser & Munition wählen

Im Seitenmenü:
1. **Mörser-Typ**: US M252 oder RUS 2B14 Podnos
2. **Munition**: HE (Spreng), Smoke (Rauch), Illumination (Leucht)
3. **Ring/Ladung**: Je höher der Ring, desto weiter die Reichweite

### Schritt 5: Feuerkommando ablesen

Die Ergebnisse werden automatisch berechnet und angezeigt:

| Wert | Beschreibung |
|------|-------------|
| **Azimut** | Richtung zum Ziel in MIL (0-6400) |
| **Elevation** | Höhenwinkel in MIL |
| **Entfernung** | Distanz zum Ziel in Metern |
| **Flugzeit** | Zeit bis zum Einschlag in Sekunden |
| **Ring** | Empfohlene Ladungsstufe |

---

## Wie funktioniert die Berechnung?

### 1. Entfernungsberechnung

Die Entfernung wird aus den Koordinaten berechnet:

```
Entfernung = √((ZielX - MörserX)² + (ZielY - MörserY)²)
```

Arma Reforger verwendet ein metrisches Koordinatensystem (1 Einheit = 1 Meter).

### 2. Azimut-Berechnung

Der Azimut (Richtung) wird in NATO-MIL berechnet:

```
Azimut = atan2(ZielX - MörserX, ZielY - MörserY) × (3200 / π)
```

- 0 MIL = Norden
- 1600 MIL = Osten
- 3200 MIL = Süden
- 4800 MIL = Westen

### 3. Elevation (Höhenwinkel)

Die Elevation basiert auf den offiziellen In-Game Tabellen:

1. **Basis-Elevation**: Aus der ballistischen Tabelle für die Entfernung
2. **Höhenkorrektur**: Anpassung für Höhenunterschied zwischen Mörser und Ziel

```
Finale Elevation = Basis-Elevation + (Höhenunterschied × dElev-Koeffizient)
```

Der **dElev-Koeffizient** (MIL pro 100m Höhenunterschied) variiert je nach:
- Entfernung
- Munitionstyp
- Ring/Ladung

### 4. Interpolation

Für Entfernungen zwischen den Tabellenwerten wird **polynomiale Interpolation** verwendet, um präzise Zwischenwerte zu berechnen.

---

## Spotter-Modus

Der Spotter-Modus ermöglicht die Zielerfassung mit dem Vector 21 Fernglas:

1. **Spotter-Position eingeben**: GPS-Koordinaten des Beobachters
2. **Messwerte eingeben**:
   - Entfernung zum Ziel (vom Fernglas)
   - Azimut zum Ziel (vom Fernglas)
3. **Ziel berechnen**: Die App berechnet die absolute Zielposition

### Feuerkorrektur

Nach dem ersten Schuss kann die Korrektur eingegeben werden:
- **Links/Rechts**: Seitliche Abweichung in Metern
- **Add/Drop**: Längenabweichung in Metern

Die App berechnet automatisch die korrigierte Feuerlösung.

---

## Verfügbare Karten

### Mit automatischen Höhendaten (10 Maps)

| Karte | Größe |
|-------|-------|
| Everon | 51.2 km² |
| Arland | 25 km² |
| Kolguev | 42 km² |
| Anizay | 16 km² |
| Gogland | 16 km² |
| Kunar | 100 km² |
| Saigon | 16 km² |
| Takistan | 16 km² |
| Zarichne | 25 km² |
| Zimnitrita | 16 km² |

### Ohne Höhendaten (manuelle Eingabe)

Bad Orb, Belleau, Fallujah, Khanh Trung, Myccano, Nizla, Novka, Rooikat, Rostov, Ruha, Seitenbuch, Serhiivka, Udachne

---

## Projektstruktur

```
├── src/
│   ├── components/     # React UI-Komponenten
│   │   ├── Map/        # Kartenansicht (Leaflet)
│   │   ├── Config/     # Eingabefelder
│   │   ├── Results/    # Ergebnisanzeige
│   │   └── Spotter/    # Spotter-Modus
│   ├── lib/
│   │   ├── ballistics/ # Ballistik-Berechnungen
│   │   ├── maps/       # Karten-Konfiguration
│   │   └── spotter/    # Spotter-Logik
│   ├── stores/         # Zustand (State Management)
│   └── hooks/          # React Hooks
├── electron/           # Desktop-App (Electron)
├── public/             # Statische Assets
└── docs/               # Dokumentation
```

---

## Entwicklung

```bash
# Development Server
npm run dev

# Tests ausführen
npm run test

# TypeScript prüfen
npx tsc --noEmit

# Produktion bauen
npm run build
```

---

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Typsichere Entwicklung
- **Vite** - Build Tool
- **Leaflet.js** - Kartenvisualisierung
- **Zustand** - State Management
- **TailwindCSS** - Styling
- **Electron** - Desktop-App

---

## Genauigkeit

Bei korrekter Eingabe liegt die Abweichung bei:
- **< 5 Meter** auf 2000m Entfernung
- **< 10 Meter** auf maximale Reichweite

Die Berechnungen basieren auf den offiziellen In-Game Tabellen und wurden gegen diese validiert.

---

## Bekannte Limitierungen

- **Wind**: Wind-Korrektur ist noch nicht implementiert
- **Bewegte Ziele**: Keine Vorhaltberechnung

---

## Credits

- **GeNeFRAG**: Karten-Daten, Höhendaten und CDN-Hosting
- **Marcel**: Ballistische Formeln und Polynomial-Berechnungen
- **Bohemia Interactive**: Arma Reforger

---

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

---

## Disclaimer

Dieses Projekt ist ein Community-Projekt und steht in keiner offiziellen Verbindung zu Bohemia Interactive. Arma Reforger ist ein eingetragenes Warenzeichen von Bohemia Interactive a.s.
