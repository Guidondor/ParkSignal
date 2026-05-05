import React from 'react';
import { TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, style,
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const sizeMap = {
    sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], fontSize: typography.fontSize.sm },
    md: { paddingVertical: spacing[3], paddingHorizontal: spacing[6], fontSize: typography.fontSize.base },
    lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[8], fontSize: typography.fontSize.md },
  };

  const variantStyles: Record<Variant, { bg: string; border?: string; textColor: string }> = {
    primary:   { bg: colors.brand,      textColor: colors.textOnBrand },
    secondary: { bg: colors.brandLight, textColor: colors.brand },
    outline:   { bg: 'transparent', border: colors.brand, textColor: colors.brand },
    ghost:     { bg: 'transparent',     textColor: colors.brand },
    danger:    { bg: colors.error,      textColor: '#FFFFFF' },
  };

  const vs = variantStyles[variant];
  const ss = sizeMap[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[{
        backgroundColor: vs.bg,
        borderRadius: radius.md,
        borderWidth: vs.border ? 1.5 : 0,
        borderColor: vs.border,
        paddingVertical: ss.paddingVertical,
        paddingHorizontal: ss.paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : 1,
        flexDirection: 'row',
        gap: spacing[2],
      }, fullWidth ? { width: '100%' } : undefined, style]}
    >
      {loading && <ActivityIndicator size="small" color={vs.textColor} />}
      <Text variant="label" color={vs.textColor} weight="bold" style={{ fontSize: ss.fontSize }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
