import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { MapContainer, MapContainerRef } from '@/components/Map/MapContainer';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Text } from '@/components/ui/Text';
import { useLocation } from '@/hooks/useLocation';
import { useSpots } from '@/hooks/useSpots';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Spot, SpotType } from '@/lib/types';

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ícono GPS — cruz con círculo central
function GpsIcon({ color }: { color: string }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="4" stroke={color} strokeWidth="1.8" />
      <Line x1="10" y1="1" x2="10" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="10" y1="14" x2="10" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="1" y1="10" x2="6" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="10" x2="19" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// Toast component
function Toast({ message, subtitle, visible, isError }: { message: string; subtitle?: string; visible: boolean; isError?: boolean }) {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = isDark
    ? colors.surface
    : isError ? '#EF4444' : colors.brand;

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 100,
      left: 20, right: 20,
      zIndex: 50,
      opacity,
      transform: [{ translateY }],
    }}>
      <View style={{
        backgroundColor: bgColor,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? colors.border : 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Sora_700Bold' }}>{message}</Text>
        {subtitle && (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Sora_500Medium', marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function MapScreen() {
  const { location, isLoading: locationLoading, getCurrentLocation, refresh: retryLocation } = useLocation();
  const {
    spots, selectedSpot, isLoadingSpots, isReporting,
    showReportModal, fetchNearbySpots, subscribeToSpots,
    reportSpot, claimSpot, confirmSpot, disputeSpot, setLeavingSoon, setSelectedSpot, setShowReportModal,
  } = useSpots();
  const { profile, session } = useAuthStore();
  const { colors, spacing, radius, shadow, isDark } = useTheme();
  const { t, lang } = useTranslation();

  const SPOT_TYPES: { value: SpotType; label: string }[] = [
    { value: 'calle',    label: t('map_spot_type_calle') },
    { value: 'playa',    label: t('map_spot_type_playa') },
    { value: 'cochera',  label: t('map_spot_type_cochera') },
    { value: 'zona_azul',label: t('map_spot_type_zona_azul') },
    { value: 'otro',     label: t('map_spot_type_otro') },
  ];

  const SPOT_TYPE_LABELS: Record<SpotType, string> = {
    calle: t('map_spot_type_calle'),
    playa: t('map_spot_type_playa'),
    cochera: t('map_spot_type_cochera'),
    zona_azul: t('map_spot_type_zona_azul'),
    otro: t('map_spot_type_otro'),
  };

  function formatTimeAgo(dateStr: string): string {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return t('map_time_now');
    if (mins === 1) return t('map_time_1min');
    if (mins < 60) return t('map_time_mins', { n: mins });
    return t('map_time_hours', { n: Math.floor(mins / 60) });
  }

  const [selectedType, setSelectedType] = useState<SpotType>('calle');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [isLeavingSoon, setIsLeavingSoon] = useState(false);
  const [gpsSpinning, setGpsSpinning] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toast, setToast] = useState<{ msg: string; sub?: string; error?: boolean } | null>(null);
  const [now, setNow] = useState(Date.now());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapContainerRef>(null);
  const gpsRotation = useRef(new Animated.Value(0)).current;

  // Subscribe once on mount; do NOT depend on location changes
  useEffect(() => {
    unsubscribeRef.current = subscribeToSpots();
    return () => { unsubscribeRef.current?.(); };
  }, []);

  // Fetch spots whenever location changes
  useEffect(() => {
    if (location) fetchNearbySpots(location);
  }, [location?.latitude, location?.longitude, fetchNearbySpots]);

  // Tick every 30s so expiresInMin stays fresh while bottom sheet is open
  useEffect(() => {
    if (!selectedSpot) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [selectedSpot?.id]);

  function showToast(msg: string, sub?: string, error = false) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, sub, error });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleGpsPress() {
    if (gpsSpinning) return;
    setGpsSpinning(true);
    Animated.timing(gpsRotation, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
      gpsRotation.setValue(0);
    });
    
    const coords = await getCurrentLocation();
    if (coords) mapRef.current?.animateTo(coords);
    setGpsSpinning(false);
  }

  async function handleConfirmReport() {
    if (isSubmittingReport) return;
    setIsSubmittingReport(true);
    try {
      const coords = await getCurrentLocation();
      if (!coords) { Alert.alert(t('map_error_title'), t('map_error_location_perms')); return; }
      if (!session?.user) { Alert.alert(t('map_error_title'), t('map_error_session')); return; }

      const err = await reportSpot({
        lat: coords.latitude,
        lng: coords.longitude,
        spot_type: selectedType,
        reporter_id: session.user.id,
      });

      if (err) {
        showToast(t('map_error_title'), err, true);
      } else {
        setShowReportModal(false);
        showToast(t('map_success_reported_title'), t('map_success_reported_body'));
        setSelectedType('calle');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  }

  async function handleClaimSpot() {
    if (!selectedSpot) return;
    setIsClaiming(true);
    const err = await claimSpot(selectedSpot.id);
    setIsClaiming(false);

    if (err) {
      showToast(t('map_error_title'), err, true);
    } else {
      showToast(t('map_claimed_title'), t('map_claimed_body'));
      setSelectedSpot(null);
    }
  }

  async function handleConfirmSpot() {
    if (!selectedSpot) return;
    setIsConfirming(true);
    const err = await confirmSpot(selectedSpot.id);
    setIsConfirming(false);
    if (err) {
      showToast(t('map_error_title'), err, true);
    } else {
      showToast(t('map_confirmed_title'), t('map_confirmed_body'));
      setSelectedSpot(null);
    }
  }

  async function handleDisputeSpot() {
    if (!selectedSpot) return;
    setIsDisputing(true);
    const err = await disputeSpot(selectedSpot.id);
    setIsDisputing(false);
    if (err) {
      showToast(t('map_error_title'), err, true);
    } else {
      showToast(t('map_disputed_title'), t('map_disputed_body'));
      setSelectedSpot(null);
    }
  }

  async function handleSetLeavingSoon() {
    if (!selectedSpot) return;
    setIsLeavingSoon(true);
    const err = await setLeavingSoon(selectedSpot.id);
    setIsLeavingSoon(false);
    if (err) {
      showToast(t('map_error_title'), err, true);
    } else {
      showToast(t('leaving_soon_toast_title'), t('leaving_soon_toast_body'));
      setSelectedSpot(null);
    }
  }

  const gpsRotateDeg = gpsRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (locationLoading) return <LoadingOverlay message={t('map_loading_location')} />;

  if (!location) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background }}>
        <Text variant="body" secondary>{t('map_no_location')}</Text>
        <TouchableOpacity
          onPress={retryLocation}
          style={{
            paddingHorizontal: 24, paddingVertical: 12,
            borderRadius: 12, backgroundColor: colors.brand,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Sora_700Bold' }}>
            {t('map_retry_location')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const visibleSpots = spots.filter(s => new Date(s.expires_at).getTime() > now);

  const isOwnSpot = selectedSpot?.reporter_id === session?.user?.id;
  const expiresInMin = selectedSpot
    ? Math.max(0, Math.floor((new Date(selectedSpot.expires_at).getTime() - now) / 60000))
    : 0;
  const distanceLabel = location && selectedSpot
    ? (() => {
        const m = distanceMeters(location.latitude, location.longitude, selectedSpot.lat, selectedSpot.lng);
        if (lang === 'en') {
          const mi = m / 1609.34;
          return mi < 0.1 ? `${Math.round(m * 3.281)} ft` : `${mi.toFixed(1)} mi`;
        }
        return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
      })()
    : '—';

  return (
    <View style={{ flex: 1 }}>
      <MapContainer
        ref={mapRef}
        userLocation={location}
        spots={visibleSpots}
        onSpotPress={(spot: Spot) => setSelectedSpot(spot)}
      />

      {isLoadingSpots && <LoadingOverlay message={t('map_loading_spots')} />}

      {/* Toast */}
      <Toast
        message={toast?.msg ?? ''}
        subtitle={toast?.sub}
        visible={!!toast}
        isError={toast?.error}
      />

      {/* Badge spots disponibles — top centrado */}
      <SafeAreaView style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        alignItems: 'center', zIndex: 10, pointerEvents: 'none',
      }} edges={['top']}>
        <View style={{
          backgroundColor: isDark ? 'rgba(0,229,160,0.1)' : colors.brand,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? 'rgba(0,229,160,0.3)' : 'transparent',
          paddingHorizontal: 18,
          paddingVertical: 7,
          borderRadius: radius.full,
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          shadowColor: isDark ? 'transparent' : '#1847D6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.32,
          shadowRadius: 20,
          elevation: 6,
        }}>
          {/* Dot indicador */}
          <View style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: isDark ? '#00E5A0' : '#10B981',
          }} />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontFamily: 'Sora_700Bold',
          }}>
            {visibleSpots.length} {visibleSpots.length === 1 ? t('map_spots_one') : t('map_spots_many')}
          </Text>
        </View>
      </SafeAreaView>

      {/* Botón GPS — bottom-right */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 90,
          width: 46, height: 46,
          borderRadius: isDark ? 14 : 23,
          backgroundColor: colors.surface,
          alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.4 : 0.28,
          shadowRadius: 10,
          elevation: 5,
        }}
        onPress={handleGpsPress}
        activeOpacity={0.75}
      >
        <Animated.View style={{ transform: [{ rotate: gpsRotateDeg }] }}>
          <GpsIcon color={colors.brand} />
        </Animated.View>
      </TouchableOpacity>

      {/* FAB Liberar lugar — full width bottom */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        left: 20, right: 20,
        zIndex: 10,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#00E5A0' : colors.brand,
            paddingVertical: 16,
            borderRadius: isDark ? 18 : radius.full,
            gap: 10,
            shadowColor: isDark ? '#00E5A0' : '#1847D6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.25 : 0.38,
            shadowRadius: isDark ? 24 : 28,
            elevation: 10,
          }}
          onPress={() => setShowReportModal(true)}
          activeOpacity={0.85}
        >
          {/* Ícono + */}
          <View style={{
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              color: isDark ? '#000' : '#FFF',
              fontSize: 18,
              fontFamily: 'Sora_800ExtraBold',
              lineHeight: 22,
            }}>+</Text>
          </View>
          <Text style={{
            color: isDark ? '#000000' : '#FFFFFF',
            fontSize: 15,
            fontFamily: 'Sora_700Bold',
          }}>
            {t('map_report_button')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom sheet — Detalle de spot */}
      {selectedSpot && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingBottom: Platform.OS === 'android' ? 24 : 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 12,
          zIndex: 20,
        }}>
          {/* Handle */}
          <View style={{
            width: 36, height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 14, marginBottom: 0,
          }} />

          <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 0 }}>
            {/* Header row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: colors.brandLight,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}>
                  <Text style={{ color: colors.brand, fontSize: 12, fontFamily: 'Sora_700Bold' }}>
                    {SPOT_TYPE_LABELS[selectedSpot.spot_type]}
                  </Text>
                </View>
                {/* Dot estado */}
                <View style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: isDark ? '#00E5A0' : '#10B981',
                }} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Sora_500Medium' }}>
                {formatTimeAgo(selectedSpot.reported_at)}
              </Text>
            </View>

            {/* Stats row */}
            <View style={{
              backgroundColor: colors.surface2,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              marginBottom: 14,
            }}>
              {[
                { value: String(expiresInMin), label: 'min para expirar' },
                { value: distanceLabel, label: t('map_distance_label') },
                { value: String(selectedSpot.confirmations), label: 'confirmaciones' },
              ].map((stat, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  {i > 0 && (
                    <View style={{
                      position: 'absolute', left: 0, top: '10%', bottom: '10%',
                      width: 1, backgroundColor: colors.border,
                    }} />
                  )}
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: 'Sora_800ExtraBold' }}>
                    {stat.value}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: 'Sora_500Medium', textAlign: 'center', marginTop: 2 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Reportado por */}
            <View style={{
              backgroundColor: colors.surface2,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 10, paddingHorizontal: 12,
              flexDirection: 'row', alignItems: 'center',
              gap: 10, marginBottom: 16,
            }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: colors.brandLight,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: colors.brand, fontSize: 12, fontFamily: 'Sora_700Bold' }}>
                  {isOwnSpot ? (profile?.username?.[0] ?? 'V').toUpperCase() : 'U'}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontFamily: 'Sora_700Bold' }}>
                  {isOwnSpot ? `@${profile?.username ?? 'vos'}` : 'Otro usuario'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Sora_500Medium' }}>
                  {isOwnSpot ? 'Lo reportaste vos' : 'Miembro de la comunidad'}
                </Text>
              </View>
            </View>

            {/* Botones */}
            <View style={{ gap: 10 }}>
              {!isOwnSpot && (
                <>
                  <TouchableOpacity
                    onPress={handleClaimSpot}
                    disabled={isClaiming}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: isDark ? '#00E5A0' : colors.brand,
                      borderRadius: 16,
                      paddingVertical: 15,
                      alignItems: 'center',
                      shadowColor: isDark ? '#00E5A0' : '#1847D6',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: isDark ? 0.2 : 0.3,
                      shadowRadius: isDark ? 24 : 20,
                      elevation: 6,
                      opacity: isClaiming ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 15, fontFamily: 'Sora_700Bold' }}>
                      {isClaiming ? 'Reservando...' : '🚗  Voy para allá'}
                    </Text>
                  </TouchableOpacity>

                  {/* Confirmar / Disputar */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={handleConfirmSpot}
                      disabled={isConfirming}
                      activeOpacity={0.8}
                      style={{
                        flex: 1, borderRadius: 14, paddingVertical: 12,
                        alignItems: 'center', borderWidth: 1,
                        borderColor: isDark ? '#00E5A0' : '#10B981',
                        opacity: isConfirming ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: isDark ? '#00E5A0' : '#10B981', fontSize: 13, fontFamily: 'Sora_600SemiBold' }}>
                        {isConfirming ? '...' : `✓  ${t('map_confirm_spot')}`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDisputeSpot}
                      disabled={isDisputing}
                      activeOpacity={0.8}
                      style={{
                        flex: 1, borderRadius: 14, paddingVertical: 12,
                        alignItems: 'center', borderWidth: 1,
                        borderColor: colors.error,
                        opacity: isDisputing ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: colors.error, fontSize: 13, fontFamily: 'Sora_600SemiBold' }}>
                        {isDisputing ? '...' : `✗  ${t('map_dispute_spot')}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {isOwnSpot && !selectedSpot.leaving_soon_at && (
                <TouchableOpacity
                  onPress={handleSetLeavingSoon}
                  disabled={isLeavingSoon}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 13,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: colors.warning,
                    opacity: isLeavingSoon ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: colors.warning, fontSize: 14, fontFamily: 'Sora_700Bold' }}>
                    {isLeavingSoon ? '...' : `🚶  ${t('leaving_soon_btn')}`}
                  </Text>
                </TouchableOpacity>
              )}
              {isOwnSpot && !!selectedSpot.leaving_soon_at && (
                <View style={{
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: colors.warning + '18',
                  borderWidth: 1.5,
                  borderColor: colors.warning,
                }}>
                  <Text style={{ color: colors.warning, fontSize: 13, fontFamily: 'Sora_600SemiBold' }}>
                    🚶  {t('leaving_soon_badge')}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setSelectedSpot(null)}
                activeOpacity={0.75}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                style={{
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 14,
                  paddingVertical: 13,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Sora_600SemiBold' }}>
                  {t('map_close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal Liberar Lugar */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingBottom: Platform.OS === 'android' ? 32 : 40,
          }}>
            {/* Handle */}
            <View style={{
              width: 36, height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: 14, marginBottom: 2,
            }} />

            <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: 'Sora_800ExtraBold', marginBottom: 6 }}>
                {t('map_report_button')}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Sora_500Medium', marginBottom: 20 }}>
                {t('map_report_hint')}
              </Text>

              <Text style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontFamily: 'Sora_700Bold',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 12,
              }}>
                {t('map_spot_type_label')}
              </Text>

              {/* Chips tipo — wrapping */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {SPOT_TYPES.map((type) => {
                  const isSelected = selectedType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setSelectedType(type.value)}
                      disabled={isReporting || isSubmittingReport}
                      activeOpacity={0.75}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radius.full,
                        borderWidth: 1.5,
                        borderColor: isSelected
                          ? isDark ? '#00E5A0' : colors.brand
                          : colors.border,
                        backgroundColor: isSelected
                          ? isDark ? '#00E5A0' : colors.brand
                          : colors.surface2,
                      }}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontFamily: isSelected ? 'Sora_700Bold' : 'Sora_500Medium',
                        color: isSelected
                          ? isDark ? '#000000' : '#FFFFFF'
                          : colors.textSecondary,
                      }}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botones acción */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={handleConfirmReport}
                  disabled={isReporting || isSubmittingReport}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: isDark ? '#00E5A0' : colors.brand,
                    borderRadius: 16,
                    paddingVertical: 15,
                    alignItems: 'center',
                    opacity: isReporting ? 0.7 : 1,
                  }}
                >
                  <Text style={{
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: 15,
                    fontFamily: 'Sora_700Bold',
                  }}>
                    {isReporting || isSubmittingReport ? 'Reportando...' : t('map_confirm')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  disabled={isReporting || isSubmittingReport}
                  activeOpacity={0.75}
                  style={{
                    borderWidth: 1, borderColor: colors.border,
                    borderRadius: 14, paddingVertical: 13,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: 'Sora_600SemiBold' }}>
                    {t('map_cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
