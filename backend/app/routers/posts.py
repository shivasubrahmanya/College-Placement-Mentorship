from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.post import Post
from app.schemas.post import PostCreate, PostResponse, PostListResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostListResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List posts with pagination. Only shows approved content."""
    posts = db.query(Post).filter(Post.is_approved == True).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new post"""
    new_post = Post(
        user_id=current_user.id,
        **post_data.model_dump()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Update leaderboard (increment total_posts)
    from app.models.leaderboard import Leaderboard
    leaderboard = db.query(Leaderboard).filter(Leaderboard.user_id == current_user.id).first()
    if leaderboard:
        leaderboard.total_posts += 1
        # Recalculate points: total_resources*10 + total_posts*5 + package*2
        leaderboard.points = (
            leaderboard.total_resources * 10 +
            leaderboard.total_posts * 5 +
            leaderboard.package * 2
        )
    else:
        # Get package from mentor profile if exists
        package = 0
        from app.models.mentor import Mentor
        mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
        if mentor:
            package = mentor.package
        
        leaderboard = Leaderboard(
            user_id=current_user.id,
            total_posts=1,
            total_resources=0,
            package=package,
            points=5  # 1 post * 5
        )
        db.add(leaderboard)
    db.commit()
    
    return new_post


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post


@router.post("/{post_id}/like", response_model=PostResponse)
def like_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Like a post (increment likes count)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Increment likes
    post.likes += 1
    db.commit()
    db.refresh(post)
    
    return post

