from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    email: str
    message: Optional[str] = None

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
