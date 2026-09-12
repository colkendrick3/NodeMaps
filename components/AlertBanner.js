import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertBanner({ nodesInRange }) {
  if (!nodesInRange?.length) return null;

  const nearest = nodesInRange[0];

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Camera node ~{Math.round(nearest.distanceMeters)}m away
        {nodesInRange.length > 1 ? ` (+${nodesInRange.length - 1} more nearby)` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: {
    color: '#1d1d1d',
    fontWeight: '600',
    textAlign: 'center',
  },
});
