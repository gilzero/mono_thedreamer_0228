// filepath: src/utils/Utils.ts
// fileoverview: Utility functions for the application
import { ChatMessage, ModelProviderConfig, ProviderIdentifier, DOMAIN, APP_CONFIG, MODELPROVIDERS } from '../config';
import EventSource from 'react-native-sse';
import { logError, logDebug, logInfo } from './logger';
import { handleNetworkError } from './errorHandler';

// =============== Error Handling ===============

export class ChatError extends Error {
  code: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
    this.name = 'ChatError';
    
    // Log the error
    logError(`ChatError: ${message}`, { code });
  }
}

// =============== Message Utilities ===============

export function getFirstNCharsOrLess(text: string | undefined | null, numChars: number = APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH): string {
  if (!text) {
    return '';
  }
  
  // Ensure text is a string
  const textStr = String(text);
  
  if (!textStr.trim()) {
    return '';
  }
  
  const trimmedText = textStr.trim();
  if (trimmedText.length <= numChars) {
    return trimmedText;
  }
  return trimmedText.substring(0, numChars);
}

export function getFirstN({ messages, size = 10 }: { size?: number, messages: any[] }) {
  if (messages.length > size) {
    const firstN = new Array();
    for (let i = 0; i < size; i++) {
      firstN.push(messages[i]);
    }
    return firstN;
  } else {
    return messages;
  }
}

// =============== Message Validation ===============

export interface MessageValidationError {
  message: string;
  code: 'EMPTY_MESSAGE' | 'MESSAGE_TOO_LONG' | 'TOO_MANY_MESSAGES' | 'INVALID_ROLE';
}

export class ChatValidationError extends Error {
  constructor(
    public code: MessageValidationError['code'],
    message: string
  ) {
    super(message);
    this.name = 'ChatValidationError';
    
    // Log the validation error
    logError(`ChatValidationError: ${message}`, { code });
  }
}

export function validateMessage(message: ChatMessage): void {
  if (!message) {
    throw new ChatValidationError('EMPTY_MESSAGE', APP_CONFIG.ERRORS.VALIDATION.EMPTY_MESSAGE);
  }

  // Ensure content is a string
  const content = message.content ? String(message.content).trim() : '';

  if (!content) {
    throw new ChatValidationError('EMPTY_MESSAGE', APP_CONFIG.ERRORS.VALIDATION.EMPTY_MESSAGE);
  }

  if (content.length > APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH) {
    throw new ChatValidationError(
      'MESSAGE_TOO_LONG',
      APP_CONFIG.ERRORS.VALIDATION.MESSAGE_TOO_LONG(APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH)
    );
  }
}

export function validateMessages(messages: ChatMessage[]): MessageValidationError | null {
  logDebug('Validating messages', { count: messages.length, action: 'validate_messages' });
  
  if (messages.length > APP_CONFIG.VALIDATION.MESSAGES.MAX_HISTORY) {
    return {
      code: 'TOO_MANY_MESSAGES',
      message: APP_CONFIG.ERRORS.VALIDATION.TOO_MANY_MESSAGES(APP_CONFIG.VALIDATION.MESSAGES.MAX_HISTORY)
    };
  }

  for (const message of messages) {
    try {
      validateMessage(message);
    } catch (error) {
      if (error instanceof ChatValidationError) {
        return { code: error.code, message: error.message };
      }
      throw error;
    }
  }

  return null;
}

// ===============  Provider Utilities ===============

export function getChatType(type: ModelProviderConfig): ProviderIdentifier {
  const label = type.label.toLowerCase();
  
  // Check if the label is a valid provider identifier
  if (Object.keys(MODELPROVIDERS).includes(label)) {
    return label as ProviderIdentifier;
  }

  const supportedModels = Object.keys(MODELPROVIDERS);
  throw new Error(APP_CONFIG.ERRORS.CONNECTION.INVALID_MODEL(type.label, supportedModels));
}

// =============== SSE Connection Handling ===============

export interface SSEConnectionCallbacks {
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
}

const { MAX_ATTEMPTS, BACKOFF_MS, MAX_BACKOFF_MS } = APP_CONFIG.NETWORK.RETRY;

export async function createSSEConnection(
  url: string,
  body: string,
  callbacks: SSEConnectionCallbacks,
  retryCount: number = 0
): Promise<EventSource> {
  const { onConnectionStatus } = callbacks;

  try {
    if (onConnectionStatus) {
      onConnectionStatus(retryCount === 0 ? 'connecting' : 'reconnecting');
    }
    
    logInfo('Creating SSE connection', { url, retryCount, action: 'create_connection' });

    const es = new EventSource(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body,
    });

    return new Promise((resolve, reject) => {
      let isResolved = false;
      let timeoutId: NodeJS.Timeout | null = null;
      
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          es.close();
          const timeoutError = new ChatError(APP_CONFIG.ERRORS.CONNECTION.TIMEOUT, 'CONNECTION_TIMEOUT');
          logError('Connection timeout', { url, retryCount });
          reject(timeoutError);
        }
      }, APP_CONFIG.NETWORK.TIMEOUTS.CONNECTION);

      es.addEventListener('open', () => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (onConnectionStatus) {
            onConnectionStatus('connected');
          }
          logInfo('SSE connection established', { url, action: 'connection_established' });
          resolve(es);
        }
      });

      es.addEventListener('error', async () => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          es.close();
          logError('SSE connection error', { url, retryCount });

          if (retryCount < MAX_ATTEMPTS) {
            const retryDelay = Math.min(
              BACKOFF_MS * Math.pow(2, retryCount),
              MAX_BACKOFF_MS
            );
            logInfo(`Retrying connection in ${retryDelay}ms`, { 
              retryCount: retryCount + 1, 
              retryDelay,
              action: 'connection_retry'
            });
            await new Promise(resolve => setTimeout(resolve, retryDelay));

            try {
              const newConnection = await createSSEConnection(url, body, callbacks, retryCount + 1);
              resolve(newConnection);
            } catch (error) {
              reject(error);
            }
          } else {
            if (onConnectionStatus) {
              onConnectionStatus('disconnected');
            }
            const connectionError = new ChatError(APP_CONFIG.ERRORS.CONNECTION.FAILED, 'CONNECTION_FAILED');
            logError('Connection failed after max retry attempts', { maxAttempts: MAX_ATTEMPTS });
            reject(connectionError);
          }
        }
      });
    });
  } catch (error) {
    if (onConnectionStatus) {
      onConnectionStatus('disconnected');
    }
    
    // Use our error handling system
    if (error instanceof Error) {
      handleNetworkError(error, url);
    }
    
    logError('Failed to create SSE connection', { url, error });
    throw error;
  }
}

export function getEventSource({
  headers,
  body,
  type
}: {
  headers?: Record<string, string>,
  body: unknown,
  type: string
}): EventSource {
  const url = `${DOMAIN}/api/${type}`;
  const stringifiedBody = JSON.stringify(body);
  
  logDebug('Creating event source', { url, type, action: 'create_event_source' });

  return new EventSource(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
    body: stringifiedBody,
  });
}