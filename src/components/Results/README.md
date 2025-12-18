# Results Components

Fire solution display components for the ARAC application.

## Overview

This directory contains modular, reusable components for displaying fire solution results with military tactical styling.

## Components

### Core Display Components

#### `AzimuthDisplay`
Large, prominent azimuth direction display.
- Shows azimuth in MIL (0-6400)
- Optional degree display
- Wind correction indicator
- Accent color: Blue

#### `ElevationDisplay`
Large, prominent elevation angle display.
- Shows adjusted elevation in MIL
- Height correction indicator
- Wind adjustment indicator
- Shows base elevation for reference
- Accent color: Green

#### `FlightTimeDisplay`
Time of flight display.
- Shows flight time in seconds (1 decimal)
- Accent color: Yellow

#### `DistanceDisplay`
Distance to target display.
- Shows distance in meters
- Accent color: White/Primary

#### `RingCountDisplay`
Charge/ring count display.
- Current ring count (0-4)
- Shows AUTO vs MANUAL mode
- Recommended charge indicator
- Optimal vs suboptimal highlighting
- Accent color: Blue (optimal) / Yellow (suboptimal)

#### `RangeWarning`
Out of range warning display.
- Shows when target is out of range (too far or too close)
- Displays current distance vs max/min range
- Provides helpful guidance
- Prominent red alert styling

### Container Component

#### `FireSolutionPanel`
Complete fire solution panel with all components.
- Grid layout: 2 columns
- Handles null/loading states
- Shows placeholder when no solution
- Integrates all display components
- Wind information banner
- Responsive design

## Usage

### Using Individual Components

```tsx
import { AzimuthDisplay } from './components/Results'

<AzimuthDisplay
  azimuthMil={fireSolution.azimuthMil}
  azimuthDeg={fireSolution.azimuthDeg}
  azimuthWithWind={fireSolution.azimuthWithWind}
  windCorrection={fireSolution.windCorrection?.azimuthCorrection}
/>
```

### Using FireSolutionPanel (Complete Solution)

```tsx
import { FireSolutionPanel } from './components/Results'

// Automatically pulls data from useAppStore
<FireSolutionPanel />
```

## Design Philosophy

### Military Tactical Aesthetic
- Monospace fonts for all numbers
- Large, readable values
- Color-coded by type (Direction=Blue, Elevation=Green, Time=Yellow)
- Clear labels and units
- Dark theme optimized

### Modular Architecture
Each component is self-contained and can be used:
- Standalone for custom layouts
- In the FireSolutionPanel for complete display
- In other contexts (modals, overlays, etc.)

### Responsive Behavior
- Scales well at different sizes
- Grid layout adapts to available space
- Clear visual hierarchy

## Color Coding

- **Blue** (`accent-blue`): Direction/Azimuth, Charge
- **Green** (`accent-green`): Elevation
- **Yellow** (`accent-yellow`): Time of Flight, Warnings
- **Red** (`accent-red`): Out of Range errors
- **White** (`text-primary`): Distance, neutral values

## State Handling

All components gracefully handle:
- Null/undefined values (show placeholders)
- Loading states (FireSolutionPanel shows spinner)
- Error states (RangeWarning for out of range)
- Optional values (wind corrections, delta elevation)

## Integration with App

### Current Usage
The app currently uses `ResultsBar` for compact, inline display at the bottom of the map.

### FireSolutionPanel Usage
FireSolutionPanel is designed for:
- Expanded view (modal or dedicated panel)
- Print/export views
- Detailed fire mission planning
- Training/tutorial modes
- Large screen displays

### Example Integration Options

#### As a Modal
```tsx
{showDetailedView && (
  <Modal>
    <FireSolutionPanel />
  </Modal>
)}
```

#### As a Split View
```tsx
<div className="grid grid-cols-2">
  <MapView />
  <FireSolutionPanel />
</div>
```

#### As a Popup/Overlay
```tsx
<Popover>
  <FireSolutionPanel />
</Popover>
```

## Future Enhancements

Potential additions:
- Print stylesheet for fire mission cards
- Copy-to-clipboard for values
- Historical comparison view
- Multiple fire solutions side-by-side
- Mobile-optimized layout
- Accessibility improvements (ARIA labels)
