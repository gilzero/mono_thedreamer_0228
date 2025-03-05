"""
Supabase client module for conversation logging.
"""
import os
import json
import uuid
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import logging
from supabase import create_client, Client
from logging_config import logger
from supabase_config import (
    SUPABASE_URL, 
    SUPABASE_KEY, 
    CONVERSATION_SETTINGS, 
    TABLES,
    DEFAULTS,
    QUERY_SETTINGS
)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def init_db():
    """
    Initialize the database tables if they don't exist.
    This is a no-op for Supabase as tables should be created in the Supabase dashboard.
    """
    logger.info("Supabase client initialized")
    # Check if we can connect to Supabase
    try:
        response = supabase.table(TABLES["CONVERSATIONS"]).select("count", count="exact").limit(1).execute()
        logger.info(f"Successfully connected to Supabase. Tables exist.")
        return True
    except Exception as e:
        logger.error(f"Error connecting to Supabase: {str(e)}")
        logger.error("Please create the required tables in the Supabase dashboard.")
        logger.error("""
        Required tables:
        1. conversations: id (uuid), provider (text), created_at (timestamp), ended_at (timestamp), client_info (jsonb), request_id (text), metadata (jsonb)
        2. messages: id (uuid), conversation_id (uuid), role (text), content (text), created_at (timestamp), model (text), tokens (integer)
        """)
        return False

