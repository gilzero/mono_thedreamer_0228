// src/config/config_theme.ts
import { BaseTheme, ThemeType } from './config_types';

export const FONTS = {
  'Geist-Regular': require('../assets/fonts/Geist-Regular.otf'),
  'Geist-Light': require('../assets/fonts/Geist-Light.otf'),
  'Geist-Bold': require('../assets/fonts/Geist-Bold.otf'),
  'Geist-Medium': require('../assets/fonts/Geist-Medium.otf'),
  'Geist-Black': require('../assets/fonts/Geist-Black.otf'),
  'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.otf'),
  'Geist-Thin': require('../assets/fonts/Geist-Thin.otf'),
  'Geist-UltraLight': require('../assets/fonts/Geist-UltraLight.otf'),
  'Geist-UltraBlack': require('../assets/fonts/Geist-UltraBlack.otf')
} as const;

export const COLORS = {
  white: '#fff',
  black: '#000',
  gray: 'rgba(0, 0, 0, .5)',
  lightWhite: 'rgba(255, 255, 255, .5)',
  blueTint: '#0281ff',
  lightPink: '#F7B5CD',
  vercelGray: '#171717',
  miamiDark: '#231F20',
} as const;

export const FONT_STYLES = {
  regularFont: 'Geist-Regular',
  lightFont: 'Geist-Light',
  boldFont: 'Geist-Bold',
  mediumFont: 'Geist-Medium',
  blackFont: 'Geist-Black',
  semiBoldFont: 'Geist-SemiBold',
  thinFont: 'Geist-Thin',
  ultraLightFont: 'Geist-UltraLight',
  ultraBlackFont: 'Geist-UltraBlack',
} as const;

const DARK_THEME: BaseTheme = {
  ...FONT_STYLES,
  name: 'Dark',
  label: 'dark',
  textColor: COLORS.white,
  secondaryTextColor: COLORS.black,
  mutedForegroundColor: COLORS.lightWhite,
  backgroundColor: COLORS.black,
  placeholderTextColor: COLORS.lightWhite,
  secondaryBackgroundColor: COLORS.white,
  borderColor: 'rgba(255, 255, 255, .2)',
  tintColor: COLORS.blueTint,
  tintTextColor: COLORS.white,
  tabBarActiveTintColor: COLORS.blueTint,
  tabBarInactiveTintColor: COLORS.lightWhite,
} as const;

export const THEMES: ThemeType = {
  light: {
    ...FONT_STYLES,
    name: 'Light',
    label: 'light',
    textColor: COLORS.black,
    secondaryTextColor: COLORS.white,
    mutedForegroundColor: COLORS.gray,
    backgroundColor: COLORS.white,
    placeholderTextColor: COLORS.gray,
    secondaryBackgroundColor: COLORS.black,
    borderColor: 'rgba(0, 0, 0, .15)',
    tintColor: COLORS.blueTint,
    tintTextColor: COLORS.white,
    tabBarActiveTintColor: COLORS.black,
    tabBarInactiveTintColor: COLORS.gray,
  },
  dark: DARK_THEME,
  miami: {
    ...FONT_STYLES,
    ...DARK_THEME,
    name: 'Miami',
    label: 'miami',
    backgroundColor: COLORS.miamiDark,
    tintColor: COLORS.lightPink,
    tintTextColor: COLORS.miamiDark,
    tabBarActiveTintColor: COLORS.lightPink,
  },
  vercel: {
    ...FONT_STYLES,
    ...DARK_THEME,
    name: 'Vercel',
    label: 'vercel',
    backgroundColor: COLORS.black,
    tintColor: COLORS.vercelGray,
    tintTextColor: COLORS.white,
    tabBarActiveTintColor: COLORS.white,
    tabBarInactiveTintColor: COLORS.lightWhite,
  }
} as const; 