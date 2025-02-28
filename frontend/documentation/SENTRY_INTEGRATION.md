# Sentry Integration Guide

This document provides information on how Sentry has been integrated into the application for error tracking and monitoring.

## Overview

[Sentry](https://sentry.io) is an error tracking and performance monitoring platform that helps developers identify and fix issues in real-time. Our application uses Sentry to:

1. Track and report unhandled exceptions
2. Monitor application performance
3. Capture custom errors and events
4. Provide breadcrumbs for debugging

## Configuration

Sentry is configured in `src/App.tsx` with the following settings:

```typescript
Sentry.init({
  dsn: 'https://9c08d89bdd154f620ff60553b32520c1@o4507451374370816.ingest.us.sentry.io/4508892284911616',
  environment: __DEV__ ? 'development' : 'production',
  enableTracing: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  autoSessionTracking: true,
  debug: __DEV__,
  enableNative: true,
  enableAutoPerformanceTracing: true,
});
```

## Integration with Error Handling

The application's error handling system (`src/utils/errorHandler.ts`) has been integrated with Sentry to automatically report errors with appropriate context:

- All error handlers (`handleNetworkError`, `handleValidationError`, etc.) report to Sentry
- Global error handlers for unhandled promise rejections and exceptions report to Sentry
- The `ErrorBoundary` component reports React rendering errors to Sentry

## Integration with Logging

The application's logging system (`src/utils/logger.ts`) has been integrated with Sentry:

- Error and warning logs are sent to Sentry as breadcrumbs
- The `exception` method in the logger reports to both the local log files and Sentry

## Usage

### Reporting Errors

To report errors to Sentry, use the existing error handling utilities:

```typescript
import { handleError } from '../utils/errorHandler';

try {
  // Some code that might throw an error
} catch (error) {
  if (error instanceof Error) {
    handleError(error, 'ContextName');
  }
}
```

### Adding Custom Events

To add custom events to Sentry:

```typescript
import * as Sentry from '@sentry/react-native';

// Capture a message
Sentry.captureMessage('Something happened', {
  level: 'info' // 'info', 'warning', or 'error'
});

// Add a breadcrumb
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info'
});
```

### User Identification

To associate errors with specific users:

```typescript
import * as Sentry from '@sentry/react-native';

// Set user information
Sentry.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'username'
});

// Clear user information (e.g., on logout)
Sentry.setUser(null);
```

## Testing Sentry Integration

A `SentryTest` component is available to test the Sentry integration:

```typescript
import { SentryTest } from '../components';

// In your component:
<SentryTest />
```

This component provides buttons to:
- Trigger a test error
- Trigger an unhandled promise rejection
- Send a direct message to Sentry

## Expo Go Limitations

When running the app in Expo Go, some Sentry features are limited:

- Offline caching is not available
- Native error reporting is limited
- Some native crash reporting features won't work

For full Sentry functionality, use EAS Build or a native release build:

```bash
# Create a development build with EAS
eas build --platform ios --profile development
```

## Known Issues and Troubleshooting

### Multiple Promise Package Versions

The application may show a warning about multiple versions of the "promise" package:

```
WARN Sentry Logger [warn]: You appear to have multiple versions of the "promise" package installed.
```

This occurs because different dependencies use different versions of the promise package:
- React Native uses promise@8.3.0
- React Native Web (via fbjs) uses promise@7.3.1

To resolve this issue, you can use one of these approaches:

1. Add a resolution in package.json:
```json
{
  "resolutions": {
    "promise": "8.3.0"
  }
}
```

2. Install the specific version directly:
```bash
npm install promise@8.3.0 --save-exact
```

## iOS Sandboxing Considerations

Due to iOS sandboxing restrictions:

1. Logs are stored in the app's sandbox directory
2. Log files are rotated to prevent excessive storage usage
3. Background operations might be interrupted, but Sentry will queue events and send them when possible

## Viewing Errors in Sentry Dashboard

To view reported errors and events:

1. Log in to [Sentry](https://sentry.io)
2. Navigate to the `gilzero/rnapp0210` project
3. View issues, performance data, and session information

## Additional Resources

- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [Sentry API Reference](https://docs.sentry.io/api/)
- [Sentry Troubleshooting Guide](https://docs.sentry.io/platforms/react-native/troubleshooting/) 