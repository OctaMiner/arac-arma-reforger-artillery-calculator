# Interactive Map with Elevation Grid - Implementation Plan

## Project Overview
Build a web-based interactive map viewer with real-time elevation display and 10m×10m grid overlay using downloaded map tiles and height data.

---

## Phase 1: Project Setup

### Dependencies
```json
{
  "dependencies": {
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Tasks:**
- [ ] Initialize npm project (`npm init`)
- [ ] Install Leaflet.js
- [ ] Set up basic HTML template
- [ ] Configure build process (optional: Vite/Webpack)
- [ ] Create symlinks to downloaded maps and height_data

---

## Phase 2: Data Integration

### 2.1 Map Configuration Loader

**Tasks:**
- [ ] Convert `all_arma_maps.json` to ES6 module or load dynamically
- [ ] Create map config lookup functions
- [ ] Validate map data structure

**Example Configuration:**
```javascript
export const MAPS = [
  {
    name: "Everon",
    namespace: "everon",
    size: [12800, 12800],
    max_zoom: 7,
    heightmap_cells: [1280, 1280]
  },
  {
    name: "Arland",
    namespace: "arland",
    size: [4095, 4095],
    max_zoom: 6,
    heightmap_cells: [409, 409]
  }
  // ... other maps
];

export function getMapConfig(namespace) {
  return MAPS.find(m => m.namespace === namespace);
}
```

### 2.2 Height Data Loader

**Tasks:**
- [ ] Implement async height data loader
- [ ] Add bounds checking for grid coordinates
- [ ] Implement elevation cache for performance
- [ ] Add error handling for missing/corrupted data

**Implementation:**
```javascript
export class ElevationData {
  constructor(heightData) {
    this.data = heightData;
    this.rows = heightData.length;
    this.cols = heightData[0].length;
    this.cache = new Map();
  }
  
  static async loadForMap(mapName) {
    const response = await fetch(`/height_data/${mapName}_height.json`);
    const data = await response.json();
    return new ElevationData(data);
  }
  
