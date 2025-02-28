// src/config/config_ui.ts
import { BaseTheme, BottomSheetStyles } from './config_types';
import { COLORS } from './config_theme';

export const UI_CONFIG = {
  SPACING: {
    TINY: 4,
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    XLARGE: 20,
    XXLARGE: 24,
    HUGE: 32,
    SECTION: 40,
  },
  TYPOGRAPHY: {
    SMALL: 13,
    BODY: 15,
    MEDIUM: 16,
    LARGE: 18,
    XLARGE: 20,
    TITLE: 24,
  },
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    PILL: 24,
  },
  ANIMATION: {
    DURATION: {
      FAST: 100,
      MEDIUM: 200,
      SLOW: 300,
      VERY_SLOW: 400
    },
    DELAY: {
      DEFAULT: 100,
      LONG: 200
    },
    EASING: {
      DEFAULT: 'ease',
      IN_OUT: 'ease-in-out',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  INPUT: {
    BORDER_RADIUS: 24,
    PADDING: {
      VERTICAL: 5,
      HORIZONTAL: 12
    },
    HEIGHT: 44
  },
  SIZES: {
    ICON: {
      SMALL: 18,
      MEDIUM: 22,
      LARGE: 28
    },
    TYPING_INDICATOR: {
      WIDTH: 28,
      HEIGHT: 28,
      DOT_SIZE: 6
    }
  },
  SHADOW: {
    OFFSET: {
      DEFAULT: { width: 0, height: 4 },
      SMALL: { width: 0, height: 2 },
      INVERTED: { width: 0, height: -4 }
    }
  }
} as const;

export function getBottomSheetStyles(theme: BaseTheme): BottomSheetStyles {
  return {
    handleIndicator: {
      backgroundColor: theme.mutedForegroundColor,
      width: UI_CONFIG.SIZES.ICON.MEDIUM,
    },
    handle: {
      backgroundColor: theme.backgroundColor,
      borderTopLeftRadius: UI_CONFIG.BORDER_RADIUS.MEDIUM,
      borderTopRightRadius: UI_CONFIG.BORDER_RADIUS.MEDIUM,
    },
    background: {
      backgroundColor: theme.backgroundColor,
      borderColor: theme.borderColor,
      borderWidth: 1,
      shadowColor: COLORS.black,
      shadowOffset: UI_CONFIG.SHADOW.OFFSET.INVERTED,
      shadowOpacity: 0.1,
      shadowRadius: UI_CONFIG.BORDER_RADIUS.SMALL,
      elevation: 5,
    },
  };
} 