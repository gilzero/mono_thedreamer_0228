# AI Chat API Server

A FastAPI-based server providing a unified interface to multiple AI chat providers (GPT, Claude, and Gemini) with streaming responses.

## Features

- Multi-provider support (OpenAI/GPT, Anthropic/Claude, Google/Gemini)
- Server-Sent Events (SSE) streaming responses
- Automatic model fallback mechanism
- Comprehensive logging system
- Error tracking and performance monitoring with Sentry
- Health monitoring endpoints
- Input validation
- Environment-based configuration

## Project Structure

```
.
├── main.py                 # FastAPI application entry point
├── aiproviders.py          # High-level provider interface
├── models.py               # Data models and validation
├── configuration.py        # Centralized configuration management
├── logging_config.py       # Logging configuration
├── prompt_engineering.py   # System prompt management
├── providers/              # Provider implementations
│   ├── __init__.py         # Provider module exports
│   ├── factory.py          # Provider factory pattern implementation
│   ├── base.py             # Base provider abstract class
│   ├── openai_provider.py  # OpenAI/GPT implementation
│   ├── anthropic_provider.py # Anthropic/Claude implementation
│   ├── gemini_provider.py  # Google/Gemini implementation
│   └── groq_provider.py    # Groq implementation
├── static/                 # Static files for web interface
├── docs/                   # Documentation directory
├── tests/                  # Test suite
├── logs/                   # Log files directory
├── .env                    # Environment variables (not in repo)
└── .env.example            # Environment template
```

## Setup

0. Clone the repository, and navigate to the directory

1. Create and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configurations
   ```

2. Install venv (recommended 3.11+)
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python main.py
   ```

## Environment Configuration

Key configurations in `.env`:

```bash
# Server
PORT=3050

# API Keys
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GEMINI_API_KEY=your_key

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=development

# Models
OPENAI_MODEL_DEFAULT=gpt-4o
ANTHROPIC_MODEL_DEFAULT=claude-3-5-sonnet-latest
GEMINI_MODEL_DEFAULT=gemini-2.0-flash

# See .env.example for all configuration options
```

## API Endpoints

### Health Checks
```bash
# Overall health
GET /health

# Provider-specific health
GET /health/{provider}
```

### Chat
```bash
# Stream chat responses
POST /chat/{provider}

# Example request:
curl -X POST "http://localhost:3050/chat/gpt" \
     -H "Content-Type: application/json" \
     -d '{
           "messages": [
             {"role": "user", "content": "Hello!"}
           ]
         }'
```

### Sentry Debug
```bash
# Test Sentry error reporting
GET /sentry-debug
```

See [API Documentation](docs/api_docs.md) for detailed specifications.

## Model Selection Architecture

- Backend-controlled model selection
- Each provider has default and fallback models
- Model information included in response streams
- Automatic fallback on model failure
- Configuration via environment variables

## Provider Architecture

The application uses a factory pattern for managing AI providers:

- **BaseProvider**: Abstract base class that defines the interface for all providers
  - Handles common functionality like message formatting and error handling
  - Provides fallback mechanism between default and fallback models

- **Provider Implementations**: Each AI service has its own implementation
  - Handles provider-specific API calls and response formatting
  - Implements streaming and health check functionality

- **ProviderFactory**: Central manager for all provider instances
  - Maintains a registry of provider classes and instances
  - Handles lazy initialization of providers when first requested
  - Centralizes provider configuration and validation

This architecture makes it easy to:
- Add new providers without changing existing code
- Swap implementations without affecting the rest of the application
- Test providers in isolation
- Handle provider-specific error cases consistently

## Logging System

The application implements a comprehensive, structured logging system:

### Logging Levels and Files
- **app.log**: Information level and above - captures normal application flow
- **error.log**: Error level and above - captures exceptions and errors
- **debug.log**: Debug level with context - detailed diagnostic information
- **conversation.log**: Records user queries and AI responses for auditing

### Structured Logging Features
- **Context-Rich Logs**: All logs include timestamp, level, and contextual information
- **Request Tracing**: Each request gets a unique ID that's tracked across all logs
- **Performance Metrics**: Automatic logging of response times and resource usage
- **Conversation Tracking**: Complete conversation history with unique conversation IDs

### Request Correlation IDs
The application implements a robust request tracing system using correlation IDs:

- **Automatic ID Generation**: Each request receives a unique ID (UUID)
- **Header Propagation**: IDs are included in response headers as `X-Request-ID`
- **Client ID Support**: Clients can provide their own IDs via the `X-Request-ID` header
- **Cross-Component Tracing**: The ID follows the request through all components:
  - HTTP middleware
  - Route handlers
  - Provider calls
  - Error responses
  - Logs at all levels
  - Sentry error reports

