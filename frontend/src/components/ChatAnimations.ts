// filepath: src/components/ChatAnimations.ts
import { Animated, Easing } from 'react-native';
import { APP_CONFIG } from '../config';

/**
 * Animates a button press with a scale down and up effect
 */
export const animateButton = (scale: Animated.Value) => {
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 0.95,
      duration: APP_CONFIG.UI.ANIMATION.DURATION.FAST,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: APP_CONFIG.UI.ANIMATION.DURATION.FAST,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
  ]).start();
};

/**
 * Animates the chat container fade in/out when clearing chat
 */
export const animateChatClear = (fadeAnim: Animated.Value, callback: () => void) => {
  Animated.sequence([
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }),
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: APP_CONFIG.UI.ANIMATION.DURATION.SLOW,
      delay: APP_CONFIG.UI.ANIMATION.DELAY.DEFAULT,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease)
    })
  ]).start();

  setTimeout(callback, 200);
};

/**
 * Animates the input opacity during loading
 */
export const animateInputLoading = (inputOpacity: Animated.Value, isLoading: boolean) => {
  Animated.timing(inputOpacity, {
    toValue: isLoading ? 0.5 : 1,
    duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
    useNativeDriver: true,
  }).start();
};

/**
 * Animates the typing indicator dots
 */
export const animateTypingDots = (typingDots: Animated.Value[]) => {
  const createDotAnimation = (dot: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(dot, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]);
  };

  Animated.loop(
    Animated.stagger(200, [
      createDotAnimation(typingDots[0]!),
      createDotAnimation(typingDots[1]!),
      createDotAnimation(typingDots[2]!)
    ])
  ).start();
}; 