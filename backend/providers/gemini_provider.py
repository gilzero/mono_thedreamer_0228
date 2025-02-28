# filepath: providers/gemini_provider.py
from typing import List, Dict, Any, AsyncGenerator
from google import genai
from google.genai import types
from .base import BaseProvider
from models import ConversationMessage
from logging_config import logger

class GeminiProvider(BaseProvider):
    """Provider implementation for Google Gemini models."""
    
    def __init__(self, api_key: str, default_model: str, fallback_model: str, 
                 temperature: float, max_tokens: int, system_prompt: str):
        super().__init__("gemini", default_model, fallback_model, temperature, max_tokens, system_prompt)
        self.client = genai.Client(api_key=api_key)
    
    def format_messages(self, messages: List[ConversationMessage]) -> List[str]:
        """Format messages for Gemini API."""
        # Gemini uses a different format - just the content strings
        return [msg.content for msg in messages if msg.role != "system"]
    
    async def stream_response(self, messages: List[str], model: str, message_id: str) -> AsyncGenerator[str, None]:
        """Stream a response from Gemini."""
        try:
            config = types.GenerateContentConfig(
                temperature=self.temperature,
                max_output_tokens=self.max_tokens,
                system_instruction=self.system_prompt
            )
            
            stream = await self.client.aio.models.generate_content_stream(
                model=model,
                contents=messages,
                config=config
            )
            
            async for chunk in stream:
                if chunk.text:
                    yield self.format_stream_chunk(message_id, chunk.text, model)
            
            yield self.format_done_message()
            
        except Exception as e:
            logger.error(f"Error in Gemini stream: {str(e)}", exc_info=True)
            raise
    
    async def health_check(self, model: str, test_message: str) -> str:
        """Check if Gemini is responding correctly."""
        config = types.GenerateContentConfig(
            temperature=0,
            max_output_tokens=5,
            system_instruction="You are a calculator. Answer math questions with just the number, no explanation."
        )
        
        response = await self.client.aio.models.generate_content_stream(
            model=model,
            contents=test_message,
            config=config
        )
        
        content = ""
        async for chunk in response:
            content += chunk.text
            
        return content.strip() 