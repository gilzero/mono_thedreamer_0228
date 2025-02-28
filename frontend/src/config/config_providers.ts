// src/config/config_providers.ts
import { ModelProviderConfig, ProviderEnvConfig, ProviderIdentifier } from './config_types';
import { OpenAIIcon, AnthropicIcon, GeminiIcon, DefaultProviderIcon } from '../components/Icons';
import rawProvidersConfig from './providers.json';

// Define the expected shape of our JSON config
interface ProvidersJsonConfig {
  providers: Record<string, {
    displayName: string;
    providerIconKey?: string;
  }>;
  defaultProvider: string;
}

// Type assertion for the imported JSON
const providersConfig = rawProvidersConfig as ProvidersJsonConfig;

/* ---------- Providers ---------- */

// Icon mapping for different provider types
export const PROVIDER_ICON_MAPPING = {
  'openai': OpenAIIcon,
  'anthropic': AnthropicIcon,
  'gemini': GeminiIcon,
  'default': DefaultProviderIcon
} as const;

// Helper function to get an icon component by key
export const getProviderIcon = (iconKey?: string) => {
  if (!iconKey) return PROVIDER_ICON_MAPPING['default'];
  return PROVIDER_ICON_MAPPING[iconKey as keyof typeof PROVIDER_ICON_MAPPING] || PROVIDER_ICON_MAPPING['default'];
};

// Get providers from the JSON configuration file
const providers: Record<string, ProviderEnvConfig> = (() => {
  try {
    // Validate the configuration
    Object.entries(providersConfig.providers).forEach(([key, config]) => {
      if (!config.displayName) {
        throw new Error(`Provider config for '${key}' is missing required field: displayName`);
      }
    });

    // Convert the JSON data to our expected type with proper type assertions
    return Object.entries(providersConfig.providers).reduce((acc, [key, config]) => {
      acc[key] = {
        id: key as ProviderIdentifier,
        displayName: config.displayName,
        providerIconKey: config.providerIconKey ?? 'default'
      };
      return acc;
    }, {} as Record<string, ProviderEnvConfig>);
  } catch (error) {
    console.error('Error loading provider configuration:', error);
    return {};
  }
})();

// Default provider from configuration
export const DEFAULT_PROVIDER = providersConfig.defaultProvider || 'gpt';

// Convert providers to ModelProviderConfig format
export const MODELPROVIDERS = Object.freeze(Object.entries(providers).reduce((acc, [key, config]) => {
  acc[key as ProviderIdentifier] = {
    label: key as ProviderIdentifier,
    displayName: config.displayName,
    icon: getProviderIcon(config.providerIconKey)
  };
  return acc;
}, {} as Record<ProviderIdentifier, ModelProviderConfig>));

// These can still be configured via environment variables if needed
export const MODEL_PARAMS = {
  TEMPERATURE: parseFloat(process.env['EXPO_PUBLIC_TEMPERATURE'] || '0.7'),
  MAX_TOKENS: parseInt(process.env['EXPO_PUBLIC_MAX_TOKENS'] || '4000', 10)
};

export const SETTINGS_CONFIG = {
  MODEL_PARAMS: {
    TEMPERATURE: {
      DEFAULT: MODEL_PARAMS.TEMPERATURE,
      MIN: 0,
      MAX: 1,
      STEP: 0.01
    },
    MAX_TOKENS: {
      DEFAULT: MODEL_PARAMS.MAX_TOKENS,
      MIN: 100,
      MAX: 8192,
      STEP: 100
    }
  },
  STORAGE_KEYS: {
    THEME: 'theme',
    CHAT_TYPE: 'chatType'
  }
} as const;