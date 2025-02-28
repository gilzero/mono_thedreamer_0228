import { StyleSheet } from 'react-native'
import { THEMES } from '../config'

export const getAgentStyles = (theme: typeof THEMES.light) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
    gap: 30,
  },
  animationContainer: {
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: theme.textColor,
    fontSize: 18,
    fontFamily: theme.mediumFont,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  comingSoonText: {
    color: theme.textColor,
    fontSize: 24,
    fontFamily: theme.boldFont,
    opacity: 0.6,
  }
}) 