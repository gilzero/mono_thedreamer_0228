# Test Documentation for AI Providers

## Overview

This documentation covers the test suite for `aiproviders.py`, which handles interactions with multiple AI providers (GPT, Claude, and Gemini).

## Test Environment Setup

### Required Environment Variables
```bash
OPENAI_API_KEY=test_key
ANTHROPIC_API_KEY=test_key
GEMINI_API_KEY=test_key
OPENAI_MODEL_DEFAULT=gpt-4o
ANTHROPIC_MODEL_DEFAULT=claude-3-5-sonnet-latest
GEMINI_MODEL_DEFAULT=gemini-2.0-flash
```

### Test Constants
```python
TEST_MESSAGE = ConversationMessage(
    role=MessageRole.USER,
    content="Test message"
)

TEST_SYSTEM_MESSAGE = ConversationMessage(
    role=MessageRole.SYSTEM,
    content="Test system prompt"
)

TEST_REQUEST = ChatRequest(
    messages=[TEST_SYSTEM_MESSAGE, TEST_MESSAGE]
)
```

## Test Categories

### 1. System Prompt Tests
```python
@pytest.mark.parametrize("messages,expected", [
    ([TEST_SYSTEM_MESSAGE], "Test system prompt"),
    ([], GENERIC_SYSTEM_PROMPT),
    ([ConversationMessage(role="system", content=".")], GENERIC_SYSTEM_PROMPT),
    ([ConversationMessage(role="system", content=" . \n \t")], GENERIC_SYSTEM_PROMPT)
])
def test_get_system_prompt(messages, expected):
    assert get_system_prompt(messages) == expected
```

Tests:
- Valid system message handling
- Empty message list handling
- Minimal content handling
- Whitespace content handling

### 2. Provider Model Selection Tests
```python
def test_get_provider_model():
    # Default model test
    assert get_provider_model("gpt") == OPENAI_MODEL_DEFAULT
    
    # Fallback model test
    assert get_provider_model("gpt", use_fallback=True) == OPENAI_MODEL_FALLBACK
    
    # Invalid provider test
    with pytest.raises(HTTPException):
        get_provider_model("invalid")
```

### 3. Message Validation Tests
```python
@pytest.mark.parametrize("content,should_raise", [
    ("", True),
    (" \n\t", True),
    ("Valid message", False),
    ("." * (MAX_MESSAGE_LENGTH + 1), True)
])
def test_message_validation(content, should_raise):
    if should_raise:
        with pytest.raises(ValueError):
            ConversationMessage(role="user", content=content)
    else:
        ConversationMessage(role="user", content=content)
```

### 4. Stream Response Tests

#### GPT Provider
```python
@pytest.mark.asyncio
async def test_stream_response_gpt(mocker):
    mock_client = mocker.patch("openai.AsyncClient")
    mock_client.chat.completions.create.return_value = AsyncMock(
        choices=[
            MagicMock(delta=MagicMock(content="Test response"))
        ]
    )
    
    async for chunk in stream_response(TEST_REQUEST, "gpt"):
        assert "Test response" in chunk or "[DONE]" in chunk
```

#### Claude Provider
```python
@pytest.mark.asyncio
async def test_stream_response_claude(mocker):
    mock_client = mocker.patch("anthropic.AsyncAnthropic")
    mock_client.messages.stream.return_value = AsyncMock(
        text_stream=["Test", "response"]
    )
    
    async for chunk in stream_response(TEST_REQUEST, "claude"):
        assert any(text in chunk for text in ["Test", "response", "[DONE]"])
```

#### Gemini Provider
```python
@pytest.mark.asyncio
async def test_stream_response_gemini(mocker):
    mock_client = mocker.patch("google.genai.Client")
    mock_client.generate_content_stream.return_value = [
        MagicMock(text="Test response")
    ]
    
    async for chunk in stream_response(TEST_REQUEST, "gemini"):
        assert "Test response" in chunk or "[DONE]" in chunk
```

### 5. Health Check Tests
```python
@pytest.mark.asyncio
async def test_provider_health():
    # Success case
    success, message, duration = await health_check_provider("gpt")
    assert success
    assert "Model responding correctly" in message
    assert isinstance(duration, float)

    # Failure case
    success, message, duration = await health_check_provider("invalid")
    assert not success
    assert isinstance(message, str)
    assert isinstance(duration, float)
```

## Error Handling Tests

### 1. API Error Tests
```python
@pytest.mark.asyncio
async def test_api_errors(mocker):
    # Test API key errors
    mocker.patch("openai.AsyncClient", side_effect=ValueError("Invalid API key"))
    with pytest.raises(HTTPException) as exc:
        async for _ in stream_response(TEST_REQUEST, "gpt"):
            pass
    assert exc.value.status_code == 401
```

### 2. Validation Error Tests
```python
def test_validation_errors():
    # Test message length
    with pytest.raises(ValueError):
        ConversationMessage(
            role="user",
            content="." * (MAX_MESSAGE_LENGTH + 1)
        )

    # Test message count
    with pytest.raises(ValueError):
        ChatRequest(messages=[TEST_MESSAGE] * (MAX_MESSAGES_IN_CONTEXT + 1))
```

## Test Coverage

Key areas covered:
- System prompt handling
- Model selection logic
- Message validation
- Streaming responses
- Health checks
- Error handling
- Provider-specific implementations

## Running Tests

```bash
# Run all tests
pytest tests/test_aiproviders.py -v

# Run specific test category
pytest tests/test_aiproviders.py -k "test_stream_response" -v

# Run with coverage report
pytest tests/test_aiproviders.py --cov=aiproviders -v
```