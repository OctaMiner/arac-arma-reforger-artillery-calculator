# ARAC Icons

Dieser Ordner enthält die Icon-Dateien für die ARAC Artillery Calculator Desktop-Anwendung.

## Benötigte Icon-Dateien

### Windows
- `icon.ico` - Windows Icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

### macOS
- `icon.icns` - macOS Icon Bundle
- `icon.png` - Fallback PNG (512x512 oder 1024x1024)

### Linux
- `icon.png` - Standard PNG Icon (512x512)

## Icon Design Richtlinien

Das Icon sollte folgende Elemente repräsentieren:
- Artillery/Mortar Theme (z.B. stilisiertes Mörsersymbol)
- Military/Tactical Aesthetic
- Klare Erkennbarkeit auch bei kleinen Größen
- Farbschema: Militärgrün, Grau, oder passend zum App-Theme (#1a1a2e)

## Icon-Generierung

Tools zur Icon-Generierung:
- `electron-icon-builder` - NPM Package für automatische Icon-Generierung
- Online: https://icon.kitchen/
- Photoshop/GIMP für manuelle Erstellung

## Temporäre Lösung

Solange keine Icons vorhanden sind, wird das Standard Electron Icon verwendet.
Der Icon-Pfad in `electron/main.ts` ist auskommentiert und kann aktiviert werden,
sobald die Icons bereitstehen.
