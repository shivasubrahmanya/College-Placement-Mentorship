from app.schemas.auth import Token, TokenData, LoginRequest, SignupRequest
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.mentor import MentorCreate, MentorResponse, MentorUpdate, MentorListResponse
from app.schemas.mentee import MenteeCreate, MenteeResponse
from app.schemas.post import PostCreate, PostResponse, PostListResponse, PostUpdate
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceListResponse, ResourceUpdate
from app.schemas.chat import ChatCreate, ChatResponse, ChatReadUpdate
from app.schemas.leaderboard import LeaderboardResponse
from app.schemas.admin import AdminCreate, AdminResponse, AdminUpdate

# Rebuild models to resolve forward references
MentorResponse.model_rebuild()
MentorListResponse.model_rebuild()
MenteeResponse.model_rebuild()
PostResponse.model_rebuild()
PostListResponse.model_rebuild()
ResourceResponse.model_rebuild()
ResourceListResponse.model_rebuild()
LeaderboardResponse.model_rebuild()
AdminResponse.model_rebuild()

__all__ = [
    "Token",
    "TokenData",
    "LoginRequest",
    "SignupRequest",
    "UserResponse",
    "UserUpdate",
    "MentorCreate",
    "MentorResponse",
    "MentorUpdate",
    "MentorListResponse",
    "MenteeCreate",
    "MenteeResponse",
    "PostCreate",
    "PostResponse",
    "PostListResponse",
    "PostUpdate",
    "ResourceCreate",
    "ResourceResponse",
    "ResourceListResponse",
    "ResourceUpdate",
    "ChatCreate",
    "ChatResponse",
    "ChatReadUpdate",
    "LeaderboardResponse",
    "AdminCreate",
    "AdminResponse",
    "AdminUpdate",
]

