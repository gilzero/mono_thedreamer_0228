#!/usr/bin/env python
"""
Test script for Supabase integration.
"""
import asyncio
import json
import uuid
from datetime import datetime
import sys

# Add the current directory to the path so we can import our modules
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import (
    init_db,
    log_conversation_start,
    log_message,
    log_conversation_end,
    get_conversation,
    get_recent_conversations,
    search_conversations,
    get_db_stats
)
from logging_config import logger

async def test_supabase_connection():
    """Test the Supabase connection."""
    print("Testing Supabase connection...")
    success = await init_db()
    if success:
        print("✅ Supabase connection successful")
    else:
        print("❌ Supabase connection failed")
    return success

async def test_conversation_logging():
    """Test conversation logging."""
    print("\nTesting conversation logging...")
    
    # Generate a unique conversation ID
    conversation_id = str(uuid.uuid4())
    print(f"Conversation ID: {conversation_id}")
    
    # Log conversation start
    await log_conversation_start(
        conversation_id=conversation_id,
        provider="test_provider",
        request_id="test_request_id",
        client_info={
            "ip": "127.0.0.1",
            "user_agent": "Test Script",
            "origin": "localhost"
        },
        metadata={
            "test": True,
            "timestamp": datetime.now().isoformat()
        }
    )
    print("✅ Logged conversation start")
    
    # Log user message
    await log_message(
        conversation_id=conversation_id,
        role="user",
        content="Hello, this is a test message from the user."
    )
    print("✅ Logged user message")
    
    # Log assistant message
    await log_message(
        conversation_id=conversation_id,
        role="assistant",
        content="Hello! I'm an AI assistant. This is a test response.",
        model="test_model",
        tokens=20
    )
    print("✅ Logged assistant message")
    
    # Log conversation end
    await log_conversation_end(conversation_id)
    print("✅ Logged conversation end")
    
    return conversation_id

async def test_conversation_retrieval(conversation_id):
    """Test conversation retrieval."""
    print("\nTesting conversation retrieval...")
    
    # Get the conversation
    conversation, messages = await get_conversation(conversation_id)
    
    if conversation:
        print(f"✅ Retrieved conversation: {conversation['id']}")
        print(f"  Provider: {conversation['provider']}")
        print(f"  Created at: {conversation['created_at']}")
        print(f"  Ended at: {conversation['ended_at']}")
    else:
        print("❌ Failed to retrieve conversation")
        return False
    
    if messages:
        print(f"✅ Retrieved {len(messages)} messages")
        for i, message in enumerate(messages):
            print(f"  Message {i+1}: {message['role']} - {message['content'][:30]}...")
    else:
        print("❌ No messages found")
        return False
    
    return True

async def test_recent_conversations():
    """Test retrieving recent conversations."""
    print("\nTesting recent conversations retrieval...")
    
    conversations = await get_recent_conversations(limit=5)
    
    if conversations:
        print(f"✅ Retrieved {len(conversations)} recent conversations")
        for i, conv in enumerate(conversations):
            print(f"  Conversation {i+1}: {conv['id']} - Provider: {conv['provider']}")
    else:
        print("❌ No recent conversations found")
        return False
    
    return True

async def test_conversation_search():
    """Test searching conversations."""
    print("\nTesting conversation search...")
    
    # Search for conversations containing "test"
    conversations = await search_conversations("test")
    
    if conversations:
        print(f"✅ Found {len(conversations)} conversations containing 'test'")
        for i, conv in enumerate(conversations):
            print(f"  Conversation {i+1}: {conv['id']} - Provider: {conv['provider']}")
    else:
        print("❌ No conversations found containing 'test'")
        return False
    
    return True

async def test_db_stats():
    """Test retrieving database statistics."""
    print("\nTesting database statistics...")
    
    stats = await get_db_stats()
    
    if stats:
        print(f"✅ Retrieved database statistics")
        print(f"  Conversation count: {stats['conversation_count']}")
        print(f"  Message count: {stats['message_count']}")
        print(f"  Provider stats: {json.dumps(stats['provider_stats'], indent=2)}")
    else:
        print("❌ Failed to retrieve database statistics")
        return False
    
    return True

async def run_tests():
    """Run all tests."""
    print("=== Supabase Integration Tests ===\n")
    
    # Test connection
    connection_success = await test_supabase_connection()
    if not connection_success:
        print("\n❌ Connection test failed. Aborting remaining tests.")
        return False
    
    # Test conversation logging
    conversation_id = await test_conversation_logging()
    
    # Test conversation retrieval
    retrieval_success = await test_conversation_retrieval(conversation_id)
    if not retrieval_success:
        print("\n❌ Retrieval test failed. Aborting remaining tests.")
        return False
    
    # Test recent conversations
    recent_success = await test_recent_conversations()
    
    # Test conversation search
    search_success = await test_conversation_search()
    
    # Test database statistics
    stats_success = await test_db_stats()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Connection test: {'✅ Passed' if connection_success else '❌ Failed'}")
    print(f"Conversation logging test: {'✅ Passed' if conversation_id else '❌ Failed'}")
    print(f"Conversation retrieval test: {'✅ Passed' if retrieval_success else '❌ Failed'}")
    print(f"Recent conversations test: {'✅ Passed' if recent_success else '❌ Failed'}")
    print(f"Conversation search test: {'✅ Passed' if search_success else '❌ Failed'}")
    print(f"Database statistics test: {'✅ Passed' if stats_success else '❌ Failed'}")
    
    overall_success = all([
        connection_success,
        bool(conversation_id),
        retrieval_success,
        recent_success,
        search_success,
        stats_success
    ])
    
    print(f"\nOverall result: {'✅ All tests passed' if overall_success else '❌ Some tests failed'}")
    return overall_success

if __name__ == "__main__":
    try:
        asyncio.run(run_tests())
    except KeyboardInterrupt:
        print("\nTests interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error during tests: {str(e)}")
        import traceback
        traceback.print_exc() 