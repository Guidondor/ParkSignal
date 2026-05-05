import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useTheme();
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const heroGradient: [string, string] = isDark
    ? ['#0F1A2E', '#0A0F1C']
    : ['#1847D6', '#2563EB'];

  async function handleSubmit() {
    if (!email.trim()) {
      setError(t('auth_forgot_error_field'));
      return;
    }
    setError('');
    setLoading(true);
    const err = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  }

  return (
    <LinearGradient colors={heroGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>

          {/* Card */}
          <View style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
          }}>
            <Text style={{
              color: '#FFF', fontSize: 22,
              fontFamily: 'Sora_700Bold', marginBottom: 8,
            }}>
              {t('auth_forgot_title')}
            </Text>

            {!sent ? (
              <>
                <Text style={{
                  color: 'rgba(255,255,255,0.65)', fontSize: 13,
                  fontFamily: 'Sora_400Regular', marginBottom: 24, lineHeight: 20,
                }}>
                  {t('auth_forgot_subtitle')}
                </Text>

                <Text style={{
                  color: 'rgba(255,255,255,0.8)', fontSize: 12,
                  fontFamily: 'Sora_600SemiBold', marginBottom: 6,
                }}>
                  {t('auth_forgot_email')}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? '#FF6B6B' : 'rgba(255,255,255,0.2)',
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    color: '#FFF',
                    fontFamily: 'Sora_400Regular',
                    fontSize: 14,
                    marginBottom: error ? 6 : 20,
                  }}
                />
                {!!error && (
                  <Text style={{
                    color: '#FF6B6B', fontSize: 12,
                    fontFamily: 'Sora_400Regular', marginBottom: 16,
                  }}>
                    {error}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: loading ? 0.7 : 1,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{
                    color: isDark ? '#0A0F1C' : '#1847D6',
                    fontSize: 15,
                    fontFamily: 'Sora_700Bold',
                  }}>
                    {loading ? '...' : t('auth_forgot_button')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{
                color: 'rgba(255,255,255,0.85)', fontSize: 14,
                fontFamily: 'Sora_400Regular', lineHeight: 22,
                marginBottom: 24,
              }}>
                {t('auth_forgot_sent')}
              </Text>
            )}

            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={{
                color: 'rgba(255,255,255,0.55)', fontSize: 13,
                fontFamily: 'Sora_500Medium', textAlign: 'center',
              }}>
                {t('auth_forgot_back')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
