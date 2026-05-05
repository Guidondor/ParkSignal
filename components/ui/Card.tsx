import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ children, style, elevated = true, padded = true }: Props) {
  const { colors, radius, spacing, shadow } = useTheme();

  return (
    <View style={[{
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: padded ? spacing[4] : 0,
      overflow: 'hidden',
      ...(elevated ? {
        ...shadow.md,
        shadowColor: colors.shadow.color,
        shadowOpacity: colors.shadow.opacity,
      } : {}),
    }, style]}>
      {children}
    </View>
  );
}
