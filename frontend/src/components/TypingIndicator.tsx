// filepath: src/components/TypingIndicator.tsx
import React, { memo } from 'react';
import { View, Animated, Text } from 'react-native';
import { getStyles } from './ChatStyles';

// TypingIndicator Component
interface TypingIndicatorProps {
  theme: any;
  typingDots: Animated.Value[];
  modelDisplayName: string;
}

export const TypingIndicator = memo(({ theme, typingDots, modelDisplayName }: TypingIndicatorProps) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.typingIndicatorContainer}>
      <View style={styles.typingIndicatorContent}>
        <View style={styles.modelIconContainer}>
          <Text style={styles.modelIcon}>{modelDisplayName[0]}</Text>
        </View>
        <View style={styles.dotsContainer}>
          {typingDots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  opacity: dot,
                  transform: [{
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}); 