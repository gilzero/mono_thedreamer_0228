// src/config/config_app.ts
import { UI_CONFIG } from './config_ui';

/* ---------- Configuration ---------- */
export const APP_CONFIG = {
  NETWORK: {
    TIMEOUTS: {
      API_REQUEST: parseInt(process.env['EXPO_PUBLIC_API_REQUEST_TIMEOUT'] || '30000'),
      STREAM: parseInt(process.env['EXPO_PUBLIC_STREAM_TIMEOUT'] || '60000'),
      CONNECTION: parseInt(process.env['EXPO_PUBLIC_CONNECTION_TIMEOUT'] || '10000'),
      SOCKET: parseInt(process.env['EXPO_PUBLIC_SOCKET_TIMEOUT'] || '5000'),
    },
    RETRY: {
      MAX_ATTEMPTS: parseInt(process.env['EXPO_PUBLIC_MAX_RETRY_ATTEMPTS'] || '3'),
      BACKOFF_MS: parseInt(process.env['EXPO_PUBLIC_RETRY_BACKOFF_MS'] || '1000'),
      MAX_BACKOFF_MS: parseInt(process.env['EXPO_PUBLIC_MAX_RETRY_BACKOFF_MS'] || '5000'),
    },
    RATE_LIMITS: {
      REQUESTS_PER_MINUTE: parseInt(process.env['EXPO_PUBLIC_REQUESTS_PER_MINUTE'] || '60'),
      CONCURRENT_STREAMS: parseInt(process.env['EXPO_PUBLIC_CONCURRENT_STREAMS'] || '3'),
    },
  },

  VALIDATION: {
    MESSAGES: {
      MAX_LENGTH: parseInt(process.env['EXPO_PUBLIC_MAX_MESSAGE_LENGTH'] || '4000'),
      MIN_LENGTH: parseInt(process.env['EXPO_PUBLIC_MIN_MESSAGE_LENGTH'] || '1'),
      MAX_HISTORY: parseInt(process.env['EXPO_PUBLIC_MAX_MESSAGES_IN_CONTEXT'] || '100'),
    },
    INPUTS: {
      MAX_FILE_SIZE: 10 * 1024 * 1024,
      ALLOWED_FILE_TYPES: ['txt', 'pdf', 'doc', 'docx'] as const,
    },
  },

  CACHE: {
    MESSAGE_TTL: parseInt(process.env['EXPO_PUBLIC_MESSAGE_TTL'] || '86400000'),
    MAX_CACHE_SIZE: parseInt(process.env['EXPO_PUBLIC_MAX_CACHE_SIZE'] || '52428800'),
    INVALIDATION_INTERVAL: parseInt(process.env['EXPO_PUBLIC_CACHE_INVALIDATION_INTERVAL'] || '3600000'),
  },

  ERRORS: {
    VALIDATION: {
      EMPTY_MESSAGE: 'Message content cannot be empty',
      MESSAGE_TOO_LONG: (limit: number) => 
        `Message exceeds maximum length of ${limit} characters`,
      TOO_MANY_MESSAGES: (limit: number) => 
        `Conversation exceeds maximum of ${limit} messages`,
      INVALID_FILE_TYPE: (types: readonly string[]) => 
        `File type not supported. Allowed types: ${types.join(', ')}`,
      FILE_TOO_LARGE: (maxSize: number) => 
        `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
      GENERIC: 'A validation error occurred',
    },
    CONNECTION: {
      TIMEOUT: 'Connection timeout',
      FAILED: 'Failed to establish connection',
      INVALID_MODEL: (model: string, supported: string[]) => 
        `Unsupported model type: ${model}. Must be one of: ${supported.join(', ')}`,
      RATE_LIMITED: 'Too many requests. Please try again later.',
      CONCURRENT_LIMIT: 'Maximum number of concurrent streams reached',
    },
    CACHE: {
      STORAGE_FULL: 'Local storage is full. Please clear some space.',
      INVALID_CACHE: 'Cache data is corrupted or invalid',
    },
    NETWORK: {
      FAILED: 'Network request failed',
      TIMEOUT: 'Network request timed out',
    },
    SERVER: {
      GENERIC: 'A server error occurred',
      UNAVAILABLE: 'Server is currently unavailable',
    },
    AUTH: {
      FAILED: 'Authentication failed',
      UNAUTHORIZED: 'Unauthorized access',
    },
  },
  STORAGE_KEYS: {
    THEME: 'theme',
    CHAT_TYPE: 'chatType'
  },
  UI: UI_CONFIG
} as const;

export const DOMAIN = process.env['EXPO_PUBLIC_ENV'] === 'DEVELOPMENT' ?
  process.env['EXPO_PUBLIC_DEV_API_URL'] :
  process.env['EXPO_PUBLIC_PROD_API_URL'];

// Type definitions for the APP_CONFIG
export namespace NetworkConfig {
  export type Timeouts = typeof APP_CONFIG.NETWORK.TIMEOUTS;
  export type Retry = typeof APP_CONFIG.NETWORK.RETRY;
  export type RateLimits = typeof APP_CONFIG.NETWORK.RATE_LIMITS;
}

export namespace ValidationConfig {
  export type Messages = typeof APP_CONFIG.VALIDATION.MESSAGES;
  export type Inputs = typeof APP_CONFIG.VALIDATION.INPUTS;
  export type Errors = typeof APP_CONFIG.ERRORS.VALIDATION;
}

export namespace ErrorConfig {
  export type Validation = typeof APP_CONFIG.ERRORS.VALIDATION;
  export type Connection = typeof APP_CONFIG.ERRORS.CONNECTION;
  export type Cache = typeof APP_CONFIG.ERRORS.CACHE;
}

export type CacheConfig = typeof APP_CONFIG.CACHE;
export type AppConfig = typeof APP_CONFIG; 