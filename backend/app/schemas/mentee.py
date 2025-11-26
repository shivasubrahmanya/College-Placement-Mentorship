from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class MenteeCreate(BaseModel):
    branch: Optional[str] = None
    current_year: Optional[int] = None
    goals: Optional[str] = None


class MenteeUpdate(BaseModel):
    branch: Optional[str] = None
    current_year: Optional[int] = None
    goals: Optional[str] = None


class MenteeResponse(BaseModel):
    id: int
    user_id: int
    branch: Optional[str]
    current_year: Optional[int]
    goals: Optional[str]
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True

