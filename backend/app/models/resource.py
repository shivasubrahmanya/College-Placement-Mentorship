from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class ResourceType(str, enum.Enum):
    STUDY_MATERIAL = "Study Material"
    PREPARATION_GUIDE = "Preparation Guide"
    EXPERIENCE = "Experience"
    OTHER = "Other"


class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_url = Column(String(500), nullable=False)  # Store URL string only
    resource_type = Column(SQLEnum(ResourceType), nullable=False, default=ResourceType.OTHER)
    category = Column(String(100))
    is_approved = Column(Boolean, default=True, nullable=False)  # For content moderation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="resources")

