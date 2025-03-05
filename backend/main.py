# filepath: main.py
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import time
import uvicorn
from models import ChatRequest, HealthResponse
from aiproviders import stream_response, health_check_provider
from logging_config import logger, debug_with_context, get_request_id, set_request_id
import traceback
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from configuration import (
    PORT, SUPPORTED_PROVIDERS, PROVIDER_SETTINGS,
    SENTRY_DSN, SENTRY_TRACES_SAMPLE_RATE, SENTRY_PROFILES_SAMPLE_RATE,
    SENTRY_ENVIRONMENT, SENTRY_ENABLE_TRACING, SENTRY_SEND_DEFAULT_PII
)
import os
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from datetime import datetime, timezone
import supabase_client
import json

# Request ID middleware
class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to assign and track request IDs throughout the request lifecycle."""
    
    async def dispatch(self, request: Request, call_next):
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Store in context for this request
        set_request_id(request_id)
        
        # Add request ID to Sentry scope if enabled
        if SENTRY_DSN:
            sentry_sdk.set_tag("request_id", request_id)
        
        # Log the incoming request with request ID
        debug_with_context(logger,
            f"Request started: {request.method} {request.url.path}",
            request_id=request_id,
            client_host=request.client.host if request.client else "unknown",
            path=request.url.path,
            method=request.method
        )
        
        # Process the request
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        # Log the completed request
        debug_with_context(logger,
            f"Request completed: {request.method} {request.url.path}",
            request_id=request_id,
            duration=f"{duration:.3f}s",
            status_code=response.status_code
        )
        
        return response

# Initialize Sentry
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=SENTRY_ENVIRONMENT,
        send_default_pii=SENTRY_SEND_DEFAULT_PII,
        traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE if SENTRY_ENABLE_TRACING else 0.0,
        profiles_sample_rate=SENTRY_PROFILES_SAMPLE_RATE if SENTRY_ENABLE_TRACING else 0.0,
        integrations=[
            FastApiIntegration(),
        ],
        _experiments={
            "continuous_profiling_auto_start": True,
        },
    )
    logger.info(f"Sentry initialized with environment: {SENTRY_ENVIRONMENT}")
else:
    logger.warning("Sentry DSN not provided. Sentry integration disabled.")

# Initialize FastAPI
app = FastAPI(
    title="AI Chat API Server",
    description="A FastAPI-based server providing a unified interface to multiple AI chat providers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"favicon": "/static/favicon.png"},
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request ID middleware
app.add_middleware(RequestIDMiddleware)

# Exception handler to include request ID in error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Add request ID to HTTP exception responses"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.status_code,
            "message": exc.detail,
            "request_id": get_request_id(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Add request ID to general exception responses"""
    # Log the exception with request ID
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "request_id": get_request_id(),
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )
    
    # Capture in Sentry if enabled
    if SENTRY_DSN:
        sentry_sdk.capture_exception(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": 500,
            "message": "Internal server error",
            "request_id": get_request_id(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

# Root route to serve custom HTML with favicon
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the custom HTML page with favicon"""
    return FileResponse("static/custom_docs.html")

# Favicon route for browsers that look for favicon.ico in the root
@app.get("/favicon.ico", include_in_schema=False)
async def get_favicon():
    """Serve the favicon directly"""
    return FileResponse("static/favicon.ico")

# Health check endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Overall system health check"""
    logger.info("Health check endpoint called")
    try:
        return {"status": "OK", "message": "System operational"}
    except Exception as e:
        logger.error("Health check failed", exc_info=True)
        return {
            "status": "ERROR",
            "error": {"message": str(e)}
        }

@app.get("/health/{provider}")
async def provider_health_check(provider: str):
    """Check health of a specific provider."""
    logger.info(f"Provider health check called for: {provider}")
    
    # First validate the provider
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Invalid provider. Supported providers are: {', '.join(SUPPORTED_PROVIDERS)}")
    
    try:
        success, message, duration = await health_check_provider(provider)
        
        debug_with_context(
            logger,
            f"Health check completed for {provider}",  # message as first arg
            success=success,
            duration=f"{duration:.3f}s"
        )
        
        return {
            "provider": provider,
            "status": "OK" if success else "ERROR",
            "message": message,
            "metrics": {
                "responseTime": f"{duration:.3f}s"
            },
            "error": {"message": message} if not success else None
        }
    except Exception as e:
        logger.error(f"Health check failed for provider {provider}")
        logger.error(traceback.format_exc())
        return {
            "provider": provider,
            "status": "ERROR",
            "error": {"message": str(e)},
            "metrics": {
                "responseTime": "N/A"
            }
        }

# Sentry test endpoint
@app.get("/sentry-debug")
async def trigger_error():
    """Endpoint to test Sentry integration by triggering a division by zero error."""
    logger.info("Sentry debug endpoint called")
    division_by_zero = 1 / 0
    return {"message": "This will never be returned"}

# Initialize Supabase
@app.on_event("startup")
async def startup_db_client():
    """Initialize the Supabase client on startup."""
    try:
        success = await supabase_client.init_db()
        if success:
            logger.info("Supabase client initialized successfully")
        else:
            logger.warning("Supabase client initialization had issues - check logs")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        if SENTRY_DSN:
            sentry_sdk.capture_exception(e)

# Chat endpoint
@app.post("/chat/{provider}")
async def chat(provider: str, request: ChatRequest, client_request: Request):
    """Stream chat responses from an AI provider"""
    debug_with_context(logger,
        "Chat endpoint called",
        provider=provider,
        message_count=len(request.messages),
        validation_state="post-fastapi-validation",
        request_id=get_request_id()
    )
    start_time = time.time()

    # Validate provider first
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid provider. Supported providers are: {', '.join(SUPPORTED_PROVIDERS)}"
        )

    # Validate messages
    if not request.messages:
        raise HTTPException(
            status_code=422,
            detail="No messages provided in request"
        )

    try:
        debug_with_context(logger,
            f"Chat request received for provider: {provider}",
            message_count=len(request.messages),
            first_message_role=request.messages[0].role if request.messages else None
        )

        # Generate conversation ID
        conversation_id = str(uuid.uuid4())
        
        # Log conversation start in Supabase
        client_info = {
            "ip": client_request.client.host if client_request.client else "unknown",
            "user_agent": client_request.headers.get("user-agent", "unknown"),
            "origin": client_request.headers.get("origin", "unknown")
        }
        
        await supabase_client.log_conversation_start(
            conversation_id=conversation_id,
            provider=provider,
            request_id=get_request_id(),
            client_info=client_info,
            metadata={
                "message_count": len(request.messages),
                "first_message_role": request.messages[0].role if request.messages else None
            }
        )
        
        # Log user message
        if request.messages:
            user_message = next((m for m in reversed(request.messages) if m.role == "user"), None)
            if user_message:
                await supabase_client.log_message(
                    conversation_id=conversation_id,
                    role="user",
                    content=user_message.content,
                    model=None
                )

        # Create streaming response
        async def wrapped_stream_response():
            response_content = ""
            async for chunk in stream_response(request, provider, conversation_id):
                # Accumulate response content
                if not chunk.startswith("data: [DONE]") and chunk.startswith("data: "):
                    try:
                        # Extract content from SSE format
                        json_str = chunk[6:].strip()  # Remove "data: " prefix
                        if json_str:
                            data = json.loads(json_str)
                            if "delta" in data and "content" in data["delta"]:
                                response_content += data["delta"]["content"]
                    except Exception as e:
                        logger.error(f"Error parsing chunk: {str(e)}")
                
                # Forward chunk to client
                yield chunk
            
            # Log assistant message at the end of the stream
            if response_content:
                await supabase_client.log_message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=response_content,
                    model=PROVIDER_SETTINGS[provider].get("default_model", "unknown")
                )
            
            # Log conversation end
            await supabase_client.log_conversation_end(conversation_id)

        response = StreamingResponse(
            wrapped_stream_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

        init_duration = time.time() - start_time
        debug_with_context(logger,
            "Chat stream response initialized",
            init_duration=f"{init_duration:.3f}s",
            provider=provider,
            conversation_id=conversation_id
        )
        return response

    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        # Capture exception in Sentry with additional context
        if SENTRY_DSN:
            sentry_sdk.set_context("request", {
                "provider": provider,
                "message_count": len(request.messages),
                "first_message_role": request.messages[0].role if request.messages else None
            })
            sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Chat error with {provider}: {str(e)}")

# Add conversation history endpoints
@app.get("/conversations")
async def get_conversations(limit: int = 10, offset: int = 0):
    """Get recent conversations"""
    try:
        conversations = await supabase_client.get_recent_conversations(limit, offset)
        return {"conversations": conversations, "count": len(conversations)}
    except Exception as e:
        logger.error(f"Error retrieving conversations: {str(e)}")
        if SENTRY_DSN:
            sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all messages"""
    try:
        conversation, messages = await supabase_client.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        return {
            "conversation": conversation,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation {conversation_id}: {str(e)}")
        if SENTRY_DSN:
            sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")

@app.get("/conversations/search")
async def search_conversations(
    query: str,
    provider: str = None,
    start_date: str = None,
    end_date: str = None,
    limit: int = 10,
    offset: int = 0
):
    """Search for conversations containing specific text"""
    try:
        conversations = await supabase_client.search_conversations(
            query, provider, start_date, end_date, limit, offset
        )
        return {"conversations": conversations, "count": len(conversations)}
    except Exception as e:
        logger.error(f"Error searching conversations: {str(e)}")
        if SENTRY_DSN:
            sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Error searching conversations: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get database statistics"""
    try:
        stats = await supabase_client.get_db_stats()
        return stats
    except Exception as e:
        logger.error(f"Error retrieving stats: {str(e)}")
        if SENTRY_DSN:
            sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)