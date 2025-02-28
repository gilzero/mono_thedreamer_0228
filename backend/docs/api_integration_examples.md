## Development Guide

### API Integration Examples

#### JavaScript/TypeScript (Fetch API)
```typescript
async function chatWithAI(messages: Array<{role: string, content: string}>) {
  const response = await fetch('http://localhost:3050/chat/gpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  // Handle SSE stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const {value, done} = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data === '[DONE]') break;
        
        console.log('Content:', data.delta.content);
        console.log('Model used:', data.delta.model);
      }
    }
  }
}

// Example usage
chatWithAI([
  { role: 'user', content: 'Hello!' }
]);
```

#### Python (aiohttp)
```python
import aiohttp
import asyncio
import json

async def chat_with_ai(messages):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'http://localhost:3050/chat/claude',
            json={'messages': messages}
        ) as response:
            async for line in response.content:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]  # Remove 'data: ' prefix
                    if data.strip() == '[DONE]':
                        break
                    
                    chunk = json.loads(data)
                    print('Content:', chunk['delta']['content'])
                    print('Model:', chunk['delta']['model'])

# Example usage
async def main():
    messages = [
        {'role': 'user', 'content': 'Write a hello world program'}
    ]
    await chat_with_ai(messages)

asyncio.run(main())
```

#### Go
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "bufio"
)

type Message struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatRequest struct {
    Messages []Message `json:"messages"`
}

type DeltaResponse struct {
    Content string `json:"content"`
    Model   string `json:"model"`
}

type ChatResponse struct {
    ID    string       `json:"id"`
    Delta DeltaResponse `json:"delta"`
}

func chatWithAI() error {
    messages := []Message{
        {Role: "user", Content: "Hello!"},
    }
    
    reqBody, err := json.Marshal(ChatRequest{Messages: messages})
    if err != nil {
        return err
    }

    resp, err := http.Post(
        "http://localhost:3050/chat/gemini",
        "application/json",
        bytes.NewBuffer(reqBody),
    )
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    reader := bufio.NewReader(resp.Body)
    for {
        line, err := reader.ReadString('\n')
        if err != nil {
            break
        }

        if len(line) > 6 && line[:6] == "data: " {
            data := line[6:]
            if data == "[DONE]" {
                break
            }

            var response ChatResponse
            if err := json.Unmarshal([]byte(data), &response); err != nil {
                continue
            }

            fmt.Printf("Content: %s\n", response.Delta.Content)
            fmt.Printf("Model: %s\n", response.Delta.Model)
        }
    }

    return nil
}

func main() {
    if err := chatWithAI(); err != nil {
        fmt.Printf("Error: %v\n", err)
    }
}
```

#### PHP (using Guzzle)
```php
<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Stream;

function chatWithAI($messages) {
    $client = new Client();

    $response = $client->post('http://localhost:3050/chat/gpt', [
        'json' => [
            'messages' => $messages
        ],
        'stream' => true
    ]);

    $body = $response->getBody();
    while (!$body->eof()) {
        $line = $body->readline();
        
        if (strpos($line, 'data: ') === 0) {
            $data = substr($line, 6); // Remove 'data: ' prefix
            
            if ($data === '[DONE]') {
                break;
            }
            
            $chunk = json_decode($data, true);
            echo "Content: " . $chunk['delta']['content'] . "\n";
            echo "Model: " . $chunk['delta']['model'] . "\n";
        }
    }
}

// Example usage
$messages = [
    [
        'role' => 'user',
        'content' => 'Hello!'
    ]
];

chatWithAI($messages);
```

#### React (using EventSource)
```typescript
import { useEffect, useState } from 'react';

interface Message {
  role: string;
  content: string;
}

interface ChatResponse {
  id: string;
  delta: {
    content: string;
    model: string;
  };
}

function ChatComponent() {
  const [response, setResponse] = useState<string>('');
  const [model, setModel] = useState<string>('');

  const sendChat = async (messages: Message[]) => {
    const response = await fetch('http://localhost:3050/chat/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          const parsedData: ChatResponse = JSON.parse(data);
          setResponse(prev => prev + parsedData.delta.content);
          setModel(parsedData.delta.model);
        }
      }
    }
  };

  return (
    <div>
      <button onClick={() => sendChat([
        { role: 'user', content: 'Hello!' }
      ])}>
        Send Message
      </button>
      <div>Response: {response}</div>
      <div>Model: {model}</div>
    </div>
  );
}

export default ChatComponent;
```

### Notes for Developers
- All examples handle Server-Sent Events (SSE) streaming
- Remember to handle errors appropriately in production code
- The response stream format is consistent across all providers
- Model information is available in each response chunk
- No need to specify model in requests - it's handled by backend

