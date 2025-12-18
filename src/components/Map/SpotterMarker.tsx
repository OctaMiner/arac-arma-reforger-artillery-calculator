/**
 * SpotterMarker - Marker for spotter position on map
 * Shows where the spotter is standing
 * Only visible when spotter mode is active and position is set
 */

import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon, type DragEndEvent } from 'leaflet';
import { useSpotterStore } from '../../stores/useSpotterStore';
import { useAppStore } from '../../stores/useAppStore';
import { getMapConfig } from '../../lib/maps/configs';
import {
  gameToLeaflet,
  leafletToGame,
  formatGridPosition,
} from '../../lib/coordinates/transform';

// Custom icon for spotter (yellow binoculars)
const spotterIcon = new DivIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #eab308;
      border: 3px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">👁</div>
  `,
  className: 'spotter-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const SpotterMarker = () => {
  const spotterMode = useSpotterStore((state) => state.spotterMode);
  const spotterPosition = useSpotterStore((state) => state.spotterPosition);
  const setSpotterPosition = useSpotterStore(
    (state) => state.setSpotterPosition
  );
  const selectedMap = useAppStore((state) => state.selectedMap);

  // Get map height for coordinate transformation
  const mapConfig = getMapConfig(selectedMap as any);
  const mapHeight = mapConfig?.size[1] ?? 12800;

  // Only show when spotter mode is active and position is set
  if (!spotterMode || !spotterPosition) return null;

  // Convert Arma game coordinates to Leaflet position
  const leafletPosition = gameToLeaflet(
    spotterPosition.east,
    spotterPosition.north,
    mapHeight
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { lat, lng } = e.target.getLatLng();

    // Convert back: Leaflet [lat, lng] → Arma [east, north]
    const gameCoords = leafletToGame(lat, lng, mapHeight);
    setSpotterPosition({
      ...gameCoords,
      height: spotterPosition.height, // Keep existing height
      heightDiff: spotterPosition.heightDiff, // Keep existing height diff
    });
  };

  return (
    <Marker
      position={leafletPosition}
      icon={spotterIcon}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -16]}>
        <strong>Spotter</strong>
        <br />
        {formatGridPosition(spotterPosition)} | H: {spotterPosition.height}m
        {spotterPosition.heightDiff !== undefined &&
          spotterPosition.heightDiff !== 0 && (
            <>
              <br />
              Diff: {spotterPosition.heightDiff > 0 ? '+' : ''}
              {spotterPosition.heightDiff}m
            </>
          )}
      </Tooltip>
    </Marker>
  );
};

export default SpotterMarker;
