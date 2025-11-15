from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class ChatCreate(BaseModel):
    receiver_id: int
    message: str


class ChatResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatReadUpdate(BaseModel):
    is_read: bool = True

