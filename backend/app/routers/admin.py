from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User, UserRole
from app.models.mentor import Mentor
from app.models.admin import Admin
from app.models.post import Post
from app.models.resource import Resource
from app.models.leaderboard import Leaderboard
# Import schemas package to trigger model rebuilds
import app.schemas  # This triggers model rebuilds in __init__.py

from app.schemas.mentor import MentorResponse
from app.schemas.admin import AdminResponse, AdminUpdate
from app.schemas.post import PostResponse
from app.schemas.resource import ResourceResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/admin", tags=["admin"])


def check_admin(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Check if current user is an admin"""
    admin = db.query(Admin).filter(Admin.user_id == current_user.id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return admin


@router.get("/profile", response_model=AdminResponse)
def get_admin_profile(
    admin: Admin = Depends(check_admin)
):
    """Get current admin's profile"""
    return admin


@router.put("/profile", response_model=AdminResponse)
def update_admin_profile(
    admin_update: AdminUpdate,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Update admin profile"""
    update_data = admin_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    return admin


@router.put("/mentors/{mentor_id}/verify", response_model=MentorResponse)
def verify_mentor(
    mentor_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Verify a mentor (set verified = true)"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found"
        )
    
    mentor.verified = True
    db.commit()
    db.refresh(mentor)
    
    return mentor


@router.get("/posts", response_model=list[PostResponse])
def list_all_posts(
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db),
    approved: Optional[bool] = Query(None, description="Filter by approval status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """List all posts for moderation (admin only)"""
    query = db.query(Post)
    
    if approved is not None:
        query = query.filter(Post.is_approved == approved)
    
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.get("/resources", response_model=list[ResourceResponse])
def list_all_resources(
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db),
    approved: Optional[bool] = Query(None, description="Filter by approval status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """List all resources for moderation (admin only)"""
    query = db.query(Resource)
    
    if approved is not None:
        query = query.filter(Resource.is_approved == approved)
    
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    return resources


@router.put("/posts/{post_id}/approve", response_model=PostResponse)
def approve_post(
    post_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Approve a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    post.is_approved = True
    db.commit()
    db.refresh(post)
    return post


@router.put("/posts/{post_id}/reject", response_model=PostResponse)
def reject_post(
    post_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Reject a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    post.is_approved = False
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Delete a post (admin only)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    db.delete(post)
    db.commit()
    return None


@router.put("/resources/{resource_id}/approve", response_model=ResourceResponse)
def approve_resource(
    resource_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Approve a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    resource.is_approved = True
    db.commit()
    db.refresh(resource)
    return resource


@router.put("/resources/{resource_id}/reject", response_model=ResourceResponse)
def reject_resource(
    resource_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Reject a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    resource.is_approved = False
    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Delete a resource (admin only)"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    db.delete(resource)
    db.commit()
    return None


@router.post("/leaderboard/recalculate", response_model=dict)
def recalculate_leaderboard(
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Manually recalculate leaderboard points for all users"""
    from app.models.mentor import Mentor
    
    # Get all users with leaderboard entries
    leaderboards = db.query(Leaderboard).all()
    updated_count = 0
    
    for lb in leaderboards:
        # Get package from mentor profile if exists
        mentor = db.query(Mentor).filter(Mentor.user_id == lb.user_id).first()
        package = mentor.package if mentor else 0
        
        # Recalculate points
        lb.package = package
        lb.points = (lb.total_resources * 10) + (lb.total_posts * 5) + (package * 2)
        updated_count += 1
    
    db.commit()
    
    return {
        "message": "Leaderboard recalculated successfully",
        "updated_entries": updated_count
    }

