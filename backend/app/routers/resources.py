from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceListResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=list[ResourceListResponse])
def list_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List resources with optional filters and pagination. Only shows approved content."""
    from app.models.resource import ResourceType
    
    query = db.query(Resource).filter(Resource.is_approved == True)  # Only approved resources
    
    if category:
        query = query.filter(Resource.category == category)
    
    if resource_type:
        try:
            resource_type_enum = ResourceType(resource_type)
            query = query.filter(Resource.resource_type == resource_type_enum)
        except ValueError:
            pass  # Invalid resource type, ignore filter
    
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    return resources


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new resource"""
    new_resource = Resource(
        user_id=current_user.id,
        **resource_data.model_dump()
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    
    # Update leaderboard (increment total_resources)
    from app.models.leaderboard import Leaderboard
    leaderboard = db.query(Leaderboard).filter(Leaderboard.user_id == current_user.id).first()
    if leaderboard:
        leaderboard.total_resources += 1
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
            total_resources=1,
            total_posts=0,
            package=package,
            points=10  # 1 resource * 10
        )
        db.add(leaderboard)
    db.commit()
    
    return new_resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a resource (only by owner)"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    if resource.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this resource"
        )
    
    # Update leaderboard (decrement total_resources)
    from app.models.leaderboard import Leaderboard
    leaderboard = db.query(Leaderboard).filter(Leaderboard.user_id == current_user.id).first()
    if leaderboard:
        leaderboard.total_resources = max(0, leaderboard.total_resources - 1)
        # Recalculate points
        leaderboard.points = (
            leaderboard.total_resources * 10 +
            leaderboard.total_posts * 5 +
            leaderboard.package * 2
        )
        db.commit()
    
    db.delete(resource)
    db.commit()
    
    return None

