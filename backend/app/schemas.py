from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: Optional[str] = None
    email: str
    status: Optional[str] = "success"
    message: Optional[str] = None
    dev_code: Optional[str] = None

class CodeVerificationRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

class ArticleOut(BaseModel):
    id: str
    title: str
    url: str
    source: str
    date: str
    category: str
    summary: str
    importance: Optional[str] = "medium"
    sentiment: Optional[str] = "neutral"

    class Config:
        from_attributes = True

class NewsFeedResponse(BaseModel):
    articles: List[ArticleOut]
    lastUpdated: str
    isSystemUpdating: bool

class SavedArticleToggle(BaseModel):
    article_id: str
    list_type: str  # "watch_later" or "read_later"

class SavedArticlesResponse(BaseModel):
    watch_later: List[str]
    read_later: List[str]

