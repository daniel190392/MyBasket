export const palette = {
  primary500: '#FF6B00',
  primary600: '#D95A00',
  peach100: '#FFDAB9',
  secondary500: '#10B981',
  secondary600: '#059669',
  neutral900: '#333333',
  neutral100: '#F5F5F5',
  white: '#FFFFFF',
  red500: '#EF4444',
  black: '#000000',
} as const;

export const colors = {
  primary: palette.primary500,
  primaryPressed: palette.primary600,
  softHighlight: palette.peach100,
  secondary: palette.secondary500,
  secondaryPressed: palette.secondary600,
  background: palette.white,
  surface: palette.neutral100,
  textPrimary: palette.neutral900,
  error: palette.red500,
  white: palette.white,
  shadow: palette.black,
} as const;
