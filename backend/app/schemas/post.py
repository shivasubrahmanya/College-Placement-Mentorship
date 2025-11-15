from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class PostCreate(BaseModel):
    title: str
    content: str
    media_url: Optional[str] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    media_url: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    media_url: Optional[str]
    likes: int
    is_approved: bool
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    media_url: Optional[str]
    likes: int
    is_approved: bool
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True

