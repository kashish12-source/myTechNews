import sys
import os

# Append project root to path for backend imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
