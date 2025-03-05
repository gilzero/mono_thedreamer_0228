-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY,
    provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    client_info JSONB,
    request_id TEXT,
    metadata JSONB
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model TEXT,
    tokens INTEGER,
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow full access to authenticated users" 
ON conversations FOR ALL TO authenticated 
USING (true);

CREATE POLICY "Allow full access to authenticated users" 
ON messages FOR ALL TO authenticated 
USING (true);

-- Create policies for anonymous users (if needed)
-- Allow anonymous users to read, insert, and update conversations
CREATE POLICY "Allow read access to anonymous users" 
ON conversations FOR SELECT TO anon 
USING (true);

CREATE POLICY "Allow insert access to anonymous users" 
ON conversations FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Allow update access to anonymous users" 
ON conversations FOR UPDATE TO anon 
USING (true);

-- Allow anonymous users to read, insert messages
CREATE POLICY "Allow read access to anonymous users" 
ON messages FOR SELECT TO anon 
USING (true);

CREATE POLICY "Allow insert access to anonymous users" 
ON messages FOR INSERT TO anon 
WITH CHECK (true);

-- Create a function to search conversations by content
CREATE OR REPLACE FUNCTION search_conversations(search_query TEXT)
RETURNS TABLE (conversation_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT m.conversation_id
    FROM messages m
    WHERE m.content ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql; 