"""
Seed script to create sample data for the mentorship platform.
Run: python seed.py
"""
from sqlalchemy.orm import Session
from app.db import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.mentor import Mentor, Branch
from app.models.mentee import Mentee
from app.models.post import Post
from app.models.resource import Resource
from app.models.leaderboard import Leaderboard
from app.models.admin import Admin
from app.utils.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()


def seed_data():
    """Create sample data"""
    try:
        # Create admin user
        admin_user = User(
            email="admin@college.edu",
            password_hash=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        db.flush()
        
        admin_profile = Admin(user_id=admin_user.id)
        db.add(admin_profile)
        
        # Create mentor users
        mentors_data = [
            {
                "email": "mentor1@college.edu",
                "password": "mentor123",
                "full_name": "John Doe",
                "branch": Branch.CSE,
                "graduation_year": 2020,
                "current_company": "Google",
                "package": 30,
                "bio": "Senior Software Engineer with 4 years of experience",
                "verified": True
            },
            {
                "email": "mentor2@college.edu",
                "password": "mentor123",
                "full_name": "Jane Smith",
                "branch": Branch.ECE,
                "graduation_year": 2019,
                "current_company": "Microsoft",
                "package": 35,
                "bio": "Product Manager at Microsoft",
                "verified": True
            },
            {
                "email": "mentor3@college.edu",
                "password": "mentor123",
                "full_name": "Bob Johnson",
                "branch": Branch.CSE,
                "graduation_year": 2021,
                "current_company": "Amazon",
                "package": 25,
                "bio": "Software Development Engineer",
                "verified": False
            }
        ]
        
        mentor_users = []
        for mentor_data in mentors_data:
            user = User(
                email=mentor_data["email"],
                password_hash=get_password_hash(mentor_data["password"]),
                full_name=mentor_data["full_name"],
                role=UserRole.MENTOR
            )
            db.add(user)
            db.flush()
            mentor_users.append(user)
            
            mentor = Mentor(
                user_id=user.id,
                branch=mentor_data["branch"],
                graduation_year=mentor_data["graduation_year"],
                current_company=mentor_data["current_company"],
                package=mentor_data["package"],
                bio=mentor_data["bio"],
                verified=mentor_data["verified"]
            )
            db.add(mentor)
            
            # Create leaderboard entry
            leaderboard = Leaderboard(
                user_id=user.id,
                total_resources=0,
                total_posts=0,
                package=mentor_data["package"],
                points=mentor_data["package"] * 2  # package*2
            )
            db.add(leaderboard)
        
        # Create mentee users
        mentees_data = [
            {
                "email": "mentee1@college.edu",
                "password": "mentee123",
                "full_name": "Alice Williams",
                "branch": "CSE",
                "current_year": 2
            },
            {
                "email": "mentee2@college.edu",
                "password": "mentee123",
                "full_name": "Charlie Brown",
                "branch": "ECE",
                "current_year": 3
            }
        ]
        
        for mentee_data in mentees_data:
            user = User(
                email=mentee_data["email"],
                password_hash=get_password_hash(mentee_data["password"]),
                full_name=mentee_data["full_name"],
                role=UserRole.MENTEE
            )
            db.add(user)
            db.flush()
            
            mentee = Mentee(
                user_id=user.id,
                branch=mentee_data["branch"],
                current_year=mentee_data["current_year"],
                goals="Learn software development and get placed"
            )
            db.add(mentee)
        
        # Create sample posts
        if mentor_users:
            posts_data = [
                {
                    "user_id": mentor_users[0].id,
                    "title": "Tips for Cracking Coding Interviews",
                    "content": "Here are some key tips: 1. Practice daily on LeetCode 2. Focus on data structures 3. Mock interviews are crucial",
                    "likes": 15
                },
                {
                    "user_id": mentor_users[1].id,
                    "title": "How to Build a Strong Resume",
                    "content": "Your resume is your first impression. Make sure to highlight projects and achievements clearly.",
                    "likes": 22
                },
                {
                    "user_id": mentor_users[0].id,
                    "title": "System Design Basics",
                    "content": "Understanding scalability, load balancing, and database design is essential for system design interviews.",
                    "likes": 18
                }
            ]
            
            for post_data in posts_data:
                post = Post(**post_data)
                db.add(post)
                
                # Update leaderboard
                leaderboard = db.query(Leaderboard).filter(
                    Leaderboard.user_id == post_data["user_id"]
                ).first()
                if leaderboard:
                    leaderboard.total_posts += 1
                    leaderboard.points = (
                        leaderboard.total_resources * 10 +
                        leaderboard.total_posts * 5 +
                        leaderboard.package * 2
                    )
            
            # Create sample resources
            resources_data = [
                {
                    "user_id": mentor_users[0].id,
                    "title": "DSA Cheat Sheet",
                    "description": "Comprehensive data structures and algorithms reference",
                    "file_url": "https://example.com/resources/dsa-cheatsheet.pdf",
                    "category": "Study Material"
                },
                {
                    "user_id": mentor_users[1].id,
                    "title": "Resume Template",
                    "description": "Professional resume template for tech roles",
                    "file_url": "https://example.com/resources/resume-template.docx",
                    "category": "Templates"
                }
            ]
            
            for resource_data in resources_data:
                resource = Resource(**resource_data)
                db.add(resource)
                
                # Update leaderboard
                leaderboard = db.query(Leaderboard).filter(
                    Leaderboard.user_id == resource_data["user_id"]
                ).first()
                if leaderboard:
                    leaderboard.total_resources += 1
                    leaderboard.points = (
                        leaderboard.total_resources * 10 +
                        leaderboard.total_posts * 5 +
                        leaderboard.package * 2
                    )
        
        db.commit()
        print("✅ Seed data created successfully!")
        print("\nSample accounts:")
        print("Admin: admin@college.edu / admin123")
        print("Mentor: mentor1@college.edu / mentor123")
        print("Mentee: mentee1@college.edu / mentee123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()

