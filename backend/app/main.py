import os
import json
import asyncio
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.config import settings
from backend.app.database import engine, Base, get_db
from backend.app.models import User, Article, SystemStatus, VerificationCode, SavedArticle
from backend.app.schemas import UserRegister, UserLogin, Token, NewsFeedResponse, ArticleOut, CodeVerificationRequest, SavedArticleToggle, SavedArticlesResponse
from backend.app.auth import hash_password, verify_password, create_access_token, get_current_user_email, validate_password_strength
from backend.app.email_sender import send_welcome_email, send_verification_email
from backend.app.aggregator import aggregate_news

app = FastAPI(title="MyTechNews API", version="1.0.0")

# Enable CORS for local development and Vercel hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup events: create tables, seed users, seed initial cache
@app.on_event("startup")
def startup_db_setup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    
    # 1. Seed Pre-seeded Admin User
    admin_email = "krishvishnoi@gmail.com"
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        hashed = hash_password("StrongPass@1")
        admin_user = User(email=admin_email, password_hash=hashed)
        db.add(admin_user)
        db.commit()
        print("Pre-seeded admin user created successfully.")
        
    # 2. Seed Legacy Cached Articles if database is empty
    article_count = db.query(Article).count()
    if article_count == 0:
        legacy_cache_paths = [
            # Check server legacy folder
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "server", "news-cache.json"),
            # Check direct fallback folder in frontend src/data
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "src", "data", "news-cache.json")
        ]
        
        seeded = False
        for path in legacy_cache_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    articles_list = data.get("articles", [])
                    for art in articles_list:
                        db_art = Article(
                            id=art.get("id"),
                            title=art.get("title"),
                            url=art.get("url"),
                            source=art.get("source"),
                            date=art.get("date"),
                            category=art.get("category"),
                            summary=art.get("summary"),
                            importance=art.get("importance", "medium"),
                            sentiment=art.get("sentiment", "neutral")
                        )
                        db.add(db_art)
                        
                    # Set system status last updated time
                    status = db.query(SystemStatus).first()
                    if not status:
                        status = SystemStatus(id=1, last_updated=data.get("lastUpdated", ""), is_updating=False)
                        db.add(status)
                    else:
                        status.last_updated = data.get("lastUpdated", "")
                        status.is_updating = False
                        
                    db.commit()
                    print(f"Pre-seeded database with {len(articles_list)} articles from: {path}")
                    seeded = True
                    break
                except Exception as e:
                    print(f"Failed to read/seed legacy cache from {path}: {e}")
                    db.rollback()
                    
        # If no cache could be loaded, initialize default status
        status = db.query(SystemStatus).first()
        if not status:
            status = SystemStatus(id=1, last_updated="", is_updating=False)
            db.add(status)
            db.commit()
            
    db.close()

# Background task helper
def run_background_scrape():
    from backend.app.database import SessionLocal
    db = SessionLocal()
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(aggregate_news(db))
        loop.close()
    except Exception as e:
        print(f"Background aggregation error: {e}")
    finally:
        db.close()

# Authentication API Routes
@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = user_in.email.strip().lower()
    validate_password_strength(user_in.password)
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address already registered."
        )
        
    hashed = hash_password(user_in.password)
    new_user = User(email=email, password_hash=hashed)
    db.add(new_user)
    db.commit()
    
    # Dispatch welcome letter in the background
    background_tasks.add_task(send_welcome_email, email)
    
    token = create_access_token(email)
    return Token(token=token, email=email, status="success", message="User registered successfully.")

