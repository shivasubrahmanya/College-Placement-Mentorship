from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from app.models.resource import ResourceType

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str
    resource_type: ResourceType = ResourceType.OTHER
    category: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    category: Optional[str] = None


class ResourceResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    file_url: str
    resource_type: ResourceType
    category: Optional[str]
    is_approved: bool
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True


class ResourceListResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    file_url: str
    resource_type: ResourceType
    category: Optional[str]
    is_approved: bool
    created_at: datetime
    user: "UserResponse"
    
    class Config:
        from_attributes = True

