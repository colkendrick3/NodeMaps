// Converts a center point + lat/lon span into an explicit bounding box,
// used for the initial Overpass query and cache lookup before the map
// itself has reported its own viewport bounds.
export function centerDeltaToBounds({ latitude, longitude, latitudeDelta, longitudeDelta }) {
  return {
    minLat: latitude - latitudeDelta / 2,
    maxLat: latitude + latitudeDelta / 2,
    minLon: longitude - longitudeDelta / 2,
    maxLon: longitude + longitudeDelta / 2,
  };
}
