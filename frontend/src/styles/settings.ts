import { StyleSheet } from 'react-native'
import { THEMES } from '../config'

export const getSettingsStyles = (theme: typeof THEMES.light) => StyleSheet.create({
  contentContainer: {
    paddingBottom: 50
  },
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor
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
  },
  chatChoiceButton: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    gap: 12
  },
  chatTypeText: {
    color: theme.textColor,
    fontSize: 16,
    fontFamily: theme.mediumFont
  },
  buttonContainer: {
    marginBottom: 15
  },
  settingRow: {
    marginBottom: 25
  },
  settingLabel: {
    color: theme.textColor,
    fontSize: 16,
    fontFamily: theme.mediumFont,
    marginBottom: 4
  },
  settingDescription: {
    color: theme.textColor + '80',
    fontSize: 14,
    fontFamily: theme.regularFont,
    marginBottom: 12,
    lineHeight: 20
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 20
  },
  switchTextContainer: {
    flex: 1,
  },
  hiddenSectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.backgroundColor,
  },
  hiddenSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hiddenSectionTitle: {
    color: theme.textColor,
    fontSize: 17,
    fontFamily: theme.mediumFont,
    fontStyle: 'italic'
  },
  hiddenSectionToggle: {
    padding: 8,
    marginRight: -8,
  },
  hiddenSettingLabel: {
    color: theme.textColor,
    fontSize: 15,
    fontFamily: theme.mediumFont,
    marginBottom: 6,
    fontStyle: 'italic'
  },
  hiddenSettingDescription: {
    color: theme.textColor,
    opacity: 0.7,
    fontSize: 13,
    fontFamily: theme.regularFont,
    marginBottom: 12,
    lineHeight: 18
  },
  hiddenSectionDivider: {
    height: 1,
    backgroundColor: theme.borderColor + '30',
    marginVertical: 8
  },
  doneButton: {
    backgroundColor: theme.tintColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    color: theme.tintTextColor,
    fontSize: 16,
    fontFamily: theme.mediumFont,
  }
}) 