/**
 * // filepath: src/services/ChatService.ts
 * DEV NOTE: Chat Implementation Strategy
 * 
 * Currently, the app exclusively uses streaming for all chat interactions via streamChat().
 * The non-streaming chat() method is kept as a placeholder for potential future use cases,
 * but should only be implemented if specific non-streaming requirements arise.
 * 
 * We intentionally default to and reinforce the streaming approach as it provides:
 * - Better user experience with real-time responses
 * - More interactive feedback
 * - Smoother UI updates
 */
import EventSource from 'react-native-sse';
import { ChatMessage, APP_CONFIG } from "../config";
import { createSSEConnection, ChatError, logInfo, logError, logDebug } from '../utils';
import { providerRegistry, ProviderIdentifier } from '../providers';

export interface ChatOptions {
  provider?: ProviderIdentifier;
  temperature?: number;
  streaming?: boolean;
}

export interface ChatCallbacks {
  onToken: (token: string, messageId: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
}

const { STREAM } = APP_CONFIG.NETWORK.TIMEOUTS;

class ChatService {
  private getApiUrl() {
    // Use the environment-specific API URL
    const isProduction = process.env['EXPO_PUBLIC_ENV'] === 'PRODUCTION';
    return isProduction 
      ? process.env['EXPO_PUBLIC_PROD_API_URL'] 
      : process.env['EXPO_PUBLIC_DEV_API_URL'];
  }

  private getProviderId(providerId?: ProviderIdentifier): ProviderIdentifier {
    if (!providerId) {
      return providerRegistry.getDefaultProvider()?.id || 'gpt';
    }
    
    const provider = providerRegistry.getProvider(providerId);
    if (!provider) {
      logError(`Provider not found: ${providerId}, using default`);
      return providerRegistry.getDefaultProvider()?.id || 'gpt';
    }
    
    return provider.id;
  }

