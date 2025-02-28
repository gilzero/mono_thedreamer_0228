// filepath: src/screens/AgentScreen.tsx
import React, { useContext } from 'react'
import { View } from 'react-native'
import { ThemeContext } from '../contexts'
import { getAgentStyles } from '../styles/agent'
import { MotiView, MotiText } from 'moti'
import { Easing } from 'react-native-reanimated'
import { BaseTheme } from '../config'

export function AgentScreen() {
  const { theme } = useContext(ThemeContext)
  const styles = getAgentStyles(theme as BaseTheme)

  return (
    <View style={styles.container}>
      <MotiView
        style={styles.animationContainer}
        from={{
          rotate: '0deg',
          scale: 0.5,
        }}
        animate={{
          rotate: '360deg',
          scale: 1,
        }}
        transition={{
          type: 'timing',
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }}
      >
        <MotiText 
          style={styles.text}
          from={{
            opacity: 0,
            translateY: -20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'spring',
            delay: 500,
            damping: 15,
            mass: 1,
          }}
        >
          AI Agents coming in next update, stay tuned! 🥷
        </MotiText>
      </MotiView>

      <MotiText
        style={[styles.comingSoonText]}
        animate={{ 
          scale: [1, 1.1, 1],
          translateY: [0, -10, 0],
        }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }}
      >
        Coming Soon
      </MotiText>
    </View>
  )
} 