import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function Index() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingOverlay message="Cargando..." />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
