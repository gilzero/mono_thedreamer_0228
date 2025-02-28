// filepath: src/components/ChatController.tsx
import { useState, useRef, useEffect, useContext } from 'react';
import { Animated, Keyboard } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { AppContext } from '../contexts';
import { ChatMessage, ChatState, MessageRole } from '../config';
import { chatService } from '../services';
import { ChatError, validateMessage, getFirstNCharsOrLess, logInfo, logDebug, logError } from '../utils';
import { animateButton, animateChatClear, animateInputLoading, animateTypingDots } from './ChatAnimations';

export interface ChatControllerProps {
  scrollToBottom: () => void;
}

export function useChatController({ scrollToBottom }: ChatControllerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [callMade, setCallMade] = useState<boolean>(false);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    index: uuid()
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputOpacity = useRef(new Animated.Value(1)).current;
  const typingDots = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;
  
  const buttonScale = useRef(new Animated.Value(1)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  
  const { showActionSheetWithOptions } = useActionSheet();
  const { chatType, clearChatRef } = useContext(AppContext);

  useEffect(() => {
    if (clearChatRef) {
      clearChatRef.current = handleClearChat;
    }
    return () => {
      if (clearChatRef) {
        clearChatRef.current = undefined;
      }
    };
  }, []);

  function handleClearChat() {
    if (loading) return;
    
    animateChatClear(fadeAnim, () => {
      setChatState({
        messages: [],
        index: uuid()
      });
      setInput('');
      setCallMade(false);
    });
  }

  const showErrorToast = (error: ChatError) => {
    const errorMessages: Record<string, string> = {
      'PARSE_ERROR': 'Failed to process AI response',
      'STREAM_ERROR': 'Connection interrupted',
      'REQUEST_ERROR': 'Failed to connect to chat service',
      'HTTP_ERROR': 'Server error occurred',
      'UNKNOWN_ERROR': 'An unexpected error occurred'
    };

    Toast.show({
      type: 'error',
      text1: errorMessages[error.code] || 'Error',
      text2: error.message,
      position: 'bottom',
      visibilityTime: 4000,
    });
  };

  const showConnectionToast = (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => {
    const statusMessages: Record<string, { text1: string; text2: string; type: string }> = {
      'connecting': {
        text1: 'Connecting...',
        text2: 'Establishing connection to chat service',
        type: 'info'
      },
      'connected': {
        text1: 'Connected',
        text2: 'Successfully connected to chat service',
        type: 'success'
      },
      'disconnected': {
        text1: 'Connection Lost',
        text2: 'Attempting to reconnect...',
        type: 'error'
      },
      'reconnecting': {
        text1: 'Reconnecting...',
        text2: 'Attempting to restore connection',
        type: 'info'
      }
    };

    const message = statusMessages[status];
    if (message) {
      Toast.show({
        type: message.type as any,
        text1: message.text1,
        text2: message.text2,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const validateAndPrepareMessage = (input: string, chatState: ChatState) => {
    const userMessage = {
      role: 'user' as const,
      content: getFirstNCharsOrLess(input),
      timestamp: Date.now()
    };
    
    const messages = [...chatState.messages, userMessage];

    // Log user prompt
    logInfo('User sent message', { 
      messageId: userMessage.timestamp,
      contentLength: userMessage.content.length,
      action: 'user_message'
    });
    
    // For privacy reasons, we log a truncated version of the message
    logDebug('User message content (partial: first 50 chars)', { 
      preview: userMessage.content && userMessage.content.length > 50 
        ? `${userMessage.content.substring(0, 50)}...` 
        : userMessage.content || '',
      action: 'user_message_content'
    });
    
    const newMessage = messages[messages.length - 1]!;
    validateMessage(newMessage);

    return messages;
  };

  async function chat() {
    if (!input.trim()) return;
    animateButton(sendButtonScale);
    Keyboard.dismiss();

    if (!callMade) {
      setCallMade(true);
    }

    try {
      const messages = validateAndPrepareMessage(input, chatState);
      
      setChatState(prev => ({
        ...prev,
        messages
      }));

      scrollToBottom();

      setLoading(true);
      setInput('');
      animateInputLoading(inputOpacity, true);
      animateTypingDots(typingDots);

      const responseMap = new Map<string, string>();
      const startTime = Date.now();

      await chatService.streamChat(
        messages,
        {
          provider: chatType.label,
          temperature: 0.3,
          streaming: true
        },
        {
          onToken: (token, messageId) => {
            const currentContent = responseMap.get(messageId) || '';
            const newContent = currentContent + token;
            responseMap.set(messageId, newContent);

            // Add logging to debug token processing
            if (currentContent === '') {
              // This is the first token for this message
              logDebug('Processing first token', { 
                messageId,
                tokenLength: token.length,
                tokenPreview: token.substring(0, 30),
                action: 'first_token_processing'
              });
            }

            setChatState(prev => {
              const messages = [...prev.messages];
              const lastMessage = messages[messages.length - 1];
              
              if (lastMessage?.role === 'assistant') {
                messages[messages.length - 1] = {
                  ...lastMessage,
                  content: newContent
                };
                
                // Log message update
                if (newContent.length <= 50) {
                  // Only log full content for short messages to avoid excessive logging
                  logDebug('Updating AI message', {
                    messageId,
                    contentLength: newContent.length,
                    fullContent: newContent,
                    action: 'update_ai_message'
                  });
                }
              } else {
                // New AI message started
                const aiMessage: ChatMessage = {
                  role: 'assistant' as MessageRole,
                  content: newContent,
                  timestamp: Date.now(),
                  model: chatType.displayName
                };
                
                // Log new message creation with full content
                logDebug('Creating new AI message', {
                  messageId,
                  contentLength: newContent.length,
                  fullContent: newContent,
                  action: 'create_ai_message'
                });
                
                messages.push(aiMessage);
                
                // Log the start of AI response
                logInfo('AI response started', { 
                  messageId,
                  model: chatType.displayName,
                  action: 'ai_response_started'
                });
              }

              return {
                ...prev,
                messages
              };
            });

            requestAnimationFrame(scrollToBottom);
          },
          onError: (error) => {
            logError('Chat error occurred', { 
              error: error instanceof Error ? error.message : String(error),
              provider: chatType.label,
              action: 'chat_error'
            });
            
            console.error('Chat error:', error);
            setLoading(false);
            animateInputLoading(inputOpacity, false);
            if (error instanceof ChatError) {
              showErrorToast(error);
            } else {
              showErrorToast(new ChatError('An unexpected error occurred', 'UNKNOWN_ERROR'));
            }
          },
          onComplete: () => {
            const responseTime = Date.now() - startTime;
            
            // Get the final AI response
            setChatState(prev => {
              const lastMessage = prev.messages[prev.messages.length - 1];
              if (lastMessage?.role === 'assistant') {
                // Log completion of AI response
                logInfo('AI response completed', { 
                  responseTimeMs: responseTime,
                  contentLength: lastMessage.content.length,
                  model: chatType.displayName,
                  action: 'ai_response_completed'
                });
                
                // For privacy reasons, we log a truncated version of the message
                logDebug('AI response content (partial: first 50 chars)', { 
                  preview: lastMessage.content && lastMessage.content.length > 50 
                    ? `${lastMessage.content.substring(0, 50)}...` 
                    : lastMessage.content || '',
                  action: 'ai_response_content'
                });
              }
              return prev;
            });
            
            setLoading(false);
            animateInputLoading(inputOpacity, false);
            scrollToBottom();
          },
          onConnectionStatus: (status) => {
            logInfo('Connection status changed', { 
              status,
              provider: chatType.label,
              action: 'connection_status_change'
            });
            
            setConnectionStatus(status);
            showConnectionToast(status);
          }
        }
      );
    } catch (error) {
      logError('Failed to send message', { 
        error: error instanceof Error ? error.message : String(error),
        action: 'message_send_failed'
      });
      
      console.error('Failed to send message:', error);
      setLoading(false);
      animateInputLoading(inputOpacity, false);
      if (error instanceof ChatError) {
        showErrorToast(error);
      } else if (error instanceof Error) {
        showErrorToast(new ChatError(error.message, 'UNKNOWN_ERROR'));
      } else {
        showErrorToast(new ChatError('Failed to send message', 'UNKNOWN_ERROR'));
      }
    }
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
  }

  async function showClipboardActionsheet(text: string) {
    const cancelButtonIndex = 2;
    showActionSheetWithOptions({
      options: ['Copy to clipboard', 'Clear chat', 'cancel'],
      cancelButtonIndex
    }, selectedIndex => {
      if (selectedIndex === 0) {
        copyToClipboard(text);
      }
      if (selectedIndex === 1) {
        handleClearChat();
      }
    });
  }

  return {
    loading,
    input,
    callMade,
    chatState,
    connectionStatus,
    fadeAnim,
    inputOpacity,
    typingDots,
    buttonScale,
    sendButtonScale,
    setInput,
    chat,
    showClipboardActionsheet,
    handleClearChat
  };
} 