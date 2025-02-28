# Provider Architecture

This directory contains the provider architecture for the application. The goal of this architecture is to create a maintainable and extensible way to manage AI providers in the application.

## Structure

- `types.ts`: Contains the core interfaces for providers
- `registry.ts`: Implements the provider registry pattern
- `hooks.ts`: Provides React hooks for accessing providers in components
- `index.ts`: Exports everything and handles provider registration from JSON configuration

## Provider Configuration

Providers are configured via the JSON configuration in `src/config/providers.json`. This approach allows for:

1. Easy addition of new providers without code changes
2. Single source of truth for provider configuration
3. Dynamic loading of providers at runtime

The configuration follows this structure:

```json
{
  "providers": {
    "provider-key": {
      "displayName": "Provider Display Name",
      "providerIconKey": "icon-key"
    }
  },
  "defaultProvider": "default-provider-key"
}
```

Note that the key used in the providers object (e.g., "provider-key") serves as the provider's identifier throughout the application.

## Adding a New Provider

To add a new provider, follow these steps:

1. Add the provider to `src/config/providers.json`:

```json
{
  "providers": {
    "new-provider": {
      "displayName": "New Provider",
      "providerIconKey": "default"
    },
    // existing providers...
  }
}
```

2. (Optional) Create a new icon component in `src/components/Icons.tsx` and register it in the `PROVIDER_ICON_MAPPING` in `src/config/config_providers.ts`

3. (Optional) Add provider-specific logic by modifying the provider registration in `src/providers/index.ts`

## Provider Hooks

The `hooks.ts` file provides React hooks for accessing providers:

- `useProviders()`: Returns a list of all available providers in the format expected by UI components
  - Automatically updates when providers are added or removed
  - Transforms provider data to the `ModelProviderConfig` format

## Type Safety

The provider system uses TypeScript to ensure type safety:

- The `ProviderIdentifier` type is automatically generated from the keys in the providers.json file
- This ensures that all references to provider IDs throughout the codebase are type-checked

## Backward Compatibility

The architecture maintains backward compatibility with the existing codebase by:

1. Creating a `MODELPROVIDERS` object that matches the original format
2. Exporting `DEFAULT_PROVIDER` in the same format

This allows the rest of the application to continue working without changes while benefiting from the improved architecture.