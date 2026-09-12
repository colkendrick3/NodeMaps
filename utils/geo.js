// Converts a react-native-maps Region (center + deltas) into an explicit
// bounding box used for both Overpass queries and the local cache lookup.
export function regionToBounds(region) {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  return {
    minLat: latitude - latitudeDelta / 2,
    maxLat: latitude + latitudeDelta / 2,
    minLon: longitude - longitudeDelta / 2,
    maxLon: longitude + longitudeDelta / 2,
  };
}
