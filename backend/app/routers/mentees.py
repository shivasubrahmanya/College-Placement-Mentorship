from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User, UserRole
from app.models.mentee import Mentee
from app.schemas.mentee import MenteeCreate, MenteeResponse, MenteeUpdate
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/mentees", tags=["mentees"])


@router.post("", response_model=MenteeResponse, status_code=status.HTTP_201_CREATED)
def create_mentee(
    mentee_data: MenteeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create mentee profile (onboarding)"""
    # Check if user already has a mentee profile
    existing_mentee = db.query(Mentee).filter(Mentee.user_id == current_user.id).first()
    if existing_mentee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee profile already exists"
        )
    
    # Ensure user role is mentee
    current_user.role = UserRole.MENTEE
    
    # Create mentee profile
    new_mentee = Mentee(
        user_id=current_user.id,
        **mentee_data.model_dump()
    )
    db.add(new_mentee)
    db.commit()
    db.refresh(new_mentee)
    
    return new_mentee


@router.get("/me", response_model=MenteeResponse)
def get_mentee_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's mentee profile"""
    mentee = db.query(Mentee).filter(Mentee.user_id == current_user.id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee profile not found"
        )
    return mentee


@router.put("/me", response_model=MenteeResponse)
def update_mentee_profile(
    mentee_update: MenteeUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    mentee = db.query(Mentee).filter(Mentee.user_id == current_user.id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentee profile not found"
        )
    update_data = mentee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentee, field, value)
    db.commit()
    db.refresh(mentee)
    return mentee

