// constants/tokens.ts

export const palette = {
  white:        '#FFFFFF',
  black:        '#000000',
  // Brand nuevo
  brand:        '#1847D6',
  brandLight:   '#EEF2FF',
  accent:       '#0EA5E9',
  // Semanticos
  success:      '#10B981',
  warning:      '#F59E0B',
  error:        '#EF4444',
  // Grises UI
  gray50:       '#F8F9FA',
  gray100:      '#F1F3F5',
  gray200:      '#E5E7EB',
  gray400:      '#9CA3AF',
  gray500:      '#6B7280',
  gray600:      '#4B5563',
  gray900:      '#111827',
  // Paleta vieja para retrocompat (SpotMarker, etc.)
  brand500:     '#1847D6',
  brand600:     '#1847D6',
  brand400:     '#4F8EFF',
  accent500:    '#0EA5E9',
};

export const lightTheme = {
  background:       '#F0F4FF',
  surface:          '#FFFFFF',
  surface2:         '#F5F7FF',
  border:           '#E5E7EB',
  textPrimary:      '#111827',
  textSecondary:    '#6B7280',
  textDisabled:     '#9CA3AF',
  textOnBrand:      '#FFFFFF',
  brand:            '#1847D6',
  brandLight:       '#EEF2FF',
  accent:           '#0EA5E9',
  success:          '#10B981',
  warning:          '#F59E0B',
  error:            '#EF4444',
  tabBg:            '#FFFFFF',
  tabBorder:        '#E5E7EB',
  shadow: { color: '#000000', opacity: 0.25 },
  // aliases para compatibilidad con componentes existentes
  surfaceRaised:    '#FFFFFF',
  borderStrong:     '#D1D5DB',
};

export const darkTheme = {
  background:       '#080C14',
  surface:          '#0F1623',
  surface2:         '#16202F',
  border:           'rgba(255,255,255,0.08)',
  textPrimary:      '#EDF2FF',
  textSecondary:    '#7A8FA6',
  textDisabled:     '#3A4A5C',
  textOnBrand:      '#FFFFFF',
  brand:            '#4F8EFF',
  brandLight:       'rgba(79,142,255,0.12)',
  accent:           '#00E5A0',
  success:          '#00E5A0',
  warning:          '#FFB224',
  error:            '#FF4D4D',
  tabBg:            '#0F1623',
  tabBorder:        'rgba(255,255,255,0.06)',
  shadow: { color: '#000000', opacity: 0.4 },
  // aliases
  surfaceRaised:    '#16202F',
  borderStrong:     'rgba(255,255,255,0.12)',
};

export const typography = {
  fontFamily: {
    regular: 'Sora_400Regular',
    medium:  'Sora_500Medium',
    semibold:'Sora_600SemiBold',
    bold:    'Sora_700Bold',
    extrabold:'Sora_800ExtraBold',
    mono:    'monospace',
  },
  fontSize: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   22,
    '2xl': 30,
    '3xl': 36,
  },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
  },
};

export const spacing = {
  '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64,
};

export const radius = { sm: 6, md: 10, lg: 16, xl: 24, full: 9999 };

export const shadow = {
  sm: { shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,  elevation: 2 },
  md: { shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 5 },
  lg: { shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 10 },
};
