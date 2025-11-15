"""
Background Scheduler for Leaderboard Auto-Recalculation
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.db import SessionLocal
from app.models.leaderboard import Leaderboard
from app.models.mentor import Mentor

scheduler = BackgroundScheduler()


def recalculate_leaderboard_job():
    """
    Background job to recalculate leaderboard points for all users
    Runs daily at midnight
    """
    db = SessionLocal()
    try:
        leaderboards = db.query(Leaderboard).all()
        
        for lb in leaderboards:
            # Get package from mentor profile if exists
            mentor = db.query(Mentor).filter(Mentor.user_id == lb.user_id).first()
            package = mentor.package if mentor else 0
            
            # Recalculate points
            lb.package = package
            lb.points = (lb.total_resources * 10) + (lb.total_posts * 5) + (package * 2)
        
        db.commit()
        print(f"Leaderboard recalculated for {len(leaderboards)} users")
    except Exception as e:
        print(f"Error recalculating leaderboard: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler"""
    # Schedule daily recalculation at midnight
    scheduler.add_job(
        recalculate_leaderboard_job,
        trigger=CronTrigger(hour=0, minute=0),  # Daily at midnight
        id='recalculate_leaderboard',
        name='Recalculate Leaderboard Points',
        replace_existing=True
    )
    
    scheduler.start()
    print("Background scheduler started - Leaderboard will recalculate daily at midnight")


def stop_scheduler():
    """Stop the background scheduler"""
    scheduler.shutdown()
    print("Background scheduler stopped")

