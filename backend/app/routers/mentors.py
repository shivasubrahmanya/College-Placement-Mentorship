from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db import get_db
from app.models.user import User, UserRole
from app.models.mentor import Mentor, Branch
from app.schemas.mentor import MentorCreate, MentorResponse, MentorUpdate, MentorListResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/mentors", tags=["mentors"])


@router.get("", response_model=list[MentorListResponse])
def list_mentors(
    branch: Optional[Branch] = Query(None, description="Filter by branch"),
    graduation_year: Optional[int] = Query(None, description="Filter by graduation year"),
    verified: Optional[bool] = Query(None, description="Filter by verification status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List mentors with optional filters and pagination"""
    query = db.query(Mentor).join(User)
    
    # Apply filters
    filters = []
    if branch:
        filters.append(Mentor.branch == branch)
    if graduation_year:
        filters.append(Mentor.graduation_year == graduation_year)
    if verified is not None:
        filters.append(Mentor.verified == verified)
    
    if filters:
        query = query.filter(and_(*filters))
    
    # Pagination
    mentors = query.offset(skip).limit(limit).all()
    return mentors


@router.post("", response_model=MentorResponse, status_code=status.HTTP_201_CREATED)
def create_mentor(
    mentor_data: MentorCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create mentor profile (onboarding)"""
    # Check if user already has a mentor profile
    existing_mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if existing_mentor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentor profile already exists"
        )
    
    # Update user role
    current_user.role = UserRole.MENTOR
    
    # Create mentor profile
    new_mentor = Mentor(
        user_id=current_user.id,
        **mentor_data.model_dump()
    )
    db.add(new_mentor)
    db.commit()
    db.refresh(new_mentor)
    
    return new_mentor


@router.get("/{mentor_id}", response_model=MentorResponse)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    """Get mentor by ID"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    return mentor


@router.put("/me", response_model=MentorResponse)
def update_mentor_profile(
    mentor_update: MentorUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's mentor profile"""
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found"
        )
    
    # Update fields
    update_data = mentor_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mentor, field, value)
    
    db.commit()
    db.refresh(mentor)
    return mentor

