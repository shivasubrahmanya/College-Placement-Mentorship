from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, or_, text
from app.schemas.resource import ResourceMentorSummary
from app.db import get_db
from app.models.user import User, UserRole
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceListResponse
from app.utils.auth import get_current_active_user, get_current_user_optional

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=list[ResourceListResponse])
def list_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    user_id: Optional[int] = Query(None, description="Filter by user (mentor) id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user_opt: Optional[User] = Depends(get_current_user_optional)
):
    """List resources with optional filters and pagination. Only shows approved content."""
    from app.models.resource import ResourceType
    
    try:
        db.execute(text("""
            UPDATE resources SET resource_type='OTHER' WHERE resource_type IN ('Other','other');
        """))
        db.execute(text("""
            UPDATE resources SET resource_type='STUDY_MATERIAL' WHERE resource_type IN ('Study Material','study material');
        """))
        db.execute(text("""
            UPDATE resources SET resource_type='PREPARATION_GUIDE' WHERE resource_type IN ('Preparation Guide','preparation guide');
        """))
        db.execute(text("""
            UPDATE resources SET resource_type='EXPERIENCE' WHERE resource_type IN ('Experience','experience');
        """))
        db.commit()
    except Exception:
        db.rollback()

    query = db.query(Resource).options(selectinload(Resource.user))
    if current_user_opt:
        query = query.filter(or_(Resource.is_approved == True, Resource.user_id == current_user_opt.id))
    else:
        query = query.filter(Resource.is_approved == True)
    
    if category:
        query = query.filter(Resource.category == category)
    
    if resource_type:
        # Accept both enum values and token names
        key = resource_type.strip().upper().replace(" ", "_")
        mapping = {
            "STUDY_MATERIAL": ResourceType.STUDY_MATERIAL,
            "PREPARATION_GUIDE": ResourceType.PREPARATION_GUIDE,
            "EXPERIENCE": ResourceType.EXPERIENCE,
            "OTHER": ResourceType.OTHER,
        }
        resource_type_enum = mapping.get(key)
        if resource_type_enum is None:
            try:
                resource_type_enum = ResourceType(resource_type)
            except ValueError:
                resource_type_enum = None
        if resource_type_enum:
            query = query.filter(Resource.resource_type == resource_type_enum)
    
    if user_id:
        query = query.filter(Resource.user_id == user_id)
    
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    return resources


@router.get("/mentors", response_model=list[ResourceMentorSummary])
def list_resource_contributors(
    db: Session = Depends(get_db)
):
    """List mentors/users who have shared approved resources with counts"""
    from app.models.user import User
    rows = (
        db.query(
            User.id.label("user_id"),
            User.full_name.label("full_name"),
            func.count(Resource.id).label("resource_count"),
        )
        .join(Resource, Resource.user_id == User.id)
        .filter(Resource.is_approved == True)
        .group_by(User.id, User.full_name)
        .order_by(func.count(Resource.id).desc())
        .all()
    )
    return [ResourceMentorSummary(user_id=r.user_id, full_name=r.full_name, resource_count=r.resource_count) for r in rows]


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new resource (mentors only)"""
    if current_user.role not in (UserRole.MENTOR, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors or admins can create resources"
        )
    from app.models.resource import ResourceType
    rt = resource_data.resource_type
    if isinstance(rt, str):
        key = rt.strip().upper().replace(" ", "_")
        mapping = {
            "STUDY_MATERIAL": ResourceType.STUDY_MATERIAL,
            "PREPARATION_GUIDE": ResourceType.PREPARATION_GUIDE,
            "EXPERIENCE": ResourceType.EXPERIENCE,
            "OTHER": ResourceType.OTHER,
        }
        rt_enum = mapping.get(key, ResourceType.OTHER)
    else:
        rt_enum = rt
    # Sanitize and trim to column sizes to avoid DB errors
    title = (resource_data.title or "").strip()[:255]
    description = (resource_data.description or "").strip() or None
    file_url = (resource_data.file_url or "").strip()[:500]
    category = (resource_data.category or None)
    if category:
        category = category.strip()[:100] or None

    new_resource = Resource(
        user_id=current_user.id,
        title=title,
        description=description,
        file_url=file_url,
        resource_type=rt_enum,
        category=category,
        is_approved=True,
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

