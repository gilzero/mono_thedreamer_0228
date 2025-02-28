// filepath: src/components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEMES, APP_CONFIG } from '../config';
import { logException, logInfo } from '../utils';
import { ErrorType, ErrorSeverity, ApplicationError } from '../utils/errorHandler';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our error reporting service
    logException(error, 'ErrorBoundary');
    
    // Create an application error for better tracking
    new ApplicationError({
      message: error.message,
      code: 'UI_ERROR',
      type: ErrorType.CLIENT,
      severity: ErrorSeverity.HIGH,
      originalError: error,
      metadata: {
        componentStack: errorInfo.componentStack
      }
    });

    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        },
        error: {
          type: ErrorType.CLIENT,
          code: 'UI_ERROR',
          severity: ErrorSeverity.HIGH
        }
      },
      extra: {
        componentStack: errorInfo.componentStack
      }
    });
  }

  handleReset = () => {
    logInfo('User attempting to recover from error boundary', { 
      action: 'reset_error_boundary',
      errorMessage: this.state.error?.message
    });
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONFIG.UI.SPACING.XLARGE,
    backgroundColor: THEMES.light.backgroundColor,
  },
  title: {
    fontSize: APP_CONFIG.UI.TYPOGRAPHY.XLARGE,
    fontWeight: 'bold',
    marginBottom: APP_CONFIG.UI.SPACING.MEDIUM,
    color: THEMES.light.textColor,
  },
  message: {
    textAlign: 'center',
    marginBottom: APP_CONFIG.UI.SPACING.XLARGE,
    color: THEMES.light.textColor,
  },
  button: {
    backgroundColor: THEMES.light.tintColor,
    padding: APP_CONFIG.UI.SPACING.MEDIUM,
    borderRadius: APP_CONFIG.UI.BORDER_RADIUS.SMALL,
  },
  buttonText: {
    color: '#fff',
    fontSize: APP_CONFIG.UI.TYPOGRAPHY.MEDIUM,
  },
});