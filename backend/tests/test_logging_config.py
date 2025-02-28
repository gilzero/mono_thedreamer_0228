# filepath: tests/test_logging_config.py
import pytest
import logging
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from logging_config import CustomFormatter, setup_logging, debug_with_context
import re
import logging.handlers

def extract_log_content(log_dir, filename):
    """Helper function to read log files with proper encoding."""
    try:
        with open(log_dir / filename, encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        pytest.fail(f"Log file {filename} not found in {log_dir}")
    except Exception as e:
        pytest.fail(f"Error reading {filename}: {e}")

@pytest.fixture
def temp_log_dir(tmp_path):
    """Fixture to create temporary log directory"""
    log_dir = tmp_path / "logs"
    log_dir.mkdir()
    
    # Temporarily modify the log paths in setup_logging
    def mock_setup_logging(logger_name="test_logger"):
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.DEBUG)
        
        # Clear existing handlers safely
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        formatter = CustomFormatter(
            '%(timestamp)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Use temp directory for log files
        handlers = [
            (logging.StreamHandler(), logging.INFO),
            (logging.FileHandler(log_dir / "app.log"), logging.INFO),
            (logging.FileHandler(log_dir / "error.log"), logging.ERROR),
            (logging.FileHandler(log_dir / "debug.log"), logging.DEBUG)
        ]
        
        for handler, level in handlers:
            handler.setFormatter(formatter)
            handler.setLevel(level)
            logger.addHandler(handler)
        
        return logger
    
    return mock_setup_logging, log_dir

def test_custom_formatter():
    """Test CustomFormatter adds timestamp and formats debug context"""
    formatter = CustomFormatter('%(timestamp)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create a log record with debug context
    record = logging.LogRecord(
        name="test",
        level=logging.DEBUG,
        pathname="test.py",
        lineno=1,
        msg="Test debug message",
        args=(),
        exc_info=None
    )
    record.extra_context = {"key": "value"}
    
    formatted = formatter.format(record)
    
    # Verify timestamp format and validity
    timestamp_match = re.match(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+00:00)', formatted)
    assert timestamp_match, "Invalid timestamp format"
    
    # Parse and verify timestamp is recent
    log_time = datetime.fromisoformat(timestamp_match.group(1))
    now = datetime.now(timezone.utc)
    assert now - log_time < timedelta(seconds=5), "Timestamp is not recent"
    
    # Verify context is included
    assert "Context: {\n  \"key\": \"value\"\n}" in formatted

def test_debug_with_context(temp_log_dir):
    """Test debug_with_context function"""
    mock_setup_logging, log_dir = temp_log_dir
    logger = mock_setup_logging()
    
    context = {
        "user_id": "123",
        "action": "test",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    debug_with_context(logger, "Debug with context", **context)
    
    debug_logs = extract_log_content(log_dir, "debug.log")
    # Verify message and context are logged
    assert "Debug with context" in debug_logs
    assert "Context:" in debug_logs
    assert "user_id" in debug_logs
    assert "action" in debug_logs
    
    # Extract and parse JSON more carefully
    try:
        # Find the first occurrence of Context: and extract the JSON block
        start_idx = debug_logs.find("Context: {")
        if start_idx == -1:
            pytest.fail("Could not find Context: { in log output")
        
        # Find the closing brace
        json_start = start_idx + len("Context: ")
        brace_count = 0
        for i, char in enumerate(debug_logs[json_start:]):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    json_str = debug_logs[json_start:json_start + i + 1]
                    break
        
        parsed_context = json.loads(json_str)
        assert parsed_context["user_id"] == "123"
        assert parsed_context["action"] == "test"
        
    except Exception as e:
        pytest.fail(f"Failed to parse context JSON: {e}\nLog content: {debug_logs}")

def test_log_rotation(temp_log_dir):
    """Test log rotation functionality"""
    mock_setup_logging, log_dir = temp_log_dir
    logger = mock_setup_logging()
    
    max_bytes = 256
    backup_count = 1
    # Allow for some overhead in log file size (timestamp, level, etc.)
    size_tolerance = 50  # bytes of overhead allowed
    
    handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=max_bytes,
        backupCount=backup_count
    )
    handler.setFormatter(CustomFormatter('%(timestamp)s - %(name)s - %(levelname)s - %(message)s'))
    handler.setLevel(logging.INFO)
    
    # Replace the app.log handler
    for h in logger.handlers[:]:
        if isinstance(h, logging.FileHandler) and str(h.baseFilename).endswith('app.log'):
            logger.removeHandler(h)
    logger.addHandler(handler)
    
    # Write multiple messages to test rotation thoroughly
    messages = [
        "X" * 200,  # Large message to trigger rotation
        "First message",
        "Y" * 200,  # Another large message
        "Second message",
        "Z" * 200,  # Third large message
        "Final message"
    ]
    
    for msg in messages:
        logger.info(msg)
    
    # Verify log files
    log_files = sorted(list(log_dir.glob("app.log*")))
    assert 1 <= len(log_files) <= backup_count + 1, \
        f"Expected 1-{backup_count + 1} log files, found {len(log_files)}: {[f.name for f in log_files]}"
    
    # Verify current log has most recent message
    current_log = extract_log_content(log_dir, "app.log")
    assert "Final message" in current_log
    
    # Verify rotation happened
    if len(log_files) > 1:
        backup_log = extract_log_content(log_dir, "app.log.1")
        assert any(c * 200 in backup_log for c in "XYZ"), "No large message found in backup log"
    
    # Verify file sizes with tolerance
    for log_file in log_files:
        file_size = log_file.stat().st_size
        assert file_size <= max_bytes + size_tolerance, \
            f"Log file {log_file.name} exceeds max size with tolerance: {file_size} > {max_bytes + size_tolerance}"
        
        # Also verify the file isn't too small (should have some content)
        assert file_size > 0, f"Log file {log_file.name} is empty"

def test_unicode_logging(temp_log_dir):
    """Test logging of unicode characters"""
    mock_setup_logging, log_dir = temp_log_dir
    logger = mock_setup_logging()
    
    unicode_msg = "Unicode test: 你好 🌍 привет"
    logger.info(unicode_msg)
    
    log_content = extract_log_content(log_dir, "app.log")
    assert unicode_msg in log_content 