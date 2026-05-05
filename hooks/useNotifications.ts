import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { UserProfile } from '@/lib/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const { session, profile, setProfile } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const notificationsEnabled = profile?.notifications_enabled ?? false;

  async function getPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }

  async function enableNotifications(): Promise<string | null> {
    if (!session?.user) return 'Debes iniciar sesion';
    setIsUpdating(true);
    try {
      const token = await getPushToken();
      if (!token) return 'No se pudo obtener permiso para notificaciones. Verificá los permisos en Ajustes.';

      const { data, error } = await supabase
        .from('users')
        .update({ push_token: token, notifications_enabled: true })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al activar notificaciones';
    } finally {
      setIsUpdating(false);
    }
  }

  async function disableNotifications(): Promise<string | null> {
    if (!session?.user) return null;
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ push_token: null, notifications_enabled: false })
        .eq('id', session.user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) setProfile(data as UserProfile);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al desactivar notificaciones';
    } finally {
      setIsUpdating(false);
    }
  }

  async function toggle(): Promise<string | null> {
    if (notificationsEnabled) {
      return await disableNotifications();
    } else {
      return await enableNotifications();
    }
  }

  return { notificationsEnabled, isUpdating, toggle };
}
