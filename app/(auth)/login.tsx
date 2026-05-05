import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

// Ícono logo: pin de mapa con "P"
function LogoIcon() {
  return (
    <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="15" r="10" fill="rgba(255,255,255,0.2)" />
      <Path
        d="M18 4C12.477 4 8 8.477 8 14c0 7.732 10 18 10 18s10-10.268 10-18c0-5.523-4.477-10-10-10z"
        fill="white"
        opacity={0.9}
      />
      <Circle cx="18" cy="14" r="4" fill="#1847D6" />
    </Svg>
  );
}

// Ícono Google SVG
function GoogleIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

// Campo de input glassmorphism
function GlassInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  hasError,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        variant="caption"
        style={{
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 6,
          fontFamily: 'Sora_700Bold',
          fontSize: 11,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={autoCorrect ?? false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1.5,
          borderColor: hasError
            ? 'rgba(255,77,77,0.6)'
            : focused
            ? 'rgba(255,255,255,0.3)'
            : 'rgba(255,255,255,0.1)',
          borderRadius: 14,
          paddingVertical: 13,
          paddingHorizontal: 14,
          fontSize: 14,
          color: '#FFFFFF',
          fontFamily: 'Sora_500Medium',
        }}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Campo requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password.trim()) e.password = 'Campo requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setIsLoading(true);
    const err = await signIn(email.trim(), password);
    setIsLoading(false);
    if (err) {
      setErrors({ general: err });
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0A1628', '#0D1F3C', '#111827']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Orb decorativo top-right */}
      <View style={{
        position: 'absolute', top: -120, right: -80,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: '#1847D6', opacity: 0.15,
      }} />
      {/* Orb decorativo bottom-left */}
      <View style={{
        position: 'absolute', bottom: -100, left: -80,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: '#0EA5E9', opacity: 0.1,
      }} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + título */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#1847D6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 32,
            elevation: 12,
          }}>
            <LinearGradient
              colors={['#1847D6', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            >
              <LogoIcon />
            </LinearGradient>
          </View>
          <Text
            variant="h3"
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              fontFamily: 'Sora_800ExtraBold',
              letterSpacing: -0.5,
            }}
          >
            ParkSignal
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              fontFamily: 'Sora_500Medium',
              marginTop: 6,
            }}
          >
            {t('login_subtitle')}
          </Text>
        </View>

        {/* Form card glassmorphism */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 20,
          marginBottom: 20,
        }}>
          <GlassInput
            label={t('login_email')}
            value={email}
            onChangeText={v => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
            placeholder="vos@email.com"
            keyboardType="email-address"
            hasError={!!errors.email}
          />
          {errors.email && (
            <Text style={{ color: 'rgba(255,77,77,0.9)', fontSize: 11, fontFamily: 'Sora_600SemiBold', marginTop: -10, marginBottom: 10 }}>
              {errors.email}
            </Text>
          )}

          <GlassInput
            label={t('login_password')}
            value={password}
            onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
            placeholder="••••••••"
            secureTextEntry
            hasError={!!errors.password}
          />
          {errors.password && (
            <Text style={{ color: 'rgba(255,77,77,0.9)', fontSize: 11, fontFamily: 'Sora_600SemiBold', marginTop: -10, marginBottom: 10 }}>
              {errors.password}
            </Text>
          )}

          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginBottom: 20 }}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Sora_500Medium' }}>
              {t('login_forgot_link')}
            </Text>
          </TouchableOpacity>

          {errors.general && (
            <Text style={{ color: 'rgba(255,77,77,0.9)', fontSize: 12, fontFamily: 'Sora_600SemiBold', textAlign: 'center', marginBottom: 12 }}>
              {errors.general}
            </Text>
          )}

          {/* Botón principal */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: isLoading ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 6,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <Text style={{
              color: '#1847D6',
              fontSize: 14,
              fontFamily: 'Sora_800ExtraBold',
            }}>
              {isLoading ? 'Ingresando...' : t('login_button')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Sora_600SemiBold', marginHorizontal: 12 }}>
            O continuá con
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </View>

        {/* Botón Google */}
        <TouchableOpacity
          onPress={signInWithGoogle}
          activeOpacity={0.75}
          style={{
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            paddingVertical: 13,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <GoogleIcon />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Sora_700Bold' }}>
            Google
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Sora_500Medium' }}>
            ¿No tenés cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.75}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Sora_700Bold', textDecorationLine: 'underline' }}>
              Registrate
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
