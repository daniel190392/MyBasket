export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
    '7xl': 44,
    '8xl': 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const;

export type FontSize = keyof typeof typography.sizes;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
