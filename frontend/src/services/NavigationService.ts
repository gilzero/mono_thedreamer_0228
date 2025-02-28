/**
 * Navigation service for handling navigation actions from outside of React components.
 * 
 * @filepath src/services/NavigationService.ts
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';

type RootTabParamList = ParamListBase & {
  'AI Chat': undefined;
  'AI Agent': undefined;
  'Settings': undefined;
};

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

export function navigate(name: keyof RootTabParamList) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never);
  }
}

export const NavigationService = {
  navigate,
  navigationRef,
};
