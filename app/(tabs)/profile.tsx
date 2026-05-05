import React from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Switch, Text as RNText, Linking } from 'react-native';

const PRIVACY_URL = 'https://guidondor.github.io/ParkSignal/privacy.html';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';

// Tier por reputación
function getTier(score: number) {
  if (score >= 500) return { name: 'Diamante', color: '#7DD3FC', min: 500, max: Infinity };
  if (score >= 200) return { name: 'Oro', color: '#F5C518', min: 200, max: 499 };
  if (score >= 50)  return { name: 'Plata', color: '#A8B8C8', min: 50, max: 199 };
  return { name: 'Cobre', color: '#CD7F32', min: 0, max: 49 };
}

// Toggle row para settings
function SettingsRow({
  label,
  description,
  value,
  onToggle,
  disabled,
  accentColor,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  accentColor: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14, paddingHorizontal: 16,
    }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: 'Sora_600SemiBold' }}>{label}</Text>
        {description && (
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Sora_400Regular', marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: accentColor }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, session, isLoading, signOut, deleteAccount } = useAuth();
  const { colors, spacing, radius, isDark, toggleTheme } = useTheme();
  const { notificationsEnabled, isUpdating, toggle } = useNotifications();
  const { t, lang } = useTranslation();
  const toggleLang = useLanguageStore((s) => s.toggle);

  async function handleLogout() {
    Alert.alert(t('profile_logout_title'), t('profile_logout_confirm'), [
      { text: t('profile_logout_cancel'), style: 'cancel' },
      {
        text: t('profile_logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(t('profile_delete_confirm_title'), t('profile_delete_confirm_msg'), [
      { text: t('profile_logout_cancel'), style: 'cancel' },
      {
        text: t('profile_delete_confirm_btn'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert(t('map_error_title'), t('auth_error_unexpected'));
          }
        },
      },
    ]);
  }

  if (isLoading) return <LoadingOverlay message={t('profile_loading')} />;

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Text variant="body" secondary center>{t('profile_load_error')}</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ backgroundColor: colors.error, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={{ color: '#FFF', fontFamily: 'Sora_700Bold', fontSize: 14 }}>{t('profile_logout')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tier = getTier(profile.reputation_score);
  const tierMax = tier.max === Infinity ? tier.min + 300 : tier.max;
  const tierProgress = Math.min(
    (profile.reputation_score - tier.min) / (tierMax - tier.min),
    1
  );

  const dateLocale = lang === 'es' ? 'es-AR' : 'en-US';
  const heroGradient: [string, string] = isDark
    ? ['#0F1A2E', '#0A0F1C']
    : ['#1847D6', '#2563EB'];

  const accentColor = isDark ? '#00E5A0' : colors.brand;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero section */}
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 28, paddingBottom: 28, paddingHorizontal: 20,
            borderBottomWidth: isDark ? 1 : 0,
            borderBottomColor: isDark ? colors.border : 'transparent',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Círculos decorativos */}
          <View style={{
            position: 'absolute', top: -40, right: -40,
            width: 180, height: 180, borderRadius: 90,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }} />
          <View style={{
            position: 'absolute', bottom: -60, left: -20,
            width: 200, height: 200, borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.03)',
          }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            {isDark ? (
              <LinearGradient
                colors={[colors.brand, accentColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 58, height: 58, borderRadius: 29,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RNText style={{ color: '#000', fontSize: 20, fontFamily: 'Sora_800ExtraBold', includeFontPadding: false, lineHeight: 24 }}>
                  {profile.username.charAt(0).toUpperCase()}
                </RNText>
              </LinearGradient>
            ) : (
              <View style={{
                width: 58, height: 58, borderRadius: 29,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <RNText style={{ color: '#FFF', fontSize: 20, fontFamily: 'Sora_800ExtraBold', includeFontPadding: false, lineHeight: 24 }}>
                  {profile.username.charAt(0).toUpperCase()}
                </RNText>
              </View>
            )}

            {/* Info usuario */}
            <View style={{ flex: 1 }}>
              <RNText style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Sora_600SemiBold' }} numberOfLines={1} adjustsFontSizeToFit>
                {(session?.user?.email ?? profile.username).replace(/^@+/, '')}
              </RNText>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Sora_500Medium', marginTop: 2 }}>
                Miembro desde {new Date(profile.created_at).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
              </Text>
              {/* Badge nivel */}
              <View style={{
                marginTop: 8,
                alignSelf: 'flex-start',
                backgroundColor: isDark ? 'rgba(0,229,160,0.15)' : 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 3,
              }}>
                <Text style={{
                  color: isDark ? accentColor : '#FFFFFF',
                  fontSize: 11,
                  fontFamily: 'Sora_700Bold',
                }}>
                  {tier.name}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Card reputación — tappable */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/reputation')}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 29,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Medalla simplificada */}
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: tier.color + '22',
              borderWidth: 2, borderColor: tier.color + '55',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <RNText style={{ fontSize: 20, fontFamily: 'Sora_800ExtraBold', color: tier.color, includeFontPadding: false, lineHeight: 24 }}>P</RNText>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: 'Sora_700Bold' }}>
                  {t('profile_reputation')} — {tier.name}
                </Text>
                <Text style={{ color: colors.brand, fontSize: 15, fontFamily: 'Sora_800ExtraBold' }}>
                  {profile.reputation_score}
                </Text>
              </View>
              {/* Barra progreso */}
              <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
                <View style={{
                  height: 4, borderRadius: 2,
                  backgroundColor: tier.color,
                  width: `${Math.round(tierProgress * 100)}%`,
                }} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Sora_500Medium', marginTop: 4 }}>
                {tier.max === Infinity
                  ? 'Nivel máximo alcanzado'
                  : `${tier.max - profile.reputation_score} pts para ${tier.name === 'Cobre' ? 'Plata' : tier.name === 'Plata' ? 'Oro' : 'Diamante'}`
                }
              </Text>
            </View>

            {/* Chevron */}
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontFamily: 'Sora_400Regular' }}>›</Text>
          </TouchableOpacity>

          {/* Stats 3 columnas */}
          <View style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: 16,
          }}>
            {[
              { value: profile.reputation_score, label: t('profile_points'), color: colors.brand },
              { value: profile.total_spots_reported, label: t('profile_spots_reported'), color: isDark ? '#00E5A0' : '#10B981' },
              { value: profile.total_spots_confirmed, label: t('profile_spots_confirmed'), color: colors.warning },
            ].map((stat, i) => (
              <View key={i} style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 16,
                paddingVertical: 14, paddingHorizontal: 8,
                alignItems: 'center',
                borderWidth: 1, borderColor: colors.border,
              }}>
                <RNText style={{ color: stat.color, fontSize: 16, fontFamily: 'Sora_800ExtraBold', includeFontPadding: false }}>
                  {String(stat.value)}
                </RNText>
                <Text style={{
                  color: colors.textSecondary, fontSize: 10,
                  fontFamily: 'Sora_500Medium',
                  textAlign: 'center', marginTop: 4, lineHeight: 14,
                }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Settings card */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 29,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
              <Text style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontFamily: 'Sora_700Bold',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}>
                Ajustes
              </Text>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            <SettingsRow
              label={t('profile_notifications_on')}
              description="Avisos de spots cercanos"
              value={notificationsEnabled}
              onToggle={async () => {
                const err = await toggle();
                if (err) Alert.alert(t('map_error_title'), err);
              }}
              disabled={isUpdating}
              accentColor={accentColor}
            />

            <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />

            <SettingsRow
              label={isDark ? t('profile_theme_light') : t('profile_theme_dark')}
              description="Cambiá entre claro y oscuro"
              value={isDark}
              onToggle={toggleTheme}
              accentColor={accentColor}
            />

            <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />

            <SettingsRow
              label={t('profile_language_switch')}
              description={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              value={lang === 'en'}
              onToggle={toggleLang}
              accentColor={accentColor}
            />
          </View>

          {/* Cerrar sesión */}
          <View style={{ alignItems: 'center', paddingVertical: 14, gap: 16 }}>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.75}
            >
              <Text style={{ color: colors.error, fontSize: 14, fontFamily: 'Sora_600SemiBold' }}>
                {t('profile_logout')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.75}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: 'Sora_500Medium' }}>
                {t('profile_delete_account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.75}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Sora_400Regular', textDecorationLine: 'underline' }}>
                Política de Privacidad
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
