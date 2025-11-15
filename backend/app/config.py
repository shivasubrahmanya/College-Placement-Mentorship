from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:27041971@localhost:3306/mentorship_db"
    
    # JWT
    SECRET_KEY: str = "jRTQ/YRrCZiFGtI0fGEc6oqdzRfe0kRNg2aZh2FuH1M="
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App
    APP_NAME: str = "College Mentorship Platform"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

