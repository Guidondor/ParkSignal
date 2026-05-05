import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function Divider({ vertical = false }: { vertical?: boolean }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={vertical
      ? { width: 1, backgroundColor: colors.border, marginHorizontal: spacing[3] }
      : { height: 1, backgroundColor: colors.border, marginVertical: spacing[3] }
    } />
  );
}
