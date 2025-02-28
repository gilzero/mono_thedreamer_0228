# filepath: providers/groq_provider.py
from typing import List, Dict, Any, AsyncGenerator
from groq import AsyncGroq
from .base import BaseProvider
from models import ConversationMessage
from logging_config import logger

class GroqProvider(BaseProvider):
    """Provider implementation for Groq models."""
    
    def __init__(self, api_key: str, default_model: str, fallback_model: str, 
                 temperature: float, max_tokens: int, system_prompt: str):
        super().__init__("groq", default_model, fallback_model, temperature, max_tokens, system_prompt)
        self.client = AsyncGroq(api_key=api_key)
    
    def format_messages(self, messages: List[ConversationMessage]) -> List[Dict[str, Any]]:
        """Format messages for Groq API with system prompt."""
        system_messages = [msg for msg in messages if msg.role == "system"]
        system_prompt = " ".join([msg.content for msg in system_messages]) if system_messages else self.system_prompt
        
        formatted_messages = [{"role": "system", "content": system_prompt}]
        formatted_messages.extend([
            {"role": m.role, "content": m.content}
            for m in messages if m.role != "system"
        ])
        
        return formatted_messages
    
    async def stream_response(self, messages: List[Dict[str, Any]], model: str, message_id: str) -> AsyncGenerator[str, None]:
        """Stream a response from Groq."""
        try:
            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield self.format_stream_chunk(message_id, chunk.choices[0].delta.content, model)
            
            yield self.format_done_message()
            
        except Exception as e:
            logger.error(f"Error in Groq stream: {str(e)}", exc_info=True)
            raise
    
    async def health_check(self, model: str, test_message: str) -> str:
        """Check if Groq is responding correctly."""
        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a calculator. Answer math questions with just the number, no explanation."},
                {"role": "user", "content": test_message}
            ],
            max_tokens=5,
            temperature=0  # Make response deterministic
        )
        return response.choices[0].message.content.strip() 