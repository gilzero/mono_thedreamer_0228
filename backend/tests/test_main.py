# filepath: tests/test_main.py
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from datetime import datetime, UTC, timedelta
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from main import app
from models import MessageRole, ConversationMessage, ChatRequest
import os
import json
from typing import Generator, AsyncGenerator

# Create a new test app for CORS testing
def create_test_app():
    """Create a test app with CORS middleware and a test route"""
    test_app = FastAPI()
    
    # Add a test route
    @test_app.get("/")
    def test_route():
        return {"message": "Test route"}
    
    # Configure CORS middleware with explicit settings
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins
        allow_credentials=False,  # Important: must be False when allow_origins=["*"]
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,
    )
    
    return test_app

# Use base_url without port since TestClient handles it internally
client = TestClient(app, base_url="http://localhost")

# Test data for each provider
TEST_PROVIDERS = {
    "gpt": {
        "model": "gpt-4o",
        "system_prompt": "You are ChatGPT, a helpful AI assistant."
    },
    "claude": {
        "model": "claude-3-5-sonnet-latest",
        "system_prompt": "You are Claude, a helpful AI assistant."
    },
    "gemini": {
        "model": "gemini-2.0-flash",
        "system_prompt": "You are Gemini, a helpful AI assistant."
    }
}

def create_test_request(provider: str) -> ChatRequest:
    """Create test request for specific provider"""
    system_message = ConversationMessage(
        role=MessageRole.SYSTEM,
        content=TEST_PROVIDERS[provider]["system_prompt"],
        timestamp=int(datetime.now(UTC).timestamp()),
        model=TEST_PROVIDERS[provider]["model"]
    )
    
    user_message = ConversationMessage(
        role=MessageRole.USER,
        content="Test message",
        timestamp=int(datetime.now(UTC).timestamp())
    )
    
    return ChatRequest(messages=[system_message, user_message])

# Add fixtures
@pytest.fixture
def test_client() -> Generator[TestClient, None, None]:
    """Fixture that creates a test client"""
    with TestClient(app, base_url="http://localhost") as client:
        yield client

@pytest.fixture
def test_cors_client() -> Generator[TestClient, None, None]:
    """Fixture that creates a test client with CORS enabled"""
    app = create_test_app()
    with TestClient(app) as client:
        yield client

@pytest.fixture
def mock_debug_context():
    """Fixture to mock debug_with_context"""
    with patch('main.debug_with_context') as mock:
        yield mock

@pytest.fixture
def env_vars() -> Generator[dict, None, None]:
    """Fixture to manage environment variables"""
    original_vars = {}
    test_vars = {
        "PORT": "3050",
        "MAX_MESSAGE_LENGTH": "6000",
        "MAX_MESSAGES_IN_CONTEXT": "50"
    }
    
    # Save original values
    for key in test_vars:
        if key in os.environ:
            original_vars[key] = os.environ[key]
    
    # Set test values
    os.environ.update(test_vars)
    
    yield test_vars
    
    # Restore original values
    for key in test_vars:
        if key in original_vars:
            os.environ[key] = original_vars[key]
        else:
            del os.environ[key]

# Test health endpoints
def test_health_check(test_client):
    """Test general health check endpoint"""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["message"] == "System operational"

