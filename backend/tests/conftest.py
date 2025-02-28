# filepath: tests/conftest.py
import pytest
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add project root to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

@pytest.fixture(autouse=True)
def setup_test_env():
    """Setup test environment variables"""
    load_dotenv()
    # Override any environment variables for testing
    os.environ["OPENAI_MODEL_DEFAULT"] = "gpt-4o"
    os.environ["CLAUDE_MODEL_DEFAULT"] = "claude-3-5-sonnet-latest"
    os.environ["GEMINI_MODEL_DEFAULT"] = "gemini-2.0-flash" 