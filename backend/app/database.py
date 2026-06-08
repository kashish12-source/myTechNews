from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from backend.app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db")

Base = declarative_base()

db_url = settings.DATABASE_URL

# Normalize Vercel/Heroku style postgres urls and add pg8000 driver
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

try:
    if "postgresql" in db_url:
        engine = create_engine(db_url, pool_pre_ping=True)
        # Test connection
        conn = engine.connect()
        conn.close()
        logger.info("Database: Connected to PostgreSQL successfully.")
    else:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        logger.info("Database: Running on local SQLite database.")
except Exception as e:
    logger.error(f"Database: Failed to connect to {db_url} due to: {e}. Falling back to local SQLite.")
    db_url = "sqlite:///./my_tech_news.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
