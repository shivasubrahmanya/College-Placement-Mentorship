from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.leaderboard import LeaderboardResponse

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardResponse])
def get_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard sorted by points (descending).
    Points formula: total_resources*10 + total_posts*5 + package*2
    """
    from app.models.leaderboard import Leaderboard
    
    # Get all leaderboard entries sorted by points
    entries = db.query(Leaderboard).order_by(
        Leaderboard.points.desc()
    ).offset(skip).limit(limit).all()
    
    return entries

