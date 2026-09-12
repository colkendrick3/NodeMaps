import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

export default function CameraMarker({ node }) {
  return (
    <Marker
      coordinate={{ latitude: node.lat, longitude: node.lon }}
      title={node.surveillanceType ?? 'Camera'}
      description={`OSM node ${node.osmId}`}
    >
      <View style={styles.dot} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff6b35',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
