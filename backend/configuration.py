# filepath: configuration.py
from typing import List, Dict, Any, Type
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Server Configuration
PORT = os.getenv("PORT", "3050")  # Keep as string since that's what the test expects

# Sentry Configuration
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
SENTRY_TRACES_SAMPLE_RATE = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "1.0"))
SENTRY_PROFILES_SAMPLE_RATE = float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "1.0"))
SENTRY_ENVIRONMENT = os.getenv("SENTRY_ENVIRONMENT", "development")
SENTRY_ENABLE_TRACING = os.getenv("SENTRY_ENABLE_TRACING", "true").lower() == "true"
SENTRY_SEND_DEFAULT_PII = os.getenv("SENTRY_SEND_DEFAULT_PII", "true").lower() == "true"

# API Configuration
SUPPORTED_PROVIDERS = os.getenv("SUPPORTED_PROVIDERS", "gpt,claude,gemini").split(",")

# Validate supported providers
VALID_PROVIDERS = ["gpt", "claude", "gemini", "groq"]
for provider in SUPPORTED_PROVIDERS:
    if provider not in VALID_PROVIDERS:
        raise ValueError(f"Environment Error: Invalid provider '{provider}' in SUPPORTED_PROVIDERS")

# Message Validation
MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", 24000))
MAX_MESSAGES_IN_CONTEXT = int(os.getenv("MAX_MESSAGES_IN_CONTEXT", 50))
MIN_MESSAGE_LENGTH = int(os.getenv("MIN_MESSAGE_LENGTH", 1))

# Provider Models
OPENAI_MODEL_DEFAULT = os.getenv("OPENAI_MODEL_DEFAULT", "gpt-4o")
OPENAI_MODEL_FALLBACK = os.getenv("OPENAI_MODEL_FALLBACK", "gpt-4o-mini")
ANTHROPIC_MODEL_DEFAULT = os.getenv("ANTHROPIC_MODEL_DEFAULT", "claude-3-5-sonnet-latest")
ANTHROPIC_MODEL_FALLBACK = os.getenv("ANTHROPIC_MODEL_FALLBACK", "claude-3-5-haiku-latest")
GEMINI_MODEL_DEFAULT = os.getenv("GEMINI_MODEL_DEFAULT", "gemini-2.0-flash")
GEMINI_MODEL_FALLBACK = os.getenv("GEMINI_MODEL_FALLBACK", "gemini-1.5-pro")
GROQ_MODEL_DEFAULT = os.getenv("GROQ_MODEL_DEFAULT", "llama-3.3-70b-versatile")
GROQ_MODEL_FALLBACK = os.getenv("GROQ_MODEL_FALLBACK", "mixtral-8x7b-32768")

# Temperature Settings
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", 0.3))
ANTHROPIC_TEMPERATURE = float(os.getenv("ANTHROPIC_TEMPERATURE", 0.3))
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", 0.3))
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", 0.3))

# Token Limits
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", 8192))
ANTHROPIC_MAX_TOKENS = int(os.getenv("ANTHROPIC_MAX_TOKENS", 8192))
GEMINI_MAX_TOKENS = int(os.getenv("GEMINI_MAX_TOKENS", 8192))
GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", 8192))

# System Prompts
GENERIC_SYSTEM_PROMPT = os.getenv("GENERIC_SYSTEM_PROMPT", "You are a helpful AI assistant that provides accurate and informative responses.")
GPT_SYSTEM_PROMPT = os.getenv("GPT_SYSTEM_PROMPT", "You are ChatGPT, a helpful AI assistant that provides accurate and informative responses.")
CLAUDE_SYSTEM_PROMPT = os.getenv("CLAUDE_SYSTEM_PROMPT", "You are Claude, a highly capable AI assistant created by Anthropic, focused on providing accurate, nuanced, and helpful responses.")
GEMINI_SYSTEM_PROMPT = os.getenv("GEMINI_SYSTEM_PROMPT", "You are Gemini, a helpful and capable AI assistant created by Google, focused on providing clear and accurate responses.")
GROQ_SYSTEM_PROMPT = os.getenv("GROQ_SYSTEM_PROMPT", "You are a helpful AI assistant powered by Groq, focused on providing fast and accurate responses.")

# Logging Configuration
LOG_SETTINGS = {
    'LEVEL': os.getenv("LOG_LEVEL", "info").upper(),
    'DIR': os.getenv("LOG_DIR", "logs"),
    'FILE_PATH': os.getenv("LOG_FILE_PATH", "logs/app.log"),
    'FORMAT': '%(timestamp)s - %(name)s - %(levelname)s - %(message)s',
    'MAX_BYTES': int(os.getenv("LOG_MAX_BYTES", 10485760)),
    'BACKUP_COUNT': int(os.getenv("LOG_BACKUP_COUNT", 5)),
    # Conversation logging settings
    'ENABLE_CONVERSATION_LOGGING': os.getenv('ENABLE_CONVERSATION_LOGGING', 'true').lower() == 'true',
    'CONVERSATION_LOG_MAX_SIZE': int(os.getenv('CONVERSATION_LOG_MAX_SIZE', 10485760)),  # 10MB
    'CONVERSATION_LOG_BACKUP_COUNT': int(os.getenv('CONVERSATION_LOG_BACKUP_COUNT', 5))
}

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Response timeout
RESPONSE_TIMEOUT = float(os.getenv("RESPONSE_TIMEOUT", 30.0))

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", 500))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", 3600))

# Environment
PYSERVER_ENV = os.getenv("PYSERVER_ENV", "development")

# Test Configuration
ENABLE_FULL_RATE_LIMIT_TEST = os.getenv("ENABLE_FULL_RATE_LIMIT_TEST", "false").lower() == "true"

# Centralized provider configuration
PROVIDER_SETTINGS = {
    'gpt': {
        'api_key': OPENAI_API_KEY,
        'default_model': OPENAI_MODEL_DEFAULT,
        'fallback_model': OPENAI_MODEL_FALLBACK,
        'temperature': OPENAI_TEMPERATURE,
        'max_tokens': OPENAI_MAX_TOKENS,
        'system_prompt': GPT_SYSTEM_PROMPT
    },
    'claude': {
        'api_key': ANTHROPIC_API_KEY,
        'default_model': ANTHROPIC_MODEL_DEFAULT,
        'fallback_model': ANTHROPIC_MODEL_FALLBACK,
        'temperature': ANTHROPIC_TEMPERATURE,
        'max_tokens': ANTHROPIC_MAX_TOKENS,
        'system_prompt': CLAUDE_SYSTEM_PROMPT
    },
    'gemini': {
        'api_key': GEMINI_API_KEY,
        'default_model': GEMINI_MODEL_DEFAULT,
        'fallback_model': GEMINI_MODEL_FALLBACK,
        'temperature': GEMINI_TEMPERATURE,
        'max_tokens': GEMINI_MAX_TOKENS,
        'system_prompt': GEMINI_SYSTEM_PROMPT
    },
    'groq': {
        'api_key': GROQ_API_KEY,
        'default_model': GROQ_MODEL_DEFAULT,
        'fallback_model': GROQ_MODEL_FALLBACK,
        'temperature': GROQ_TEMPERATURE,
        'max_tokens': GROQ_MAX_TOKENS,
        'system_prompt': GROQ_SYSTEM_PROMPT
    }
}

# Add after API key definitions
def validate_api_keys():
    for provider, settings in PROVIDER_SETTINGS.items():
        if provider in SUPPORTED_PROVIDERS and not settings['api_key']:
            raise ValueError(f"API key for {provider} is required but not set")

validate_api_keys()

