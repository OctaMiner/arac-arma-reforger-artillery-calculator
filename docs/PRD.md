# Product Requirements Document (PRD)
# Arma Reforger Mörser-Rechner

## 1. Produktübersicht

### 1.1 Produktname
**Arma Reforger Artillery Calculator** (ARAC)

### 1.2 Produktvision
Ein benutzerfreundlicher, präziser Mörser-Ballistik-Rechner für Arma Reforger, der Spielern ermöglicht, schnell und akkurat Feuerkommandos zu berechnen. Die Anwendung kombiniert eine interaktive Kartenansicht mit fortschrittlichen ballistischen Berechnungen.

### 1.3 Zielgruppe
- Arma Reforger Spieler (Mörser-Teams)
- Milsim-Gruppen und Clans
- Einzelspieler und Teamleader

---

## 2. Kernfunktionen

### 2.1 Kartenbasierte Zielerfassung
- Interaktive Karten aller Arma Reforger Maps (**24 Karten verfügbar**)
- Karten werden via CDN geladen (GeNeFRAG's Cloudflare R2 Storage)
- Mörser-Position per Klick setzen
- Zielposition per Klick setzen
- Echtzeit-Aktualisierung der Berechnungen beim Verschieben
- **Automatische Höhendaten** für 9 Maps (Everon, Arland, Kolguev, etc.)

### 2.2 Ballistik-Berechnung
- **Entfernungsberechnung**: Aus Ost/Nord-Koordinaten
- **Azimut-Berechnung**: Richtung in Grad und MIL (Strich)
- **Elevation-Berechnung**: Höhenwinkel basierend auf Distanz und Ladung
- **Höhenkompensation**: Delta-ELEV für Höhenunterschiede
- **Flugzeit**: Time of Flight Berechnung
- **Polynomial-Flugbahn**: Präzise Berechnung bis 5. Grades

### 2.3 Mörser-Konfiguration
- **Mörser-Typ**: US / RUS Auswahl
- **Munitionstyp**: HE, Smoke, Illumination
- **Ladung (Ring Count)**: 0-4 Ringe

### 2.4 Erweiterte Funktionen (Phase 2)

#### 2.4.1 Wind-Korrektur
- Windrichtung eingeben (8 Himmelsrichtungen oder Grad)
- Windstärke eingeben
- **HINWEIS**: Genaue Wind-Einfluss-Faktoren müssen noch ermittelt werden

#### 2.4.2 Spotter-Unterstützung (Vektor-Fernglas)
- Spotter-GPS-Position eingeben
- Entfernung zum Ziel (vom Fernglas)
- Winkelgrad (Azimut vom Fernglas)
- Höhenabweichung
- Automatische Zielkoordinaten-Berechnung

#### 2.4.3 Feuerkorrektur
- Einschlagposition eingeben
- Abweichung zum Ziel berechnen
- Korrekturwerte ausgeben

### 2.5 Fire Mission Management
- Fire Missions speichern
- Gespeicherte Missionen schnell laden
- Mission-Namen vergeben

---

## 3. User Stories

### Epic 1: Grundlegende Berechnung

#### US-1.1: Mörser-Position setzen
**Als** Mörser-Schütze
**möchte ich** meine Position auf der Karte markieren können
**damit** die Berechnung von meinem Standort ausgeht

**Akzeptanzkriterien:**
- Klick auf Karte setzt Mörser-Marker
- Koordinaten werden in Ost/Nord angezeigt
- Marker ist visuell als "Mörser" erkennbar
- Höhe kann manuell eingegeben werden

#### US-1.2: Ziel setzen
**Als** Mörser-Schütze
**möchte ich** das Ziel auf der Karte markieren können
**damit** die Berechnung zum Ziel erfolgt

**Akzeptanzkriterien:**
- Klick auf Karte setzt Ziel-Marker
- Koordinaten werden in Ost/Nord angezeigt
- Linie zwischen Mörser und Ziel wird angezeigt
- Entfernung wird live angezeigt

#### US-1.3: Feuerkommando berechnen
**Als** Mörser-Schütze
**möchte ich** automatisch die Einstellungen berechnet bekommen
**damit** ich den Mörser korrekt einstellen kann

**Akzeptanzkriterien:**
- Azimut in MIL wird angezeigt
- Elevation in MIL wird angezeigt
- Flugzeit in Sekunden wird angezeigt
- Empfohlene Ladung wird angezeigt

#### US-1.4: Mörser-Typ wählen
**Als** Mörser-Schütze
**möchte ich** zwischen US und RUS Mörser wählen können
**damit** die korrekten ballistischen Daten verwendet werden

**Akzeptanzkriterien:**
- Dropdown/Toggle für Mörser-Typ
- Ballistik-Tabelle wechselt automatisch
- Berechnung aktualisiert sich sofort

#### US-1.5: Munitionstyp wählen
**Als** Mörser-Schütze
**möchte ich** den Munitionstyp auswählen können
**damit** die korrekte Flugbahn berechnet wird

**Akzeptanzkriterien:**
- Auswahl: HE, Smoke, Illumination
- Reichweiten-Limits werden angepasst
- Warnung bei Ziel außer Reichweite

---

### Epic 2: Karteninteraktion

#### US-2.1: Karte auswählen
**Als** Spieler
**möchte ich** die aktuelle Spielkarte auswählen können
**damit** die richtige Karte angezeigt wird

**Akzeptanzkriterien:**
- Dropdown mit 24 verfügbaren Karten
- Everon als erste/Standard-Karte
- Karte lädt via CDN mit korrektem Koordinatensystem
- Höhendaten werden automatisch geladen (wenn verfügbar)

#### US-2.2: Karte zoomen und verschieben
**Als** Spieler
**möchte ich** die Karte zoomen und verschieben können
**damit** ich den gewünschten Bereich sehe

**Akzeptanzkriterien:**
- Mausrad zum Zoomen
- Drag zum Verschieben
- Koordinatenraster bleibt sichtbar
- Smooth Scrolling

#### US-2.3: Koordinaten-Grid
**Als** Spieler
**möchte ich** ein Koordinatenraster sehen
**damit** ich mich orientieren kann

**Akzeptanzkriterien:**
- 100m Raster sichtbar bei hohem Zoom
- Beschriftung an den Rändern
- Grid kann ein/ausgeblendet werden

---

### Epic 3: Schnelle Zielwechsel

#### US-3.1: Ziel verschieben
**Als** Mörser-Schütze
**möchte ich** das Ziel schnell verschieben können
**damit** ich auf neue Feindpositionen reagieren kann

**Akzeptanzkriterien:**
- Drag & Drop des Ziel-Markers
- Berechnung aktualisiert in < 100ms
- Keine Verzögerung beim Ziehen

#### US-3.2: Direkteingabe Koordinaten
**Als** Mörser-Schütze
**möchte ich** Koordinaten direkt eingeben können
**damit** ich vom Spotter gemeldete Positionen nutzen kann

**Akzeptanzkriterien:**
- Eingabefelder für Ost/Nord
- Eingabe validiert (nur Zahlen)
- Karte zentriert auf eingegebene Position

---

### Epic 4: Erweiterte Berechnungen

#### US-4.1: Höhenkompensation
**Als** Mörser-Schütze
**möchte ich** Höhenunterschiede berücksichtigen können
**damit** die Berechnung präziser ist

**Akzeptanzkriterien:**
- Eingabefeld für Mörser-Höhe (m)
- Eingabefeld für Ziel-Höhe (m)
- Delta-ELEV wird automatisch berechnet
- Korrigierte Elevation wird angezeigt

#### US-4.2: Wind-Eingabe (Basis)
**Als** Mörser-Schütze
**möchte ich** Windrichtung und -stärke eingeben können
**damit** ich Wind berücksichtigen kann

**Akzeptanzkriterien:**
- Windrichtung auswählbar (N, NE, E, SE, S, SW, W, NW)
- Windstärke eingebbar
- Hinweis dass Wind-Korrektur experimentell ist

#### US-4.3: Spotter-Modus
**Als** Spotter mit Vektor-Fernglas
**möchte ich** meine Beobachtungen eingeben können
**damit** das Ziel berechnet wird

**Akzeptanzkriterien:**
- Spotter-Position (GPS) eingeben
- Entfernung zum Ziel eingeben
- Winkel zum Ziel eingeben
- Höhendifferenz eingeben
- Zielkoordinaten werden berechnet

---

### Epic 5: Mission Management

#### US-5.1: Fire Mission speichern
**Als** Mörser-Schütze
**möchte ich** Feuerkommandos speichern können
**damit** ich sie später schnell abrufen kann

**Akzeptanzkriterien:**
- "Speichern" Button
- Namen für Mission eingeben
- Alle Parameter werden gespeichert

#### US-5.2: Fire Mission laden
**Als** Mörser-Schütze
**möchte ich** gespeicherte Missionen laden können
**damit** ich schnell auf bekannte Ziele feuern kann

**Akzeptanzkriterien:**
- Liste gespeicherter Missionen
- Ein-Klick laden
- Alle Marker und Parameter werden wiederhergestellt

#### US-5.3: Fire Mission löschen
**Als** Mörser-Schütze
**möchte ich** nicht mehr benötigte Missionen löschen können
**damit** meine Liste übersichtlich bleibt

**Akzeptanzkriterien:**
- Löschen-Button pro Mission
- Bestätigungsdialog
- Mission wird aus Speicher entfernt

---

### Epic 6: UI/UX

#### US-6.1: Dunkles Theme
**Als** Spieler
**möchte ich** ein dunkles Design haben
**damit** ich im Dunkeln spielen kann ohne geblendet zu werden

**Akzeptanzkriterien:**
- Dunkler Hintergrund
- Kontrastreiche Schrift
- Gut lesbare Werte

#### US-6.2: Kompakte Ausgabe
**Als** Mörser-Schütze
**möchte ich** die wichtigsten Werte groß und deutlich sehen
**damit** ich sie schnell ablesen kann

**Akzeptanzkriterien:**
- Azimut und Elevation prominent
- Große, lesbare Zahlen
- Farbcodierung (z.B. Rot wenn außer Reichweite)

#### US-6.3: Responsive Layout
**Als** Spieler
**möchte ich** das Fenster anpassen können
**damit** ich es neben dem Spiel nutzen kann

**Akzeptanzkriterien:**
- Fenster skalierbar
- Layout passt sich an
- Mindestgröße definiert

---

## 4. Nicht-funktionale Anforderungen

### 4.1 Performance
- Berechnung < 50ms
- UI-Update < 100ms
- Startzeit < 3 Sekunden

### 4.2 Sicherheit
- Keine Netzwerk-Verbindung erforderlich (offline-fähig)
- Keine Admin-Rechte erforderlich
- Keine verdächtigen System-Aufrufe (Antivirus-kompatibel)
- Daten nur lokal im AppData-Verzeichnis

### 4.3 Kompatibilität
- Windows 10/11
- Keine zusätzlichen Installationen erforderlich
- Portable Version möglich

### 4.4 Datenspeicherung
- JSON-Format für Einstellungen und Missionen
- Speicherort: `%APPDATA%/ArmaReforgerArtilleryCalc/`
- Keine persönlichen Daten speichern

---

## 5. Technische Constraints

### 5.1 Bekannte Limitierungen
- **Wind-Berechnung**: Die genauen Auswirkungen von Wind im Spiel sind nicht dokumentiert. Wind-Korrektur ist daher experimentell und muss durch Tests kalibriert werden.
- **Karten-Daten**: Höhendaten sind für 9 von 24 Maps verfügbar. Für Maps ohne Höhendaten muss die Höhe manuell eingegeben werden.

### 5.2 Offene Fragen
1. Wie berechnet Arma Reforger den Wind-Einfluss auf Geschosse?
2. ~~Gibt es eine API für Terrain-Höhendaten?~~ **GELÖST**: Höhendaten via GeNeFRAG CDN verfügbar
3. Wie genau ist die Polynomial-Approximation über alle Entfernungen?

---

## 5.3 Externe Datenquellen

### Kartendaten (GeNeFRAG)
- **Repository**: https://github.com/GeNeFRAG/ArmaReforger
- **CDN**: `pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev`
- **Dateien**:
  - `maps_core/all_arma_maps.json` - 24 Karten mit Metadaten
  - `maps_core/generate_tiles.py` - Tile-Generator für Leaflet
  - `maps_core/map_viewer.html` - Referenz-Implementation
- **Lokale Kopie**: `data/maps/all_arma_maps.json`

### Verfügbare Karten (24 Maps)

| Map | Größe (px) | Max Zoom | Höhendaten |
|-----|------------|----------|------------|
| Everon | 12.800 x 12.800 | 7 | Ja |
| Arland | 4.095 x 4.095 | 6 | Ja |
| Kolguev | 12.800 x 12.800 | 7 | Ja |
| Anizay | 10.240 x 10.240 | 7 | Ja |
| Gogland | 12.286 x 12.286 | 7 | Ja |
| Kunar | 4.000 x 4.000 | 5 | Ja |
| Saigon | 17.150 x 17.150 | 7 | Ja |
| Takistan | 12.900 x 12.900 | 7 | Ja |
| Zarichne | 4.095 x 4.095 | 6 | Ja |
| Zimnitrita | 16.384 x 16.384 | 7 | Ja |
| Bad Orb | 5.120 x 5.120 | 6 | Nein |
| Belleau Wood | 12.032 x 12.032 | 7 | Nein |
| Fallujah | 4.095 x 4.095 | 6 | Nein |
| Khanh Trung | 4.095 x 4.095 | 6 | Nein |
| Myccano | 6.655 x 6.655 | 7 | Nein |
| Nizla Island | 17.150 x 17.150 | 7 | Nein |
| Novka | 2.900 x 2.900 | 5 | Nein |
| Rooikat 89 | 5.120 x 5.120 | 6 | Nein |
| Rostov | 7.935 x 7.935 | 7 | Nein |
| Ruha | 8.150 x 8.150 | 7 | Nein |
| Seitenbuch | 2.000 x 4.000 | 6 | Nein |
| Serhiivka | 10.240 x 10.240 | 7 | Nein |
| Udachne | 5.120 x 10.240 | 7 | Nein |

### Ballistische Daten (GeNeFRAG)
- **Datei**: `mortar_core/ballistic-data.json`
- **Status**: Identisch mit unseren lokalen Tabellen (verifiziert)
- **Zusatzfeld**: `tofPer100m` (Flugzeit-Änderung pro 100m)
- **Lokale Referenz**: `data/ballistics/ballistic-data-reference.json`

---

## 6. Phasen-Plan

### Phase 1: MVP (Minimum Viable Product)
- Kartenansicht (Everon)
- Mörser/Ziel setzen per Klick
- Basis-Berechnung (Azimut, Elevation)
- US/RUS Mörser + alle Munitionstypen
- Dunkles Theme

### Phase 2: Erweiterungen
- Spotter-Modus
- Fire Mission Speicherung
- Feuerkorrektur
- Weitere Karten

### Phase 3: Optimierung
- Wind-Korrektur (nach Tests)
- Performance-Optimierung
- Community-Features (Mission-Sharing)

---

## 7. Erfolgsmetriken
- Berechnungen entsprechen In-Game Ergebnissen (< 5m Abweichung auf 2000m)
- Benutzer können innerhalb von 30 Sekunden ein Feuerkommando ausgeben
- Keine Antivirus-Warnungen bei Installation
