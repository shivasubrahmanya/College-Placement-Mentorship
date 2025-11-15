from sqlalchemy import Column, Integer, String, DateTime, TypeDecorator
from sqlalchemy.sql import func
from app.db import Base
import enum


class UserRole(str, enum.Enum):
    MENTOR = "MENTOR"
    MENTEE = "MENTEE"
    ADMIN = "ADMIN"


class CaseInsensitiveEnum(TypeDecorator):
    """
    Custom TypeDecorator to handle case-insensitive enum conversion
    This allows the database to store lowercase values while Python uses uppercase
    """
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enum_class = enum_class
    
    def process_bind_param(self, value, dialect):
        """Convert Python enum to database string (uppercase)"""
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value.value
        if isinstance(value, str):
            # Convert to uppercase for storage
            return value.upper()
        return str(value).upper()
    
    def process_result_value(self, value, dialect):
        """Convert database string to Python enum (case-insensitive)"""
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value
        # Case-insensitive lookup
        value_upper = str(value).upper()
        for member in self.enum_class:
            if member.value.upper() == value_upper:
                return member
        # If not found, try to create from value directly
        try:
            return self.enum_class(value_upper)
        except ValueError:
            # Fallback: return the uppercase string value
            return value_upper


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    # Use custom TypeDecorator to handle case-insensitive enum conversion
    role = Column(CaseInsensitiveEnum(UserRole, length=50), nullable=False, default=UserRole.MENTEE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

