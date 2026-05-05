import React, { useState } from 'react';
import { TextInput, View, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: spacing[1] }, containerStyle]}>
      {label && <Text variant="label" secondary>{label}</Text>}
      <TextInput
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={[{
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: error ? colors.error : focused ? colors.brand : colors.border,
          borderRadius: radius.md,
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          fontSize: typography.fontSize.base,
          color: colors.textPrimary,
        }, props.style]}
        placeholderTextColor={colors.textDisabled}
      />
      {error && <Text variant="caption" color={colors.error}>{error}</Text>}
    </View>
  );
}
