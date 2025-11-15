from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Leaderboard(Base):
    __tablename__ = "leaderboard"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_resources = Column(Integer, default=0)
    total_posts = Column(Integer, default=0)
    package = Column(Integer, default=0)
    points = Column(Float, default=0.0)  # Computed: total_resources*10 + total_posts*5 + package*2
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="leaderboard_entry")

