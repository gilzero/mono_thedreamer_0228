// filepath: src/utils/logger.ts
// fileoverview: Advanced logging utility for the application
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// Define log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  HTTP = 3,
  DEBUG = 4,
}

// Log level names
const LOG_LEVEL_NAMES = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.HTTP]: 'HTTP',
  [LogLevel.DEBUG]: 'DEBUG',
};

// Sentry level mapping
const SENTRY_LEVEL_MAP = {
  [LogLevel.ERROR]: 'error',
  [LogLevel.WARN]: 'warning',
  [LogLevel.INFO]: 'info',
  [LogLevel.HTTP]: 'info',
  [LogLevel.DEBUG]: 'debug',
};

// Configuration
const LOG_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  LOG_DIR: 'logs',
  CURRENT_LEVEL: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  SENTRY_MIN_LEVEL: __DEV__ ? LogLevel.ERROR : LogLevel.WARN, // Only send ERROR and WARN to Sentry in production
  // Disable file logging in Expo Go to avoid permission errors
  DISABLE_FILE_LOGGING: __DEV__ && Platform.OS === 'ios',
};

// Log file paths
const LOG_FILES = {
  ERROR: 'error.log',
  INFO: 'info.log',
  DEBUG: 'debug.log',
};

// Class to handle log rotation
class LogRotator {
  private logDir: string;
  
  constructor(baseDir: string) {
    this.logDir = `${baseDir}${LOG_CONFIG.LOG_DIR}`;
  }

  async ensureLogDirectoryExists(): Promise<void> {
    // Skip if file logging is disabled
    if (LOG_CONFIG.DISABLE_FILE_LOGGING) return;
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.logDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.logDir, { intermediates: true });
        console.log(`Created log directory at ${this.logDir}`);
      }
    } catch (error) {
      console.error('Failed to ensure log directory exists:', error);
    }
  }

  getLogFilePath(logType: string): string {
    return `${this.logDir}/${logType}`;
  }

  async rotateLogIfNeeded(logFile: string): Promise<void> {
    // Skip if file logging is disabled
    if (LOG_CONFIG.DISABLE_FILE_LOGGING) return;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      
      if (fileInfo.exists && fileInfo.size >= LOG_CONFIG.MAX_FILE_SIZE) {
        // Get current date for rotation
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Create rotated file name
        const rotatedFile = `${logFile}.${timestamp}`;
        
        // Copy current log to rotated file
        await FileSystem.copyAsync({
          from: logFile,
          to: rotatedFile
        });
        
        // Clear the current log file
        await FileSystem.writeAsStringAsync(logFile, '');
        
        // Clean up old log files
        await this.cleanupOldLogs(logFile);
      }
    } catch (error) {
      console.error(`Failed to rotate log file ${logFile}:`, error);
    }
  }

  async cleanupOldLogs(baseLogFile: string): Promise<void> {
    // Skip if file logging is disabled
    if (LOG_CONFIG.DISABLE_FILE_LOGGING) return;
    
    try {
      // Get all files in the log directory
      const dirContents = await FileSystem.readDirectoryAsync(this.logDir);
      
      // Filter for rotated versions of this log file
      const baseFileName = baseLogFile.split('/').pop();
      const rotatedLogs = dirContents
        .filter(file => file.startsWith(`${baseFileName}.`))
        .map(file => `${this.logDir}/${file}`);
      
      // Sort by modification time (oldest first)
      const fileInfos = await Promise.all(
        rotatedLogs.map(async file => {
          const info = await FileSystem.getInfoAsync(file);
          const modTime = info.exists ? info.modificationTime || 0 : 0;
          return { file, modTime };
        })
      );
      
      fileInfos.sort((a, b) => a.modTime - b.modTime);
      
      // Delete oldest files if we have more than MAX_FILES
      if (fileInfos.length > LOG_CONFIG.MAX_FILES) {
        const filesToDelete = fileInfos.slice(0, fileInfos.length - LOG_CONFIG.MAX_FILES);
        for (const fileInfo of filesToDelete) {
          await FileSystem.deleteAsync(fileInfo.file);
        }
      }
    } catch (error) {
      console.error('Failed to clean up old log files:', error);
    }
  }
}

