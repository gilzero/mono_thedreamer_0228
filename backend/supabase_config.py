"""
Supabase configuration settings.
"""
import os
from typing import Dict, Any

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://zsetwuiexichrpuxdyml.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZXR3dWlleGljaHJwdXhkeW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDQxNDUsImV4cCI6MjA1NjcyMDE0NX0.G27Z5bQJQHCoP44hB6FkQZj2KpJRxvhqPvTmx-UszO8")

# Conversation logging settings
CONVERSATION_SETTINGS: Dict[str, Any] = {
    "ENABLE_CONVERSATION_LOGGING": True,
    "RETENTION_DAYS": 30,  # Number of days to keep conversations before cleanup
    "MAX_MESSAGES_PER_CONVERSATION": 100,  # Maximum number of messages to store per conversation
}

# Table names
TABLES = {
    "CONVERSATIONS": "conversations",
    "MESSAGES": "messages",
}

# Default values
DEFAULTS = {
    "LIMIT": 10,
    "OFFSET": 0,
}

# Query settings
QUERY_SETTINGS = {
    "MAX_SEARCH_RESULTS": 100,
    "MAX_RECENT_CONVERSATIONS": 50,
} 