This makes it possible to trace a single request through the entire system, even across multiple services or in high-volume environments.

Example of using request IDs for debugging:
```bash
# Client includes request ID
curl -X POST "http://localhost:3050/chat/gpt" \
     -H "Content-Type: application/json" \
     -H "X-Request-ID: debug-12345" \
     -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

# Then search logs for this specific request
grep "debug-12345" logs/app.log logs/debug.log logs/error.log logs/conversations.log
```

### Using Logs for Debugging
```python
# Example of using the structured logger in your code
from logging_config import logger, debug_with_context

# Simple logging
logger.info("Provider initialized")

# Context-rich logging
debug_with_context(logger,
    "Chat request received",
    provider="gpt",
    message_count=5,
    user_id="anonymous"
)
```

### Log Rotation and Management
- Logs are automatically rotated based on size (10MB default)
- Configurable retention policy (5 backup files by default)
- Environment-based log level configuration

See [Logging Documentation](docs/logs_doc.md) for complete details.

## Error Tracking and Performance Monitoring

The application implements a multi-layered approach to error handling and monitoring:

### Error Handling Strategy
- **Graceful Degradation**: Automatic fallback to alternative models when primary models fail
- **Structured Error Responses**: Consistent error format across all endpoints
- **Detailed Error Context**: Errors include provider, model, and request information
- **User-Friendly Messages**: Technical details are logged but user messages are simplified

### Sentry Integration
- **Real-time Error Tracking**: Automatic capture of exceptions with full context
- **Performance Monitoring**: Tracking of endpoint response times and bottlenecks
- **Code Profiling**: Identification of slow code paths and memory usage
- **Environment Segmentation**: Different environments (dev/prod) are tracked separately

### Implementing Error Handling in New Providers
When implementing a new provider, follow these error handling patterns:

```python
async def stream_response(self, messages, model, message_id):
    try:
        # Your provider-specific code here
        
    except ProviderAPIError as e:
        # Handle provider-specific API errors
        logger.error(f"Provider API error: {str(e)}", 
                    extra={"context": {"provider": self.provider_name, "model": model}})
        raise HTTPException(status_code=502, detail=f"Provider API error: {str(e)}")
        
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error in {self.provider_name} provider", exc_info=True)
        if sentry_sdk.Hub.current.client:
            sentry_sdk.set_context("provider_details", {
                "provider": self.provider_name,
                "model": model
            })
            sentry_sdk.capture_exception(e)
        raise
```

### Monitoring Dashboard
- Sentry provides a real-time dashboard for monitoring errors and performance
- Custom metrics can be added to track provider-specific performance
- Alerts can be configured for critical errors or performance degradation

See [Sentry Integration Documentation](docs/sentry_integration.md) for configuration details.

## Development

### Adding New Provider

After our code refactoring, adding a new provider is now more straightforward:

1. **Create a new provider class**:
   - Create a new file in the `providers/` directory (e.g., `providers/new_provider.py`)
   - Implement a class that inherits from `BaseProvider` and implements all required methods
   - Example structure:
     ```python
     # providers/new_provider.py
     from typing import List, Dict, Any, AsyncGenerator
     from .base import BaseProvider
     
     class NewProvider(BaseProvider):
         def __init__(self, api_key, default_model, fallback_model, temperature, max_tokens, system_prompt):
             super().__init__("new_provider_name", default_model, fallback_model, temperature, max_tokens, system_prompt)
             # Initialize your provider-specific client here
             self.client = YourProviderClient(api_key=api_key)
         
         async def stream_response(self, messages, model, message_id):
             # Implement streaming logic here
             pass
         
         async def health_check(self, model, test_message):
             # Implement health check logic here
             pass
     ```

2. **Update the provider factory**:
   - Import your new provider class in `providers/factory.py`
   - Add it to the `_provider_classes` dictionary in `ProviderFactory`
     ```python
     # In providers/factory.py
     from providers.new_provider import NewProvider
     
     class ProviderFactory:
         # ...
         _provider_classes: Dict[str, Type[BaseProvider]] = {
             'gpt': OpenAIProvider,
             'claude': AnthropicProvider,
             'gemini': GeminiProvider,
             'groq': GroqProvider,
             'new_provider_name': NewProvider  # Add your new provider here
         }
         # ...
     ```

3. **Add provider configuration**:
   - Add the necessary environment variables to `.env.example` and your `.env` file:
     ```
     # New Provider Configuration
     NEW_PROVIDER_API_KEY=your_key
     NEW_PROVIDER_MODEL_DEFAULT=model-name
     NEW_PROVIDER_MODEL_FALLBACK=fallback-model-name
     NEW_PROVIDER_TEMPERATURE=0.3
     NEW_PROVIDER_MAX_TOKENS=8192
     NEW_PROVIDER_SYSTEM_PROMPT=You are a helpful AI assistant...
     ```