  getElevation(gridX, gridY) {
    if (gridX < 0 || gridX >= this.cols || 
        gridY < 0 || gridY >= this.rows) {
      return null;
    }
    
    const key = `${gridX},${gridY}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, parseInt(this.data[gridY][gridX]));
    }
    return this.cache.get(key);
  }
}
```

---

## Phase 3: Map Initialization

### 3.1 Leaflet Map Setup

**Tasks:**
- [ ] Set up Leaflet with CRS.Simple coordinate system
- [ ] Configure tile layer with correct path pattern
- [ ] Calculate and set map bounds based on config
- [ ] Test tile loading for one map (e.g., Everon)
- [ ] Handle tile loading errors gracefully

**Implementation:**
```javascript
export function initializeMap(containerId, mapConfig) {
  const map = L.map(containerId, {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: mapConfig.max_zoom,
    attributionControl: false
  });
  
  const bounds = [[0, 0], mapConfig.size];
  map.fitBounds(bounds);
  
  const tileLayer = L.tileLayer('/maps/{namespace}_{layer}/{z}/{x}/{y}.png', {
    maxZoom: mapConfig.max_zoom,
    tileSize: 256,
    noWrap: true
  });
  
  tileLayer.addTo(map);
  
  return map;
}
```

### 3.2 Map Selector UI

**Tasks:**
- [ ] Create HTML structure for controls
- [ ] Implement map selection dropdown
- [ ] Implement layer selection (sat/scheme)
- [ ] Add event handlers for map/layer switching
- [ ] Reload height data when map changes

**HTML Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Arma Reforger Map Viewer</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    #map { height: 100vh; width: 100%; }
    #controls { position: absolute; top: 10px; left: 10px; z-index: 1000; background: white; padding: 10px; }
    #info-panel { position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(0,0,0,0.7); color: white; padding: 10px; }
  </style>
</head>
<body>
  <div id="controls">
    <select id="map-selector">
      <option value="everon">Everon</option>
      <option value="arland">Arland</option>
    </select>
    <select id="layer-selector">
      <option value="sat">Satellite</option>
      <option value="scheme">Topographic</option>
    </select>
  </div>
  <div id="map"></div>
  <div id="info-panel">
    <div id="coords">X: 0, Y: 0, Z: 0m</div>
    <div id="grid-cell">Grid: [0, 0]</div>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## Phase 4: Coordinate System

### 4.1 Coordinate Converter

**Tasks:**
- [ ] Implement Leaflet LatLng → Game coordinate conversion
- [ ] Implement Game → Grid coordinate conversion
- [ ] Add reverse conversions (Grid → Game, etc.)
- [ ] Test coordinate accuracy with known points

**Implementation:**
```javascript
export class CoordinateConverter {
  constructor(mapConfig) {
    this.mapSizeMeters = mapConfig.size[0];
    this.heightmapCells = mapConfig.heightmap_cells[0];
    this.cellSizeMeters = 10;
  }
  
  latlngToGame(latlng) {
    return {
      x: Math.floor(latlng.lng),
      y: Math.floor(latlng.lat)
    };
  }
  
  gameToGrid(gameX, gameY) {
    return {
      x: Math.floor(gameX / this.cellSizeMeters),
      y: Math.floor(gameY / this.cellSizeMeters)
    };
  }
  
  gridToGame(gridX, gridY) {
    return {
      x: gridX * this.cellSizeMeters,
      y: gridY * this.cellSizeMeters
    };
  }
}
```

### 4.2 Mouse Tracking

**Tasks:**
- [ ] Attach mousemove event to Leaflet map
- [ ] Convert mouse position to game coordinates
- [ ] Look up elevation at current position
- [ ] Update info panel with coordinates and elevation
- [ ] Debounce updates for performance

**Implementation:**
```javascript
let updateTimeout;

map.on('mousemove', (e) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    const game = converter.latlngToGame(e.latlng);
    const grid = converter.gameToGrid(game.x, game.y);
    const elevation = elevationData.getElevation(grid.x, grid.y);
    
    document.getElementById('coords').textContent = 
      `X: ${game.x}, Y: ${game.y}, Z: ${elevation || 0}m`;
    document.getElementById('grid-cell').textContent = 
      `Grid: [${grid.x}, ${grid.y}]`;
  }, 16); // ~60fps
});
```

---

## Phase 5: Grid Overlay

### 5.1 Canvas-Based Grid

**Tasks:**
- [ ] Create Canvas overlay layer for Leaflet
- [ ] Calculate grid line spacing based on zoom level
- [ ] Render grid lines on canvas
- [ ] Update grid on zoom/pan events
- [ ] Optimize rendering for large maps

**Implementation:**
```javascript
export class GridOverlay {
  constructor(map, mapConfig) {
    this.map = map;
    this.mapConfig = mapConfig;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.visible = true;
  }
  
  draw() {
    if (!this.visible) return;
    
    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();
    
    // Calculate visible grid cells
    const minGridX = Math.floor(bounds.getWest() / 10);
    const maxGridX = Math.ceil(bounds.getEast() / 10);
    const minGridY = Math.floor(bounds.getSouth() / 10);
    const maxGridY = Math.ceil(bounds.getNorth() / 10);
    
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = minGridX; x <= maxGridX; x++) {
      const point = this.map.latLngToContainerPoint([0, x * 10]);
      this.ctx.moveTo(point.x, 0);
      this.ctx.lineTo(point.x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = minGridY; y <= maxGridY; y++) {
      const point = this.map.latLngToContainerPoint([y * 10, 0]);
      this.ctx.moveTo(0, point.y);
      this.ctx.lineTo(this.canvas.width, point.y);
      this.ctx.stroke();
    }
  }
  
  toggle() {
    this.visible = !this.visible;
    this.draw();
  }
}
```

### 5.2 Grid Control

**Tasks:**
- [ ] Add toggle button for grid visibility
- [ ] Implement grid show/hide functionality
- [ ] Add keyboard shortcut for grid toggle (e.g., 'G' key)
- [ ] Save grid state to localStorage

**Implementation:**
```javascript
L.Control.GridToggle = L.Control.extend({
  onAdd: function(map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const button = L.DomUtil.create('a', '', container);
    button.innerHTML = '⊞ Grid';
    button.href = '#';
    button.title = 'Toggle Grid (G)';
    
    L.DomEvent.on(button, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      gridOverlay.toggle();
    });
    
    return container;
  }
});

map.addControl(new L.Control.GridToggle({ position: 'topright' }));
```

---

## Phase 6: Visual Enhancements

### 6.1 Elevation Heatmap Overlay

**Tasks:**
- [ ] Generate heatmap from elevation data
- [ ] Apply color gradient (low=blue, high=red)
- [ ] Add opacity control slider
- [ ] Toggle heatmap layer on/off
- [ ] Optimize heatmap generation for large maps

**Approach:**
```javascript
function generateHeatmap(elevationData, mapConfig) {
  const canvas = document.createElement('canvas');
  canvas.width = elevationData.cols;
  canvas.height = elevationData.rows;
  const ctx = canvas.getContext('2d');
  
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  
  // Find min/max elevation
  let min = Infinity, max = -Infinity;
  for (let y = 0; y < elevationData.rows; y++) {
    for (let x = 0; x < elevationData.cols; x++) {
      const elev = parseInt(elevationData.data[y][x]);
      min = Math.min(min, elev);
      max = Math.max(max, elev);
    }
  }
  
  // Color each pixel
  for (let y = 0; y < elevationData.rows; y++) {
    for (let x = 0; x < elevationData.cols; x++) {
      const elev = parseInt(elevationData.data[y][x]);
      const normalized = (elev - min) / (max - min);
      const color = elevationToColor(normalized);
      
      const idx = (y * canvas.width + x) * 4;
      imageData.data[idx] = color.r;
      imageData.data[idx + 1] = color.g;
      imageData.data[idx + 2] = color.b;
      imageData.data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
```

### 6.2 Click Actions

**Tasks:**
- [ ] Add click event handler
- [ ] Display detailed info popup on click
- [ ] Show coordinate and elevation in popup
- [ ] Add "Copy Coordinates" button
- [ ] Optionally place marker at clicked location

---

## Phase 7: Performance Optimization

### 7.1 Viewport Culling

**Tasks:**
- [ ] Only render grid cells within viewport
- [ ] Update on map move/zoom events
- [ ] Implement throttling for pan events

### 7.2 Data Optimization

**Tasks:**
- [ ] Lazy-load height data (don't load until map selected)
- [ ] Compress height data (gzip) if serving from web server
- [ ] Consider converting large JSON to binary format
- [ ] Implement Web Worker for heavy computations

### 7.3 Caching Strategy

**Tasks:**
- [ ] Cache elevation lookups
- [ ] Cache rendered grid segments
- [ ] Use IndexedDB for offline map support (optional)

---

## Phase 8: Testing

### 8.1 Coordinate Accuracy

**Tasks:**
- [ ] Test with known coordinates from game
- [ ] Verify elevation matches in-game values
- [ ] Test boundary conditions (edges of map)
- [ ] Test with all available maps

### 8.2 Performance Testing

**Tasks:**
- [ ] Test with largest map (Kolguev - 6401×6401)
- [ ] Measure frame rate during pan/zoom
- [ ] Test on low-end devices
- [ ] Profile JavaScript execution

### 8.3 Browser Compatibility

**Tasks:**
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers
- [ ] Verify touch controls work on mobile

---

## Phase 9: Documentation

### 9.1 User Guide

**Tasks:**
- [ ] Document how to use the viewer
- [ ] Explain coordinate system
- [ ] List keyboard shortcuts
- [ ] Add FAQ section

### 9.2 Developer Guide

**Tasks:**
- [ ] Document code architecture
- [ ] Explain coordinate conversion formulas
- [ ] Add JSDoc comments to functions
- [ ] Create setup instructions for new developers

---

## Deployment Checklist

- [ ] Minify JavaScript and CSS
- [ ] Optimize images (if any custom assets)
- [ ] Enable gzip compression for JSON files
- [ ] Set up proper cache headers
- [ ] Test in production environment
- [ ] Set up error logging/monitoring

---

## Future Enhancements

### Optional Features

- [ ] Distance/area measurement tools
- [ ] Route planning with elevation profile
- [ ] 3D terrain visualization
- [ ] Export coordinates to CSV
- [ ] Share link with specific coordinates
- [ ] Multiple marker support
- [ ] Contour line generation
- [ ] Search by coordinates
- [ ] Minimap overview
- [ ] Fullscreen mode

---

## Success Criteria

✓ Map loads correctly with tiles from local filesystem  
✓ Elevation data displays accurately for all maps  
✓ Grid overlay renders at all zoom levels  
✓ Coordinate display updates in real-time on mouse move  
✓ Performance is acceptable on standard hardware (>30fps)  
✓ Works on major browsers (Chrome, Firefox, Safari, Edge)  
✓ Code is documented and maintainable
