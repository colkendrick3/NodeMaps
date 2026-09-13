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

// Initial Leaflet zoom level for the map WebView (roughly matches the old
// 0.05-degree react-native-maps region span).
export const INITIAL_MAP_ZOOM = 13;
