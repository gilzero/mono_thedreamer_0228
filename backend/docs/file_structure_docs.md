# Project File Structure Documentation

## Directory Structure
```
.
├── main.py                     # FastAPI application entry point
├── aiproviders.py             # AI provider implementations
├── models.py                  # Data models and validation
├── logging_config.py          # Logging configuration
├── .env                       # Environment variables (not in repo)
├── .env.example              # Environment template
│
├── docs/                      # Documentation directory
│   ├── api_docs.md           # API endpoint documentation
│   ├── api_integration_examples.md  # Integration examples
│   ├── data_models_docs.md   # Data models documentation
│   └── file_structure_docs.md      # This file
│
└── logs/                      # Log files directory
    ├── app.log               # Information level logs
    ├── error.log            # Error level logs
    ├── debug.log            # Debug level logs
    ├── app.log.1            # Rotated log files
    ├── error.log.1
    └── debug.log.1
```

## Core Files

### Main Application Files
- `main.py` - FastAPI application entry point, route definitions, and middleware
- `aiproviders.py` - AI provider implementations and streaming logic
- `models.py` - Pydantic models and data validation
- `logging_config.py` - Custom logging configuration

### Configuration
- `.env` - Environment variables (not in repo)
- `.env.example` - Example environment variable template

## Documentation
- `docs/`
  - `api_docs.md` - API endpoint documentation
  - `api_integration_examples.md` - Code examples for different languages
  - `data_models_docs.md` - Data model documentation
  - `file_structure_docs.md` - This file structure documentation

## Logs
- `logs/` - Log file directory
  - `app.log` - Information level logs
  - `error.log` - Error level logs
  - `debug.log` - Debug level logs with context
  - `*.log.[1-5]` - Rotated log files

## File Details

### main.py
- FastAPI application setup
- CORS middleware configuration
- Route definitions:
  - Health check endpoints
  - Chat endpoint
- Request logging middleware
- Error handling

### aiproviders.py
- AI provider client initialization
- Provider-specific implementations:
  - GPT (OpenAI)
  - Claude (Anthropic)
  - Gemini (Google)
- Streaming response handling
- Model selection and fallback logic
- System prompt management

### models.py
- Pydantic model definitions:
  - ChatRequest
  - ConversationMessage
  - MessageRole (enum)
  - HealthResponse
- Input validation rules
- Message length and count limits

### logging_config.py
- Custom logging formatter
- Three-tier logging setup:
  - Info level (app.log)
  - Error level (error.log)
  - Debug level (debug.log)
- Log rotation configuration
- Context-based debug logging

### .env.example
Configuration template including:
- API keys
- Model configurations
- Server settings
- Message validation limits
- System prompts
- Temperature settings
- Token limits

## Environment Variables

### Server Configuration
- `PORT` - Server port (default: 3050)

### API Keys
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

### Model Configuration
- `OPENAI_MODEL_DEFAULT`/`FALLBACK`
- `ANTHROPIC_MODEL_DEFAULT`/`FALLBACK`
- `GEMINI_MODEL_DEFAULT`/`FALLBACK`

### Model Parameters
- `OPENAI_TEMPERATURE`/`MAX_TOKENS`
- `ANTHROPIC_TEMPERATURE`/`MAX_TOKENS`
- `GEMINI_TEMPERATURE`/`MAX_TOKENS`

### System Prompts
- `GENERIC_SYSTEM_PROMPT`
- `GPT_SYSTEM_PROMPT`
- `CLAUDE_SYSTEM_PROMPT`
- `GEMINI_SYSTEM_PROMPT`

### Validation Limits
- `MAX_MESSAGE_LENGTH`
- `MAX_MESSAGES_IN_CONTEXT`

## Logging Structure

### Log Files
Each log file serves a specific purpose:

1. **app.log**
   - General application information
   - Request/response tracking
   - Provider operations

2. **error.log**
   - Error messages
   - Stack traces
   - Provider failures

3. **debug.log**
   - Detailed debug information
   - Context data
   - Performance metrics

### Log Rotation
- Maximum file size: 10MB
- Backup count: 5 files
- Naming pattern: `{filename}.log.{1-5}`

## Development Guidelines

### Adding New Features
1. Update relevant models in `models.py`
2. Implement provider-specific logic in `aiproviders.py`
3. Add routes in `main.py`
4. Update documentation in `docs/`
5. Add environment variables to `.env.example`

### Adding New Provider
1. Add provider configuration to `.env.example`
2. Update `SUPPORTED_PROVIDERS` in environment
3. Add provider models to `PROVIDER_MODELS`
4. Implement provider-specific streaming in `aiproviders.py`
5. Update documentation

### Logging Best Practices
1. Use `debug_with_context` for detailed debugging
2. Include relevant context in error logs
3. Use appropriate log levels:
   - DEBUG: Detailed information
   - INFO: General operations
   - ERROR: Failures and exceptions
