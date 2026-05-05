import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      gap: spacing[4],
    }}>
      <ActivityIndicator size="large" color={colors.brand} />
      {message && <Text variant="body" secondary center>{message}</Text>}
    </View>
  );
}
