// filepath: src/App.tsx
import 'react-native-gesture-handler';
import { ReadableStream } from 'web-streams-polyfill';

if (typeof global.ReadableStream === 'undefined') {
  (global as any).ReadableStream = ReadableStream;
}

import { useState, useEffect, useRef, SetStateAction } from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { NavigationService } from './services/NavigationService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';

import { MainNavigator } from './navigation';
import { 
  ModelProviderConfig, 
  MODELPROVIDERS, 
  THEMES, 
  FONTS, 
  APP_CONFIG, 
  DEFAULT_PROVIDER, 
  ProviderIdentifier,
  getBottomSheetStyles,
  BaseTheme,
  Theme
} from './config';
import { ProvidersModal } from './components';
import { ThemeContext, AppContext } from './contexts';
import { ErrorBoundary } from './components';
import { logInfo, logError, logDebug, logWarn, setupGlobalErrorHandlers } from './utils';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://9c08d89bdd154f620ff60553b32520c1@o4507451374370816.ingest.us.sentry.io/4508892284911616',
  // Set environment based on __DEV__
  environment: __DEV__ ? 'development' : 'production',
  // Enable performance monitoring
  enableTracing: true,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  // Enable auto session tracking
  autoSessionTracking: true,
  // Set debug to true in development
  debug: __DEV__,
  // Enable React Native specific features
  enableNative: true,
  // Enable auto breadcrumbs
  enableAutoPerformanceTracing: true,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const { STORAGE_KEYS } = APP_CONFIG;

// Set up global error handlers
setupGlobalErrorHandlers();

// Log application startup
logInfo('Application starting up', { version: '1.1.0' });

SplashScreen.preventAutoHideAsync()

const useAppConfiguration = () => {
  // If no providers are configured, use an empty provider config to prevent crashes
  const hasProviders = Object.keys(MODELPROVIDERS).length > 0;
  if (!hasProviders) {
    logWarn('No providers configured in environment variables');
  }

  const [chatType, setChatType] = useState<ModelProviderConfig>(() => {
    const defaultProvider = DEFAULT_PROVIDER as string;
    const firstProvider = Object.keys(MODELPROVIDERS)[0];
    
    return MODELPROVIDERS[defaultProvider as ProviderIdentifier] || 
           (firstProvider ? MODELPROVIDERS[firstProvider as ProviderIdentifier] : {} as ModelProviderConfig);
  });
  const [currentTheme, setCurrentTheme] = useState(THEMES.light);

  useEffect(() => {
    async function loadConfiguration() {
      try {
        logDebug('Loading saved configuration', { action: 'init' });
        const [savedChatType, savedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CHAT_TYPE),
          AsyncStorage.getItem(STORAGE_KEYS.THEME)
        ]);

        if (savedChatType) {
          const parsedChatType = JSON.parse(savedChatType);
          setChatType(parsedChatType);
          logDebug('Loaded saved chat type', { provider: parsedChatType.label });
        }

        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          setCurrentTheme(parsedTheme);
          logDebug('Loaded saved theme', { theme: parsedTheme.name });
        }
      } catch (error) {
        logError('Failed to load configuration', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    loadConfiguration();
  }, []);

  return { chatType, setChatType, currentTheme, setCurrentTheme };
};

const App: React.FC = () => {
  const { chatType, setChatType, currentTheme, setCurrentTheme } = useAppConfiguration();
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const clearChatRef = useRef<() => void>()
  const [fontsLoaded] = useFonts(FONTS)

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync()
      }
    }
    hideSplashScreen()
  }, [fontsLoaded])

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  function closeModal() {
    bottomSheetModalRef.current?.dismiss()
    setModalVisible(false)
  }

  function handlePresentModalPress() {
    if (modalVisible) {
      closeModal()
    } else {
      bottomSheetModalRef.current?.present()
      setModalVisible(true)
    }
  }

  function _setChatType(type: SetStateAction<ModelProviderConfig>) {
    setChatType(type)
    if (type instanceof Function) return
    AsyncStorage.setItem(STORAGE_KEYS.CHAT_TYPE, JSON.stringify(type))
  }

  const _setCurrentTheme = (theme: SetStateAction<BaseTheme>) => {
    setCurrentTheme(theme as any)
    if (theme instanceof Function) return
    AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme))
  }

  function clearChat() {
    // Navigate to Chat screen first, then clear the chat
    NavigationService.navigate('AI Chat')
    // Use setTimeout to ensure navigation completes before clearing
    setTimeout(() => {
      clearChatRef.current?.()
    }, 100)
  }

  const bottomSheetStyles = getBottomSheetStyles(currentTheme)

  if (!fontsLoaded) return null
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContext.Provider
          value={{
            chatType,
            setChatType: _setChatType,
            handlePresentModalPress,
            closeModal,
            clearChat,
            clearChatRef
          }}
        >
          <ThemeContext.Provider value={{
            theme: currentTheme as Theme,
            themeName: currentTheme.name,
            setTheme: _setCurrentTheme as any
          }}>
            <ActionSheetProvider>
              <NavigationContainer ref={NavigationService.navigationRef}>
                <MainNavigator />
              </NavigationContainer>
            </ActionSheetProvider>
            <BottomSheetModalProvider>
              <BottomSheetModal
                handleIndicatorStyle={bottomSheetStyles.handleIndicator}
                handleStyle={bottomSheetStyles.handle}
                backgroundStyle={bottomSheetStyles.background}
                ref={bottomSheetModalRef}
                enableDynamicSizing={true}
                backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />}
                enableDismissOnClose
                enablePanDownToClose
                onDismiss={() => setModalVisible(false)}
              >
                <BottomSheetView>
                  <ProvidersModal
                    handlePresentModalPress={handlePresentModalPress}
                  />
                </BottomSheetView>
              </BottomSheetModal>
            </BottomSheetModalProvider>
          </ThemeContext.Provider>
        </AppContext.Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}

// Wrap the App component with Sentry
export default Sentry.wrap(App);