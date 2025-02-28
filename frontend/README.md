# rnapp0220

A React Native chat application that supports multiple AI providers.

## Getting Started

Load backend port 3050

## Provider Configuration System

This application uses a flexible, JSON-driven provider configuration system. Providers are defined in `src/config/providers.json` and dynamically loaded at runtime.

### How to Add a New Provider

To add a new provider to the application, follow these steps:

1. **Add Provider Configuration to JSON**

   Edit `src/config/providers.json` to add your new provider:

   ```json
   {
     "providers": {
       "your-provider-id": {
         "displayName": "Your Provider Name",
         "providerIconKey": "default"
       },
       // existing providers...
     }
   }
   ```

   For example, if you want to add a new provider Perplexity, you would add the following to `providers.json`:

   ```json
   {
     "providers": {
       "perplexity": {
         "displayName": "Perplexity",
         "providerIconKey": "perplexity"
       },
       // existing providers...
     }
   }
   ```

   Note: The key you use in the providers object (e.g., "your-provider-id") will be used as the provider's identifier throughout the application.

2. **Create a Custom Icon (Optional)**

   If you want a custom icon for your provider:

   a. Add the icon component to `src/components/Icons.tsx`:

   ```tsx
   export function YourProviderIcon({
     size = 24,
     theme,
     selected,
     ...props
   }: IconProps) {
     const fill = selected ? theme.tintTextColor : theme.textColor;
     return (
       <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
         {/* Your SVG paths here */}
         <Path d="..." fill={fill} />
       </Svg>
     );
   }
   ```

   b. Register the icon in the central icon mapping in `src/config/config_providers.ts`:

   ```typescript
   export const PROVIDER_ICON_MAPPING = {
     // existing mappings...
     'your-provider-key': YourProviderIcon,
   };
   ```

   c. Update your provider configuration to use this icon:

   ```json
   "your-provider-id": {
     "displayName": "Your Provider Name",
     "providerIconKey": "your-provider-key"
   }
   ```

3. **No Need to Update Type Definitions**

   The `ProviderIdentifier` type in `src/config/config_types.ts` is automatically generated from the keys in your providers.json file, so you don't need to manually update it when adding new providers.

4. **Provider-Specific Logic (Optional)**

   If your provider needs custom message formatting or other special handling, you can add provider-specific methods when registering the provider in `src/providers/index.ts`.

   Look for the provider registration code and add any custom methods:

   ```typescript
   const provider: Provider = {
     id: key as ProviderIdentifier,
     displayName: config.displayName,
     providerIconKey: providerIconKey,
     getIcon: (props) => React.createElement(providerIcon, { ...props }),
     // Add custom methods here
     prepareMessages: (messages) => {
       // Custom message formatting for your provider
       return messages;
     }
   };
   ```

### Notes

- If no custom icon is specified, the default provider icon will be used
- The provider system is designed to be extensible - you can add new provider-specific methods as needed
- All providers must have a unique key in the providers object
- The provider key in the JSON is used as the provider's ID throughout the application

## Todo

- Diagnose beginning of message truncated sometimes