  async streamChat( // Streaming method - primarily used (default)
    messages: ChatMessage[],
    options: ChatOptions,
    callbacks: ChatCallbacks
  ) {
    const { onToken, onError, onComplete } = callbacks;
    const providerId = this.getProviderId(options.provider);
    const provider = providerRegistry.getProvider(providerId);
    
    // Apply provider-specific message transformations if available
    const preparedMessages = provider?.prepareMessages 
      ? provider.prepareMessages(messages) 
      : messages;
    
    const url = `${this.getApiUrl()}/chat/${providerId}`;
    const body = JSON.stringify({ messages: preparedMessages });

    logInfo('Starting chat stream request', { 
      provider: providerId,
      messageCount: messages.length,
      url,
      action: 'stream_chat_request'
    });

    // Create a flag to track if the stream completed normally
    let streamCompleted = false;
    
    // Create a timeout controller that can be cancelled
    let timeoutId: NodeJS.Timeout | null = null;
    
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        // Only reject if the stream hasn't completed yet
        if (!streamCompleted) {
          logError('Stream request timed out', {
            provider: providerId,
            timeoutMs: STREAM,
            action: 'stream_timeout'
          });
          reject(new ChatError(APP_CONFIG.ERRORS.CONNECTION.TIMEOUT, 'STREAM_TIMEOUT'));
        }
      }, STREAM);
    });

    try {
      const es = await Promise.race([
        createSSEConnection(url, body, callbacks),
        timeoutPromise
      ]) as EventSource;
      
      let isCompletedNormally = false;
      let tokenCount = 0;

      es.addEventListener('message', (event) => {
        if (!event.data) return;
        if (event.data === '[DONE]') {
          isCompletedNormally = true;
          streamCompleted = true; // Mark as completed to prevent timeout errors
          
          // Clear the timeout since we've completed normally
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          logInfo('Stream completed normally', {
            provider: providerId,
            totalTokens: tokenCount,
            action: 'stream_complete'
          });
          es.close();
          onComplete();
          return;
        }
        
        // Log raw event data for the first few messages to help debug
        if (tokenCount < 3) {
          logDebug('Raw SSE event data', {
            provider: providerId,
            messageIndex: tokenCount,
            rawData: typeof event.data === 'string' ? event.data : 'non-string data',
            action: 'raw_sse_data'
          });
        }
        
        try {
          const parsed = JSON.parse(event.data);
          const content = parsed.delta?.content || '';
          const messageId = parsed.id;
          if (content && messageId) {
            tokenCount++;
            
            // Add detailed logging for the first token to help debug truncation issues
            if (tokenCount === 1) {
              logDebug('First token received', {
                provider: providerId,
                messageId,
                contentLength: content.length,
                contentPreview: content.substring(0, 30),
                action: 'first_token_received'
              });
            }
            
            onToken(content, messageId);
            
            // Log every 50 tokens to avoid excessive logging
            if (tokenCount % 50 === 0) {
              logDebug('Stream progress', {
                provider: providerId,
                tokenCount,
                messageId,
                action: 'stream_progress'
              });
            }
          }
        } catch (e) {
          logError('Failed to parse stream chunk', {
            error: e instanceof Error ? e.message : String(e),
            data: typeof event.data === 'string' && event.data 
              ? event.data.substring(0, 100) 
              : 'non-string or empty data',
            action: 'parse_error'
          });
          console.warn('Failed to parse chunk:', e);
          onError(new ChatError('Failed to parse response from server', 'PARSE_ERROR'));
        }
      });

      // Handle unexpected connection close
      es.addEventListener('close', () => {
        // Only notify disconnection if the stream didn't complete normally
        if (!isCompletedNormally) {
          logInfo('Stream closed unexpectedly', {
            provider: providerId,
            tokenCount,
            action: 'stream_closed'
          });
          if (callbacks.onConnectionStatus) {
            callbacks.onConnectionStatus('disconnected');
          }
        }
      });

    } catch (error) {
      // Clear the timeout if we've caught an error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      logError('Stream chat request failed', {
        provider: providerId,
        error: error instanceof Error ? error.message : String(error),
        action: 'stream_request_failed'
      });
      
      if (error instanceof ChatError) {
        onError(error);
      } else if (error instanceof Error) {
        onError(new ChatError(error.message, 'REQUEST_ERROR'));
      } else {
        onError(new ChatError('Failed to connect to chat service', 'REQUEST_ERROR'));
      }
    }
  }

  // Non-streaming method - appears to be mainly used for health checks
  async chat(messages: ChatMessage[], options: ChatOptions): Promise<string> {
    const providerId = this.getProviderId(options.provider);
    const provider = providerRegistry.getProvider(providerId);
    
    // Apply provider-specific message transformations if available
    const preparedMessages = provider?.prepareMessages 
      ? provider.prepareMessages(messages) 
      : messages;
    
    logInfo('Starting non-streaming chat request', {
      provider: providerId,
      messageCount: messages.length,
      action: 'chat_request'
    });
    
    try {
      const response = await fetch(`${this.getApiUrl()}/chat/${providerId}`, {
        // Regular REST API call
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: preparedMessages
        })
      });

      if (!response.ok) {
        const errorMsg = `Server responded with status: ${response.status}`;
        logError('Chat request failed with HTTP error', {
          provider: providerId,
          status: response.status,
          statusText: response.statusText,
          action: 'chat_http_error'
        });
        throw new ChatError(errorMsg, 'HTTP_ERROR');
      }

      const data = await response.json();
      const content = data.content || '';
      
      logInfo('Chat request completed successfully', {
        provider: providerId,
        responseLength: content.length,
        action: 'chat_success'
      });
      
      return content;
    } catch (error) {
      logError('Chat request failed', {
        provider: providerId,
        error: error instanceof Error ? error.message : String(error),
        action: 'chat_request_failed'
      });
      
      if (error instanceof ChatError) {
        throw error;
      } else if (error instanceof Error) {
        throw new ChatError(error.message, 'REQUEST_ERROR');
      } else {
        throw new ChatError('Unknown error occurred', 'UNKNOWN_ERROR');
      }
    }
  }
}

export const chatService = new ChatService(); 