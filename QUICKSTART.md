# ARAC - Quickstart Guide

## Sofort loslegen

### 1. Development starten
Rufe in Claude Code auf:
```
/lead Starte Phase 1: Projekt-Setup
```

Der Lead-Agent wird:
1. Die Task-Liste in `docs/PRD_TASKS.md` öffnen
2. Den ersten Task identifizieren
3. An den richtigen Agent delegieren
4. Nach Erledigung die Checkbox setzen

---

## Projekt-Übersicht

```
ARAC - Arma Reforger Artillery Calculator
├── 8 Phasen
├── ~315 Tasks
├── 8 spezialisierte Agents
└── Geschätzte Entwicklungszeit: Kommt auf euch an!
```

---

## Die 8 Agents

| Befehl | Agent | Macht was? |
|--------|-------|------------|
| `/lead` | Project Lead | Koordiniert alles, arbeitet Task-Liste ab |
| `/ballistics` | Ballistics Engineer | Berechnungsformeln, JSON-Tabellen |
| `/frontend` | Frontend Developer | React, Hooks, State Management |
| `/electron` | Electron Specialist | Desktop-App, Speicherung, Build |
| `/map` | Map Specialist | Leaflet-Karten, Koordinaten, Marker |
| `/design` | UI Designer | TailwindCSS, Dark Theme, Animationen |
| `/spotter` | Spotter Specialist | Vector 21 Fernglas, Feuerkorrektur |
| `/qa` | QA Tester | Unit Tests, Validierung |

---

## Feature-Highlights (besser als arma-mortar.com)

| Feature | arma-mortar.com | ARAC |
|---------|-----------------|------|
| Basis-Berechnung | Ja | Ja |
| Kartenansicht | Ja | Ja (interaktiv!) |
| **Fire Missions speichern** | Nein | **Ja** |
| **Vordefinierte Stellungen** | Nein | **Ja** |
| **Schuss-Historie** | Nein | **Ja** |
| **Benutzer-Profil** | Nein | **Ja** |
| **Spotter/Vector 21** | Nein | **Ja** |
| **Feuerkorrektur** | Nein | **Ja** |
| **Offline-fähig** | Nein (Web) | **Ja** |

---

## Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `docs/PRD_TASKS.md` | **HAUPT-TASKLISTE** - Hier werden Tasks abgehakt |
| `docs/PRD.md` | Alle User Stories und Anforderungen |
| `docs/ARCHITECTURE.md` | Technische Architektur |
| `docs/FORMULAS.md` | Alle Berechnungsformeln |
| `docs/VECTOR21_SPOTTER.md` | Spotter-Integration Details |
| `data/ballistics/*.json` | Ballistische Tabellen |
| `.claude/commands/*.md` | Agent-Definitionen |

---

## Typischer Workflow

### Neues Feature entwickeln
```
1. /lead Zeige nächsten Task

2. Lead sagt: "Task 2.3.1 - calculateDistance implementieren - Agent: /ballistics"

3. /ballistics Implementiere calculateDistance Funktion

4. Ballistics implementiert die Funktion

5. /lead Markiere Task 2.3.1 als erledigt

6. Lead setzt [x] und zeigt nächsten Task
```

### Ganzen Block abarbeiten
```
/lead Arbeite Phase 2.3 (Core Calculator) komplett ab
```

---

## Referenzdaten für Tests

Diese Werte MÜSSEN rauskommen:

**Eingabe:**
- Mörser: Ost 481, Nord 473, Höhe 95m
- Ziel: Ost 707, Nord 428, Höhe 145m
- US Mörser, HE, 4 Ringe

**Erwartete Ausgabe:**
- Entfernung: **2304 m**
- Azimut: **101.26°** / **1800 MIL**
- Elevation: **~1134 MIL** (Basis)
- Elevation korrigiert: **~1125 MIL**
- Flugzeit: **32.7 sec**

---

---

## Hinweise für später (GitHub)

Wenn das Projekt später auf GitHub kommt:
- `.claude/` Ordner wird automatisch ignoriert (in .gitignore)
- Keine Claude/AI-Referenzen im öffentlichen Code
- Nur die fertige App wird veröffentlicht

---

## Los geht's!

```
/lead Starte die Entwicklung
```
