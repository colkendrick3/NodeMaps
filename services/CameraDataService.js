// Fetches publicly-tagged surveillance nodes from OpenStreetMap's Overpass
// API for a given bounding box, and caches them locally via db.js.
//
// PRIVACY NOTE: the only thing sent over the network here is a bounding box
// of map coordinates the user is currently viewing — never the user's own
// GPS fix, never a device identifier, never a history of movement.

import {
  OVERPASS_ENDPOINT,
  OVERPASS_MAX_ATTEMPTS,
  OVERPASS_RETRY_DELAY_MS,
  OVERPASS_MAX_BBOX_DEGREES,
} from '../utils/constants';
import { upsertCameraNodes, getCameraNodesInBounds } from './db';

// Thrown instead of attempting a sync when the viewport is too wide to
// query fairly. Cached nodes are unaffected — callers should treat this
// distinctly from a real network failure (e.g. prompt to zoom in rather
// than reporting "offline").
export class AreaTooLargeError extends Error {}

function boundsSpanDegrees({ minLat, minLon, maxLat, maxLon }) {
  return Math.max(maxLat - minLat, maxLon - minLon);
}

function buildOverpassQuery({ minLat, minLon, maxLat, maxLon }) {
  const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;
  return `
    [out:json][timeout:25];
    (
      node["man_made"="surveillance"](${bbox});
      node["surveillance:type"](${bbox});
    );
    out body;
  `;
}

function parseOverpassElements(elements) {
  return elements
    .filter((el) => el.type === 'node')
    .map((el) => ({
      osmId: el.id,
      lat: el.lat,
      lon: el.lon,
      surveillanceType: el.tags?.['surveillance:type'] ?? el.tags?.['man_made'] ?? 'unknown',
      direction: el.tags?.['camera:direction'] ?? null,
    }));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOverpassElements(query) {
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    // overpass-api.de's fair-use filtering rejects requests with the bare
    // OkHttp/Android client signature (406 Not Acceptable) unless they
    // identify themselves and state what response they'll accept.
    headers: {
      'Content-Type': 'text/plain',
      Accept: 'application/json',
      'User-Agent': 'NodeMap/1.0 (+https://github.com/colkendrick3/NodeMaps)',
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const json = await response.json();
  return json.elements ?? [];
}

// Fetches fresh nodes for the given bbox and merges them into the local
// cache. Retries once after a transient failure (a slow/rate-limited
// response from the shared public Overpass instance, or a network blip)
// before giving up. Throws on failure — caller should fall back to cached
// data.
export async function syncCameraNodesForBounds(bounds) {
  if (boundsSpanDegrees(bounds) > OVERPASS_MAX_BBOX_DEGREES) {
    throw new AreaTooLargeError('Viewport too large for a live Overpass query');
  }

  const query = buildOverpassQuery(bounds);

  let elements;
  for (let attempt = 1; attempt <= OVERPASS_MAX_ATTEMPTS; attempt++) {
    try {
      elements = await fetchOverpassElements(query);
      break;
    } catch (err) {
      if (attempt === OVERPASS_MAX_ATTEMPTS) throw err;
      await delay(OVERPASS_RETRY_DELAY_MS);
    }
  }

  const nodes = parseOverpassElements(elements);
  await upsertCameraNodes(nodes);
  return nodes;
}

// Offline-first accessor: always returns whatever is cached immediately;
// callers that also want a fresh sync should call syncCameraNodesForBounds
// separately (e.g. on viewport idle) and re-read the cache after.
export async function getCachedCameraNodes(bounds) {
  return getCameraNodesInBounds(bounds);
}
