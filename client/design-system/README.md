# Design System

A comprehensive design system for the Contract Secretary app, providing consistent styling, theming, and components across all platforms (iOS, Android, Web).

## Overview

The design system is organized into three main categories:

1. **Tokens** - Foundational design values (colors, typography, spacing, shadows)
2. **Theme** - Configuration and hooks for applying tokens
3. **Components** - Themed UI components that use the design system

## Quick Start

Import everything you need from `@/design-system`:

```tsx
import {
  // Components
  Text,
  View,

  // Tokens
  colors,
  spacing,
  borderRadius,
  shadows,
  fontFamilies,
  textStyles,

  // Hooks
  useTheme,
  useColorScheme,
  useThemeColor,
} from '@/design-system';
```

## Design Tokens

### Colors (`tokens/colors.ts`)

Color palette and theme colors for light and dark modes.

```tsx
import { colors } from '@/design-system';

// Access palette
colors.palette.blue400

// Access theme colors
colors.light.primary
colors.dark.background

// Semantic colors
colors.light.error
colors.light.success
colors.light.warning
```

**Available theme colors:**
- `primary` - Brand color
- `background` - Screen background
- `card` - Card background
- `text` - Default text color
- `textPrimary` - Primary emphasis text
- `textSecondary` - Secondary/muted text
- `textInverse` - Inverse text (light on dark, dark on light)
- `error`, `success`, `warning`, `info` - Semantic colors
- `outline` - Border colors
- `overlay` - Overlay backgrounds

### Typography (`tokens/typography.ts`)

Font families, sizes, and text style presets.

```tsx
import { fontFamilies, textStyles, fontSizes } from '@/design-system';

// Font families
fontFamilies.regular    // Pretendard-Regular (400)
fontFamilies.medium     // Pretendard-Medium (500)
fontFamilies.semiBold   // Pretendard-SemiBold (600)
fontFamilies.bold       // Pretendard-Bold (700)

// Text style presets (includes font family, size, and line height)
textStyles.h1
textStyles.h2
textStyles.body
textStyles.caption
textStyles.label
```

**Text style variants:**
- Display: `displayLarge`, `displayMedium`
- Headings: `h1`, `h2`, `h3`, `h4`
- Body: `body`, `bodyLarge`, `bodySmall`, `bodySemiBold`, `bodyMedium`
- Special: `label`, `caption`, `link`

### Spacing (`tokens/spacing.ts`)

Spacing scale and border radius values based on 4px base unit.

```tsx
import { spacing, borderRadius } from '@/design-system';

// Spacing scale (4px base unit)
spacing[0]   // 0px
spacing[1]   // 4px
spacing[2]   // 8px
spacing[4]   // 16px
spacing[6]   // 24px

// Border radius
borderRadius.sm    // 4px
borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.full  // 9999px (fully rounded)
```

### Shadows (`tokens/shadows.ts`)

Platform-specific shadow definitions.

```tsx
import { shadows } from '@/design-system';

// Shadow sizes
shadows.sm
shadows.md
shadows.lg
shadows.xl

// Semantic shadows
shadows.card
shadows.button
shadows.modal
```

## Theme System

### Hooks

#### `useTheme()`

Get the current theme object with all tokens.

```tsx
import { useTheme } from '@/design-system';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={theme.textStyles.h1}>Title</Text>
    </View>
  );
}
```

#### `useColorScheme()`

Get the device color scheme ('light' or 'dark').

```tsx
import { useColorScheme } from '@/design-system';

function MyComponent() {
  const colorScheme = useColorScheme();
  // 'light' | 'dark' | null
}
```

#### `useThemeColor()`

Get a specific color from the theme with optional overrides.

```tsx
import { useThemeColor } from '@/design-system';

function MyComponent() {
  // Use theme color
  const backgroundColor = useThemeColor({}, 'background');

  // Override theme colors
  const customColor = useThemeColor(
    { light: '#fff', dark: '#000' },
    'card'
  );
}
```

## Components

### Text Component

Themed text component with typography variants.

```tsx
import { Text } from '@/design-system';

<Text variant="h1">Heading</Text>
<Text variant="body">Body text</Text>
<Text variant="caption">Small text</Text>

// Override colors
<Text
  variant="body"
  lightColor="#333"
  darkColor="#ccc"
>
  Custom colored text
</Text>

// Custom styles
<Text
  variant="h2"
  style={{ marginBottom: 16 }}
>
  Styled heading
</Text>
```

