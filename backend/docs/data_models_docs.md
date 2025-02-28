## data models docs

## Data Models Documentation

## Core Models

### MessageRole (Enum)
```python
class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
```

### ConversationMessage
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

### ChatRequest
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

### HealthResponse
```python
class HealthResponse(BaseModel):
    status: Literal["OK", "ERROR"]
    message: Optional[str] = None
    provider: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None
    error: Optional[Dict[str, str]] = None
```

## Response Formats

### Chat Response (SSE Stream)
The chat endpoint returns a Server-Sent Events (SSE) stream with the following format:

```json
{
    "id": "provider-timestamp",
    "delta": {
        "content": "chunk of response text",
        "model": "model name"    // Reports which model was actually used
    }
}
```

Followed by completion marker:
```
data: [DONE]
```

### Health Check Responses

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

## Model Selection Architecture

The API implements a backend-controlled model selection strategy:

1. **Provider Selection**
   - Specified in endpoint URL: `/chat/{provider}`
   - Must be one of the supported providers (gpt, claude, gemini)
   - Configured via SUPPORTED_PROVIDERS environment variable

2. **Model Selection**
   - Handled automatically by backend
   - Each provider has:
     - Default model (configured in .env)
     - Fallback model (used if default fails)
   - Model information included in response stream

3. **System Prompts**
   - Each provider has a configurable system prompt
   - System messages in requests are combined with provider prompts
   - If no system message provided, default prompt is used

## Validation Details

### Message Validation
- Content cannot be empty or whitespace-only
- Content length limit: 6000 characters
- Valid roles: "user", "assistant", "system"

### Request Validation
- Minimum 1 message required
- Maximum 50 messages allowed
- Messages must be properly formatted
- No model specification in request (handled by backend)

## Usage Notes

1. **Request Format**
   ```python
   {
       "messages": [
           {"role": "user", "content": "Hello!"}
       ]
   }
   ```

2. **Model Information**
   - Do not include model selection in requests
   - Model information is provided in response streams
   - Use model information for:
     - Logging
     - Monitoring
     - User feedback

3. **System Messages**
   - Optional in requests
   - Combined with provider-specific prompts
   - Used for context and instruction