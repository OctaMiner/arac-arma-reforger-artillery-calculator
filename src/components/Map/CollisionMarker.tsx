/**
 * CollisionMarker - Shows calculated impact point when trajectory hits terrain
 * Displays an orange X on the map at the collision/impact point
 */

import { memo, useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import { gameToLeaflet } from '../../lib/coordinates/transform';

// Custom icon for impact point (orange X)
const impactIcon = new DivIcon({
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #f97316;
      border: 3px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
        <line x1="4" y1="4" x2="20" y2="20"/>
        <line x1="20" y1="4" x2="4" y2="20"/>
      </svg>
    </div>
  `,
  className: 'impact-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const CollisionMarker = memo(() => {
  const fireSolution = useAppStore((state) => state.fireSolution);
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation
  const mapConfig = useMemo(() => getMapConfig(selectedMap as any), [selectedMap]);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  // Check if there's a collision/impact point to show
  const blockageInfo = fireSolution?.blockageInfo;

  // Show marker if we have valid blockage coordinates (regardless of trajectoryBlocked flag)
  const hasValidImpact =
    blockageInfo?.east !== undefined &&
    blockageInfo?.north !== undefined &&
    blockageInfo?.distance !== undefined &&
    blockageInfo.distance > 0;

  if (!hasValidImpact || !blockageInfo) return null;

  // Convert game coordinates to Leaflet position
  const leafletPosition = gameToLeaflet(
    blockageInfo.east!,
    blockageInfo.north!,
    mapHeight
  );

  // Determine label based on situation
  const isFullyBlocked = fireSolution?.trajectoryBlocked;
  const label = isFullyBlocked ? 'Einschlag' : 'Hindernis';

  return (
    <Marker
      position={leafletPosition}
      icon={impactIcon}
      interactive={true}
    >
      <Tooltip permanent direction="top" offset={[0, -14]}>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ color: '#f97316' }}>{label}</strong>
          <br />
          <span style={{ fontSize: '11px' }}>
            {blockageInfo.distance}m | H: {blockageInfo.terrainHeight}m
          </span>
        </div>
      </Tooltip>
    </Marker>
  );
});

CollisionMarker.displayName = 'CollisionMarker';

export default CollisionMarker;
