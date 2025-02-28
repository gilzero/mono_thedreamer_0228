/**
 * @fileoverview Main navigation component that sets up the navigation structure and global UI elements.
 * Implements bottom tab navigation, theme-aware toast notifications, and safe area handling.
 *
 * @filepath src/navigation/MainNavigator.tsx
 */

import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ParamListBase } from '@react-navigation/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ChatScreen, SettingsScreen, AgentScreen } from '../screens';
import { Header } from '../components';
import { ThemeContext } from '../contexts';
import { Theme } from '../config';

type RootTabParamList = ParamListBase & {
  'AI Chat': undefined;
  'AI Agent': undefined;
  'Settings': undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>()

/**
 * Generates theme-aware toast configurations for the application.
 */
function ToastConfig({ theme }: { theme: Theme }) {
  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.tintColor,
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: theme.semiBoldFont,
          color: theme.textColor
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: theme.regularFont,
          color: theme.textColor
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#FF5252',
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: theme.semiBoldFont,
          color: theme.textColor
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: theme.regularFont,
          color: theme.textColor
        }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#3498db',
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: theme.semiBoldFont,
          color: theme.textColor
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: theme.regularFont,
          color: theme.textColor
        }}
      />
    ),
  }
};

/**
 * Main navigation component that implements the bottom tab navigation.
 */
function MainNavigatorComponent() {
  const insets = useSafeAreaInsets()
  const { theme } = useContext(ThemeContext)
  const styles = getStyles({ theme, insets })
  
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={getTabScreenOptions(theme)}
        initialRouteName="AI Chat"
      >
        <Tab.Screen
          name="AI Chat"
          component={ChatScreen}
          options={{
            header: () => <Header />,
            tabBarIcon: ({ color, size }) => (
              <FeatherIcon name="message-circle" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AI Agent"
          component={AgentScreen}
          options={{
            header: () => <Header />,
            tabBarIcon: ({ color, size }) => (
              <FeatherIcon name="cpu" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            header: () => <Header />,
            tabBarIcon: ({ color, size }) => (
              <FeatherIcon name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <Toast config={ToastConfig({ theme })} position="bottom" />
    </View>
  )
}

/**
 * Root component of the application.
 * Sets up the SafeAreaProvider and global toast notifications.
 */
export function MainNavigator() {
  return (
    <SafeAreaProvider>
      <MainNavigatorComponent />
    </SafeAreaProvider>
  )
}

/**
 * Generates styles for the container component based on theme and safe area insets.
 */
function getStyles({ theme, insets } : { theme: Theme, insets: any}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      paddingTop: insets.top,
    },
  })
}

/**
 * Extracts tab screen options to reduce duplication
 */
function getTabScreenOptions(theme: Theme) {
  return {
    tabBarStyle: {
      backgroundColor: theme.backgroundColor,
      borderTopColor: theme.borderColor,
      borderTopWidth: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    tabBarActiveTintColor: theme.tabBarActiveTintColor,
    tabBarInactiveTintColor: theme.tabBarInactiveTintColor,
    tabBarLabelStyle: {
      fontFamily: theme.mediumFont,
    },
  }
}
