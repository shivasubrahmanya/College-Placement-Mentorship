from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from app.models.mentor import Branch

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class MentorCreate(BaseModel):
    branch: Branch
    graduation_year: int
    current_company: Optional[str] = None
    package: int = 0
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None


class MentorUpdate(BaseModel):
    branch: Optional[Branch] = None
    graduation_year: Optional[int] = None
    current_company: Optional[str] = None
    package: Optional[int] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None


class MentorResponse(BaseModel):
    id: int
    user_id: int
    branch: Branch
    graduation_year: int
    current_company: Optional[str]
    package: int
    verified: bool
    bio: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True


class MentorListResponse(BaseModel):
    id: int
    user_id: int
    branch: Branch
    graduation_year: int
    current_company: Optional[str]
    package: int
    verified: bool
    bio: Optional[str]
    user: "UserResponse"
    
    class Config:
        from_attributes = True

