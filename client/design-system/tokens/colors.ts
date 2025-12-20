/**
 * Color palette for the design system
 * Defines all color values used across light and dark themes
 */

// Base color palette
const palette = {
  // Grays
  gray50: '#F5F7FA',
  gray100: '#EEF1F4',
  gray200: '#E5E7EB',
  gray300: '#9BA7B4',
  gray400: '#7C8794',
  gray500: '#6A7282',
  gray700: '#2C3E50',
  gray800: '#263541',
  gray900: '#1E2A33',
  gray950: '#1C1C1A',

  // Brand colors
  blue400: '#6BA3FF',
  blue500: '#4D8BFF',
  blue600: '#0040F0',

  // Semantic colors - Light
  redLight: '#CA3500',
  orangeLight: '#FF6900',
  yellowLight: '#F0B100',
  greenLight: '#40F000',

  // Semantic colors - Dark
  redDark: '#FF613A',
  orangeDark: '#FF8A3D',
  yellowDark: '#F5C843',
  greenDark: '#75FF62',
  purpleDark: '#C58AFF',

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

    // Borders
    outline: 'rgba(229, 231, 235, 0.8)',

    // Text colors
    text: palette.gray700,
    textPrimary: palette.gray950,
    textSecondary: palette.gray500,
    textInverse: palette.white,

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
    purple: '#B000F0',
  },

  dark: {
    // Primary brand color
    primary: palette.blue400,

    // Backgrounds
    background: palette.gray900,
    card: palette.gray800,
    overlay: 'rgba(255, 255, 255, 0.08)',

    // Borders
    outline: 'rgba(229, 231, 235, 0.2)',

    // Text colors
    text: '#E6ECF2',
    textPrimary: palette.gray50,
    textSecondary: palette.gray300,
    textInverse: palette.gray900,

    // Navigation
    tabIconDefault: palette.gray400,
    tabIconSelected: palette.blue400,
    tabSelectedBackground: 'rgba(107, 163, 255, 0.15)',

    // Semantic colors
    success: palette.greenDark,
    warning: palette.yellowDark,
    error: palette.redDark,
    info: palette.blue500,

    // Additional colors
    red: palette.redDark,
    orange: palette.orangeDark,
    yellow: palette.yellowDark,
    green: palette.greenDark,
    blue: palette.blue500,
    purple: palette.purpleDark,
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof colors.light;
export type ColorName = keyof ThemeColors;
