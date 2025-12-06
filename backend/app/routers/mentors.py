from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db import get_db
from app.models.user import User, UserRole
from app.models.mentor import Mentor, Branch
from app.schemas.mentor import MentorCreate, MentorResponse, MentorListResponse, MentorUpdate
from app.utils.auth import get_current_active_user
from app.models.resource import Resource
from app.schemas.resource import ResourceListResponse

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
    
    # Notify admins for verification via chat message
    from app.models.admin import Admin
    from app.models.chat import Chat
    admins = db.query(Admin).all()
    for admin in admins:
        db.add(Chat(
            sender_id=current_user.id,
            receiver_id=admin.user_id,
            message=f"New mentor {current_user.full_name} requires verification"
        ))
    if admins:
        db.commit()
    
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


@router.get("/me", response_model=MentorResponse)
def get_my_mentor_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found"
        )
    return mentor


@router.get("/{mentor_id}/resources", response_model=list[ResourceListResponse])
def list_resources_by_mentor(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    resources = (
        db.query(Resource)
        .filter(Resource.user_id == mentor.user_id, Resource.is_approved == True)
        .order_by(Resource.created_at.desc())
        .limit(50)
        .all()
    )
    return resources


@router.get("/by-user/{user_id}", response_model=MentorResponse)
def get_mentor_by_user_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    mentor = db.query(Mentor).filter(Mentor.user_id == user_id).first()
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

