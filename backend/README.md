# AI Chat API Server (backend)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.8-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A FastAPI-based server providing a unified interface to multiple AI chat providers (GPT, Claude, Gemini, and Groq) with streaming responses.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
- [API Endpoints](#api-endpoints)
- [API Documentation](#api-documentation)
- [Validation Rules](#validation-rules)
- [Error Responses](#error-responses)
- [Model Selection Architecture](#model-selection-architecture)
- [Provider Architecture](#provider-architecture)
- [Data Models](#data-models)
- [Logging System](#logging-system)
- [Error Tracking and Performance Monitoring](#error-tracking-and-performance-monitoring)
- [API Integration Examples](#api-integration-examples)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)
- [License](#license)
- [Contributing](#contributing)
- [Author](#author)
- [Roadmap](#roadmap)

## Features

- ✅ **Multi-provider support**: OpenAI/GPT, Anthropic/Claude, Google/Gemini, and Groq
- ✅ **Server-Sent Events (SSE)**: Real-time streaming responses
- ✅ **Automatic model fallback**: Graceful degradation when primary models fail
- ✅ **Comprehensive logging**: Structured logs with context and request tracing
- ✅ **Error tracking**: Sentry integration for monitoring and alerting
- ✅ **Health monitoring**: Endpoints for system and provider health checks
- ✅ **Input validation**: Robust validation with clear error messages
- ✅ **Environment-based configuration**: Flexible deployment options

## Project Structure

```
.
├── main.py                 # FastAPI application entry point
├── aiproviders.py          # High-level provider interface
├── models.py               # Data models and validation
├── configuration.py        # Centralized configuration management
├── logging_config.py       # Logging configuration
├── prompt_engineering.py   # System prompt management
├── constants.py            # Constant values used across the application
├── providers/              # Provider implementations
│   ├── __init__.py         # Provider module exports
│   ├── factory.py          # Provider factory pattern implementation
│   ├── base.py             # Base provider abstract class
│   ├── openai_provider.py  # OpenAI/GPT implementation
│   ├── anthropic_provider.py # Anthropic/Claude implementation
│   ├── gemini_provider.py  # Google/Gemini implementation
│   └── groq_provider.py    # Groq implementation
├── static/                 # Static files for web interface
├── logs/                   # Log files directory
├── .env                    # Environment variables (not in repo)
├── .env.example            # Environment template
└── requirements.txt        # Python dependencies
```

## Setup

1. **Clone the repository and navigate to the directory**

2. **Create and configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configurations
   ```

3. **Install Python virtual environment** (recommended 3.11+):
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server**:
   ```bash
   python main.py
   ```
   
   Alternatively, you can use uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

## Key Components

### Provider Architecture

The backend implements a flexible provider architecture:

- **BaseProvider**: Abstract base class defining the interface for all providers
- **Provider Factory**: Creates and manages provider instances
- **Provider Implementations**: Concrete implementations for each AI service (OpenAI, Anthropic, Google, Groq)

### Request Flow

1. Client sends a chat request to `/chat/{provider}`
2. Request is validated using Pydantic models
3. Provider is selected based on the URL parameter
4. Request is processed by the appropriate provider
5. Response is streamed back to the client using Server-Sent Events (SSE)

### Error Handling

The application implements comprehensive error handling:

- Input validation errors with clear messages
- Provider-specific error handling
- Fallback mechanisms when primary models fail
- Sentry integration for error tracking

## API Endpoints

- **GET /**: Simple HTML interface
- **GET /health**: Overall system health check
- **GET /health/{provider}**: Provider-specific health check
- **POST /chat/{provider}**: Main chat endpoint

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Configuration

Key configurations in `.env`:

```bash
# Server
PORT=3050

# API Keys
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=development

# Models
OPENAI_MODEL_DEFAULT=gpt-4o
ANTHROPIC_MODEL_DEFAULT=claude-3-5-sonnet-latest
GEMINI_MODEL_DEFAULT=gemini-2.0-flash
GROQ_MODEL_DEFAULT=llama-3-70b-8192

# See .env.example for all configuration options
```

## API Documentation

**Base URL:** `http://localhost:3050` (default)

### 1. Health Check

**GET `/health`**

Returns the overall system health status.

**Response:**
```json
{
    "status": "OK",
    "message": "System operational"
}
```

### 2. Provider Health Check

**GET `/health/{provider}`**

Check health status of a specific provider.

**Parameters:**
- `provider`: The AI provider to check (gpt, claude, gemini, groq)

**Success Response:**
```json
{
    "status": "OK",
    "provider": "gpt",
    "message": "Model responding correctly",
    "metrics": {
        "responseTime": 0.123
    }
}
```

**Error Response:**
```json
{
    "status": "ERROR",
    "provider": "gpt",
    "error": {
        "message": "Error message details"
    },
    "metrics": {
        "responseTime": 0.123
    }
}
```

### 3. Chat Endpoint

**POST `/chat/{provider}`**

Stream chat responses from an AI provider.

**Headers:**
```
Content-Type: application/json
X-Request-ID: optional-client-request-id
```

**Parameters:**
- `provider`: AI provider (gpt, claude, gemini, groq)

**Request Body:**
```json
{
    "messages": [
        {
            "role": "user" | "assistant" | "system",
            "content": "message text"
        }
    ]
}
```

Note: Each message in the array is a `ConversationMessage` object representing an entry in the conversation history.

**Response:**
Server-Sent Events (SSE) stream with the following headers:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
X-Request-ID: request-id
```

Response format:
```
data: {
    "id": "provider-timestamp",
    "delta": {
        "content": "chunk of response text",
        "model": "model name"    // Reports which model was actually used
    }
}
...
data: [DONE]
```

## Validation Rules

### 1. Messages
- Maximum messages in context: 50 (MAX_MESSAGES_IN_CONTEXT)
- Maximum message length: 6000 characters (MAX_MESSAGE_LENGTH)
- Required fields: role, content
- Content cannot be empty or whitespace-only

### 2. Roles (MessageRole)
- Allowed values: "user", "assistant", "system"

## Error Responses

All errors follow this format:
```json
{
    "detail": "Error message",
    "request_id": "unique-request-id",
    "timestamp": "2024-03-20T10:15:30.123Z"
}
```

Common error codes:
- **400**: Invalid request format or validation error
- **401**: Authentication error (invalid API key)
- **404**: Provider not found
- **500**: Internal server error or provider API error
- **502**: Provider service unavailable

## Model Selection Architecture

The API implements a backend-controlled model selection strategy:

- **Provider Selection**: Specified in endpoint URL (`/chat/{provider}`)
- **Model Selection**: Handled automatically by backend
  - Each provider has default and fallback models
  - Model information included in response streams
  - Automatic fallback on model failure
- **Configuration**: Managed via environment variables

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

## Data Models

### Core Models

#### MessageRole (Enum)
```python
class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
```

#### ConversationMessage
```python
class ConversationMessage(BaseModel):
    role: MessageRole
    content: str
```

**Validation Rules:**
- `content`: 
  - Cannot be empty or whitespace-only
  - Maximum length: 6000 characters (MAX_MESSAGE_LENGTH)
  - Validated using @field_validator

#### ChatRequest
```python
class ChatRequest(BaseModel):
    messages: List[ConversationMessage] = Field(
        ...,  # Required field
        min_length=1,
        description="List of conversation messages. Cannot be empty."
    )
```

**Validation Rules:**
- `messages`:
  - Must contain at least one message
  - Maximum 50 messages (MAX_MESSAGES_IN_CONTEXT)
  - Validated using @field_validator

#### HealthResponse
```python
class HealthResponse(BaseModel):
    status: Literal["OK", "ERROR"]
    message: Optional[str] = None
    provider: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None
    error: Optional[Dict[str, str]] = None
```

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

### Sentry Configuration

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

## API Integration Examples

### JavaScript/TypeScript (Fetch API)
```typescript
async function chatWithAI(messages: Array<{role: string, content: string}>) {
  const response = await fetch('http://localhost:3050/chat/gpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  // Handle SSE stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const {value, done} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data === '[DONE]') break;
        
        console.log('Content:', data.delta.content);
        console.log('Model used:', data.delta.model);
      }
    }
  }
}

// Example usage
chatWithAI([
  { role: 'user', content: 'Hello!' }
]);
```

### Python (aiohttp)
```python
import aiohttp
import asyncio
import json

async def chat_with_ai(messages):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'http://localhost:3050/chat/claude',
            json={'messages': messages}
        ) as response:
            async for line in response.content:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]  # Remove 'data: ' prefix
                    if data.strip() == '[DONE]':
                        break
                    
                    chunk = json.loads(data)
                    print('Content:', chunk['delta']['content'])
                    print('Model:', chunk['delta']['model'])

# Example usage
async def main():
    messages = [
        {'role': 'user', 'content': 'Write a hello world program'}
    ]
    await chat_with_ai(messages)

asyncio.run(main())
```

## Development Guidelines

### Adding New Features
1. Update relevant models in `models.py`
2. Implement provider-specific logic in `aiproviders.py`
3. Add routes in `main.py`
4. Update documentation
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

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Check that API keys are correctly set in `.env`
   - Verify API key validity with provider

2. **Model Availability**
   - Ensure selected models are available in your account
   - Check provider status pages for outages

3. **Streaming Issues**
   - Verify client supports Server-Sent Events
   - Check for proxy or firewall issues

4. **Sentry Integration**
   - Verify `SENTRY_DSN` is correctly set
   - Check Sentry project settings

### Debugging with Logs

1. Check appropriate log files:
   - `logs/app.log` for general information
   - `logs/error.log` for errors
   - `logs/debug.log` for detailed debugging

2. Use request IDs to trace requests:
   ```bash
   grep "request-id" logs/*.log
   ```

3. Test provider health:
   ```bash
   curl http://localhost:3050/health/gpt
   ```

## Known Issues

1. **Response Truncation**:
   - In some cases, the beginning of the response may be truncated
   - Under investigation

2. **Frontend/Backend Model Field**:
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
- [ ] Add testing
- [ ] Add more documentation
- [ ] Add more examples

## Last Updated

Last updated: 2024-03-05 11:05:00 UTC+0800
