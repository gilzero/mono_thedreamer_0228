# filepath: providers/anthropic_provider.py
from typing import List, Dict, Any, AsyncGenerator
from anthropic import AsyncAnthropic
from .base import BaseProvider
from models import ConversationMessage
from logging_config import logger

class AnthropicProvider(BaseProvider):
    """Provider implementation for Anthropic (Claude) models."""
    
    def __init__(self, api_key: str, default_model: str, fallback_model: str, 
                 temperature: float, max_tokens: int, system_prompt: str):
        super().__init__("claude", default_model, fallback_model, temperature, max_tokens, system_prompt)
        self.client = AsyncAnthropic(api_key=api_key)
    
    def format_messages(self, messages: List[ConversationMessage]) -> List[Dict[str, Any]]:
        """Format messages for Anthropic API."""
        return [
            {"role": m.role, "content": m.content}
            for m in messages if m.role != "system"
        ]
    
    async def stream_response(self, messages: List[Dict[str, Any]], model: str, message_id: str) -> AsyncGenerator[str, None]:
        """Stream a response from Anthropic."""
        try:
            async with self.client.messages.stream(
                model=model,
                messages=messages,
                system=self.system_prompt,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            ) as stream:
                async for text in stream.text_stream:
                    yield self.format_stream_chunk(message_id, text, model)
            
            yield self.format_done_message()
            
        except Exception as e:
            logger.error(f"Error in Claude stream: {str(e)}", exc_info=True)
            raise
    
    async def health_check(self, model: str, test_message: str) -> str:
        """Check if Anthropic is responding correctly."""
        response = await self.client.messages.create(
            model=model,
            messages=[{"role": "user", "content": test_message}],
            system="You are a calculator. Answer math questions with just the number, no explanation.",
            max_tokens=5,
            temperature=0
        )
        return response.content[0].text.strip() 