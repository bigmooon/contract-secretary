/**
 * Color palette for the design system (light-only)
 */

// Base color palette
const palette = {
  // Grays
  gray100: '#EEF1F4',
  gray400: '#7C8794',
  gray500: '#6A7282',
  gray700: '#2C3E50',
  gray950: '#1C1C1A',

  // Brand colors
  blue600: '#3b82f5',

  // Semantic colors
  redLight: '#CA3500',
  orangeLight: '#f55200',
  yellowLight: '#f09400',
  greenLight: '#21c45d',
  purpleLight: '#a854f7',

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  palette,

  light: {
    // Primary brand color
    primary: palette.gray700,

    // Backgrounds
    background: palette.gray100,
    card: palette.white,
    overlay: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // Borders & Dividers
    outline: 'rgba(229, 231, 235, 0.8)',
    divider: 'rgba(0, 0, 0, 0.08)',

    // Text colors
    text: palette.gray700,
    textPrimary: palette.gray950,
    textSecondary: palette.gray500,
    textTertiary: palette.gray400,
    textInverse: palette.white,
    placeholder: palette.gray400,

    // Navigation
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.gray700,
    tabSelectedBackground: `${palette.gray700}1A`, // 10% opacity

    // Semantic colors
    success: palette.greenLight,
    warning: palette.yellowLight,
    error: palette.redLight,
    info: palette.blue600,

    // Additional colors
    red: palette.redLight,
    orange: palette.orangeLight,
    yellow: palette.yellowLight,
    green: palette.greenLight,
    blue: palette.blue600,
    purple: palette.purpleLight,
  },
} as const;

export type ColorScheme = 'light';
export type ThemeColors = typeof colors.light;
export type ColorName = keyof ThemeColors;
