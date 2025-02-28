// filepath: src/utils/errorHandler.ts
// fileoverview: Centralized error handling utility for the application
import { logError, logException } from './logger';
import { APP_CONFIG } from '../config';
import * as Sentry from '@sentry/react-native';

// Define error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Define error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Define error interface
export interface AppError {
  message: string;
  code: string;
  type: ErrorType;
  severity: ErrorSeverity;
  originalError?: Error | undefined;
  metadata?: Record<string, any> | undefined;
}

// Create a custom error class
export class ApplicationError extends Error implements AppError {
  code: string;
  type: ErrorType;
  severity: ErrorSeverity;
  originalError?: Error | undefined;
  metadata?: Record<string, any> | undefined;

  constructor({
    message,
    code = 'UNKNOWN_ERROR',
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.MEDIUM,
    originalError,
    metadata,
  }: Partial<AppError> & { message: string }) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.metadata = metadata;
  }
}

// Function to handle errors
export function handleError(error: Error | AppError | unknown, context?: string): AppError {
  let appError: AppError;

  // Convert to AppError if it's not already
  if (error instanceof ApplicationError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new ApplicationError({
      message: error.message,
      originalError: error,
    });
  } else {
    appError = new ApplicationError({
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
    });
  }

  // Log the error
  logException(
    appError.originalError || new Error(appError.message),
    context || 'Error Handler'
  );

  // Send to Sentry
  Sentry.captureException(appError.originalError || new Error(appError.message), {
    contexts: {
      error: {
        type: appError.type,
        severity: appError.severity,
        code: appError.code,
        context: context || 'Error Handler'
      }
    },
    extra: appError.metadata || {}
  });

  return appError;
}

// Network error handler
export function handleNetworkError(error: Error, endpoint?: string): AppError {
  const networkError = new ApplicationError({
    message: APP_CONFIG.ERRORS.NETWORK.FAILED,
    code: 'NETWORK_ERROR',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    originalError: error,
    metadata: { endpoint },
  });

  logError(`Network error: ${error.message}`, { endpoint });
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      error: {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        code: 'NETWORK_ERROR',
      }
    },
    extra: endpoint ? { endpoint } : {}
  });

  return networkError;
}

// Validation error handler
export function handleValidationError(error: Error, field?: string): AppError {
  const validationError = new ApplicationError({
    message: error.message || APP_CONFIG.ERRORS.VALIDATION.GENERIC,
    code: 'VALIDATION_ERROR',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    originalError: error,
    metadata: { field },
  });

  logError(`Validation error: ${error.message}`, { field });
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      error: {
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        code: 'VALIDATION_ERROR',
      }
    },
    extra: field ? { field } : {}
  });

  return validationError;
}

// Server error handler
export function handleServerError(error: Error, endpoint?: string): AppError {
  const serverError = new ApplicationError({
    message: APP_CONFIG.ERRORS.SERVER.GENERIC,
    code: 'SERVER_ERROR',
    type: ErrorType.SERVER,
    severity: ErrorSeverity.HIGH,
    originalError: error,
    metadata: { endpoint },
  });

  logError(`Server error: ${error.message}`, { endpoint });
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      error: {
        type: ErrorType.SERVER,
        severity: ErrorSeverity.HIGH,
        code: 'SERVER_ERROR',
      }
    },
    extra: endpoint ? { endpoint } : {}
  });

  return serverError;
}

// Authentication error handler
export function handleAuthError(error: Error): AppError {
  const authError = new ApplicationError({
    message: APP_CONFIG.ERRORS.AUTH.FAILED,
    code: 'AUTH_ERROR',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    originalError: error,
  });

  logError(`Authentication error: ${error.message}`);
  
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      error: {
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        code: 'AUTH_ERROR',
      }
    },
    extra: {}
  });

  return authError;
}

// Export a global error handler for unhandled errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  const handleUnhandledRejection = (error: any) => {
    logError('Unhandled Promise Rejection', error);
    Sentry.captureException(error, {
      contexts: {
        error: {
          type: ErrorType.UNKNOWN,
          context: 'Unhandled Promise Rejection'
        }
      },
      extra: {}
    });
  };

  // Handle uncaught exceptions
  const handleUncaughtException = (error: Error) => {
    logError('Uncaught Exception', error);
    Sentry.captureException(error, {
      contexts: {
        error: {
          type: ErrorType.UNKNOWN,
          context: 'Uncaught Exception'
        }
      },
      extra: {}
    });
  };

  // Set up global handlers
  if (typeof global !== 'undefined') {
    // @ts-ignore
    global.onunhandledrejection = handleUnhandledRejection;
  }

  return {
    handleUnhandledRejection,
    handleUncaughtException,
  };
} 