**Props:**
- `variant` - Typography variant (h1, h2, h3, h4, body, bodySemiBold, caption, label, link, etc.)
- `lightColor` - Override color for light mode
- `darkColor` - Override color for dark mode
- All standard React Native Text props

### View Component

Themed view component with automatic background colors.

```tsx
import { View } from '@/design-system';

<View>
  <Text>Content</Text>
</View>

// Override background colors
<View
  lightColor="#fff"
  darkColor="#000"
>
  <Text>Custom background</Text>
</View>

// With spacing and styling
<View style={{
  padding: spacing[4],
  borderRadius: borderRadius.lg,
}}>
  <Text>Padded content</Text>
</View>
```

**Props:**
- `lightColor` - Override background color for light mode
- `darkColor` - Override background color for dark mode
- All standard React Native View props

## Usage Examples

### Creating a Card

```tsx
import {
  View,
  Text,
  spacing,
  borderRadius,
  shadows,
  useTheme,
} from '@/design-system';

function Card() {
  const theme = useTheme();

  return (
    <View
      style={[
        shadows.card,
        {
          padding: spacing[4],
          borderRadius: borderRadius.lg,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <Text variant="h3">Card Title</Text>
      <Text variant="body">Card content goes here</Text>
    </View>
  );
}
```

### Creating a Button

```tsx
import {
  Text,
  spacing,
  borderRadius,
  useTheme,
} from '@/design-system';
import { TouchableOpacity } from 'react-native';

function Button({ title, onPress }) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.primary,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
        borderRadius: borderRadius.md,
      }}
    >
      <Text
        variant="bodySemiBold"
        style={{ color: theme.colors.textInverse }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

### Using Theme-Aware Styles

```tsx
import { useTheme, spacing, borderRadius } from '@/design-system';
import { StyleSheet } from 'react-native';

function MyComponent() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: spacing[4],
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text variant="body">Content</Text>
      </View>
    </View>
  );
}
```

## Best Practices

1. **Use design tokens instead of hardcoded values**
   ```tsx
   // ❌ Don't
   <View style={{ padding: 16, borderRadius: 8 }} />

   // ✅ Do
   <View style={{
     padding: spacing[4],
     borderRadius: borderRadius.md
   }} />
   ```

2. **Use text variants instead of manual styling**
   ```tsx
   // ❌ Don't
   <Text style={{
     fontSize: 32,
     fontFamily: 'Pretendard-Bold',
     lineHeight: 32
   }} />

   // ✅ Do
   <Text variant="h1" />
   ```

3. **Use semantic color names**
   ```tsx
   // ❌ Don't
   <View style={{ backgroundColor: colors.light.red }} />

   // ✅ Do
   <View style={{ backgroundColor: theme.colors.error }} />
   ```

4. **Leverage the theme hook for dynamic styling**
   ```tsx
   // ✅ Good
   const theme = useTheme();
   <View style={{ backgroundColor: theme.colors.card }} />
   ```

## File Structure

```
design-system/
├── tokens/
│   ├── colors.ts           # Color palette and themes
│   ├── typography.ts       # Font families and text styles
│   ├── spacing.ts          # Spacing scale and border radius
│   ├── shadows.ts          # Platform-specific shadows
│   └── index.ts            # Token exports
├── theme/
│   ├── theme.ts            # Theme configuration
│   ├── use-theme.ts        # Theme hooks
│   └── index.ts            # Theme exports
├── components/
│   ├── text.tsx            # Themed text component
│   ├── view.tsx            # Themed view component
│   └── index.ts            # Component exports
├── index.ts                # Main design system export
└── README.md               # This file
```

## Migration Guide

If you're updating from the old theme system:

### Old Import
```tsx
import { Colors, Fonts } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
```

### New Import
```tsx
import {
  colors,
  fontFamilies,
  Text,
  View,
  useThemeColor,
} from '@/design-system';
```

### Component Changes
```tsx
// Old
<ThemedText type="title">Title</ThemedText>
<ThemedText type="defaultSemiBold">Bold text</ThemedText>
<ThemedText type="subtitle">Subtitle</ThemedText>

// New
<Text variant="h1">Title</Text>
<Text variant="bodySemiBold">Bold text</Text>
<Text variant="h3">Subtitle</Text>
```

### Color Access
```tsx
// Old
Colors.light.background
Colors[colorScheme ?? 'light'].tint

// New
colors.light.background
colors[colorScheme ?? 'light'].tabIconSelected
// or
const theme = useTheme();
theme.colors.background
```
