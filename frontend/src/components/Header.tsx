/**
 * Application header component with navigation and action buttons.
 * 
 * @filepath src/components/Header.tsx
 */
import { StyleSheet, View, TouchableHighlight } from 'react-native';
import { useContext } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ThemeContext, AppContext } from '../contexts';
import { APP_CONFIG } from '../config';
import { Theme } from '../config/config_types';

export function Header() {
  const { theme } = useContext(ThemeContext)
  const {
    handlePresentModalPress,
    clearChat
  } = useContext(AppContext)
  const styles = getStyles(theme)

  const handleModelPress = () => {
    console.log('Model Selection icon pressed')
    if (handlePresentModalPress) {
      handlePresentModalPress()
    } else {
      console.log('Model selection not available on this screen')
    }
  }

  const handleDovePress = () => {
    console.log('Dove icon pressed')
  }

  const handleClearPress = () => {
    console.log('Clear Chat icon pressed')
    if (clearChat) {
      console.log('clearChat function exists')
      clearChat()
    } else {
      console.log('Clear chat not available on this screen')
    }
  }

  

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <TouchableHighlight
          style={styles.button}
          underlayColor={'transparent'}
          activeOpacity={0.6}
          onPress={handleModelPress}
        >
          <FontAwesome6
            name="boxes-stacked"
            size={APP_CONFIG.UI.SIZES.ICON.MEDIUM}
            color={theme.textColor}
          />
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          underlayColor={'transparent'}
          activeOpacity={0.6}
          onPress={handleDovePress}
        >
          <FontAwesome6
            name="dove"
            size={APP_CONFIG.UI.SIZES.ICON.LARGE}
            color={theme.textColor}
          />
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          underlayColor={'transparent'}
          activeOpacity={0.6}
          onPress={handleClearPress}
        >
          <Ionicons
            name="add-circle-outline"
            size={APP_CONFIG.UI.SIZES.ICON.MEDIUM}
            color={theme.textColor}
          />
        </TouchableHighlight>
      </View>
    </View>
  )
}

function getStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      paddingVertical: APP_CONFIG.UI.SPACING.MEDIUM,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: APP_CONFIG.UI.SPACING.MEDIUM,
    },
    button: {
      padding: APP_CONFIG.UI.SPACING.MEDIUM,
    }
  })
}