4. **Update configuration.py**:
   - Add your provider to `VALID_PROVIDERS` list
   - Add your provider settings to `PROVIDER_SETTINGS` dictionary
     ```python
     # In configuration.py
     VALID_PROVIDERS = ["gpt", "claude", "gemini", "groq", "new_provider_name"]
     
     # Add after other provider settings
     NEW_PROVIDER_API_KEY = os.getenv("NEW_PROVIDER_API_KEY")
     NEW_PROVIDER_MODEL_DEFAULT = os.getenv("NEW_PROVIDER_MODEL_DEFAULT", "default-model")
     NEW_PROVIDER_MODEL_FALLBACK = os.getenv("NEW_PROVIDER_MODEL_FALLBACK", "fallback-model")
     NEW_PROVIDER_TEMPERATURE = float(os.getenv("NEW_PROVIDER_TEMPERATURE", 0.3))
     NEW_PROVIDER_MAX_TOKENS = int(os.getenv("NEW_PROVIDER_MAX_TOKENS", 8192))
     NEW_PROVIDER_SYSTEM_PROMPT = os.getenv("NEW_PROVIDER_SYSTEM_PROMPT", "You are a helpful AI assistant...")
     
     # Add to PROVIDER_SETTINGS
     PROVIDER_SETTINGS = {
         # ... existing providers ...
         'new_provider_name': {
             'api_key': NEW_PROVIDER_API_KEY,
             'default_model': NEW_PROVIDER_MODEL_DEFAULT,
             'fallback_model': NEW_PROVIDER_MODEL_FALLBACK,
             'temperature': NEW_PROVIDER_TEMPERATURE,
             'max_tokens': NEW_PROVIDER_MAX_TOKENS,
             'system_prompt': NEW_PROVIDER_SYSTEM_PROMPT
         }
     }
     ```

5. **Update SUPPORTED_PROVIDERS** (optional):
   - If you want your provider to be enabled by default, add it to the default value in `configuration.py`:
     ```python
     SUPPORTED_PROVIDERS = os.getenv("SUPPORTED_PROVIDERS", "gpt,claude,gemini,groq,new_provider_name").split(",")
     ```

6. **Add dependencies**:
   - Add any required packages to `requirements.txt`

7. **Test your provider**:
   - Create tests in the `tests/` directory
   - Test both the health check and chat endpoints

8. **Update documentation**:
   - Update API documentation to include your new provider
   - Add any provider-specific notes or limitations

No changes to `aiproviders.py` or other core files are needed thanks to our factory pattern implementation!

### Running Tests
```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. -v

# run with coverage and generate html report
pip install coverage

  
coverage run -m pytest


(Generate a Coverage Report:)
coverage report -m

coverage html
(Then open htmlcov/index.html in a browser.)
```

## Documentation

- [API Documentation](docs/api_docs.md)
- [Data Models](docs/data_models_docs.md)
- [File Structure](docs/file_structure_docs.md)
- [Logging System](docs/logs_doc.md)
- [Sentry Integration](docs/sentry_integration.md)
- [Integration Examples](docs/api_integration_examples.md)
- [Test Documentation](docs/test_aiproviders_docs.md)

## Known Issues

1. Response Truncation:
   - In some cases, the beginning of the response may be truncated
   - Under investigation

2. Frontend/Backend Model Field:
   - Frontend may send 'model' field
   - Backend intentionally ignores model selection
   - Use model information from response streams

## License

MIT License

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests.

## Author

This project is developed by [Weiming](https://weiming.ai).

## Roadmap

- [ ] Add more providers
- [ ] Add more tests
- [ ] Add more documentation
- [ ] Add more examples

## Todo

- [ ] Known issue to fix: beginning of the ai response truncation (not sure backend or frontend issue)
- [ ] todo 2 
- [ ] todo 3 
- [ ] todo 4 
- [ ] todo 5 
- [ ] todo 6 
- [ ] todo 7 
- [ ] todo 8 

## Last Updated

Last updated: 2025-02-22 10:55:18 UTC+0800 shark galaxy

Last updated: 2025-02-22 10:55:23 UTC+0800 dragon comet

Last updated: 2025-02-22 10:56:45 UTC+0800 kangaroo comet

Last updated: 2025-02-22 10:56:57 UTC+0800 bison meteor

Last updated: 2025-02-22 11:03:35 UTC+0800 penguin meteor

Last updated: 2025-02-22 11:03:56 UTC+0800 crocodile meteor

Last updated: 2025-02-22 11:04:42 UTC+0800 iguana star

Last updated: 2025-02-22 11:05:00 UTC+0800 shark cosmos
