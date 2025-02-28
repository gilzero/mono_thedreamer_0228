# filepath: providers/factory.py
from typing import Dict, Any, Optional, Type
from fastapi import HTTPException
from logging_config import logger
from providers.base import BaseProvider
from configuration import PROVIDER_SETTINGS, SUPPORTED_PROVIDERS

# Import all provider implementations
from providers.openai_provider import OpenAIProvider
from providers.anthropic_provider import AnthropicProvider
from providers.gemini_provider import GeminiProvider
from providers.groq_provider import GroqProvider

class ProviderFactory:
    """Factory class for creating and managing provider instances."""
    
    _instances: Dict[str, BaseProvider] = {}
    _provider_classes: Dict[str, Type[BaseProvider]] = {
        'gpt': OpenAIProvider,
        'claude': AnthropicProvider,
        'gemini': GeminiProvider,
        'groq': GroqProvider
    }
    
    @classmethod
    def get_provider(cls, provider_name: str) -> BaseProvider:
        """
        Get a provider instance by name.
        
        Args:
            provider_name: The name of the provider to get
            
        Returns:
            An instance of the provider
            
        Raises:
            HTTPException: If the provider is not supported or not initialized
        """
        if provider_name not in SUPPORTED_PROVIDERS:
            raise HTTPException(status_code=400, detail=f"Provider {provider_name} not supported")
        
        if provider_name not in cls._instances:
            cls._initialize_provider(provider_name)
            
        if provider_name not in cls._instances:
            raise HTTPException(status_code=500, detail=f"Provider {provider_name} could not be initialized")
            
        return cls._instances[provider_name]
    
    @classmethod
    def _initialize_provider(cls, provider_name: str) -> None:
        """
        Initialize a provider instance.
        
        Args:
            provider_name: The name of the provider to initialize
        """
        if provider_name not in PROVIDER_SETTINGS:
            logger.warning(f"Provider {provider_name} is supported but not properly configured")
            return
            
        settings = PROVIDER_SETTINGS[provider_name]
        
        if provider_name not in cls._provider_classes:
            logger.warning(f"Provider class for {provider_name} not found")
            return
            
        if not settings['api_key']:
            logger.warning(f"API key for provider {provider_name} not found")
            return
            
        try:
            provider_class = cls._provider_classes[provider_name]
            cls._instances[provider_name] = provider_class(
                api_key=settings['api_key'],
                default_model=settings['default_model'],
                fallback_model=settings['fallback_model'],
                temperature=settings['temperature'],
                max_tokens=settings['max_tokens'],
                system_prompt=settings['system_prompt']
            )
            logger.info(f"Provider {provider_name} initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing provider {provider_name}: {str(e)}")
    
    @classmethod
    def initialize_all_providers(cls) -> None:
        """Initialize all supported providers."""
        for provider_name in SUPPORTED_PROVIDERS:
            if provider_name not in cls._instances:
                cls._initialize_provider(provider_name)
                
    @classmethod
    def get_all_providers(cls) -> Dict[str, BaseProvider]:
        """Get all initialized provider instances."""
        return cls._instances 