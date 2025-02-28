// filepath: src/components/Icons.tsx
import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { IconProps, Theme } from '../config';

const iconDefaultTheme: Theme = {
  name: 'light',
  backgroundColor: '#fff',
  textColor: '#000',
  tintColor: '#0281ff',
  tintTextColor: '#fff',
  borderColor: '#eee',
  tabBarActiveTintColor: '#0281ff',
  tabBarInactiveTintColor: '#999',
  placeholderTextColor: '#999',
  secondaryBackgroundColor: '#f5f5f5',
  secondaryTextColor: '#666',
  regularFont: 'Geist-Regular',
  mediumFont: 'Geist-Medium',
  semiBoldFont: 'Geist-SemiBold',
  boldFont: 'Geist-Bold',
  lightFont: 'Geist-Light'
};

export function AppIcon({
  size = 100,
  fill = 'black',
  theme = iconDefaultTheme,
  selected,
  ...props
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1200 1200" {...props}>
      <G>
        <Path fill={fill} d="m632.62 175.12 236.62 744h216.75z"/>
        <Path fill={fill} d="m609.38 163.88v755.25h240.38z"/>
        <Path fill={fill} d="m590.62 919.12v-755.25l-240.38 755.25z"/>
        <Path fill={fill} d="m114 919.12h216.75l236.62-744z"/>
        <Path fill={fill} d="m106.88 937.88h221.25v98.25h-221.25z"/>
        <Path fill={fill} d="m346.88 937.88h243.75v93.75h-243.75z"/>
        <Path fill={fill} d="m609.38 937.88h243.75v93.75h-243.75z"/>
        <Path fill={fill} d="m871.88 937.88h221.25v98.25h-221.25z"/>
      </G>
    </Svg>
  )
}

export function OpenAIIcon({
  size = 24,
  theme,
  selected,
  ...props
}: IconProps) {
  const fill = selected ? theme.tintTextColor : theme.textColor
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill={fill}
      />
    </Svg>
  )
}

export function AnthropicIcon({
  size = 24,
  theme,
  selected,
  ...props
}: IconProps) {
  const fill = selected ? theme.tintTextColor : theme.textColor
  return (
    <Svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 46 32"
    >
      <Path
        d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z"
        fill={fill}
      />
    </Svg>
  )
}

export function GeminiIcon({
  size = 24,
  theme,
  selected,
  ...props
}: IconProps) {
  const fill = selected ? theme.tintTextColor : theme.textColor
  return (
    <Svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 73 73"
    >
      <G>
        <Path
          fill={fill}
          d="M36.3745 72.7592C33.5275 53.9722 18.7819 39.2266 -0.00512695 36.3796C18.7819 33.5327 33.5275 18.787 36.3745 0C39.2214 18.787 53.9671 33.5327 72.7541 36.3796C53.9671 39.2266 39.2214 53.9722 36.3745 72.7592Z"
        />
      </G>
    </Svg>
  )
}

export function DefaultProviderIcon({
  size = 24,
  theme,
  selected,
  ...props
}: IconProps) {
  const fill = selected ? theme.tintTextColor : theme.textColor
  return (
    <Svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <Path
        d="M11.58 2c3.28 0 5.84 2.75 5.28 6.16-.33 1.96-1.93 3.96-3.53 5.16l2.15 1.6c.18.12.29.34.29.55v4.53c0 .48-.53.76-.93.51L12 18.35l-2.84 2.16c-.4.25-.93-.03-.93-.51v-4.53c0-.21.11-.43.29-.55l2.15-1.6c-1.6-1.2-3.2-3.2-3.53-5.16C6.58 4.75 9.14 2 12.42 2M12 4c-2.2 0-4 1.8-4 4 0 2.05 1.53 3.83 3.44 3.97.08-.97.44-1.61 1.09-2.04.37-.26.79-.41 1.22-.41.05 0 .1 0 .15.01 1.91-.14 3.44-1.92 3.44-3.97 0-2.2-1.8-4-4-4m2.5 13.39l-2 1.5V22h-1v-3.11l-2-1.5v-1.39h5z"
        fill={fill}
      />
    </Svg>
  )
}