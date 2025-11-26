from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.auth import get_current_active_user
from app.models.post import Post
from app.models.resource import Resource
from app.models.leaderboard import Leaderboard
from app.models.mentor import Mentor
from app.models.mentee import Mentee
from app.models.chat import Chat
from app.models.admin import Admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.query(Chat).filter((Chat.sender_id == current_user.id) | (Chat.receiver_id == current_user.id)).delete(synchronize_session=False)
    db.query(Post).filter(Post.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Resource).filter(Resource.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Leaderboard).filter(Leaderboard.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Mentor).filter(Mentor.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Mentee).filter(Mentee.user_id == current_user.id).delete(synchronize_session=False)
    db.query(Admin).filter(Admin.user_id == current_user.id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()
    return None

