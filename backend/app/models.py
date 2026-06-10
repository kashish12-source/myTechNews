from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

class Article(Base):
    __tablename__ = "articles"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(500), unique=True, index=True, nullable=False)
    source = Column(String(100), nullable=False)
    date = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    importance = Column(String(50), default="medium")
    sentiment = Column(String(50), default="neutral")
    created_at = Column(DateTime, default=func.now())

class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, default=1)
    last_updated = Column(String(100), nullable=True)
    is_updating = Column(Boolean, default=False)

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())

class SavedArticle(Base):
    __tablename__ = "saved_articles"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    article_id = Column(String(50), index=True, nullable=False)
    list_type = Column(String(50), nullable=False)  # "watch_later" or "read_later"
    created_at = Column(DateTime, default=func.now())

