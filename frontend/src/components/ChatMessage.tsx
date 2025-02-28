// filepath: src/components/ChatMessage.tsx
import React, { memo } from 'react';
import { View, TouchableHighlight, Animated, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Markdown from '@ronradtke/react-native-markdown-display';
import { ChatMessage as ChatMessageType } from '../config';
import { getStyles } from './ChatStyles';

// ChatMessage Component
interface ChatMessageProps {
  item: ChatMessageType;
  theme: any;
  onPressOptions: (content: string) => void;
}

export const ChatMessage = memo(({ item, theme, onPressOptions }: ChatMessageProps) => {
  const styles = getStyles(theme);

  return (
    <Animated.View style={[styles.promptResponse]}>
      {item.role === 'user' ? (
        <View style={styles.promptTextContainer}>
          <View style={styles.promptTextWrapper}>
            <Text style={styles.promptText}>{item.content}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.textStyleContainer}>
          {item.model && (
            <View style={styles.modelIndicator}>
              <Text style={styles.modelName}>{item.model}</Text>
            </View>
          )}
          <Markdown style={styles.markdownStyle as any}>{item.content}</Markdown>
          <TouchableHighlight
            onPress={() => onPressOptions(item.content)}
            underlayColor={'transparent'}
            accessible={true}
            accessibilityLabel="Message options"
            accessibilityHint="Show options to copy message or clear chat"
          >
            <View style={styles.optionsIconWrapper}>
              <Ionicons name="apps" size={20} color={theme.textColor} />
            </View>
          </TouchableHighlight>
        </View>
      )}
    </Animated.View>
  );
}); 