@app.post("/api/auth/login", response_model=Token)
def login_user(user_in: UserLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = user_in.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    import secrets
    from datetime import datetime, timedelta, timezone
    
    # Generate 6-digit code
    code = "".join(secrets.choice("0123456789") for _ in range(6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    # Purge old code entries for this email address
    db.query(VerificationCode).filter(VerificationCode.email == email).delete()
    
    db_code = VerificationCode(email=email, code=code, expires_at=expires_at)
    db.add(db_code)
    db.commit()
    
    # Dispatch verification code in the background
    background_tasks.add_task(send_verification_email, email, code)
    
    return Token(
        token=None,
        email=email,
        status="verification_required",
        message="Verification code has been dispatched to your email address.",
        dev_code=code if settings.ENVIRONMENT == "development" else None
    )

@app.post("/api/auth/verify-code", response_model=Token)
def verify_code(req: CodeVerificationRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    code = req.code.strip()
    
    db_code = db.query(VerificationCode).filter(
        VerificationCode.email == email,
        VerificationCode.code == code
    ).first()
    
    if not db_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or incorrect verification code."
        )
        
    # Validate expiration
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    expires_at = db_code.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if now > expires_at:
        db.delete(db_code)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please log in again."
        )
        
    # Clean up verification code from database
    db.delete(db_code)
    db.commit()
    
    # Generate user access session token
    token = create_access_token(email)
    return Token(token=token, email=email, status="success", message="Identity verified successfully.")

# News Feed API Routes
@app.get("/api/news", response_model=NewsFeedResponse)
def get_news(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    articles = db.query(Article).all()
    status = db.query(SystemStatus).first()
    
    last_updated = status.last_updated if status else ""
    is_updating = status.is_updating if status else False
    
    # Background refresh check: if cache is older than 15 minutes, trigger refresh silently
    if last_updated and not is_updating:
        try:
            last_updated_dt = datetime.fromisoformat(last_updated)
            # Ensure timezone-aware datetime comparison
            if last_updated_dt.tzinfo is None:
                last_updated_dt = last_updated_dt.replace(tzinfo=timezone.utc)
            now_dt = datetime.now(timezone.utc)
            
            age_seconds = (now_dt - last_updated_dt).total_seconds()
            if age_seconds > 15 * 60:
                print(f"Cache is {age_seconds / 60:.1f} minutes old. Launching background update...")
                # Update status immediately to prevent duplicate triggers
                status.is_updating = True
                db.commit()
                # Run background task
                background_tasks.add_task(run_background_scrape)
                is_updating = True
        except Exception as e:
            print(f"Error checking background refresh age: {e}")
            
    elif not last_updated and not is_updating:
        print("No news aggregated yet. Launching initial boot aggregation in background...")
        status.is_updating = True
        db.commit()
        background_tasks.add_task(run_background_scrape)
        is_updating = True

    # Convert sqlalchemy objects to article schemas
    articles_out = [ArticleOut.from_orm(art) for art in articles]
    
    return NewsFeedResponse(
        articles=articles_out,
        lastUpdated=last_updated or "",
        isSystemUpdating=is_updating
    )

@app.post("/api/refresh", response_model=NewsFeedResponse)
def force_refresh(background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    status = db.query(SystemStatus).first()
    if status and status.is_updating:
        # Already updating
        articles = db.query(Article).all()
        articles_out = [ArticleOut.from_orm(art) for art in articles]
        return NewsFeedResponse(
            articles=articles_out,
            lastUpdated=status.last_updated or "",
            isSystemUpdating=True
        )
        
    print("Manual news refresh requested via API...")
    
    # Initialize or update status to is_updating = True
    if not status:
        status = SystemStatus(id=1, is_updating=True, last_updated="")
        db.add(status)
    else:
        status.is_updating = True
    db.commit()
    
    # Trigger crawling in background
    background_tasks.add_task(run_background_scrape)
    
    articles = db.query(Article).all()
    articles_out = [ArticleOut.from_orm(art) for art in articles]
    
    return NewsFeedResponse(
        articles=articles_out,
        lastUpdated=status.last_updated if status else "",
        isSystemUpdating=True
    )

@app.get("/api/saved", response_model=SavedArticlesResponse)
def get_saved_articles(db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    saved = db.query(SavedArticle).filter(SavedArticle.user_email == current_user).all()
    watch_later = [s.article_id for s in saved if s.list_type == "watch_later"]
    read_later = [s.article_id for s in saved if s.list_type == "read_later"]
    return SavedArticlesResponse(watch_later=watch_later, read_later=read_later)

@app.post("/api/saved/toggle", response_model=SavedArticlesResponse)
def toggle_saved_article(req: SavedArticleToggle, db: Session = Depends(get_db), current_user: str = Depends(get_current_user_email)):
    if req.list_type not in ["watch_later", "read_later"]:
        raise HTTPException(status_code=400, detail="Invalid list type.")
    
    existing = db.query(SavedArticle).filter(
        SavedArticle.user_email == current_user,
        SavedArticle.article_id == req.article_id,
        SavedArticle.list_type == req.list_type
    ).first()
    
    if existing:
        db.delete(existing)
    else:
        new_saved = SavedArticle(
            user_email=current_user,
            article_id=req.article_id,
            list_type=req.list_type
        )
        db.add(new_saved)
    db.commit()
    
    saved = db.query(SavedArticle).filter(SavedArticle.user_email == current_user).all()
    watch_later = [s.article_id for s in saved if s.list_type == "watch_later"]
    read_later = [s.article_id for s in saved if s.list_type == "read_later"]
    return SavedArticlesResponse(watch_later=watch_later, read_later=read_later)

