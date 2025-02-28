// filepath: src/providers/hooks.ts
import { useState, useEffect } from 'react';
import { providerRegistry } from './registry';
import { ModelProviderConfig } from '../config';

/**
 * Custom hook to get all available providers
 * This will automatically update when providers are added or removed
 */
export function useProviders() {
  const [providers, setProviders] = useState<ModelProviderConfig[]>([]);
  
  useEffect(() => {
    // Convert providers to the format expected by the UI
    const modelProviders = providerRegistry.getAllProviders().map(provider => ({
      label: provider.id,
      displayName: provider.displayName,
      icon: provider.getIcon
    })) as ModelProviderConfig[];
    
    setProviders(modelProviders);
    
    // Subscribe to provider registry changes
    const unsubscribe = providerRegistry.subscribe(() => {
      const updatedProviders = providerRegistry.getAllProviders().map(provider => ({
        label: provider.id,
        displayName: provider.displayName,
        icon: provider.getIcon
      })) as ModelProviderConfig[];
      
      setProviders(updatedProviders);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);
  
  return providers;
} 