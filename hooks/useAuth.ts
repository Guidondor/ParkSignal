import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { UserProfile } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';

export function useAuth() {
  const { session, profile, isLoading, setSession, setProfile, setIsLoading, reset } =
    useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      return null;
    } catch {
      return t('auth_error_unexpected');
    }
  }

  async function signUp(
    email: string,
    password: string,
    username: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      if (!data.user) return 'No se pudo crear el usuario';

      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        username,
      });

      if (profileError) {
        await supabase.auth.signOut();
        return profileError.message;
      }
      return null;
    } catch {
      return t('auth_error_unexpected');
    }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function deleteAccount(): Promise<void> {
    const { error } = await supabase.rpc('delete_user_account');
    if (error) throw error;
    await supabase.auth.signOut();
  }

  async function signInWithGoogle(): Promise<string | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const WebBrowser = require('expo-web-browser') as typeof import('expo-web-browser');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AuthSession = require('expo-auth-session') as typeof import('expo-auth-session');
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'parksignal' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error || !data.url) return error?.message ?? 'Error al iniciar con Google';
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'success' && result.url) {
        await supabase.auth.exchangeCodeForSession(result.url);
      }
      return null;
    } catch {
      return t('auth_error_unexpected');
    }
  }

  async function resetPassword(email: string): Promise<string | null> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'parksignal://reset-password',
      });
      if (error) return error.message;
      return null;
    } catch {
      return t('auth_error_unexpected');
    }
  }

  return { session, profile, isLoading, signIn, signUp, signOut, deleteAccount, resetPassword, signInWithGoogle };
}
