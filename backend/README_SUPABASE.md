# Supabase Integration for Conversation Logging

This document provides instructions for setting up and using Supabase for conversation logging in the AI Chat API Server.

## Overview

The Supabase integration allows for storing and retrieving conversation data, including:
- Conversation metadata (provider, timestamps, client info)
- Individual messages (user and assistant)
- Search and retrieval capabilities

## Setup Instructions

### 1. Create a Supabase Project

1. Sign up or log in at [Supabase](https://supabase.com/)
2. Create a new project
3. Note your project URL and API key (found in Project Settings > API)

### 2. Set Environment Variables

Add the following environment variables to your project:

```bash
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_api_key
```

Alternatively, update the default values in `supabase_config.py`.

### 3. Create Database Tables

Run the SQL script in the Supabase SQL Editor:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `backend/sql/create_tables.sql`
3. Paste and execute the SQL in the editor

The script will create:
- `conversations` table
- `messages` table
- Necessary indexes and constraints
- Row-level security policies

### 4. Verify Row Level Security (RLS) Policies

It's crucial to ensure that the RLS policies are correctly set up:

1. Go to the Supabase Dashboard > Authentication > Policies
2. Verify that the following policies exist for both tables:
   - For authenticated users: Allow full access (SELECT, INSERT, UPDATE, DELETE)
   - For anonymous users: Allow SELECT, INSERT, and UPDATE access

If you encounter "401 Unauthorized" errors or "violates row-level security policy" messages:

1. Run the updated SQL script that includes all necessary policies
2. Or manually add the missing policies in the Supabase Dashboard:
   ```sql
   -- For conversations table
   CREATE POLICY "Allow insert access to anonymous users" 
   ON conversations FOR INSERT TO anon 
   WITH CHECK (true);

   CREATE POLICY "Allow update access to anonymous users" 
   ON conversations FOR UPDATE TO anon 
   USING (true);

   -- For messages table
   CREATE POLICY "Allow insert access to anonymous users" 
   ON messages FOR INSERT TO anon 
   WITH CHECK (true);
   ```

### 5. Test the Connection

Start the server and check the logs to ensure the Supabase connection is working:

```bash
python main.py
```

Look for the log message: "Supabase client initialized successfully"

You can also run the test script to verify all functionality:

```bash
./test_supabase.py
```

## API Endpoints

The following endpoints are available for conversation data:

- `GET /conversations` - Get recent conversations
- `GET /conversations/{conversation_id}` - Get a specific conversation with all messages
- `GET /conversations/search?query=text` - Search for conversations containing specific text
- `GET /stats` - Get database statistics

## Configuration

You can customize the Supabase integration by modifying `supabase_config.py`:

- `CONVERSATION_SETTINGS` - Retention period and limits
- `TABLES` - Table names
- `DEFAULTS` - Default pagination values
- `QUERY_SETTINGS` - Maximum result limits

## Database Schema

### Conversations Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| provider | TEXT | AI provider name |
| created_at | TIMESTAMP | Creation timestamp |
| ended_at | TIMESTAMP | End timestamp |
| client_info | JSONB | Client information |
| request_id | TEXT | Request ID for correlation |
| metadata | JSONB | Additional metadata |

### Messages Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key to conversations |
| role | TEXT | Message role (user, assistant, system) |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Creation timestamp |
| model | TEXT | AI model used (for assistant messages) |
| tokens | INTEGER | Token count |

## Troubleshooting

### Connection Issues

If you see "Error connecting to Supabase" in the logs:

1. Verify your Supabase URL and API key
2. Check that the tables have been created correctly
3. Ensure your Supabase project is active

### Row Level Security (RLS) Issues

If you see errors like "401 Unauthorized" or "violates row-level security policy":

1. Check that all necessary RLS policies are in place (see "Verify Row Level Security Policies" section)
2. Verify you're using the correct API key (anon key for anonymous access)
3. Try running the SQL script again to recreate the policies
4. Check the Supabase Dashboard > Authentication > Policies to manually verify and fix policies

### Missing Tables

If you see "Please create the required tables in the Supabase dashboard":

1. Run the SQL script from `backend/sql/create_tables.sql` in the Supabase SQL Editor
2. Restart the server

## Security Considerations

- The default setup uses the anonymous key. For production, consider using JWT authentication.
- Row-level security is enabled but configured to allow anonymous access. Adjust the policies as needed.
- Consider enabling encryption at rest in your Supabase project settings.
- For production environments, you may want to restrict the RLS policies further to prevent unauthorized access.