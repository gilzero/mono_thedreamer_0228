# Application Logs

logs are likely  not  in  this  directory, because  of iOS  system  sandboxing.

Alternative, consider  use  of  third-party  logging  libraries  like  sentry:
https://sentry.io/

## Log Files

The application generates the following log files:

- `info.log`: Contains informational messages about the application's operation
- `debug.log`: Contains detailed debug information for troubleshooting
- `error.log`: Contains error messages and stack traces

## Log Rotation

Log files are automatically rotated with the following settings:
- Maximum file size: 5MB
- Maximum number of files: 5 per log level

When a log file reaches its maximum size, it is renamed with a timestamp (e.g., `info.log.2023-05-15_14-30`) and a new log file is created.

## Log Format

Each log entry follows this format:
```
YYYY-MM-DDTHH:mm:ss.sssZ LEVEL: MESSAGE [METADATA]
```

## Log Levels

The application uses the following log levels (from highest to lowest priority):
1. ERROR
2. WARN
3. INFO
4. HTTP
5. DEBUG

In production, only logs with level 'INFO' and above are recorded. 