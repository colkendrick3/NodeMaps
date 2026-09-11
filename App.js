import React from 'react';
import { StatusBar } from 'expo-status-bar';
import MapScreen from './screens/MapScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <MapScreen />
    </>
  );
}
