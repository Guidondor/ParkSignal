import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Ellipse, Defs, RadialGradient as SvgRadialGradient, Stop, G, Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';

interface Tier {
  name: string;
  color: string;
  glow: string;
  min: number;
  max: number;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    name: 'Cobre', color: '#CD7F32', glow: 'rgba(205,127,50,0.4)',
    min: 0, max: 49,
    perks: ['Acceso básico al mapa', 'Ver spots cercanos', 'Reportar lugares'],
  },
  {
    name: 'Plata', color: '#A8B8C8', glow: 'rgba(168,184,200,0.4)',
    min: 50, max: 199,
    perks: ['Badge Plata en tu perfil', 'Radio de búsqueda +20%', 'Historial de 30 días'],
  },
  {
    name: 'Oro', color: '#F5C518', glow: 'rgba(245,197,24,0.4)',
    min: 200, max: 499,
    perks: ['Badge Oro con efecto brillo', 'Radio ilimitado', 'Prioridad en notificaciones', 'Acceso anticipado a features'],
  },
  {
    name: 'Diamante', color: '#7DD3FC', glow: 'rgba(125,211,252,0.4)',
    min: 500, max: Infinity,
    perks: ['Badge Diamante exclusivo', 'Sin publicidad', 'API access', 'Soporte prioritario', 'Co-diseño de features'],
  },
];

const TIERS_REVERSED = TIERS.slice().reverse();

// Medalla SVG por tier
function Medal({ tier, size = 56 }: { tier: Tier; size?: number }) {
  const gradId = `grad_${tier.name}`;
  return (
    <Svg width={size} height={size + 16} viewBox="0 0 56 72">
      <Defs>
        <SvgRadialGradient id={gradId} cx="40%" cy="35%" r="65%">
          <Stop offset="0%" stopColor={tier.color} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={tier.color} stopOpacity={0.5} />
        </SvgRadialGradient>
      </Defs>
      {/* Cintas */}
      <Path d="M20 16 L14 0 L22 0 L26 16 Z" fill={tier.color} opacity={0.6} />
      <Path d="M36 16 L42 0 L34 0 L30 16 Z" fill={tier.color} opacity={0.6} />
      {/* Rectángulos cinta */}
      <Rect x="14" y="0" width="8" height="10" rx="2" fill={tier.color} opacity={0.5} />
      <Rect x="34" y="0" width="8" height="10" rx="2" fill={tier.color} opacity={0.5} />
      {/* Círculo principal */}
      <Circle cx="28" cy="44" r="26" fill={`url(#${gradId})`} />
      {/* Ring interior */}
      <Circle cx="28" cy="44" r="20" fill="none" stroke="white" strokeWidth="1" opacity={0.3} />
      {/* Shine */}
      <Ellipse cx="20" cy="36" rx="7" ry="4" fill="white" opacity={0.2} transform="rotate(-30, 20, 36)" />
      {/* Letra P */}
      <Path
        d="M23 36 L23 52 M23 36 L29 36 Q33 36 33 41 Q33 46 29 46 L23 46"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkles para Oro y Diamante */}
      {(tier.name === 'Oro' || tier.name === 'Diamante') && (
        <>
          <Path d="M48 22 L49 19 L50 22 L53 23 L50 24 L49 27 L48 24 L45 23 Z" fill={tier.color} opacity={0.8} />
          <Path d="M5 30 L5.8 28 L6.5 30 L8.5 30.8 L6.5 31.5 L5.8 33.5 L5 31.5 L3 30.8 Z" fill={tier.color} opacity={0.6} />
        </>
      )}
    </Svg>
  );
}

// Fila de cómo ganar puntos
function PointsRow({ action, pts, color }: { action: string; pts: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: 'Sora_500Medium' }}>{action}</Text>
      <View style={{
        backgroundColor: color + '22', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 3,
      }}>
        <Text style={{ color, fontSize: 12, fontFamily: 'Sora_700Bold' }}>{pts}</Text>
      </View>
    </View>
  );
}

