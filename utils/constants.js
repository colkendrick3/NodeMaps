// Central config. No secrets here by design — everything is public/anonymous.

// Standard OSM raster tile server. For production, swap to a provider that
// permits app-embedded tile usage under their ToS (e.g. a paid tile host,
// or self-hosted tiles) — the raw tile.openstreetmap.org servers are meant
// for light/dev usage only and can rate-limit or block high-traffic apps.
export const OSM_TILE_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Overpass API — public, anonymous, no auth. No user identifiers are ever
// sent; only a bounding box.
export const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

// Distance (meters) at which a cached camera node triggers a local alert.
export const PROXIMITY_THRESHOLD_METERS = 100;

// How often (ms) the proximity engine re-checks distance against cached nodes.
export const PROXIMITY_CHECK_INTERVAL_MS = 5000;

// Minimum GPS movement (meters) before a new location update is processed.
export const LOCATION_DISTANCE_INTERVAL_METERS = 15;

// Dark, high-contrast map style tuned for outdoor visibility.
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];
