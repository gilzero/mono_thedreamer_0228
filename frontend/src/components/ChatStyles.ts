// filepath: src/components/ChatStyles.ts
import { StyleSheet } from 'react-native';
import { APP_CONFIG } from '../config';

// Shared styles for chat components
export const getStyles = (theme: any) => StyleSheet.create({
  // ChatInput styles
  chatInputContainer: {
    paddingTop: APP_CONFIG.UI.INPUT.PADDING.VERTICAL,
    borderColor: theme.borderColor,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: APP_CONFIG.UI.INPUT.PADDING.VERTICAL
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: APP_CONFIG.UI.INPUT.BORDER_RADIUS,
    color: theme.textColor,
    marginHorizontal: APP_CONFIG.UI.SPACING.MEDIUM,
    paddingVertical: APP_CONFIG.UI.SPACING.MEDIUM,
    paddingHorizontal: APP_CONFIG.UI.SPACING.XLARGE,
    paddingRight: 50,
    borderColor: theme.borderColor + '30',
    fontFamily: theme.mediumFont,
    backgroundColor: theme.backgroundColor,
  },
  inputLoading: {
    borderColor: theme.tintColor + '30',
  },
  chatButton: {
    marginRight: APP_CONFIG.UI.SPACING.MEDIUM,
    padding: APP_CONFIG.UI.SPACING.MEDIUM,
    borderRadius: 99,
    backgroundColor: theme.tintColor,
  },
  chatButtonDisabled: {
    backgroundColor: theme.tintColor + '50',
  },

  // ChatMessage styles
  promptResponse: {
    marginTop: APP_CONFIG.UI.SPACING.LARGE,
    marginBottom: APP_CONFIG.UI.SPACING.SMALL,
  },
  textStyleContainer: {
    borderWidth: 1,
    marginRight: 25,
    borderColor: theme.borderColor + '20',
    padding: 20,
    paddingBottom: 10,
    paddingTop: 10,
    margin: 10,
    borderRadius: 20,
    backgroundColor: theme.backgroundColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  promptTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
    marginLeft: 28,
  },
  promptTextWrapper: {
    borderRadius: 20,
    borderTopRightRadius: 4,
    backgroundColor: theme.tintColor,
    shadowColor: theme.tintColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  promptText: {
    color: theme.tintTextColor,
    fontFamily: theme.mediumFont,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  modelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    opacity: 0.7
  },
  modelName: {
    color: theme.textColor,
    fontSize: 12,
    fontFamily: theme.mediumFont,
    opacity: 0.8
  },
  optionsIconWrapper: {
    padding: APP_CONFIG.UI.SPACING.MEDIUM,
    paddingTop: 10,
    alignItems: 'flex-end',
    opacity: 0.8
  },
  markdownStyle: {
    body: {
      color: theme.textColor,
      fontFamily: theme.regularFont
    },
    paragraph: {
      color: theme.textColor,
      fontSize: 16,
      fontFamily: theme.regularFont
    },
    heading1: {
      color: theme.textColor,
      fontFamily: theme.semiBoldFont,
      marginVertical: 5
    },
    code_inline: {
      color: theme.secondaryTextColor,
      backgroundColor: theme.secondaryBackgroundColor,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, .1)',
      fontFamily: theme.lightFont
    },
    fence: {
      marginVertical: 5,
      padding: 10,
      color: theme.secondaryTextColor,
      backgroundColor: theme.secondaryBackgroundColor,
      borderColor: 'rgba(255, 255, 255, .1)',
      fontFamily: theme.regularFont
    }
  } as any,

  // TypingIndicator styles
  typingIndicatorContainer: {
    paddingHorizontal: APP_CONFIG.UI.SPACING.XLARGE,
    paddingVertical: APP_CONFIG.UI.SPACING.MEDIUM,
  },
  typingIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  modelIconContainer: {
    width: APP_CONFIG.UI.SIZES.TYPING_INDICATOR.WIDTH,
    height: APP_CONFIG.UI.SIZES.TYPING_INDICATOR.HEIGHT,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.LARGE,
    backgroundColor: theme.tintColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: APP_CONFIG.UI.SPACING.MEDIUM,
  },
  modelIcon: {
    color: theme.tintColor,
    fontSize: APP_CONFIG.UI.TYPOGRAPHY.SMALL,
    fontFamily: theme.mediumFont,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.LARGE,
    paddingHorizontal: APP_CONFIG.UI.SPACING.MEDIUM,
    paddingVertical: APP_CONFIG.UI.SPACING.SMALL,
    borderWidth: 1,
    borderColor: theme.borderColor + '20',
  },
  typingDot: {
    width: APP_CONFIG.UI.SIZES.TYPING_INDICATOR.DOT_SIZE,
    height: APP_CONFIG.UI.SIZES.TYPING_INDICATOR.DOT_SIZE,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.SMALL,
    backgroundColor: theme.tintColor,
    marginHorizontal: APP_CONFIG.UI.SPACING.TINY,
  }
}); 