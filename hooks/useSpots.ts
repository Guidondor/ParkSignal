import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSpotsStore } from '@/store/spotsStore';
import { useAuthStore } from '@/store/authStore';
import { Spot, NewSpotPayload, UserProfile } from '@/lib/types';
import { Coordinates } from './useLocation';

const RADIUS_KM = 1;

export function useSpots() {
  const {
    spots,
    selectedSpot,
    isLoadingSpots,
    isReporting,
    showReportModal,
    setSpots,
    upsertSpot,
    removeSpot,
    setSelectedSpot,
    setIsLoadingSpots,
    setIsReporting,
    setShowReportModal,
  } = useSpotsStore();

  const { session, setProfile } = useAuthStore();

  const fetchNearbySpots = useCallback(async (coords: Coordinates) => {
    setIsLoadingSpots(true);
    try {
      const { data, error } = await supabase.rpc('get_nearby_spots', {
        p_lat: coords.latitude,
        p_lng: coords.longitude,
        p_radius_km: RADIUS_KM,
      });

      if (error) throw error;
      setSpots((data as Spot[]) ?? []);
    } catch (e) {
      console.error('Error fetching spots:', e);
    } finally {
      setIsLoadingSpots(false);
    }
  }, [setSpots, setIsLoadingSpots]);

  function subscribeToSpots() {
    const channel = supabase
      .channel('spots-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'spots' },
        (payload) => {
          const newSpot = payload.new as Spot;
          if (newSpot.status === 'available') {
            upsertSpot(newSpot);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'spots' },
        (payload) => {
          const updated = payload.new as Spot;
          if (updated.status === 'available') {
            upsertSpot(updated);
          } else {
            removeSpot(updated.id);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'spots' },
        (payload) => {
          removeSpot((payload.old as Spot).id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function reportSpot(payload: NewSpotPayload): Promise<string | null> {
    setIsReporting(true);
    try {
      const { error } = await supabase.from('spots').insert({
        lat: payload.lat,
        lng: payload.lng,
        spot_type: payload.spot_type,
        reporter_id: payload.reporter_id,
      });

      if (error) throw error;
      setShowReportModal(false);

      // Refrescar perfil para reflejar reputacion y contador actualizados
      if (session?.user) {
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
        if (data) setProfile(data as UserProfile);
      }

      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al reportar el lugar';
      return msg;
    } finally {
      setIsReporting(false);
    }
  }

  async function claimSpot(spotId: string): Promise<string | null> {
    if (!session?.user) return 'Debes iniciar sesion';
    try {
      const { data, error } = await supabase.rpc('claim_spot', {
        p_spot_id: spotId,
        p_user_id: session.user.id,
      });

      if (error) throw error;
      if (data && !data.success) return data.message ?? 'El lugar ya no esta disponible';

      // Refrescar perfil para reflejar reputacion actualizada
      const { data: updatedProfile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
      if (updatedProfile) setProfile(updatedProfile as UserProfile);

      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al reclamar el lugar';
    }
  }

  async function confirmSpot(spotId: string): Promise<string | null> {
    if (!session?.user) return 'Debes iniciar sesion';
    try {
      const { error } = await supabase.rpc('confirm_spot', {
        p_spot_id: spotId,
        p_user_id: session.user.id,
      });
      if (error) throw error;
      const { data: updatedProfile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
      if (updatedProfile) setProfile(updatedProfile as UserProfile);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al confirmar el lugar';
    }
  }

  async function disputeSpot(spotId: string): Promise<string | null> {
    if (!session?.user) return 'Debes iniciar sesion';
    try {
      const { error } = await supabase.rpc('dispute_spot', {
        p_spot_id: spotId,
        p_user_id: session.user.id,
      });
      if (error) throw error;
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al reportar el pin';
    }
  }

  async function setLeavingSoon(spotId: string): Promise<string | null> {
    if (!session?.user) return 'Debes iniciar sesion';
    try {
      const { data, error } = await supabase.rpc('set_leaving_soon', {
        p_spot_id: spotId,
        p_user_id: session.user.id,
      });
      if (error) throw error;
      if (data && !data.success) return data.message ?? 'Error';
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error al activar aviso';
    }
  }

  return {
    spots,
    selectedSpot,
    isLoadingSpots,
    isReporting,
    showReportModal,
    fetchNearbySpots,
    subscribeToSpots,
    reportSpot,
    claimSpot,
    confirmSpot,
    disputeSpot,
    setLeavingSoon,
    setSelectedSpot,
    setShowReportModal,
  };
}
