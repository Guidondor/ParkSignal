import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  weight?: Weight;
  color?: string;
  secondary?: boolean;
  disabled?: boolean;
  center?: boolean;
  style?: TextStyle;
}

// Mapa de peso numérico → fontFamily Sora
function soraFamily(weight: string): string {
  switch (weight) {
    case '800': return 'Sora_800ExtraBold';
    case '700': return 'Sora_700Bold';
    case '600': return 'Sora_600SemiBold';
    case '500': return 'Sora_500Medium';
    default:    return 'Sora_400Regular';
  }
}

export function Text({
  children, variant = 'body', weight, color,
  secondary, disabled, center, style,
}: Props) {
  const { colors, typography } = useTheme();

  // Variante → fontSize + peso base
  const variantDef: Record<Variant, { size: number; w: string }> = {
    h1:        { size: 36, w: '800' },
    h2:        { size: 30, w: '800' },
    h3:        { size: 22, w: '800' },
    body:      { size: 15, w: '500' },
    bodySmall: { size: 13, w: '500' },
    caption:   { size: 11, w: '700' },
    label:     { size: 12, w: '700' },
  };

  const weightMap: Record<Weight, string> = {
    regular:   '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
  };

  const { size, w: baseWeight } = variantDef[variant];
  const resolvedWeight = weight ? weightMap[weight] : baseWeight;
  const fontFamily = soraFamily(resolvedWeight);

  const resolvedColor = color
    ?? (disabled ? colors.textDisabled : secondary ? colors.textSecondary : colors.textPrimary);

  const variantStyle: TextStyle = {
    fontSize: size,
    fontFamily,
    fontWeight: resolvedWeight as TextStyle['fontWeight'],
    lineHeight: size * 1.35,
  };

  return (
    <RNText style={[
      variantStyle,
      { color: resolvedColor },
      center ? { textAlign: 'center' } : undefined,
      style,
    ]}>
      {children}
    </RNText>
  );
}
