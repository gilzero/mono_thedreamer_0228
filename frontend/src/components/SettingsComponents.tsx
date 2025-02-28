// filepath: src/components/SettingsComponents.tsx
import React from 'react'
import {
  View,
  Text,
  TouchableHighlight,
  Animated,
  TouchableOpacity
} from 'react-native'

import Slider from '@react-native-community/slider'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AnthropicIcon, OpenAIIcon, GeminiIcon } from './index'
import { IconProps, SETTINGS_CONFIG, BaseTheme } from '../config'
import { useProviders } from '../providers'

type DynamicStyleProps = {
  baseType: string;
  type: string;
  theme: BaseTheme;
}

type StyleObject = {
  color?: string;
  backgroundColor?: string;
}

export type SettingsStyles = {
  container: any;
  contentContainer: any;
  sectionContainer: any;
  sectionTitle: any;
  buttonContainer: any;
  chatChoiceButton: any;
  chatTypeText: any;
  sectionDivider: any;
  settingRow: any;
  settingLabel: any;
  settingDescription: any;
  slider: any;
  switchRow: any;
  hiddenSectionTitle: any;
  hiddenSettingLabel: any;
  hiddenSettingDescription: any;
  hiddenSectionDivider: any;
  hiddenSectionHeader: any;
  hiddenSectionToggle: any;
  hiddenSectionContainer: any;
  switchTextContainer: any;
  doneButton: any;
  doneButtonText: any;
}

export function renderIcon(props: IconProps): React.ReactElement | null {
  const { type, size, theme, selected } = props

  if (!type) return null;

  // Get the provider from the registry
  const { providerRegistry } = require('../providers');
  const provider = providerRegistry.getProvider(type);
  
  if (provider) {
    // Use the provider's getIcon function
    return provider.getIcon({ size, theme, selected: selected || false });
  }
  
  // Fallback to legacy icon rendering for backward compatibility
  const iconSize = typeof size === 'string' ? parseInt(size, 10) : size;
  if (type.includes('gpt')) {
    return <OpenAIIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
  }
  if (type.includes('claude')) {
    return <AnthropicIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
  }
  if (type.includes('gemini')) {
    return <GeminiIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
  }
  return null;
}

export function getDynamicTextStyle({ baseType, type, theme }: DynamicStyleProps): StyleObject {
  if (type === baseType) {
    return {
      color: theme.tintTextColor,
    }
  } else return {}
}

export function getDynamicViewStyle({ baseType, type, theme }: DynamicStyleProps): StyleObject {
  if (type === baseType) {
    return {
      backgroundColor: theme.tintColor
    }
  } else return {}
}

interface ModelSectionProps {
  styles: SettingsStyles;
  theme: BaseTheme;
  chatType: any;
  handleModelSelect: (model: any) => void;
}

export function ModelSection({ styles, theme, chatType, handleModelSelect }: ModelSectionProps) {
  const models = useProviders();
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Chat Model</Text>
      <View style={styles.buttonContainer}>
        {models.map((model, index) => (
          <TouchableHighlight
            key={index}
            underlayColor='transparent'
            onPress={() => handleModelSelect(model)}
          >
            <View
              style={{ 
                ...styles.chatChoiceButton, 
                ...getDynamicViewStyle({ baseType: chatType.label, type: model.label, theme }) 
              }}
            >
              {renderIcon({
                theme,
                type: model.label,
                size: 24,
                selected: chatType.label === model.label || false
              })}
              <Text
                style={{ 
                  ...styles.chatTypeText, 
                  ...getDynamicTextStyle({ baseType: chatType.label, type: model.label, theme }) 
                }}
              >
                {model.displayName}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
}

interface ThemeSectionProps {
  styles: SettingsStyles;
  theme: BaseTheme;
  currentThemeName: string;
  themes: Array<{ name: string; theme: BaseTheme }>;
  handleThemeChange: (theme: BaseTheme) => void;
}

export function ThemeSection({ styles, theme, currentThemeName, themes, handleThemeChange }: ThemeSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Theme</Text>
      <View style={styles.buttonContainer}>
        {themes.map((themeOption, index) => (
          <TouchableHighlight
            key={index}
            underlayColor='transparent'
            onPress={() => handleThemeChange(themeOption.theme)}
          >
            <View
              style={{
                ...styles.chatChoiceButton,
                ...getDynamicViewStyle({
                  baseType: currentThemeName,
                  type: themeOption.name,
                  theme
                })
              }}
            >
              <Text
                style={{
                  ...styles.chatTypeText,
                  ...getDynamicTextStyle({
                    baseType: currentThemeName,
                    type: themeOption.name,
                    theme
                  })
                }}
              >
                {themeOption.name}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
}

interface AdvancedSettingsSectionProps {
  styles: SettingsStyles;
  theme: BaseTheme;
  showHiddenSettings: boolean;
  fadeAnim: Animated.Value;
  spin: Animated.AnimatedInterpolation<string>;
  toggleHiddenSettings: () => void;
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
}

export function AdvancedSettingsSection({
  styles,
  theme,
  showHiddenSettings,
  fadeAnim,
  spin,
  toggleHiddenSettings,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens
}: AdvancedSettingsSectionProps) {
  if (!showHiddenSettings) return null;
  
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.hiddenSectionContainer}>
        <View style={styles.hiddenSectionHeader}>
          <Text style={styles.hiddenSectionTitle}>Advanced Settings</Text>
          <TouchableOpacity
            onPress={toggleHiddenSettings}
            style={styles.hiddenSectionToggle}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons
                name="chevron-up"
                size={24}
                color={theme.textColor + '90'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.hiddenSettingLabel}>Temperature: {temperature.toFixed(2)}</Text>
          <Text style={styles.hiddenSettingDescription}>
            Controls randomness: Lower values make responses more focused and deterministic, higher values make them more creative and varied.
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.MIN}
            maximumValue={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.MAX}
            step={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.STEP}
            value={temperature}
            onValueChange={setTemperature}
            minimumTrackTintColor={theme.tintColor + '90'}
            maximumTrackTintColor={theme.borderColor + '60'}
            thumbTintColor={theme.tintColor + '90'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.hiddenSettingLabel}>Max Tokens: {maxTokens}</Text>
          <Text style={styles.hiddenSettingDescription}>
            Maximum length of the model's response. Higher values allow for longer responses but may increase latency.
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.MIN}
            maximumValue={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.MAX}
            step={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.STEP}
            value={maxTokens}
            onValueChange={setMaxTokens}
            minimumTrackTintColor={theme.tintColor + '90'}
            maximumTrackTintColor={theme.borderColor + '60'}
            thumbTintColor={theme.tintColor + '90'}
          />
        </View>
      </View>
      <View style={[styles.sectionDivider, styles.hiddenSectionDivider]} />
    </Animated.View>
  );
} 