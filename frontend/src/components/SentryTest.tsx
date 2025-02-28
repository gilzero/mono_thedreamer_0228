import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { handleError } from '../utils/errorHandler';

/**
 * A component to test Sentry integration.
 * This component provides buttons to trigger different types of errors
 * to verify that they are properly captured by Sentry.
 */
export const SentryTest: React.FC = () => {
  const triggerTestError = () => {
    try {
      // Deliberately throw an error for testing
      throw new Error('This is a test error for Sentry');
    } catch (error) {
      if (error instanceof Error) {
        // Use our error handling system which will send to Sentry
        handleError(error, 'SentryTest');
      }
    }
  };

  const triggerUnhandledPromiseRejection = () => {
    // This will trigger an unhandled promise rejection
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Test unhandled promise rejection'));
      }, 100);
    });
  };

  const triggerSentryDirectly = () => {
    // Send an event directly to Sentry
    Sentry.captureMessage('Test message from SentryTest component', {
      level: 'error'
    });
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Trigger Test Error" 
        onPress={triggerTestError} 
      />
      <View style={styles.spacer} />
      <Button 
        title="Trigger Unhandled Promise Rejection" 
        onPress={triggerUnhandledPromiseRejection} 
      />
      <View style={styles.spacer} />
      <Button 
        title="Send Direct to Sentry" 
        onPress={triggerSentryDirectly} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  spacer: {
    height: 16,
  },
});

export default SentryTest; 