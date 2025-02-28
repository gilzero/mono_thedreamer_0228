/**
 * // filepath: src/components/ProvidersModal.tsx
 * 
 * Modal component for selecting AI chat models.
 * Provides a bottom sheet interface for switching between different AI providers.
 * 
 */
import { useContext } from 'react'
import { View, Text, StyleSheet, TouchableHighlight, Alert } from 'react-native'
import { ThemeContext, AppContext } from '../contexts'
import { ModelProviderConfig, THEMES, APP_CONFIG } from '../config'
import { useProviders } from '../providers'

interface ProvidersModalProps {
  handlePresentModalPress: () => void;
}

export function ProvidersModal({ handlePresentModalPress }: ProvidersModalProps) {
  const { theme } = useContext(ThemeContext)
  const { setChatType, chatType, clearChatRef } = useContext(AppContext)
  const styles = getStyles(theme as any)
  
  // Get providers using our custom hook - will update automatically when providers change
  const options = useProviders();

  function _setChatType(newModel: ModelProviderConfig) {
    // Don't show dialog if selecting the same model
    if (newModel.label === chatType.label) {
      handlePresentModalPress()
      return
    }

    // Add emoji icons for better visual cues
    // Using emojis instead of IconComponent because Alert doesn't support custom components
    Alert.alert(
      'Switch to ' + newModel.displayName,
      'When switching AI models, you can either:\n\n' +
      '• Continue with your current chat history\n' +
      '• Start fresh with a new conversation\n\n' +
      'What would you like to do?',
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
            handlePresentModalPress()
          }
        },
        {
          text: '💬 Continue Chat',
          style: 'default',
          onPress: () => {
            setChatType(newModel)
            handlePresentModalPress()
          }
        }
      ],
      { cancelable: true }
    )
  }

  return (
    <View style={styles.bottomSheetContainer}>
      <View>
        <View style={styles.chatOptionsTextContainer}>
          <Text style={styles.chatOptionsText}>
            AI Models
          </Text>
        </View>
        {
          options.map((option, index) => (
            <TouchableHighlight
              underlayColor={'transparent'}
              onPress={() => _setChatType(option)}
              key={option.label || index}>
              <View style={optionContainer(theme as any, chatType.label, option.label)}>
                {option.icon && (
                  <option.icon
                    size={20}
                    theme={theme}
                    selected={chatType.label === option.label}
                  />
                )}
                <Text style={optionText(theme as any, chatType.label, option.label)}>
                  {option.displayName}
                </Text>
              </View>
            </TouchableHighlight>
          ))
        }
      </View>
    </View>
  )
}

function getStyles(theme: typeof THEMES.light) {
  return StyleSheet.create({
    closeIconContainer: {
      position: 'absolute',
      right: 3,
      top: 3,
    },
    chatOptionsTextContainer: {
      flexDirection: 'row',
      justifyContent:'center',
    },
    logo: {
      width: APP_CONFIG.UI.SIZES.ICON.MEDIUM,
      height: APP_CONFIG.UI.SIZES.ICON.MEDIUM,
      marginRight: APP_CONFIG.UI.SPACING.MEDIUM
    },
    chatOptionsText: {
      color: theme.textColor,
      marginBottom: APP_CONFIG.UI.SPACING.XLARGE,
      textAlign: 'center',
      fontSize: APP_CONFIG.UI.TYPOGRAPHY.MEDIUM,
      fontFamily: theme.semiBoldFont,
      marginLeft: APP_CONFIG.UI.SPACING.MEDIUM
    },
    bottomSheetContainer: {
      borderColor: theme.borderColor,
      borderWidth: 1,
      padding: APP_CONFIG.UI.SPACING.XXLARGE,
      justifyContent: 'center',
      backgroundColor: theme.backgroundColor,
      marginHorizontal: APP_CONFIG.UI.SPACING.MEDIUM,
      marginBottom: APP_CONFIG.UI.SPACING.XXLARGE,
      borderRadius: APP_CONFIG.UI.BORDER_RADIUS.LARGE
    }
  })
}

function optionContainer(theme: typeof THEMES.light, baseType: string, type: string) {
  const selected = baseType === type
  return {
    backgroundColor: selected ? theme.tintColor : theme.backgroundColor,
    padding: APP_CONFIG.UI.SPACING.MEDIUM,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.MEDIUM,
    marginBottom: APP_CONFIG.UI.SPACING.SMALL,
    flexDirection: 'row' as 'row',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
  }
}

function optionText(theme: typeof THEMES.light, baseType: string, type: string) {
  const selected = baseType === type
  return {
    color: selected ? theme.tintTextColor : theme.textColor,
    fontFamily: theme.boldFont,
    fontSize: APP_CONFIG.UI.TYPOGRAPHY.BODY,
    shadowColor: 'rgba(0, 0, 0, .2)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginLeft: APP_CONFIG.UI.SPACING.TINY
  }
}