export default function ReputationScreen() {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const score = profile?.reputation_score ?? 0;
  const currentTier = TIERS_REVERSED.find(t => score >= t.min) ?? TIERS[0];
  const tierMax = currentTier.max === Infinity ? currentTier.min + 300 : currentTier.max;
  const tierProgress = Math.min((score - currentTier.min) / (tierMax - currentTier.min), 1);

  const heroGradient: [string, string] = isDark ? ['#0F1A2E', '#0A0F1C'] : ['#1847D6', '#2563EB'];
  const accentColor = isDark ? '#00E5A0' : colors.brand;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header hero */}
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 16, paddingBottom: 28, paddingHorizontal: 20,
            borderBottomWidth: isDark ? 1 : 0,
            borderBottomColor: isDark ? colors.border : 'transparent',
          }}
        >
          {/* Back button + título */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.75}
              style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 20, fontFamily: 'Sora_600SemiBold' }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Sora_800ExtraBold' }}>
              Tus logros
            </Text>
          </View>

          {/* Card tier actual */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 20, padding: 16,
            flexDirection: 'row', alignItems: 'center', gap: 16,
          }}>
            <Medal tier={currentTier} size={68} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'Sora_800ExtraBold' }}>
                {currentTier.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Sora_500Medium' }}>
                {score} puntos
              </Text>
              <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 10 }}>
                <View style={{
                  height: 4, borderRadius: 2,
                  backgroundColor: currentTier.color,
                  width: `${Math.round(tierProgress * 100)}%`,
                }} />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Sora_500Medium', marginTop: 4 }}>
                {currentTier.max === Infinity
                  ? 'Nivel máximo'
                  : `${currentTier.max - score} pts para el siguiente nivel`
                }
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* Lista de tiers */}
          {TIERS_REVERSED.map((tier) => {
            const isUnlocked = score >= tier.min;
            const isCurrent = tier.name === currentTier.name;
            const isExpanded = expandedTier === tier.name;

            return (
              <View key={tier.name} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => setExpandedTier(isExpanded ? null : tier.name)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: isCurrent ? 1.5 : 1,
                    borderColor: isCurrent ? tier.color : colors.border,
                    opacity: isUnlocked ? 1 : 0.5,
                    shadowColor: isCurrent && isDark ? tier.color : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: isCurrent ? 4 : 0,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Medal tier={tier} size={44} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: tier.color, fontSize: 16, fontFamily: 'Sora_800ExtraBold' }}>
                          {tier.name}
                        </Text>
                        {isCurrent && (
                          <View style={{
                            backgroundColor: tier.color + '22', borderRadius: 6,
                            paddingHorizontal: 7, paddingVertical: 2,
                          }}>
                            <Text style={{ color: tier.color, fontSize: 9, fontFamily: 'Sora_700Bold' }}>
                              ACTUAL
                            </Text>
                          </View>
                        )}
                        {!isUnlocked && (
                          <Text style={{ fontSize: 14 }}>🔒</Text>
                        )}
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Sora_500Medium', marginTop: 2 }}>
                        {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}
                      </Text>
                    </View>
                    {/* Chevron */}
                    <Text style={{
                      color: colors.textSecondary, fontSize: 18,
                      transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                      fontFamily: 'Sora_400Regular',
                    }}>
                      ›
                    </Text>
                  </View>

                  {/* Perks expandidos */}
                  {isExpanded && (
                    <View style={{ marginTop: 14, gap: 8 }}>
                      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 4 }} />
                      {tier.perks.map((perk, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: tier.color + '30', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: tier.color, fontSize: 9, fontFamily: 'Sora_700Bold' }}>✓</Text>
                          </View>
                          <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: 'Sora_500Medium' }}>
                            {perk}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Tabla cómo ganar puntos */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 16,
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Sora_700Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Cómo ganar puntos
            </Text>
            <PointsRow action="Reportar un lugar" pts="+10 pts" color={accentColor} />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <PointsRow action="Lugar confirmado" pts="+15 pts" color={accentColor} />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <PointsRow action="Primero en reportar" pts="+5 pts bonus" color={colors.warning} />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <PointsRow action="Lugar disputado" pts="-5 pts" color={colors.error} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
