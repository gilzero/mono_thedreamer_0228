# Frontend API Integration Guide

This document outlines the API requirements for backend services to be compatible with the React Native frontend application.

## Base URL Configuration

The frontend expects environment-based API URLs:
- Development: `http://localhost:3050`
- Production: Configurable through environment variables

## API Endpoints

### Chat Endpoints

Base path: `/chat`

#### Stream Chat Messages

```
POST /chat/{provider}
```

Where `{provider}` can be:
- `gpt` - OpenAI GPT models
- `claude` - Anthropic Claude models
- `gemini` - Google Gemini models

##### Request

```json
{
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": string,
      "timestamp?: number,
      "model?": string
    }
  ],
  "model": string
}
```

- `messages`: Array of message objects representing the conversation history
- `model`:  identifier string (e.g., "gpt-4o", "claude-3-5-sonnet-latest", "gemini-2.0-flash")

##### Response

The endpoint must implement Server-Sent Events (SSE) with the following format:

```
data: {"id": "messageId", "delta": {"content": "token content"}}
data: {"id": "messageId", "delta": {"content": "next token"}}
...
data: [DONE]
```

Each SSE message must:
1. Start with `data: `
2. Contain a JSON object with:
   - `id`: Unique message identifier
   - `delta.content`: The token/chunk of the response
3. End with a `data: [DONE]` message

Example SSE stream:
```
data: {"id":"claude-1234567890","delta":{"content":"Hello"}}
data: {"id":"claude-1234567890","delta":{"content":" there"}}
data: {"id":"claude-1234567890","delta":{"content":"!"}}
data: [DONE]
```

##### Error Response

Error responses should be sent as SSE messages:

```
data: {"error": "Error message description"}
data: [DONE]
```

### Health Check Endpoints

Base path: `/health`

#### General Health Check
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "message": "System operational"
}
```

#### Provider Health Check
```
GET /health/{provider}
```

Response:
```json
{
  "status": "OK",
  "provider": string,
  "metrics": {
    "responseTime": number
  }
}
```

Error Response:
```json
{
  "status": "ERROR",
  "provider": string,
  "message": string,
  "error": {
    "type": string,
    "message": string
  }
}
```

## Message Validation Requirements

The backend should validate:

1. Message Content:
   - Non-empty content
   - Maximum length: 24,000 characters
   - Valid roles: "user", "assistant", "system"

2. Conversation Context:
   - Maximum 50 messages per conversation
   - All messages must pass individual validation

## Rate Limiting

The frontend expects rate limiting headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until limit resets

Rate limit response (429 Too Many Requests):
```json
{
  "error": "[Provider] request limit exceeded, please try again later."
}
```

##  Configuration

Each provider must support at least two models:
- Default model
- Fallback model

Expected model configurations:
```
GPT:
- Default: "gpt-4o"
- Fallback: "gpt-4o-mini"

Claude:
- Default: "claude-3-5-sonnet-latest"
- Fallback: "claude-3-5-haiku-latest"

Gemini:
- Default: "gemini-2.0-flash"
- Fallback: "gemini-1.5-pro"
```

## Testing Backend Compatibility

Use these curl commands to test your implementation:

```bash
# Health check
curl http://localhost:3050/health

# Provider health check
curl http://localhost:3050/health/gpt
curl http://localhost:3050/health/claude
curl http://localhost:3050/health/gemini

# Chat endpoint (example)
curl -X POST http://localhost:3050/chat/gpt \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "gpt-4o-mini"
  }'
```

## Implementation Notes

1. SSE Connection:
   - Keep-alive headers required
   - No caching headers
   - Content-Type: text/event-stream

2. Error Handling:
   - Use appropriate HTTP status codes
   - Include detailed error messages
   - Maintain SSE format for streaming errors

3. Performance:
   - Optimize for quick initial response
   - Maintain consistent token streaming rate
   - Handle connection drops gracefully