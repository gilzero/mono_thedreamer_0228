// src/providers/types.ts
import { IconProps } from '../config/config_types';
import React from 'react';
import { ChatMessage } from '../config';

export interface ProviderCapabilities {
  supportsStreaming: boolean;
}

export interface Provider {
  id: string;
  displayName: string;
  providerIconKey?: string;
  getIcon: (props: IconProps) => React.ReactNode;
  
  // Optional methods that can be overridden by specific providers
  prepareMessages?: (messages: ChatMessage[]) => ChatMessage[];
}

export type ProviderIdentifier = string; 