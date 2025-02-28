# filepath: tests/test_models.py
import pytest
from datetime import datetime, UTC
from pydantic import ValidationError
from models import (
    MessageRole,
    ConversationMessage,
    ChatRequest,
    HealthResponse,
    MAX_MESSAGE_LENGTH,
    MAX_MESSAGES_IN_CONTEXT
)

# Test MessageRole enum
def test_message_role_values():
    """Test MessageRole enum has correct values"""
    assert MessageRole.USER == "user"
    assert MessageRole.ASSISTANT == "assistant"
    assert MessageRole.SYSTEM == "system"
    assert len(MessageRole) == 3

# Test ConversationMessage validation
def test_valid_conversation_message():
    """Test creating valid ConversationMessage"""
    timestamp = int(datetime.now(UTC).timestamp())
    message = ConversationMessage(
        role=MessageRole.USER,
        content="Test message",
        timestamp=timestamp,
        model="gpt-4o"
    )
    assert message.role == MessageRole.USER
    assert message.content == "Test message"
    assert message.timestamp == timestamp
    assert message.model == "gpt-4o"

def test_conversation_message_empty_content():
    """Test ConversationMessage rejects empty content"""
    with pytest.raises(ValidationError) as exc_info:
        ConversationMessage(
            role=MessageRole.USER,
            content=""
        )
    assert "Message content cannot be empty" in str(exc_info.value)

def test_conversation_message_whitespace_content():
    """Test ConversationMessage rejects whitespace-only content"""
    with pytest.raises(ValidationError) as exc_info:
        ConversationMessage(
            role=MessageRole.USER,
            content="   \n\t   "
        )
    assert "Message content cannot be empty" in str(exc_info.value)

def test_conversation_message_max_length():
    """Test ConversationMessage enforces maximum length"""
    with pytest.raises(ValidationError) as exc_info:
        ConversationMessage(
            role=MessageRole.USER,
            content="x" * (MAX_MESSAGE_LENGTH + 1)
        )
    assert f"maximum length of {MAX_MESSAGE_LENGTH}" in str(exc_info.value)

def test_conversation_message_different_models():
    """Test ConversationMessage with different provider models"""
    # OpenAI models
    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="OpenAI response",
        model="gpt-4o"
    )
    assert message.model == "gpt-4o"

    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="OpenAI fallback response",
        model="gpt-4o-mini"
    )
    assert message.model == "gpt-4o-mini"

    # Claude models
    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="Claude response",
        model="claude-3-5-sonnet-latest"
    )
    assert message.model == "claude-3-5-sonnet-latest"

    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="Claude fallback response",
        model="claude-3-5-haiku-latest"
    )
    assert message.model == "claude-3-5-haiku-latest"

    # Gemini models
    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="Gemini response",
        model="gemini-2.0-flash"
    )
    assert message.model == "gemini-2.0-flash"

    message = ConversationMessage(
        role=MessageRole.ASSISTANT,
        content="Gemini fallback response",
        model="gemini-1.5-pro"
    )
    assert message.model == "gemini-1.5-pro"

# Test ChatRequest validation
def test_valid_chat_request():
    """Test creating valid ChatRequest"""
    messages = [
        ConversationMessage(role=MessageRole.SYSTEM, content="System prompt"),
        ConversationMessage(role=MessageRole.USER, content="User message")
    ]
    request = ChatRequest(messages=messages)
    assert len(request.messages) == 2
    assert request.messages[0].role == MessageRole.SYSTEM
    assert request.messages[1].role == MessageRole.USER

def test_chat_request_max_messages():
    """Test ChatRequest enforces maximum message count"""
    messages = [
        ConversationMessage(role=MessageRole.USER, content=f"Message {i}")
        for i in range(MAX_MESSAGES_IN_CONTEXT + 1)
    ]
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(messages=messages)
    assert f"maximum of {MAX_MESSAGES_IN_CONTEXT} messages" in str(exc_info.value)

def test_chat_request_empty_messages():
    """Test ChatRequest rejects empty message list"""
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(messages=[])
    assert "List should have at least 1 item" in str(exc_info.value)

def test_chat_request_with_mixed_models():
    """Test ChatRequest with messages from different models"""
    messages = [
        ConversationMessage(
            role=MessageRole.SYSTEM,
            content="System prompt",
            model="gpt-4o"
        ),
        ConversationMessage(
            role=MessageRole.USER,
            content="User message"
        ),
        ConversationMessage(
            role=MessageRole.ASSISTANT,
            content="Claude response",
            model="claude-3-5-sonnet-latest"
        ),
        ConversationMessage(
            role=MessageRole.USER,
            content="Follow-up question"
        ),
        ConversationMessage(
            role=MessageRole.ASSISTANT,
            content="Gemini response",
            model="gemini-2.0-flash"
        )
    ]
    request = ChatRequest(messages=messages)
    assert len(request.messages) == 5
    assert request.messages[0].model == "gpt-4o"
    assert request.messages[2].model == "claude-3-5-sonnet-latest"
    assert request.messages[4].model == "gemini-2.0-flash"

# Test HealthResponse model
def test_health_response_ok():
    """Test creating OK HealthResponse"""
    response = HealthResponse(
        status="OK",
        message="System operational",
        provider="gpt",
        metrics={"responseTime": 0.1}
    )
    assert response.status == "OK"
    assert response.message == "System operational"
    assert response.provider == "gpt"
    assert response.metrics == {"responseTime": 0.1}
    assert response.error is None

def test_health_response_error():
    """Test creating ERROR HealthResponse"""
    response = HealthResponse(
        status="ERROR",
        provider="claude",
        error={"message": "API error"}
    )
    assert response.status == "ERROR"
    assert response.provider == "claude"
    assert response.error == {"message": "API error"}
    assert response.message is None
    assert response.metrics is None

def test_health_response_invalid_status():
    """Test HealthResponse rejects invalid status"""
    with pytest.raises(ValidationError):
        HealthResponse(status="INVALID") 