from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class LeaderboardResponse(BaseModel):
    id: int
    user_id: int
    total_resources: int
    total_posts: int
    package: int
    points: float
    updated_at: Optional[datetime]
    user: "UserResponse"
    
    class Config:
        from_attributes = True

