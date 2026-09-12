import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { LOCATION_DISTANCE_INTERVAL_METERS } from '../utils/constants';

// Foreground-only watch for Phase 1. Background location is deliberately
// out of scope here (see CLAUDE.md) — it requires additional platform
// permissions/config we haven't reviewed yet for this phase.
export function useLocation() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted) setErrorMsg('Location permission denied');
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
        },
        (loc) => {
          if (isMounted) {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy,
              timestamp: loc.timestamp,
            });
          }
        }
      );
    })();

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return { location, errorMsg };
}
