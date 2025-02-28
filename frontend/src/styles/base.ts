import { StyleSheet } from 'react-native'
import { THEMES } from '../config'

export const getBaseStyles = (theme: typeof THEMES.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor
  },
  text: {
    color: theme.textColor,
    fontFamily: theme.mediumFont
  },
  sectionContainer: {
    paddingTop: 25,
    paddingBottom: 15
  },
  sectionTitle: {
    color: theme.textColor,
    fontSize: 18,
    fontFamily: theme.boldFont,
    marginBottom: 14,
    paddingHorizontal: 14
  },
  sectionDivider: {
    height: 2,
    backgroundColor: theme.borderColor + '5',
    marginVertical: 5
  }
}) 