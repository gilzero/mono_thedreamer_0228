import { StyleSheet } from 'react-native'
import { THEMES } from '../config'

export const getChatStyles = (theme: typeof THEMES.light) => StyleSheet.create({
  container: {
    backgroundColor: theme.backgroundColor,
    flex: 1
  },
  scrollContentContainer: {
    flex: 1,
    paddingTop: 20
  },
  loadingContainer: {
    marginTop: 25
  },
  connectionStatusBar: {
    backgroundColor: theme.tintColor + '90',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  connectionStatusText: {
    color: theme.tintTextColor,
    marginLeft: 8,
    fontFamily: theme.mediumFont,
    fontSize: 14,
  },
  midInput: {
    marginBottom: 20,
    borderWidth: 1,
    paddingHorizontal: 25,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 24,
    color: theme.textColor,
    borderColor: theme.borderColor + '30',
    fontFamily: theme.mediumFont,
    backgroundColor: theme.backgroundColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  midButtonContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: theme.tintColor,
    shadowColor: theme.tintColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  midButtonStyle: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  midButtonIcon: {
    marginRight: 14,
  },
  midButtonText: {
    color: theme.tintTextColor,
    fontFamily: theme.boldFont,
    fontSize: 17,
    letterSpacing: 0.4,
  },
  midChatInputWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  midChatInputContainer: {
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5
  },
  chatDescription: {
    color: theme.textColor,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    letterSpacing: 0.4,
    paddingHorizontal: 40,
    fontFamily: theme.regularFont,
    lineHeight: 24,
  }
}) 