import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';

const PRIVACY_URL = 'https://guidondor.github.io/ParkSignal/privacy.html';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

function GlassInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  hint,
  hasError,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  hint?: string;
  hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
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
        autoCorrect={false}
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
      {hint && (
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Sora_500Medium', marginTop: 4 }}>
          {hint}
        </Text>
      )}
    </View>
  );
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleUsernameChange(raw: string) {
    // Solo lowercase, números y guión bajo
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
  }

  function validateStep1(): boolean {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  }

  function handleNextStep() {
    setError(null);
    if (!validateStep1()) return;
    setStep(2);
  }

  async function handleRegister() {
    setError(null);
    if (!username.trim() || username.length < 3) {
      setError('El usuario debe tener mínimo 3 caracteres');
      return;
    }
    setIsLoading(true);
    const err = await signUp(email.trim(), password, username.trim());
    setIsLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace('/(tabs)');
    }
  }

  const avatarLetter = username.trim() ? username[0].toUpperCase() : '?';

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
      {/* Orbs */}
      <View style={{ position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: '#1847D6', opacity: 0.15 }} />
      <View style={{ position: 'absolute', bottom: -100, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: '#0EA5E9', opacity: 0.1 }} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button + step indicator */}
        <View style={{ marginBottom: 32 }}>
          {step === 2 && (
            <TouchableOpacity
              onPress={() => { setStep(1); setError(null); }}
              activeOpacity={0.75}
              style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Sora_600SemiBold' }}>‹</Text>
            </TouchableOpacity>
          )}
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontFamily: 'Sora_800ExtraBold', letterSpacing: -0.5 }}>
            {step === 1 ? 'Crear cuenta' : 'Tu usuario'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Sora_500Medium', marginTop: 4, marginBottom: 16 }}>
            Paso {step} de 2
          </Text>
          {/* Progress bar */}
          <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <View style={{
              height: 3,
              borderRadius: 2,
              backgroundColor: '#FFFFFF',
              width: step === 1 ? '50%' : '100%',
            }} />
          </View>
        </View>

        {/* Form card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 20,
          marginBottom: 20,
        }}>
          {step === 1 ? (
            <>
              <GlassInput
                label="Email"
                value={email}
                onChangeText={v => { setEmail(v); setError(null); }}
                placeholder="vos@email.com"
                keyboardType="email-address"
              />
              <GlassInput
                label="Contraseña"
                value={password}
                onChangeText={v => { setPassword(v); setError(null); }}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
              />
              <GlassInput
                label="Repetir contraseña"
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); setError(null); }}
                placeholder="••••••••"
                secureTextEntry
              />
            </>
          ) : (
            <>
              {/* Avatar preview */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <LinearGradient
                  colors={['#1847D6', '#0EA5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'Sora_800ExtraBold' }}>
                    {avatarLetter}
                  </Text>
                </LinearGradient>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Sora_700Bold' }}>
                    @{username || 'tunombre'}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Sora_500Medium' }}>
                    Nuevo miembro
                  </Text>
                </View>
              </View>

              <GlassInput
                label="Nombre de usuario"
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="solo letras, números y _"
                hint="Solo minúsculas, números y guión bajo"
              />
            </>
          )}

          {error && (
            <Text style={{ color: 'rgba(255,77,77,0.9)', fontSize: 12, fontFamily: 'Sora_600SemiBold', textAlign: 'center', marginBottom: 12 }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={step === 1 ? handleNextStep : handleRegister}
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
            <Text style={{ color: '#1847D6', fontSize: 14, fontFamily: 'Sora_800ExtraBold' }}>
              {isLoading ? 'Creando cuenta...' : step === 1 ? 'Continuar →' : '¡Empezar!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer volver a login */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Sora_500Medium' }}>
            ¿Ya tenés cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Sora_700Bold', textDecorationLine: 'underline' }}>
              Iniciá sesión
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.75} style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Sora_400Regular', textDecorationLine: 'underline' }}>
            Política de Privacidad
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