// Main Logger class
class Logger {
  private rotator: LogRotator | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Skip file-based initialization if file logging is disabled
      if (LOG_CONFIG.DISABLE_FILE_LOGGING) {
        this.initialized = true;
        return;
      }
      
      const documentDirectory = FileSystem.documentDirectory;
      if (!documentDirectory) {
        console.error('Document directory not available');
        return;
      }

      this.rotator = new LogRotator(documentDirectory);
      await this.rotator.ensureLogDirectoryExists();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  private async writeToLog(level: LogLevel, message: string, meta?: any): Promise<void> {
    if (!this.initialized) {
      // If not initialized yet, queue the log or retry
      setTimeout(() => this.writeToLog(level, message, meta), 100);
      return;
    }

    // Skip if log level is higher than current level
    if (level > LOG_CONFIG.CURRENT_LEVEL) {
      return;
    }

    // Format the log entry for console output
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const logEntry = `${timestamp} ${levelName}: ${message}${metaStr}`;
    
    // Always log to console
    if (level === LogLevel.ERROR) {
      console.error(logEntry);
    } else if (level === LogLevel.WARN) {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }
    
    // Send to Sentry if appropriate
    if (level <= LOG_CONFIG.SENTRY_MIN_LEVEL) {
      Sentry.captureMessage(message, {
        level: SENTRY_LEVEL_MAP[level] as Sentry.SeverityLevel,
        extra: meta,
      });
    }
    
    // Skip file logging if disabled
    if (LOG_CONFIG.DISABLE_FILE_LOGGING || !this.rotator) {
      return;
    }

    try {
      // Determine which log file to write to
      let logFile: string;
      if (level === LogLevel.ERROR) {
        logFile = this.rotator.getLogFilePath(LOG_FILES.ERROR);
      } else if (level <= LogLevel.INFO) {
        logFile = this.rotator.getLogFilePath(LOG_FILES.INFO);
      } else {
        logFile = this.rotator.getLogFilePath(LOG_FILES.DEBUG);
      }

      // Check if log needs rotation
      await this.rotator.rotateLogIfNeeded(logFile);

      // Add newline for file storage
      const fileLogEntry = logEntry + '\n';
      
      // Try to read existing content
      let existingContent = '';
      try {
        existingContent = await FileSystem.readAsStringAsync(logFile, {
          encoding: FileSystem.EncodingType.UTF8
        });
      } catch (error) {
        // File might not exist yet, which is fine
      }

      // Concatenate new log entry
      const updatedContent = existingContent + fileLogEntry;
      
      // Write to file
      await FileSystem.writeAsStringAsync(logFile, updatedContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
    } catch (error) {
      // If file operations fail, just log to console and don't throw
      console.error(`Failed to write to log file: ${error}`);
    }
  }

  // Public logging methods
  async error(message: string, meta?: any): Promise<void> {
    return this.writeToLog(LogLevel.ERROR, message, meta);
  }

  async warn(message: string, meta?: any): Promise<void> {
    return this.writeToLog(LogLevel.WARN, message, meta);
  }

  async info(message: string, meta?: any): Promise<void> {
    return this.writeToLog(LogLevel.INFO, message, meta);
  }

  async http(message: string, meta?: any): Promise<void> {
    return this.writeToLog(LogLevel.HTTP, message, meta);
  }

  async debug(message: string, meta?: any): Promise<void> {
    return this.writeToLog(LogLevel.DEBUG, message, meta);
  }

  async exception(error: Error, context?: string): Promise<void> {
    const message = context ? `${context}: ${error.message}` : error.message;
    await this.error(message, { stack: error.stack });
    
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        error: {
          context: context || 'unknown'
        }
      },
      extra: {
        stack: error.stack
      }
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Export convenience methods
export const logError = (message: string, meta?: any): void => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any): void => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any): void => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any): void => {
  logger.debug(message, meta);
};

export const logException = (error: Error, context?: string): void => {
  logger.exception(error, context);
};

// Export the logger instance
export default logger; 