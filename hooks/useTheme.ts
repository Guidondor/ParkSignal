import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, typography, spacing, radius, shadow } from '@/constants/tokens';
import { useThemeStore } from '@/store/themeStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { mode, toggle } = useThemeStore();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkTheme : lightTheme;

  return {
    colors,
    typography,
    spacing,
    radius,
    shadow,
    isDark,
    toggleTheme: () => toggle(systemScheme),
  };
}
