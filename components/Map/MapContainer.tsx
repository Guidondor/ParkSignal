import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Spot } from '@/lib/types';
import { SpotMarker } from './SpotMarker';
import { Coordinates } from '@/hooks/useLocation';
import { useTheme } from '@/hooks/useTheme';

interface MapContainerProps {
  userLocation: Coordinates;
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onMapReady?: () => void;
}

export interface MapContainerRef {
  animateToUser: () => void;
  animateTo: (coords: Coordinates) => void;
}

export const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(
  ({ userLocation, spots, onSpotPress, onMapReady }, ref) => {
    const mapRef = useRef<MapView>(null);
    const { isDark } = useTheme();

    useImperativeHandle(ref, () => ({
      animateToUser: () => {
        mapRef.current?.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 600);
      },
      animateTo: (coords: Coordinates) => {
        mapRef.current?.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 600);
      },
    }));

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          onMapReady={onMapReady}
        >
          {spots.map((spot) => (
            <SpotMarker key={spot.id} spot={spot} onPress={onSpotPress} isDark={isDark} />
          ))}
        </MapView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
