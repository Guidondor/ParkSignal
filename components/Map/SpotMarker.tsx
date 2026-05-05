import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { Spot } from '@/lib/types';

interface SpotMarkerProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
  isDark?: boolean;
}

const SUCCESS_LIGHT = '#10B981';
const SUCCESS_DARK  = '#00E5A0';
const WARNING       = '#F59E0B';

export function SpotMarker({ spot, onPress, isDark = false }: SpotMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const minutesAgo = Math.floor((Date.now() - new Date(spot.reported_at).getTime()) / 60000);
  const isExpiringSoon = minutesAgo >= 12;
  const isLeavingSoon = !!spot.leaving_soon_at;
  const dotColor = isLeavingSoon
    ? WARNING
    : isExpiringSoon
    ? WARNING
    : isDark ? SUCCESS_DARK : SUCCESS_LIGHT;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] });

  return (
    <Marker
      coordinate={{ latitude: spot.lat, longitude: spot.lng }}
      onPress={() => onPress(spot)}
      tracksViewChanges={false}
    >
      <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
        {/* Anillo pulse */}
        {(!isExpiringSoon || isLeavingSoon) && (
          <Animated.View style={{
            position: 'absolute',
            width: 32, height: 32,
            borderRadius: 16,
            backgroundColor: dotColor,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }} />
        )}
        {/* Círculo principal */}
        <View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: dotColor,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: isDark ? 2.5 : 3,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
          shadowColor: isDark ? dotColor : '#000',
          shadowOffset: { width: 0, height: isDark ? 0 : 3 },
          shadowOpacity: isDark ? 0.8 : 0.22,
          shadowRadius: isDark ? 10 : 7,
          elevation: 6,
        }}>
          <Animated.Text style={{
            color: isDark ? '#000000' : '#FFFFFF',
            fontSize: 11,
            fontFamily: 'Sora_800ExtraBold',
            lineHeight: 14,
          }}>
            P
          </Animated.Text>
        </View>
      </View>
    </Marker>
  );
}
