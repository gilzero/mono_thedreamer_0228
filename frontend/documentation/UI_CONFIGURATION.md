# UI Configuration System

The RNDreamer Chat application uses a centralized UI configuration system to maintain consistent styling across all components. This document outlines the key concepts and usage patterns.

## Core Principles

1. **Single Source of Truth**: All UI-related constants are defined in `config.ts`
2. **8-Point Grid System**: Spacing follows an 8-point grid for harmonious layouts
3. **Type-Safe**: All configurations are TypeScript-enabled
4. **Maintainable**: Easy to modify app-wide styling from a single location

## Configuration Categories

### 1. Spacing

Uses an 8-point grid system for consistent spacing:

```typescript
APP_CONFIG.UI.SPACING.{SIZE}

// Available sizes:
TINY: 4px    // Half-step
SMALL: 8px    // Base unit
MEDIUM: 12px  // 1.5x
LARGE: 16px   // 2x
XLARGE: 24px  // 3x
XXLARGE: 32px // 4x
```

### 2. Typography

Standardized font sizes for text hierarchy:

```typescript
APP_CONFIG.UI.TYPOGRAPHY.{SIZE}

// Available sizes:
SMALL: 13px   // Captions, helper text
BODY: 15px    // Default body text
MEDIUM: 16px  // Emphasized body
LARGE: 18px   // Subtitles
XLARGE: 20px  // Small headers
TITLE: 24px   // Main headers
```

### 3. Border Radius

Consistent rounding for UI elements:

```typescript
APP_CONFIG.UI.BORDER_RADIUS.{SIZE}

// Available sizes:
SMALL: 4px    // Subtle rounding
MEDIUM: 8px   // Default rounding
LARGE: 12px   // Emphasized rounding
PILL: 24px    // Pill-shaped elements
```

### 4. Animations

Standardized animation values for consistent motion:

```typescript
APP_CONFIG.UI.ANIMATION.{CATEGORY}.{VALUE}

// Durations:
DURATION.FAST: 100ms      // Micro-interactions
DURATION.MEDIUM: 200ms    // Standard transitions
DURATION.SLOW: 300ms      // Emphasized transitions
DURATION.VERY_SLOW: 400ms // Major transitions

// Delays:
DELAY.DEFAULT: 100ms      // Standard delay
DELAY.LONG: 200ms        // Emphasized delay

// Easing:
EASING.DEFAULT           // Basic easing
EASING.IN_OUT           // Smooth acceleration/deceleration
EASING.BOUNCE           // Playful bouncy effect
```

### 5. Component Sizes

Standard sizes for UI components:

```typescript
APP_CONFIG.UI.SIZES.{COMPONENT}.{SIZE}

// Icons:
ICON.SMALL: 16px   // Inline icons
ICON.MEDIUM: 20px  // Default icons
ICON.LARGE: 24px   // Emphasized icons

// Typing Indicator:
TYPING_INDICATOR.WIDTH
TYPING_INDICATOR.HEIGHT
TYPING_INDICATOR.DOT_SIZE
```

### 6. Input Styling

Standard styling for input elements:

```typescript
APP_CONFIG.UI.INPUT.{PROPERTY}

// Available properties:
BORDER_RADIUS: 24px
PADDING.VERTICAL: 5px
PADDING.HORIZONTAL: 12px
HEIGHT: 44px
```

## Usage Examples

### 1. Component Styling

```typescript
const styles = StyleSheet.create({
  container: {
    padding: APP_CONFIG.UI.SPACING.MEDIUM,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.LARGE,
  },
  text: {
    fontSize: APP_CONFIG.UI.TYPOGRAPHY.BODY,
    marginBottom: APP_CONFIG.UI.SPACING.SMALL,
  }
});
```

### 2. Animations

```typescript
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
  easing: APP_CONFIG.UI.ANIMATION.EASING.IN_OUT,
  delay: APP_CONFIG.UI.ANIMATION.DELAY.DEFAULT,
  useNativeDriver: true,
}).start();
```

### 3. Icons

```typescript
<Ionicons
  name="arrow-up"
  size={APP_CONFIG.UI.SIZES.ICON.MEDIUM}
  color={theme.tintColor}
/>
```

## Best Practices

1. **Always Use Constants**: Never hardcode values that exist in the configuration
2. **Maintain Grid System**: Stick to the 8-point grid for spacing
3. **Consistent Animation**: Use predefined durations and easing functions
4. **Theme Integration**: Combine with theme system for colors
5. **Documentation**: Document any new additions to the configuration system

## Contributing

When adding new UI constants:

1. Add them to the appropriate section in `config.ts`
2. Add TypeScript types if needed
3. Update this documentation
4. Use consistent naming conventions
5. Follow the existing patterns for values
