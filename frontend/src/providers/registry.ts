// src/providers/registry.ts
import { Provider, ProviderIdentifier } from './types';
import { logWarn } from '../utils';

type RegistryListener = () => void;

class ProviderRegistry {
  private providers: Record<string, Provider> = {};
  private defaultProviderId: ProviderIdentifier | null = null;
  private listeners: Set<RegistryListener> = new Set();

  register(provider: Provider): void {
    this.providers[provider.id] = provider;
    // Set as default if it's the first one
    if (Object.keys(this.providers).length === 1) {
      this.defaultProviderId = provider.id;
    }
    this.notifyListeners();
  }

  unregister(id: ProviderIdentifier): void {
    if (this.providers[id]) {
      delete this.providers[id];
      
      // If we removed the default provider, set a new one
      if (this.defaultProviderId === id) {
        const remainingProviders = Object.keys(this.providers);
        this.defaultProviderId = remainingProviders.length > 0 ? (remainingProviders[0] as string) : null;
      }
      
      this.notifyListeners();
    }
  }

  getProvider(id: ProviderIdentifier): Provider | undefined {
    return this.providers[id];
  }

  getAllProviders(): Provider[] {
    return Object.values(this.providers);
  }

  getProviderIds(): ProviderIdentifier[] {
    return Object.keys(this.providers);
  }

  setDefaultProvider(id: ProviderIdentifier): void {
    if (this.providers[id]) {
      this.defaultProviderId = id;
      this.notifyListeners();
    } else {
      logWarn(`Attempted to set non-existent provider '${id}' as default`);
    }
  }

  getDefaultProvider(): Provider | undefined {
    return this.defaultProviderId ? this.providers[this.defaultProviderId] : undefined;
  }
  
  // Subscribe to changes in the registry
  subscribe(listener: RegistryListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const providerRegistry = new ProviderRegistry(); 