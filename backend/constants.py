"""
Constants used throughout the application.
"""

# Server-Sent Events (SSE) format constants
class SSEFormat:
    """Constants for Server-Sent Events (SSE) format."""
    DATA_PREFIX = "data: "
    NEWLINE_SEPARATOR = "\n\n"
    DONE_MARKER = "[DONE]"
    
    # Complete SSE format strings
    DONE_MESSAGE = f"{DATA_PREFIX}{DONE_MARKER}{NEWLINE_SEPARATOR}"
    
    @staticmethod
    def format_data(data_json: str) -> str:
        """Format JSON data as an SSE message."""
        return f"{SSEFormat.DATA_PREFIX}{data_json}{SSEFormat.NEWLINE_SEPARATOR}" 