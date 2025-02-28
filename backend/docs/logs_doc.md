# Logging Documentation

## Overview

The application uses a custom three-tier logging system with context support and automatic log rotation.

## Log Files Structure

```
logs/
├── app.log         # Information level logs
├── error.log       # Error level logs
├── debug.log       # Debug level logs with context
├── app.log.1       # Rotated logs
├── error.log.1     # (up to 5 backup files)
└── debug.log.1
```

## Log Levels and Usage

### 1. Information Level (app.log)
- General application operations
- Request/response tracking
- Provider operations
- Model selection events

Example:
```log
2024-03-20T10:15:30.123Z - root - INFO - Health check endpoint called
2024-03-20T10:15:31.456Z - root - INFO - Provider health check called for: gpt
```

### 2. Error Level (error.log)
- Application errors
- Provider API errors
- Validation failures
- Connection issues

Example:
```log
2024-03-20T10:16:45.789Z - root - ERROR - Chat endpoint error: API key invalid
2024-03-20T10:16:46.012Z - root - ERROR - Provider gpt health check failed
```

### 3. Debug Level (debug.log)
- Detailed debugging information
- Request context
- Performance metrics
- System state

Example with context:
```log
2024-03-20T10:17:12.345Z - root - DEBUG - Request completed: POST /chat/gpt
Context: {
  "duration": "1.234s",
  "status_code": 200,
  "client_host": "192.168.1.1"
}
```

## Custom Formatter

The `CustomFormatter` class provides:
- Timezone-aware UTC timestamps
- JSON-formatted context for debug logs
- Structured log output

```python
record.timestamp = datetime.now(timezone.utc).isoformat()
```

## Context-Based Debugging

### Using debug_with_context
```python
debug_with_context(logger,
    "Provider health check completed",
    duration="1.234s",
    success=True,
    message="Model responding correctly",
    model="gpt-4o"
)
```

### Context Fields
Common context fields include:
- `duration`: Operation timing
- `provider`: AI provider name
- `model`: Model used
- `status_code`: HTTP status
- `client_host`: Client IP
- `message_count`: Number of messages
- `error_type`: Type of error (if applicable)

## Log Rotation

### Configuration
- Maximum file size: 10MB (10,485,760 bytes)
- Backup count: 5 files
- Encoding: UTF-8
- Rotation naming: `{filename}.log.{1-5}`

### Rotation Process
1. When log file reaches max size:
   - Current file renamed to `.log.1`
   - Previous `.log.1` becomes `.log.2`
   - And so on up to `.log.5`
2. Oldest log (`.log.5`) is deleted if exists
3. New log file created with original name

## Implementation Details

### Logger Setup
```python
def setup_logging(
    log_dir: str = "logs",
    logger_name: Optional[str] = None,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 5,
    log_format: str = '%(timestamp)s - %(name)s - %(levelname)s - %(message)s',
    clear_handlers: bool = True
) -> logging.Logger
```

### Debug Context Helper
```python
def debug_with_context(
    logger: logging.Logger,
    message: str,
    **context: Any
) -> None
```

## Best Practices

1. **General Logging**
   - Use appropriate log levels
   - Include relevant context
   - Keep messages clear and concise

2. **Error Logging**
   - Include exception details
   - Add system state context
   - Log stack traces when needed

3. **Debug Logging**
   - Use `debug_with_context` for detailed debugging
   - Include performance metrics
   - Add request/response details

4. **Context Usage**
   - Keep context data relevant
   - Use consistent field names
   - Avoid sensitive information

## Log Maintenance

1. **Rotation Management**
   - Logs automatically rotate at 10MB
   - Keep 5 backup files
   - Older logs automatically deleted

2. **Directory Structure**
   - Maintain `logs/` directory
   - Ensure write permissions
   - Monitor disk space

3. **Log Cleanup**
   - Automated via rotation
   - Manual cleanup if needed
   - Archive old logs if required