@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_provider_health_check_success(test_client, mock_debug_context, provider):
    """Test provider-specific health check endpoints"""
    mock_response = (True, f"{provider} service operational", 0.1)
    
    with patch('main.health_check_provider', new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_response
        response = test_client.get(f"/health/{provider}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "OK"
        assert data["provider"] == provider
        assert f"{provider} service operational" in data["message"]
        assert "responseTime" in data["metrics"]
        
        # Verify debug logging
        mock_debug_context.assert_called()

@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_provider_health_check_failure(provider):
    """Test provider health check when provider is unhealthy"""
    mock_response = (False, f"{provider} API Error", 0.1)
    
    with patch('main.health_check_provider', new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_response
        with patch('main.debug_with_context') as mock_debug:  # Mock debug_with_context
            response = client.get(f"/health/{provider}")
            assert response.status_code == 200
            data = response.json()
            
            assert data["status"] == "ERROR"
            assert data["provider"] == provider
            assert data["error"]["message"] == f"{provider} API Error"
            assert "responseTime" in data["metrics"]

def test_provider_health_check_invalid_provider():
    """Test health check with invalid provider"""
    response = client.get("/health/invalid_provider")
    assert response.status_code == 400
    assert "Invalid provider" in response.json()["detail"]

# Test chat endpoint
@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_chat_endpoint_success(provider):
    """Test successful chat requests for different providers"""
    test_request = create_test_request(provider)
    
    async def mock_stream():
        yield f"data: {{'id': 'test', 'delta': {{'content': 'Test response from {provider}', 'model': '{TEST_PROVIDERS[provider]['model']}'}}}}".encode()
        yield "data: [DONE]".encode()

    with patch('main.stream_response', return_value=mock_stream()):
        response = client.post(
            f"/chat/{provider}",
            json=test_request.model_dump()
        )
        
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        assert response.headers["cache-control"] == "no-cache"
        assert response.headers["connection"] == "keep-alive"
        assert response.headers["x-accel-buffering"] == "no"

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_invalid_request(provider):
    """Test chat endpoint with invalid request body for each provider"""
    invalid_request = {
        "messages": [
            {
                "role": "invalid_role",
                "content": "Test message",
                "model": TEST_PROVIDERS[provider]["model"]
            }
        ]
    }
    response = client.post(f"/chat/{provider}", json=invalid_request)
    assert response.status_code == 422  # Validation error

@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_chat_endpoint_provider_error(provider):
    """Test chat endpoint when provider raises an error"""
    test_request = create_test_request(provider)
    
    with patch('main.stream_response') as mock_stream:
        mock_stream.side_effect = Exception(f"{provider} Provider API error")
        
        response = client.post(
            f"/chat/{provider}",
            json=test_request.model_dump()
        )
        
        assert response.status_code == 500
        error_detail = response.json()["detail"]
        assert f"{provider} Provider API error" in error_detail

# Test middleware
def test_logging_middleware():
    """Test request logging middleware"""
    with patch('main.debug_with_context') as mock_debug:
        response = client.get("/health")
        assert response.status_code == 200
        
        mock_debug.assert_called_once()
        call_args = mock_debug.call_args
        assert "Request completed" in str(call_args)
        assert "duration" in str(call_args)
        assert "status_code" in str(call_args)
        assert "client_host" in str(call_args)

def test_cors_middleware(test_cors_client):
    """Test CORS middleware configuration with fixture"""
    response = test_cors_client.options(
        "/",
        headers={
            "origin": "http://localhost",
            "access-control-request-method": "GET",
            "access-control-request-headers": "content-type",
        }
    )
    
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"
    assert "GET" in response.headers["access-control-allow-methods"]
    assert "content-type" in response.headers["access-control-allow-headers"]

# Test error handling
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_internal_server_error_handling(provider):
    """Test handling of internal server errors for each provider"""
    with patch('main.health_check_provider', side_effect=Exception(f"Unexpected {provider} error")):
        response = client.get(f"/health/{provider}")
        assert response.status_code == 200  # Health check handles its own errors
        data = response.json()
        assert data["status"] == "ERROR"
        assert f"Unexpected {provider} error" in str(data["error"])

def setup_module(module):
    """Setup test environment before running tests"""
    os.environ["PORT"] = "3050"
    os.environ["MAX_MESSAGE_LENGTH"] = "6000"
    os.environ["MAX_MESSAGES_IN_CONTEXT"] = "50"

def teardown_module(module):
    """Cleanup test environment after tests"""
    if "PORT" in os.environ:
        del os.environ["PORT"]
    if "MAX_MESSAGE_LENGTH" in os.environ:
        del os.environ["MAX_MESSAGE_LENGTH"]
    if "MAX_MESSAGES_IN_CONTEXT" in os.environ:
        del os.environ["MAX_MESSAGES_IN_CONTEXT"]

def test_environment_variables(env_vars):
    """Test environment variable loading with fixture"""
    from main import PORT
    assert PORT == env_vars["PORT"]
    assert int(PORT) == 3050

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_empty_messages(test_client, provider):
    """Test chat endpoint with empty messages list"""
    response = test_client.post(
        f"/chat/{provider}",
        json={"messages": []}
    )
    assert response.status_code == 422
    error = response.json()["detail"][0]
    assert "List should have at least 1 item" in error["msg"]

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_malformed_timestamp(test_client, provider):
    """Test chat endpoint with malformed timestamp"""
    with patch('main.stream_response') as mock_stream:
        async def mock_response():
            yield b"data: {\"id\":\"test\",\"delta\":{\"content\":\"Test\"}}\n\n"
            yield b"data: [DONE]\n\n"
            
        mock_stream.return_value = mock_response()
        
        # Future timestamp
        future_time = int((datetime.now(UTC) + timedelta(days=1)).timestamp())
        request = {
            "messages": [
                {
                    "role": "user",
                    "content": "Test message",
                    "timestamp": future_time
                }
            ]
        }
        
        response = test_client.post(f"/chat/{provider}", json=request)
        assert response.status_code == 200

@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_chat_endpoint_stream_errors(test_client, provider):
    """Test handling of errors during streaming"""
    test_request = create_test_request(provider)
    
    with patch('main.stream_response') as mock_stream:
        mock_stream.side_effect = Exception("Stream error")
        
        response = test_client.post(
            f"/chat/{provider}",
            json=test_request.model_dump(),
            headers={"Accept": "text/event-stream"}
        )
        
        assert response.status_code == 500
        error_data = response.json()
        assert "Stream error" in error_data["detail"]

@pytest.mark.asyncio
@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
async def test_chat_endpoint_stream_parsing(test_client, provider):
    """Test parsing of streamed chat responses"""
    test_request = create_test_request(provider)
    
    test_responses = [
        {
            "id": "test-1",
            "delta": {
                "content": "First ",
                "model": TEST_PROVIDERS[provider]["model"]
            }
        },
        {
            "id": "test-1",
            "delta": {
                "content": "chunk ",
                "model": TEST_PROVIDERS[provider]["model"]
            }
        },
        {
            "id": "test-1",
            "delta": {
                "content": "of text",
                "model": TEST_PROVIDERS[provider]["model"]
            }
        }
    ]

    # Mock stream_response only
    async def mock_stream():
        for resp in test_responses:
            yield f"data: {json.dumps(resp)}\n\n"
        yield "data: [DONE]\n\n"

    with patch('main.stream_response', return_value=mock_stream()):
        response = test_client.post(
            f"/chat/{provider}",
            json=test_request.model_dump(),
            headers={"Accept": "text/event-stream"}
        )
        
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        
        content = parse_stream_response(response)
        assert content == "First chunk of text"

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_max_messages(test_client, env_vars, provider):
    """Test chat endpoint with maximum number of messages"""
    max_messages = int(env_vars["MAX_MESSAGES_IN_CONTEXT"])
    messages = [
        {
            "role": "user" if i % 2 == 0 else "assistant",
            "content": f"Message {i}",
            "timestamp": int(datetime.now(UTC).timestamp())
        }
        for i in range(max_messages + 1)  # One more than max
    ]
    
    response = test_client.post(
        f"/chat/{provider}",
        json={"messages": messages}
    )
    assert response.status_code == 422
    assert "maximum" in response.json()["detail"][0]["msg"]

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_validation_errors(test_client, provider):
    """Test various validation errors in chat endpoint"""
    test_cases = [
        # Invalid role
        {
            "messages": [{
                "role": "invalid_role",
                "content": "test",
                "timestamp": int(datetime.now(UTC).timestamp())
            }],
            "expected_error": "Input should be 'user', 'assistant' or 'system'"
        },
        # Empty content
        {
            "messages": [{
                "role": "user",
                "content": "",
                "timestamp": int(datetime.now(UTC).timestamp())
            }],
            "expected_error": "Message content cannot be empty"
        }
    ]
    
    for test_case in test_cases:
        response = test_client.post(
            f"/chat/{provider}",
            json=test_case
        )
        assert response.status_code == 422
        errors = response.json()["detail"]
        assert any(test_case["expected_error"] in error["msg"] for error in errors)

@pytest.mark.parametrize("provider", TEST_PROVIDERS.keys())
def test_chat_endpoint_malformed_json(test_client, provider):
    """Test handling of malformed JSON in request"""
    response = test_client.post(
        f"/chat/{provider}",
        content=json.dumps({"malformed": "json"}),
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422

def parse_stream_response(response) -> str:
    """Helper function to parse SSE stream response"""
    content = ""
    for line in response.iter_lines():
        if line.startswith("data: "):
            data = line[6:]  # Remove "data: " prefix
            if data == "[DONE]":
                break
            chunk = json.loads(data)
            content += chunk["delta"]["content"]
    return content

def create_mock_stream_response(content: str, model: str) -> list[dict]:
    """Create a mock stream response with given content"""
    return [
        {
            "id": "test-1",
            "delta": {
                "content": chunk,
                "model": model
            }
        }
        for chunk in content.split()
    ] 