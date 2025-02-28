# filepath: prompt_engineering.py
from typing import List
from models import ConversationMessage
from logging_config import logger
from configuration import (
    GENERIC_SYSTEM_PROMPT,
    GPT_SYSTEM_PROMPT,
    CLAUDE_SYSTEM_PROMPT,
    GEMINI_SYSTEM_PROMPT,
    GROQ_SYSTEM_PROMPT
)

def get_system_prompt(messages: List[ConversationMessage], provider: str = None) -> str:
    """
    Get system prompt from messages or return provider-specific default.
    
    Args:
        messages: List of conversation messages
        provider: Optional provider name to get specific system prompt
        
    Returns:
        The system prompt to use
    """
    # First try to extract system prompt from messages
    if messages:
        system_messages = [msg.content for msg in messages if msg.role == "system"]
        
        # Filter out empty or whitespace-only system messages
        valid_system_messages = [
            msg for msg in system_messages 
            if msg and msg.strip() and len(''.join(c for c in msg if not c.isspace() and c != '.')) > 0
        ]
        
        if valid_system_messages:
            return " ".join(valid_system_messages)
    
    # If no valid system messages found, use provider-specific or generic prompt
    if provider:
        provider_prompts = {
            "gpt": GPT_SYSTEM_PROMPT,
            "claude": CLAUDE_SYSTEM_PROMPT,
            "gemini": GEMINI_SYSTEM_PROMPT,
            "groq": GROQ_SYSTEM_PROMPT
        }
        return provider_prompts.get(provider, GENERIC_SYSTEM_PROMPT)
    
    logger.debug("No valid system messages found and no provider specified, using generic system prompt")
    return GENERIC_SYSTEM_PROMPT 