// src/config/config_types.ts
import { SetStateAction, Dispatch } from 'react';
import { NumberProp } from 'react-native-svg';
import rawProvidersConfig from './providers.json';

/* ---------- Types and Interfaces ---------- */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: number;
  model?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  index: string;
}

export interface IconProps {
  type?: string;
  theme: Theme;
  size?: NumberProp;
  selected?: boolean;
  [key: string]: any;
}

export interface Theme {
  name: string;
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  tintTextColor: string;
  borderColor: string;
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  placeholderTextColor: string;
  secondaryBackgroundColor: string;
  secondaryTextColor: string;
  regularFont: string;
  mediumFont: string;
  semiBoldFont: string;
  boldFont: string;
  lightFont: string;
}

export interface ThemeContext {
  theme: Theme;
  themeName: string;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export interface AppContext {
  chatType: ModelProviderConfig;
  setChatType: Dispatch<SetStateAction<ModelProviderConfig>>;
  handlePresentModalPress: () => void;
  closeModal: () => void;
  clearChat: () => void;
  clearChatRef: React.MutableRefObject<(() => void) | undefined>;
}

// Extract provider keys from the JSON for type safety
type ProvidersJson = typeof rawProvidersConfig;
type ProviderKeys = keyof ProvidersJson['providers'];

// Use the keys from the JSON as the provider identifiers
export type ProviderIdentifier = ProviderKeys;

export interface ModelProviderConfig {
  label: ProviderIdentifier;
  icon: React.ComponentType<any> | null;
  displayName: string;
}

export interface ProviderEnvConfig {
  id: ProviderIdentifier;
  displayName: string;
  providerIconKey?: string;
}

export interface BottomSheetStyles {
  handleIndicator: {
    backgroundColor: string;
    width: number;
  };
  handle: {
    backgroundColor: string;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
  };
  background: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export type BaseTheme = {
  name: string;
  label: string;
  textColor: string;
  secondaryTextColor: string;
  mutedForegroundColor: string;
  backgroundColor: string;
  placeholderTextColor: string;
  secondaryBackgroundColor: string;
  borderColor: string;
  tintColor: string;
  tintTextColor: string;
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  regularFont: string;
  lightFont: string;
  boldFont: string;
  mediumFont: string;
  blackFont: string;
  semiBoldFont: string;
  thinFont: string;
  ultraLightFont: string;
  ultraBlackFont: string;
};

export type ThemeType = {
  light: BaseTheme;
  dark: BaseTheme;
  miami: BaseTheme;
  vercel: BaseTheme;
}