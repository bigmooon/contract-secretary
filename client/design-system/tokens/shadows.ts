/**
 * Shadow tokens for the design system
 * Platform-specific shadow definitions for iOS, Android, and Web
 */

import { Platform } from 'react-native';

/**
 * Shadow presets for different elevation levels
 * Each level provides platform-specific shadow configuration
 */
const shadowPresets = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
      shadowColor: '#000000',
    },
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    },
    default: {
      elevation: 2,
      shadowColor: '#000000',
    },
  }),

  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
      shadowColor: '#000000',
    },
    web: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    },
    default: {
      elevation: 4,
      shadowColor: '#000000',
    },
  }),

  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
      shadowColor: '#000000',
    },
    web: {
      boxShadow:
        '0px 8px 16px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.08)',
    },
    default: {
      elevation: 8,
      shadowColor: '#000000',
    },
  }),

  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 12,
      shadowColor: '#000000',
    },
    web: {
      boxShadow:
        '0px 16px 24px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(0, 0, 0, 0.08)',
    },
    default: {
      elevation: 12,
      shadowColor: '#000000',
    },
  }),
};

export const shadows = {
  none: undefined,
  sm: shadowPresets.sm,
  md: shadowPresets.md,
  lg: shadowPresets.lg,
  xl: shadowPresets.xl,

  // Semantic shadow names
  card: shadowPresets.lg,
  button: shadowPresets.sm,
  modal: shadowPresets.xl,
} as const;

export type ShadowSize = keyof typeof shadows;
