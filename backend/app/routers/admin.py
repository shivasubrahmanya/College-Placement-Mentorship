from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.models.user import User, UserRole
from app.models.mentor import Mentor
from app.models.mentee import Mentee
from app.models.admin import Admin
from app.models.post import Post
from app.models.resource import Resource
from app.models.leaderboard import Leaderboard
# Import schemas package to trigger model rebuilds
import app.schemas  # This triggers model rebuilds in __init__.py

from app.schemas.mentor import MentorResponse
from app.schemas.admin import AdminResponse, AdminUpdate, AdminCreate
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


@router.post("/profile/create", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_profile(
    admin_create: AdminCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create admin profile for current user and set role to ADMIN"""
    existing = db.query(Admin).filter(Admin.user_id == current_user.id).first()
    if existing:
        return existing
    current_user.role = UserRole.ADMIN
    admin = Admin(
        user_id=current_user.id,
        **admin_create.model_dump(exclude_unset=True)
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
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


@router.post("/db/install", response_model=dict)
def install_admin_triggers_and_procedures(
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    statements = []
    statements.append("""
    DROP TRIGGER IF EXISTS trg_admin_limit_bi;
    """)
    statements.append("""
    CREATE TRIGGER trg_admin_limit_bi BEFORE INSERT ON admin
    FOR EACH ROW
    BEGIN
      IF (SELECT COUNT(*) FROM admin) >= 10 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admin limit reached';
      END IF;
    END;
    """)
    statements.append("""
    DROP TRIGGER IF EXISTS trg_resources_ai;
    """)
    statements.append("""
    CREATE TRIGGER trg_resources_ai AFTER INSERT ON resources
    FOR EACH ROW
    BEGIN
      INSERT INTO leaderboard (user_id, total_resources, total_posts, package, points)
      VALUES (
        NEW.user_id, 1, 0,
        COALESCE((SELECT package FROM mentors WHERE user_id = NEW.user_id), 0),
        10
      )
      ON DUPLICATE KEY UPDATE
        total_resources = total_resources + 1,
        points = (total_resources*10 + total_posts*5 + package*2);
    END;
    """)
    statements.append("""
    DROP TRIGGER IF EXISTS trg_resources_ad;
    """)
    statements.append("""
    CREATE TRIGGER trg_resources_ad AFTER DELETE ON resources
    FOR EACH ROW
    BEGIN
      UPDATE leaderboard
        SET total_resources = GREATEST(total_resources - 1, 0),
            points = (total_resources*10 + total_posts*5 + package*2)
      WHERE user_id = OLD.user_id;
    END;
    """)
    statements.append("""
    DROP TRIGGER IF EXISTS trg_posts_ai;
    """)
    statements.append("""
    CREATE TRIGGER trg_posts_ai AFTER INSERT ON posts
    FOR EACH ROW
    BEGIN
      INSERT INTO leaderboard (user_id, total_posts, total_resources, package, points)
      VALUES (
        NEW.user_id, 1, 0,
        COALESCE((SELECT package FROM mentors WHERE user_id = NEW.user_id), 0),
        5
      )
      ON DUPLICATE KEY UPDATE
        total_posts = total_posts + 1,
        points = (total_resources*10 + total_posts*5 + package*2);
    END;
    """)
    statements.append("""
    DROP TRIGGER IF EXISTS trg_posts_ad;
    """)
    statements.append("""
    CREATE TRIGGER trg_posts_ad AFTER DELETE ON posts
    FOR EACH ROW
    BEGIN
      UPDATE leaderboard
        SET total_posts = GREATEST(total_posts - 1, 0),
            points = (total_resources*10 + total_posts*5 + package*2)
      WHERE user_id = OLD.user_id;
    END;
    """)
    statements.append("""
    DROP TRIGGER IF EXISTS trg_mentors_au;
    """)
    statements.append("""
    CREATE TRIGGER trg_mentors_au AFTER UPDATE ON mentors
    FOR EACH ROW
    BEGIN
      IF NEW.package <> OLD.package THEN
        UPDATE leaderboard
          SET package = NEW.package,
              points = (total_resources*10 + total_posts*5 + NEW.package*2)
        WHERE user_id = NEW.user_id;
      END IF;
    END;
    """)
    statements.append("""
    DROP PROCEDURE IF EXISTS sp_recalc_leaderboard;
    """)
    statements.append("""
    CREATE PROCEDURE sp_recalc_leaderboard()
    BEGIN
      DECLARE done INT DEFAULT 0;
      DECLARE v_user_id INT;
      DECLARE cur CURSOR FOR SELECT user_id FROM leaderboard;
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
      OPEN cur;
      read_loop: LOOP
        FETCH cur INTO v_user_id;
        IF done = 1 THEN LEAVE read_loop; END IF;
        UPDATE leaderboard lb
        SET lb.total_resources = (SELECT COUNT(*) FROM resources r WHERE r.user_id = v_user_id),
            lb.total_posts = (SELECT COUNT(*) FROM posts p WHERE p.user_id = v_user_id),
            lb.package = COALESCE((SELECT m.package FROM mentors m WHERE m.user_id = v_user_id), 0),
            lb.points = (lb.total_resources*10 + lb.total_posts*5 + lb.package*2)
        WHERE lb.user_id = v_user_id;
      END LOOP;
      CLOSE cur;
    END;
    """)

    for sql in statements:
      db.execute(text(sql))
    db.commit()

    return {"installed": True}


@router.get("/stats", response_model=dict)
def get_admin_stats(
    admin: Admin = Depends(check_admin),
    db: Session = Depends(get_db)
):
    """Get counts for mentors, mentees, posts, resources and pending mentors"""
    mentors_count = db.query(Mentor).count()
    mentees_count = db.query(Mentee).count()
    pending_mentors = db.query(Mentor).filter(Mentor.verified == False).count()
    resources_count = db.query(Resource).count()
    posts_count = db.query(Post).count()
    return {
        "mentors": mentors_count,
        "mentees": mentees_count,
        "pending_mentors": pending_mentors,
        "resources": resources_count,
        "posts": posts_count,
    }

