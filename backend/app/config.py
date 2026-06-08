import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load dotenv if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    # Fallback to loading root .env if it exists
    root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    if os.path.exists(root_env_path):
        load_dotenv(root_env_path)

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 3001
    DATABASE_URL: str = "sqlite:///./my_tech_news.db"
    JWT_SECRET: str = "supersecretkeyformytechnewsaggregator"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Post-load verification for security
if settings.ENVIRONMENT == "production" and settings.JWT_SECRET == "supersecretkeyformytechnewsaggregator":
    # In production, require a strong JWT secret
    import secrets
    settings.JWT_SECRET = secrets.token_hex(32)
