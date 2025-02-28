# Sentry Integration

This document describes the Sentry integration for error tracking, performance monitoring, and profiling in the AI Chat API Server.

## Overview

Sentry provides real-time error tracking, performance monitoring, and profiling capabilities. The integration helps identify and fix issues in production by providing detailed error reports, performance metrics, and profiling data.

## Features

- **Error Tracking**: Capture and report exceptions with detailed context
- **Performance Monitoring**: Track API endpoint performance with transaction tracing
- **Profiling**: Identify performance bottlenecks with code profiling
- **Environment Awareness**: Configure different settings for development, staging, and production
- **Context-Rich Reporting**: Include provider details, conversation IDs, and request metadata

## Configuration

Sentry is configured through environment variables in the `.env` file:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0
SENTRY_ENVIRONMENT=development
SENTRY_ENABLE_TRACING=true
SENTRY_SEND_DEFAULT_PII=true
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry Data Source Name (DSN) | Empty (disabled) |
| `SENTRY_TRACES_SAMPLE_RATE` | Percentage of transactions to sample (0.0 to 1.0) | 1.0 (100%) |
| `SENTRY_PROFILES_SAMPLE_RATE` | Percentage of transactions to profile (0.0 to 1.0) | 1.0 (100%) |
| `SENTRY_ENVIRONMENT` | Environment name (development, staging, production) | development |
| `SENTRY_ENABLE_TRACING` | Enable performance monitoring | true |
| `SENTRY_SEND_DEFAULT_PII` | Include personally identifiable information | true |

## Implementation Details

### Initialization

Sentry is initialized in `main.py` before the FastAPI application is created:

```python
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=SENTRY_ENVIRONMENT,
        send_default_pii=SENTRY_SEND_DEFAULT_PII,
        traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE if SENTRY_ENABLE_TRACING else 0.0,
        profiles_sample_rate=SENTRY_PROFILES_SAMPLE_RATE if SENTRY_ENABLE_TRACING else 0.0,
        integrations=[
            FastApiIntegration(),
        ],
        _experiments={
            "continuous_profiling_auto_start": True,
        },
    )
```

### Error Tracking

Errors are captured at multiple levels:

1. **FastAPI Integration**: Automatically captures unhandled exceptions in API endpoints
2. **Explicit Capture**: Manually captures exceptions with additional context
3. **Provider-Specific Errors**: Captures errors from AI providers with provider-specific context

Example of explicit error capture:

```python
try:
    # Code that might raise an exception
except Exception as e:
    logger.error(f"Error message: {str(e)}", exc_info=True)
    if SENTRY_DSN:
        sentry_sdk.set_context("additional_context", {
            "key": "value",
            "error_details": str(e)
        })
        sentry_sdk.capture_exception(e)
```

### Context and Tags

The integration adds rich context to error reports:

- **Tags**: Provider name, conversation ID, environment
- **Context**: Request details, provider settings, error information
- **Breadcrumbs**: Request path, duration, status code

### Testing the Integration

A debug endpoint is available to test the Sentry integration:

```
GET /sentry-debug
```

This endpoint intentionally triggers a division by zero error to verify that errors are properly reported to Sentry.

## Best Practices

1. **Use Different DSNs for Different Environments**: Create separate Sentry projects for development, staging, and production
2. **Adjust Sample Rates in Production**: Lower the sample rates in production to reduce costs
3. **Add Context to Errors**: Always add relevant context when capturing exceptions
4. **Review Sentry Alerts Regularly**: Set up alerts and review them regularly to identify and fix issues

## Troubleshooting

If errors are not appearing in Sentry:

1. Verify that `SENTRY_DSN` is correctly set
2. Check that the DSN is valid and the project exists in Sentry
3. Ensure that the server has internet access to send data to Sentry
4. Look for any initialization errors in the application logs

## References

- [Sentry Python SDK Documentation](https://docs.sentry.io/platforms/python/)
- [FastAPI Integration Documentation](https://docs.sentry.io/platforms/python/guides/fastapi/)
- [Performance Monitoring Documentation](https://docs.sentry.io/product/performance/)
- [Profiling Documentation](https://docs.sentry.io/product/profiling/) 