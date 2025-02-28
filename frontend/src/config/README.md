# Configuration System

This directory contains configuration files for the application, including theme, providers, UI, types, and app settings.

## Directory Structure

- `index.ts` - Barrel file that re-exports all configuration components
- `config_types.ts` - TypeScript interfaces and types for the application
- `config_theme.ts` - Theme configuration including colors and fonts
- `config_providers.ts` - Provider configuration and icon mappings
- `config_ui.ts` - UI configuration including spacing, typography, and animations
- `config_app.ts` - Application configuration including network settings and validation
- `providers.json` - JSON configuration for available providers

## Type Definitions (`config_types.ts`)

This file contains TypeScript interfaces and types used throughout the application:

- Message and chat-related types (`ChatMessage`, `ChatState`)
- Theme interfaces (`Theme`, `BaseTheme`, `ThemeType`)
- Context interfaces (`ThemeContext`, `AppContext`)
- Provider-related types (`ProviderIdentifier`, `ModelProviderConfig`)
- UI component types (`BottomSheetStyles`, `IconProps`)

## Theme Configuration (`config_theme.ts`)

The theme configuration includes:

- `FONTS` - Font definitions and imports
- `COLORS` - Color palette definitions
- `FONT_STYLES` - Font style mappings
- `THEMES` - Theme definitions (light, dark, miami, vercel)
- Theme utility functions

### Adding a New Theme

To add a new theme:

1. Add new color definitions to the `COLORS` object if needed
2. Create a new theme object in the `THEMES` object
3. Add the theme to the `ThemeType` interface in `config_types.ts`

## UI Configuration (`config_ui.ts`)

The UI configuration includes:

- `SPACING` - Spacing constants (TINY, SMALL, MEDIUM, etc.)
- `TYPOGRAPHY` - Font size constants
- `BORDER_RADIUS` - Border radius constants
- `ANIMATION` - Animation duration and easing presets
- UI utility functions including bottom sheet styles

## App Configuration (`config_app.ts`)

The application configuration includes:

- `NETWORK` - Network timeouts, retry logic, and rate limits
- `VALIDATION` - Message and input validation rules
- `ERRORS` - Error message templates
- `CACHE` - Cache configuration
- `UI` - UI-related configuration
- Error and validation utility functions

## Provider Configuration

### Provider Implementation (`config_providers.ts`)

This file contains:

- Icon mapping for different provider types
- Helper functions for working with providers
- Provider configuration validation and processing

### Provider Data (`providers.json`)

The `providers.json` file has the following structure:

```json
{
  "providers": {
    "provider-id": {
      "displayName": "Provider Display Name",
      "providerIconKey": "icon-key"
    },
    // Additional providers...
  },
  "defaultProvider": "provider-id"
}
```

### Fields

- `providers`: An object containing provider configurations
  - Each key is the unique identifier for the provider
  - `displayName`: The human-readable name for the provider
  - `providerIconKey`: The key to use for icon mapping (must match an available icon in PROVIDER_ICON_MAPPING)
- `defaultProvider`: The ID of the default provider to use

### Adding a New Provider

To add a new provider:

1. Add a new entry to the `providers` object in `providers.json`
2. Ensure the provider has all required fields
3. If needed, add a new icon mapping in `config_providers.ts`

### Icon Mapping

Icons are mapped in the `PROVIDER_ICON_MAPPING` constant in `config_providers.ts`. To add a new icon:

1. Import the icon component
2. Add it to the `PROVIDER_ICON_MAPPING` object with the appropriate key

## Benefits of This Configuration System

- **Type-safe**: TypeScript interfaces ensure configuration validity
- **Centralized**: All configuration is managed in dedicated files
- **Extensible**: Easy to add new configuration options
- **Maintainable**: Clear separation of concerns
- **Environment-aware**: Uses environment variables where appropriate
- **Better structure and validation** than environment variables
- **Easier to read and modify**
- **Less error-prone**
- **Can be loaded dynamically at runtime**
- **Can be versioned and tracked in source control**