async def log_conversation_start(
    conversation_id: Optional[str] = None,
    provider: str = "",
    request_id: Optional[str] = None,
    client_info: Optional[Any] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """
    Log the start of a new conversation.
    
    Args:
        conversation_id: Optional unique identifier (generated if not provided)
        provider: AI provider name (e.g., 'gpt', 'claude')
        request_id: Optional request ID for correlation
        client_info: Optional client information
        metadata: Optional additional metadata
        
    Returns:
        The conversation_id
    """
    try:
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            
        data = {
            "id": conversation_id,
            "provider": provider,
            "request_id": request_id,
            "client_info": client_info,
            "metadata": metadata
        }
        
        result = supabase.table(TABLES["CONVERSATIONS"]).insert(data).execute()
        
        logger.debug(f"Conversation started: {conversation_id} with provider {provider}")
        return conversation_id
    except Exception as e:
        logger.error(f"Error logging conversation start: {str(e)}")
        # Continue execution even if logging fails
        return conversation_id or str(uuid.uuid4())

async def log_conversation_end(conversation_id: str):
    """
    Log the end of a conversation.
    
    Args:
        conversation_id: The conversation ID to update
    """
    try:
        supabase.table(TABLES["CONVERSATIONS"]).update(
            {"ended_at": datetime.now().isoformat()}
        ).eq("id", conversation_id).execute()
        
        logger.debug(f"Conversation ended: {conversation_id}")
    except Exception as e:
        logger.error(f"Error logging conversation end: {str(e)}")

async def log_message(
    conversation_id: str,
    role: str,
    content: str,
    model: Optional[str] = None,
    tokens: Optional[int] = None
) -> str:
    """
    Log a message in a conversation.
    
    Args:
        conversation_id: The conversation this message belongs to
        role: Message role ('user', 'assistant', or 'system')
        content: The message content
        model: Optional model name (for assistant messages)
        tokens: Optional token count
        
    Returns:
        The message_id
    """
    try:
        message_id = str(uuid.uuid4())
        
        data = {
            "id": message_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "model": model,
            "tokens": tokens
        }
        
        supabase.table(TABLES["MESSAGES"]).insert(data).execute()
        
        logger.debug(f"Message logged: {message_id} in conversation {conversation_id}")
        return message_id
    except Exception as e:
        logger.error(f"Error logging message: {str(e)}")
        # Continue execution even if logging fails
        return str(uuid.uuid4())

async def get_conversation(conversation_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Retrieve a complete conversation with all its messages.
    
    Args:
        conversation_id: The conversation ID to retrieve
        
    Returns:
        A tuple containing (conversation_data, messages)
    """
    try:
        # Get conversation data
        conversation_response = supabase.table(TABLES["CONVERSATIONS"]).select("*").eq("id", conversation_id).execute()
        
        if not conversation_response.data or len(conversation_response.data) == 0:
            return None, []
            
        conversation = conversation_response.data[0]
        
        # Get all messages
        messages_response = supabase.table(TABLES["MESSAGES"]).select("*").eq("conversation_id", conversation_id).order("created_at").execute()
        messages = messages_response.data
                
        return conversation, messages
    except Exception as e:
        logger.error(f"Error retrieving conversation: {str(e)}")
        return None, []

async def get_recent_conversations(limit: int = DEFAULTS["LIMIT"], offset: int = DEFAULTS["OFFSET"]) -> List[Dict[str, Any]]:
    """
    Get a list of recent conversations.
    
    Args:
        limit: Maximum number of conversations to return
        offset: Offset for pagination
        
    Returns:
        List of conversation data dictionaries
    """
    try:
        # Apply limits from configuration
        if limit > QUERY_SETTINGS["MAX_RECENT_CONVERSATIONS"]:
            limit = QUERY_SETTINGS["MAX_RECENT_CONVERSATIONS"]
            
        response = supabase.table(TABLES["CONVERSATIONS"]).select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        conversations = response.data
        
        # Enhance with message counts
        for conv in conversations:
            # Get message count for this conversation
            count_response = supabase.table(TABLES["MESSAGES"]).select("count", count="exact").eq("conversation_id", conv["id"]).execute()
            conv["message_count"] = count_response.count if hasattr(count_response, "count") else 0
            
        return conversations
    except Exception as e:
        logger.error(f"Error retrieving recent conversations: {str(e)}")
        return []

async def search_conversations(
    query: str,
    provider: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = DEFAULTS["LIMIT"],
    offset: int = DEFAULTS["OFFSET"]
) -> List[Dict[str, Any]]:
    """
    Search for conversations containing specific text.
    
    Args:
        query: Text to search for in messages
        provider: Optional provider filter
        start_date: Optional start date filter (YYYY-MM-DD)
        end_date: Optional end date filter (YYYY-MM-DD)
        limit: Maximum number of results
        offset: Offset for pagination
        
    Returns:
        List of matching conversation data
    """
    try:
        # Apply limits from configuration
        if limit > QUERY_SETTINGS["MAX_SEARCH_RESULTS"]:
            limit = QUERY_SETTINGS["MAX_SEARCH_RESULTS"]
            
        # First get message IDs that match the content search
        message_query = supabase.table(TABLES["MESSAGES"]).select("conversation_id").ilike("content", f"%{query}%")
        message_response = message_query.execute()
        
        if not message_response.data:
            return []
            
        # Extract conversation IDs
        conversation_ids = [msg["conversation_id"] for msg in message_response.data]
        
        # Build the conversation query
        conversation_query = supabase.table(TABLES["CONVERSATIONS"]).select("*").in_("id", conversation_ids)
        
        if provider:
            conversation_query = conversation_query.eq("provider", provider)
            
        if start_date:
            conversation_query = conversation_query.gte("created_at", f"{start_date}T00:00:00")
            
        if end_date:
            conversation_query = conversation_query.lte("created_at", f"{end_date}T23:59:59")
            
        # Execute the query with pagination
        response = conversation_query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error searching conversations: {str(e)}")
        return []

async def get_db_stats() -> Dict[str, Any]:
    """
    Get database statistics.
    
    Returns:
        Dictionary with database statistics
    """
    try:
        # Get conversation count
        conversation_count_response = supabase.table(TABLES["CONVERSATIONS"]).select("count", count="exact").execute()
        conversation_count = conversation_count_response.count if hasattr(conversation_count_response, "count") else 0
        
        # Get message count
        message_count_response = supabase.table(TABLES["MESSAGES"]).select("count", count="exact").execute()
        message_count = message_count_response.count if hasattr(message_count_response, "count") else 0
        
        # Get provider distribution
        provider_response = supabase.table(TABLES["CONVERSATIONS"]).select("provider").execute()
        provider_data = provider_response.data
        
        # Count occurrences of each provider
        provider_stats = {}
        for item in provider_data:
            provider = item.get("provider")
            if provider:
                provider_stats[provider] = provider_stats.get(provider, 0) + 1
        
        return {
            "conversation_count": conversation_count,
            "message_count": message_count,
            "provider_stats": provider_stats
        }
    except Exception as e:
        logger.error(f"Error getting database stats: {str(e)}")
        return {
            "error": str(e),
            "conversation_count": 0,
            "message_count": 0,
            "provider_stats": {}
        }

async def cleanup_old_conversations(days: int = CONVERSATION_SETTINGS["RETENTION_DAYS"]):
    """
    Delete conversations older than the specified number of days.
    
    Args:
        days: Number of days to keep conversations
    """
    try:
        # Calculate the cutoff date
        from datetime import datetime, timedelta
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Delete old conversations (cascade will delete messages too)
        supabase.table(TABLES["CONVERSATIONS"]).delete().lt("created_at", cutoff_date).execute()
        
        logger.info(f"Cleaned up conversations older than {days} days")
    except Exception as e:
        logger.error(f"Error cleaning up old conversations: {str(e)}") 