/**
 * Contexts for theme and app-wide state management.
 * 
 * @filepath src/contexts/AppContexts.tsx
 */
import { createContext } from 'react'
import { 
  ThemeContext as IThemeContext, 
  AppContext as IAppContext,
  THEMES, 
  MODELPROVIDERS 
} from '../config'

export const ThemeContext = createContext<IThemeContext>({
  theme: THEMES.light,
  setTheme: () => null,
  themeName: ''
})

export const AppContext = createContext<IAppContext>({
  chatType: MODELPROVIDERS.gpt,
  setChatType: () => null,
  handlePresentModalPress: () => null,
  closeModal: () => null,
  clearChat: () => null,
  clearChatRef: { current: undefined }
}) 