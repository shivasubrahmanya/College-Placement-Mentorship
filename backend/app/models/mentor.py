from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class Branch(str, enum.Enum):
    CSE = "CSE"
    ECE = "ECE"
    ME = "ME"
    CE = "CE"
    EE = "EE"
    IT = "IT"


class Mentor(Base):
    __tablename__ = "mentors"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    branch = Column(SQLEnum(Branch), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    current_company = Column(String(255))
    package = Column(Integer, default=0)  # LPA (Lakhs per annum)
    verified = Column(Boolean, default=False, nullable=False)
    bio = Column(String(1000))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="mentor_profile")
    
    # Indexes for filtering
    __table_args__ = (
        Index("idx_mentor_branch", "branch"),
        Index("idx_mentor_graduation_year", "graduation_year"),
        Index("idx_mentor_verified", "verified"),
    )

