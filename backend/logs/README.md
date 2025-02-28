# Logs Directory

This directory contains the application logs for the Python server.

## Log Files

- `app.log`: Contains all application logs (INFO level and above)
- `error.log`: Contains only error logs (ERROR level and above)

Both log files are configured with rotation:
- Maximum file size: 10MB
- Keeps up to 5 backup files

## Log Format

Logs are formatted as:

