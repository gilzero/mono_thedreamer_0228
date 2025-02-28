// src/providers/index.ts 
import { providerRegistry } from './registry';
import React from 'react';
import { Provider, ProviderIdentifier } from './types';
import { getProviderIcon } from '../config/config_providers';
import rawProvidersConfig from '../config/providers.json';
import { logInfo, logWarn } from '../utils';

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

// Load providers from JSON configuration
try {
  if (providersConfig && providersConfig.providers) {
    // Register providers from configuration
    Object.entries(providersConfig.providers).forEach(([key, config]) => {
      if (!config.displayName) {
        logWarn(`Provider config for '${key}' is missing required field: displayName`);
        return;
      }
      
      const providerIconKey = config.providerIconKey || 'default';
      const providerIcon = getProviderIcon(providerIconKey);
      
      const provider: Provider = {
        id: key as ProviderIdentifier,
        displayName: config.displayName,
        providerIconKey: providerIconKey,
        getIcon: (props) => React.createElement(providerIcon, { ...props })
      };
      
      providerRegistry.register(provider);
      logInfo(`Registered provider: ${key} with icon: ${providerIconKey}`);
    });
  }
} catch (e) {
  const error = e as Error;
  logWarn(
    `Error loading provider configuration: ${error.message}`
  );
}

// Set the default provider from configuration
if (providersConfig.defaultProvider) {
  const defaultId = providersConfig.defaultProvider;
  if (providerRegistry.getProvider(defaultId)) {
    providerRegistry.setDefaultProvider(defaultId);
    logInfo(`Set default provider to: ${defaultId}`);
  } else {
    logWarn(`Default provider '${defaultId}' not found in registry`);
  }
}

// Export helper functions
export const providers = Object.freeze(
  Object.values(providerRegistry.getAllProviders()).reduce((acc, provider) => {
    acc[provider.id] = {
      id: provider.id,
      displayName: provider.displayName,
      icon: (props: any) => provider.getIcon(props)
    };
    return acc;
  }, {} as Record<ProviderIdentifier, any>)
);

// Helper function to register a new provider at runtime
export function registerProvider(provider: Provider): void {
  providerRegistry.register(provider);
}

// Export everything
export * from './types';
export * from './registry';
export * from './hooks';

// Create a MODELPROVIDERS object that matches the original format
// This is a dynamic getter that will always return the latest providers
export const MODELPROVIDERS = Object.freeze(
  providerRegistry.getAllProviders().reduce((acc, provider) => {
    acc[provider.id] = {
      label: provider.id,
      displayName: provider.displayName,
      icon: provider.getIcon
    };
    return acc;
  }, {} as Record<ProviderIdentifier, any>)
);

// Get the default provider from the registry, or fall back to the first available provider
export const DEFAULT_PROVIDER = providerRegistry.getDefaultProvider()?.id || 
  (providerRegistry.getAllProviders()[0]?.id || 'gpt');