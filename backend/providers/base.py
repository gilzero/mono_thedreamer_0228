# filepath: providers/base.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple, AsyncGenerator
import json
import time
from fastapi import HTTPException
from models import ConversationMessage

class BaseProvider(ABC):
    """Base class for all AI providers."""
    
    def __init__(self, provider_name: str, default_model: str, fallback_model: str, 
                 temperature: float, max_tokens: int, system_prompt: str):
        self.provider_name = provider_name
        self.default_model = default_model
        self.fallback_model = fallback_model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt
    
    @abstractmethod
    async def stream_response(self, messages: List[Dict[str, Any]], model: str, message_id: str) -> AsyncGenerator[str, None]:
        """Stream a response from the AI provider."""
        pass
    
    @abstractmethod
    async def health_check(self, model: str, test_message: str) -> str:
        """Check if the provider is responding correctly."""
        pass
    
    def format_messages(self, messages: List[ConversationMessage]) -> List[Dict[str, Any]]:
        """Format messages for the provider API. Override in subclasses if needed."""
        return [{"role": m.role, "content": m.content} for m in messages]
    
    def format_stream_chunk(self, message_id: str, content: str, model: str) -> str:
        """Format a chunk of streamed content."""
        data = {
            "id": message_id,
            "delta": {
                "content": content,
                "model": model
            }
        }
        return f"data: {json.dumps(data)}\n\n"
    
    def format_done_message(self) -> str:
        """Format the done message for SSE."""
        return "data: [DONE]\n\n"
    
    async def try_with_models(self, messages: List[ConversationMessage], message_id: str) -> AsyncGenerator[str, None]:
        """Try to get a response using default model, then fallback if needed."""
        try:
            # Try with default model
            formatted_messages = self.format_messages(messages)
            async for chunk in self.stream_response(formatted_messages, self.default_model, message_id):
                yield chunk
        except Exception as e:
            # If default model fails, try fallback
            try:
                formatted_messages = self.format_messages(messages)
                async for chunk in self.stream_response(formatted_messages, self.fallback_model, message_id):
                    yield chunk
            except Exception as inner_e:
                # If both models fail, raise an exception
                raise HTTPException(
                    status_code=500,
                    detail=f"Both default and fallback models failed for provider {self.provider_name}: {str(inner_e)}"
                ) 