/**
 * MapLegend - Shows legend for map markers
 * Positioned at bottom-left of the map
 */

import { memo } from 'react';

const MapLegend = memo(() => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(30, 30, 30, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '10px', color: '#888' }}>
        LEGENDE
      </div>

      {/* Mörser */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            background: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
          }}
        >
          M
        </div>
        <span>Mörserstellung</span>
      </div>

      {/* Ziel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            background: '#e94560',
            border: '2px solid white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
          }}
        >
          ✕
        </div>
        <span>Ziel</span>
      </div>

      {/* Einschlag/Hindernis */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            background: '#f97316',
            border: '2px solid white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <line x1="4" y1="4" x2="20" y2="20"/>
            <line x1="20" y1="4" x2="4" y2="20"/>
          </svg>
        </div>
        <span>Einschlag (Terrain)</span>
      </div>
    </div>
  );
});

MapLegend.displayName = 'MapLegend';

export default MapLegend;
