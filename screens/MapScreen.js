import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import AlertBanner from '../components/AlertBanner';
import { useLocation } from '../hooks/useLocation';
import { useProximityAlerts } from '../hooks/useProximityAlerts';
import {
  getCachedCameraNodes,
  syncCameraNodesForBounds,
  AreaTooLargeError,
} from '../services/CameraDataService';
import { centerDeltaToBounds } from '../utils/geo';
import { OSM_TILE_URL_TEMPLATE, INITIAL_MAP_ZOOM } from '../utils/constants';
import { buildLeafletMapHtml } from '../assets/leafletMapHtml';

const INITIAL_REGION = {
  latitude: 33.7490, // Atlanta, as a sane default
  longitude: -84.3880,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MAP_HTML = buildLeafletMapHtml({
  tileUrlTemplate: OSM_TILE_URL_TEMPLATE,
  initialCenter: [INITIAL_REGION.latitude, INITIAL_REGION.longitude],
  initialZoom: INITIAL_MAP_ZOOM,
});

export default function MapScreen() {
  const { location, errorMsg: locationError } = useLocation();
  const [cameraNodes, setCameraNodes] = useState([]);
  const [syncError, setSyncError] = useState(null);
  const { nodesInRange } = useProximityAlerts(location, cameraNodes);
  const webviewRef = useRef(null);

  const loadForBounds = useCallback(async (bounds) => {
    // Offline-first: show whatever's cached immediately.
    const cached = await getCachedCameraNodes(bounds);
    setCameraNodes(cached);

    // Then attempt a background refresh; failures are non-fatal since we
    // already have cached data on screen.
    try {
      await syncCameraNodesForBounds(bounds);
      const refreshed = await getCachedCameraNodes(bounds);
      setCameraNodes(refreshed);
      setSyncError(null);
    } catch (err) {
      setSyncError(
        err instanceof AreaTooLargeError
          ? 'Zoom in to load camera data for this area'
          : 'Offline — showing cached nodes only'
      );
    }
  }, []);

  useEffect(() => {
    loadForBounds(centerDeltaToBounds(INITIAL_REGION));
  }, [loadForBounds]);

  useEffect(() => {
    webviewRef.current?.injectJavaScript(
      `window.setCameraNodes(${JSON.stringify(cameraNodes)}); true;`
    );
  }, [cameraNodes]);

  useEffect(() => {
    if (!location) return;
    webviewRef.current?.injectJavaScript(
      `window.setUserLocation(${location.latitude}, ${location.longitude}); true;`
    );
  }, [location]);

  const handleMessage = useCallback(
    (event) => {
      let message;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch (err) {
        return;
      }
      if (message.type === 'regionChange') {
        loadForBounds(message.bounds);
      }
    },
    [loadForBounds]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: MAP_HTML }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
      />

      <AlertBanner nodesInRange={nodesInRange} />

      {(locationError || syncError) && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{locationError ?? syncError}</Text>
        </View>
      )}

      {!location && !locationError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#ff6b35" size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d1d1d' },
  map: { flex: 1, backgroundColor: '#1d1d1d' },
  statusBar: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#1d1d1dcc',
    borderRadius: 8,
    padding: 10,
  },
  statusText: { color: '#8a8a8a', textAlign: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d1d1d88',
  },
});
