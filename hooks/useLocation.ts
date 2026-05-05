import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    requestAndFetch();
    return () => {
      // Al desmontar, marcar GPS como inactivo
      if (session?.user) {
        supabase.from('users').update({ gps_active: false }).eq('id', session.user.id);
      }
    };
  }, []);

  async function requestAndFetch() {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicacion denegado');
        setPermissionGranted(false);
        setLocation(null);
        return;
      }
      setPermissionGranted(true);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(coords);

      // Marcar GPS como activo en DB
      if (session?.user) {
        supabase.from('users').update({ gps_active: true }).eq('id', session.user.id);
      }
    } catch (e) {
      setError('No se pudo obtener la ubicacion');
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function getCurrentLocation(): Promise<Coordinates | null> {
    if (!permissionGranted) return null;
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch {
      return location;
    }
  }

  return { location, permissionGranted, error, isLoading, getCurrentLocation, refresh: requestAndFetch };
}
