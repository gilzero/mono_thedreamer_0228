// filepath: src/screens/ChatScreen.tsx
import React, { useContext, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  FlatList, 
  Animated, 
  TouchableHighlight
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { ThemeContext } from '../contexts';
import { APP_CONFIG, ChatMessage as ChatMessageType, BaseTheme } from '../config';
import { ChatMessage, ChatInput, TypingIndicator } from '../components/ChatUI';
import { getChatStyles } from '../styles/chat';
import { useChatController } from '../components/ChatController';
import { animateButton } from '../components/ChatAnimations';

export function ChatScreen() {
  const { theme } = useContext(ThemeContext);
  const styles = getChatStyles(theme as BaseTheme);
  const scrollViewRef = useRef<ScrollView | null>(null);
  
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const {
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
    showClipboardActionsheet
  } = useChatController({ scrollToBottom });

  const renderItem = useCallback(({ item }: { item: ChatMessageType }) => (
    <ChatMessage 
      item={item} 
      theme={theme}
      onPressOptions={showClipboardActionsheet}
    />
  ), [theme, showClipboardActionsheet]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={110}
    >
      {connectionStatus === 'reconnecting' && (
        <View style={styles.connectionStatusBar}>
          <ActivityIndicator size="small" color={theme.tintTextColor} />
          <Text style={styles.connectionStatusText}>Reconnecting...</Text>
        </View>
      )}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          ref={scrollViewRef}
          contentContainerStyle={[
            !callMade && styles.scrollContentContainer,
            { paddingBottom: 20 }
          ]}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        >
          {!callMade ? (
            <View style={styles.midChatInputWrapper}>
              <View style={styles.midChatInputContainer}>
                <TextInput
                  onChangeText={setInput}
                  style={styles.midInput}
                  placeholder='Message'
                  placeholderTextColor={theme.placeholderTextColor + '80'}
                  autoCorrect={true}
                  maxLength={APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH}
                  accessible={true}
                  accessibilityLabel="Message input field"
                  accessibilityHint="Enter your message to the AI"
                />
                <TouchableHighlight
                  onPress={() => {
                    animateButton(buttonScale);
                    chat();
                  }}
                  underlayColor={theme.tintColor + '90'}
                  style={styles.midButtonContainer}
                  accessible={true}
                  accessibilityLabel={`Start Chat`}
                  accessibilityHint="Begins a new chat session with the AI"
                >
                  <Animated.View 
                    style={[
                      styles.midButtonStyle,
                      {
                        transform: [{ scale: buttonScale }]
                      }
                    ]}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={22}
                      color={theme.tintTextColor}
                      style={styles.midButtonIcon}
                    />
                    <Text style={styles.midButtonText}>
                      Start Chat
                    </Text>
                  </Animated.View>
                </TouchableHighlight>
                <Text style={styles.chatDescription}>
                  It's time to prompt...
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={chatState.messages}
              renderItem={renderItem}
              scrollEnabled={false}
              keyExtractor={(_, index) => `chat-message-${index}`}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          )}
          {loading && (
            <TypingIndicator 
              theme={theme}
              typingDots={typingDots}
              modelDisplayName="AI"
            />
          )}
          {loading && <ActivityIndicator style={styles.loadingContainer} />}
        </ScrollView>
      </Animated.View>
      {callMade && (
        <ChatInput
          input={input}
          loading={loading}
          theme={theme}
          inputOpacity={inputOpacity}
          sendButtonScale={sendButtonScale}
          onChangeText={setInput}
          onSend={() => {
            if (!loading && input.trim()) {
              animateButton(sendButtonScale);
              chat();
            }
          }}
        />
      )}
      <Toast />
    </KeyboardAvoidingView>
  );
}