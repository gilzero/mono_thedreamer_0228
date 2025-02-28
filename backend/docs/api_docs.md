# API Documentation

**Base URL:** `http://localhost:3050` (default)

## Endpoints

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
- `provider`: The AI provider to check (gpt, claude, gemini)

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
```

**Parameters:**
- `provider`: AI provider (gpt, claude, gemini)

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

**Important Model Selection Architecture:**
- Model selection is handled by backend configuration
- Each provider has a default model and a fallback model
- Model selection and fallback logic are handled automatically
- Response streams include the actual model used for transparency
- Requests should not include model selection

**Response:**
Server-Sent Events (SSE) stream with the following headers:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
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

1. Messages:
   - Maximum messages in context: 50 (MAX_MESSAGES_IN_CONTEXT)
   - Maximum message length: 6000 characters (MAX_MESSAGE_LENGTH)
   - Required fields: role, content
   - Content cannot be empty or whitespace-only

2. Roles (MessageRole):
   - Allowed values: "user", "assistant", "system"

## Error Responses

All errors follow this format:
```json
{
    "detail": "Error message"
}
```

Common error codes:
- **400**: Invalid request format or validation error
- **401**: Authentication error (invalid API key)
- **404**: Provider not found
- **500**: Internal server error or provider API error
- **502**: Provider service unavailable

## Provider Configuration

Provider configurations are managed through environment variables:

**OpenAI (gpt)**
- Models: OPENAI_MODEL_DEFAULT, OPENAI_MODEL_FALLBACK
- Temperature: OPENAI_TEMPERATURE
- Max tokens: OPENAI_MAX_TOKENS
- System prompt: GPT_SYSTEM_PROMPT

**Anthropic (claude)**
- Models: ANTHROPIC_MODEL_DEFAULT, ANTHROPIC_MODEL_FALLBACK
- Temperature: ANTHROPIC_TEMPERATURE
- Max tokens: ANTHROPIC_MAX_TOKENS
- System prompt: CLAUDE_SYSTEM_PROMPT

**Google (gemini)**
- Models: GEMINI_MODEL_DEFAULT, GEMINI_MODEL_FALLBACK
- Temperature: GEMINI_TEMPERATURE
- Max tokens: GEMINI_MAX_TOKENS
- System prompt: GEMINI_SYSTEM_PROMPT

## Notes

- System prompts can be customized per provider in the .env file
- Responses are streamed in real-time using Server-Sent Events (SSE)
- Each provider may have different response characteristics
- Fallback models are automatically used if the primary model fails
- The backend ignores any model specification in requests