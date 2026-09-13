// Central config. No secrets here by design — everything is public/anonymous.

// Standard OSM raster tile server. For production, swap to a provider that
// permits app-embedded tile usage under their ToS (e.g. a paid tile host,
// or self-hosted tiles) — the raw tile.openstreetmap.org servers are meant
// for light/dev usage only and can rate-limit or block high-traffic apps.
export const OSM_TILE_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Overpass API — public, anonymous, no auth. No user identifiers are ever
// sent; only a bounding box.
export const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

// The public Overpass instance is shared/unauthenticated and occasionally
// flaky (a slow response, a transient rate limit) even for a well-formed
// query, so a sync is retried once before falling back to cached nodes.
export const OVERPASS_MAX_ATTEMPTS = 2;
export const OVERPASS_RETRY_DELAY_MS = 500;

// Above this bbox span (degrees), skip the live Overpass sync entirely.
// Query latency scales with area, and a wide, zoomed-out viewport is
// exactly the kind of query the shared, unauthenticated public instance
// isn't meant for -- it's slow enough to risk timing out, and it's not
// the "light usage" fair-use spirit this free service depends on.
// Whatever's already cached for the area still displays.
export const OVERPASS_MAX_BBOX_DEGREES = 0.08;

// Distance (meters) at which a cached camera node triggers a local alert.
export const PROXIMITY_THRESHOLD_METERS = 100;

// How often (ms) the proximity engine re-checks distance against cached nodes.
export const PROXIMITY_CHECK_INTERVAL_MS = 5000;

// Minimum GPS movement (meters) before a new location update is processed.
export const LOCATION_DISTANCE_INTERVAL_METERS = 15;

// Initial Leaflet zoom level for the map WebView (roughly matches the old
// 0.05-degree react-native-maps region span).
export const INITIAL_MAP_ZOOM = 13;
