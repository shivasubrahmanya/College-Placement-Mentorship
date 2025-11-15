from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class AdminCreate(BaseModel):
    department_name: Optional[str] = None
    designation: Optional[str] = None
    contact_number: Optional[str] = None


class AdminUpdate(BaseModel):
    department_name: Optional[str] = None
    designation: Optional[str] = None
    contact_number: Optional[str] = None


class AdminResponse(BaseModel):
    id: int
    user_id: int
    department_name: Optional[str]
    designation: Optional[str]
    contact_number: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    user: "UserResponse"
    
    class Config:
        from_attributes = True


# Rebuild model to resolve forward reference
# This must be done after UserResponse is defined
def _rebuild_admin_response():
    """Rebuild AdminResponse to resolve forward reference to UserResponse"""
    try:
        from app.schemas.user import UserResponse
        AdminResponse.model_rebuild()
    except ImportError:
        pass  # Will be rebuilt in schemas/__init__.py


# Try to rebuild immediately if UserResponse is available
_rebuild_admin_response()

