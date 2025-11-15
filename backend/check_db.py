"""Quick script to check database credentials"""
import sys
from app.config import settings
from app.db import engine
from sqlalchemy import text

print("=" * 50)
print("Database Configuration Check")
print("=" * 50)

# Show database URL (masked password)
db_url = settings.DATABASE_URL
if '@' in db_url:
    parts = db_url.split('@')
    user_pass = parts[0].split('//')[1]
    if ':' in user_pass:
        user, password = user_pass.split(':', 1)
        print(f"[OK] Username: {user}")
        print(f"[OK] Password: {'*' * len(password)} (configured)")
        print(f"[OK] Host/DB: {parts[1]}")
    else:
        print(f"Database URL: {db_url.split('@')[0]}@***")
else:
    print(f"Database URL: {db_url}")

print("\n" + "=" * 50)
print("Testing Database Connection")
print("=" * 50)

try:
    with engine.connect() as conn:
        # Test connection
        result = conn.execute(text("SELECT DATABASE()"))
        db_name = result.scalar()
        print(f"[OK] Connection successful!")
        print(f"[OK] Current database: {db_name}")
        
        # Check if tables exist
        result = conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result]
        print(f"[OK] Tables found: {len(tables)}")
        if tables:
            print(f"  Tables: {', '.join(tables[:5])}{'...' if len(tables) > 5 else ''}")
        
except Exception as e:
    print(f"[ERROR] Connection failed!")
    print(f"  Error: {str(e)}")
    print("\nPlease check:")
    print("  1. MySQL is running")
    print("  2. Database 'mentorship_db' exists")
    print("  3. Username and password are correct in .env file")
    print("  4. .env file exists in backend/ directory")

print("=" * 50)

