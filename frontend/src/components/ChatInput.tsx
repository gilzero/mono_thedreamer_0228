// filepath: src/components/ChatInput.tsx
import React, { memo } from 'react';
import { View, TextInput, TouchableHighlight, Animated, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { APP_CONFIG } from '../config';
import { getStyles } from './ChatStyles';

// ChatInput Component
interface ChatInputProps {
  input: string;
  loading: boolean;
  theme: any;
  inputOpacity: Animated.Value;
  sendButtonScale: Animated.Value;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatInput = memo(({
  input,
  loading,
  theme,
  inputOpacity,
  sendButtonScale,
  onChangeText,
  onSend
}: ChatInputProps) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.chatInputContainer}>
      <Animated.View style={{ flex: 1, opacity: inputOpacity }}>
        <TextInput
          style={[styles.input, loading && styles.inputLoading]}
          onChangeText={onChangeText}
          placeholder={loading ? 'AI is thinking...' : 'Message'}
          placeholderTextColor={theme.placeholderTextColor + '80'}
          value={input}
          maxLength={APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH}
          editable={!loading}
          accessible={true}
          accessibilityLabel="Message input field"
          accessibilityHint={loading ? "AI is generating response" : "Enter your message"}
        />
      </Animated.View>
      <TouchableHighlight
        underlayColor={'transparent'}
        activeOpacity={0.65}
        onPress={onSend}
        disabled={loading || !input.trim()}
        accessible={true}
        accessibilityLabel={loading ? "AI is responding" : "Send message"}
        accessibilityHint={loading ? "Please wait" : "Send your message to the AI"}
      >
        <Animated.View
          style={[
            styles.chatButton,
            loading && styles.chatButtonDisabled,
            { transform: [{ scale: sendButtonScale }] }
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.tintTextColor} />
          ) : (
            <Ionicons name="arrow-up-outline" size={APP_CONFIG.UI.SIZES.ICON.MEDIUM} color={theme.tintTextColor} />
          )}
        </Animated.View>
      </TouchableHighlight>
    </View>
  );
}); 