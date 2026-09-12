import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { findNodesWithinThreshold, createAlertDeduper } from '../services/ProximityEngine';
import { PROXIMITY_CHECK_INTERVAL_MS } from '../utils/constants';

// location: { latitude, longitude } | null
// cachedNodes: array of camera nodes currently loaded for the viewport
export function useProximityAlerts(location, cachedNodes) {
  const [nodesInRange, setNodesInRange] = useState([]);
  const deduperRef = useRef(createAlertDeduper());
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (!location) return;

    const now = Date.now();
    if (now - lastCheckRef.current < PROXIMITY_CHECK_INTERVAL_MS) return;
    lastCheckRef.current = now;

    const inRange = findNodesWithinThreshold(location, cachedNodes);
    setNodesInRange(inRange);

    const newlyTriggered = deduperRef.current.getNewlyTriggered(inRange);
    if (newlyTriggered.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
        // Haptics can fail on devices without support — alert still shows
        // in-app via nodesInRange, so this is non-fatal.
      });
    }
  }, [location, cachedNodes]);

  return { nodesInRange };
}
