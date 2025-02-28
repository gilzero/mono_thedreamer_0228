// filepath: src/screens/SettingsScreen.tsx
import React, { useContext, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TouchableOpacity
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { ThemeContext, AppContext } from '../contexts'
import { THEMES, SETTINGS_CONFIG, APP_CONFIG, BaseTheme, ModelProviderConfig } from '../config'
import { getSettingsStyles } from '../styles/settings'
import { 
  ModelSection, 
  ThemeSection, 
  AdvancedSettingsSection,
  SettingsStyles
} from '../components/SettingsComponents'

const themes = [
  { name: 'Be Water', theme: THEMES.light },
  { name: 'Pink Lady', theme: THEMES.miami },
  { name: 'Yohji', theme: THEMES.vercel }
]

export function SettingsScreen() {
  const { theme, setTheme } = useContext(ThemeContext)
  const { chatType, setChatType, clearChatRef } = useContext(AppContext)
  const styles = getSettingsStyles(theme as BaseTheme) as SettingsStyles
  const [showHiddenSettings, setShowHiddenSettings] = useState(false)
  const [temperature, setTemperature] = useState<number>(SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.DEFAULT)
  const [maxTokens, setMaxTokens] = useState<number>(SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.DEFAULT)

  const pullDistance = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const lastPullY = useRef(0)
  const pullThreshold = 80
  const navigation = useNavigation()

  const currentThemeName = themes.find(t => t.theme === theme)?.name || 'Light'

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y

    if (y <= 0) {
      const pull = Math.abs(y)
      pullDistance.setValue(pull)
      lastPullY.current = pull

      if (pull > pullThreshold && !showHiddenSettings) {
        setShowHiddenSettings(true)
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        )
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
            useNativeDriver: true,
          })
        ]).start()
      }
    }
  }, [showHiddenSettings, fadeAnim, rotateAnim])

  const handleScrollEnd = useCallback(() => {
    Animated.spring(pullDistance, {
      toValue: 0,
      useNativeDriver: true,
      tension: 30,
      friction: 7
    }).start()
  }, [pullDistance])

  const toggleHiddenSettings = useCallback(() => {
    setShowHiddenSettings(prev => !prev)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: showHiddenSettings ? 0 : 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: showHiddenSettings ? 0 : 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
        useNativeDriver: true,
      })
    ]).start()
  }, [showHiddenSettings, fadeAnim, rotateAnim])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  function handleModelSelect(newModel: ModelProviderConfig) {
    if (newModel.label === chatType.label) {
      return
    }

    Alert.alert(
      'Switch to ' + newModel.displayName,
      'Would you like to continue with the current conversation or start a new one?',
      [
        {
          text: '✕ Cancel',
          style: 'cancel'
        },
        {
          text: '🗑️ New Conversation',
          style: 'destructive',
          onPress: () => {
            setChatType(newModel)
            if (clearChatRef.current) {
              clearChatRef.current()
            }
          }
        },
        {
          text: '💬 Continue Chat',
          style: 'default',
          onPress: () => {
            setChatType(newModel)
          }
        }
      ],
      { cancelable: true }
    )
  }

  const handleThemeChange = (newTheme: typeof THEMES.light) => {
    setTheme(newTheme)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      <AdvancedSettingsSection 
        styles={styles}
        theme={theme as BaseTheme}
        showHiddenSettings={showHiddenSettings}
        fadeAnim={fadeAnim}
        spin={spin}
        toggleHiddenSettings={toggleHiddenSettings}
        temperature={temperature}
        setTemperature={setTemperature}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
      />

      <ModelSection 
        styles={styles}
        theme={theme as BaseTheme}
        chatType={chatType}
        handleModelSelect={handleModelSelect}
      />

      <View style={styles.sectionDivider} />

      <ThemeSection 
        styles={styles}
        theme={theme as BaseTheme}
        currentThemeName={currentThemeName}
        themes={themes}
        handleThemeChange={handleThemeChange}
      />

      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
} 