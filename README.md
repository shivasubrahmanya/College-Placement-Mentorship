# College Mentorship Platform

A full-stack mentorship platform where mentors (placed seniors) guide mentees. Built with FastAPI (backend) and React + TypeScript (frontend).

## Features

- **User Authentication**: Signup, login with JWT tokens
- **Role-based Profiles**: Mentor, Mentee, and Admin onboarding
- **Mentor Directory**: Browse mentors with filters (branch, graduation year, verification status)
- **Posts Feed**: Create and like posts; admin approval/rejection
- **Resources**: Mentors/Admins can post; mentees can view; per-mentor resource pages
- **Chat**: Real-time messaging (polling-based)
- **Leaderboard**: Points based on resources, posts, and mentor package
- **Admin Dashboard**: Counts (mentors, mentees, resources, posts, pending verifications)
- **Admin Moderation**: Approve/reject posts and resources, verify mentors
- **DB Triggers & Procedure**: Automatic leaderboard updates; admin cap (max 10); maintenance procedure

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- SQLAlchemy ORM (sync)
- MySQL 8.x
- Pydantic for validation
- JWT authentication

Connection string (SQLAlchemy):

```
mysql+pymysql://<user>:<password>@<host>:<port>/<database>
```

Example used in this project (`backend/app/config.py`):

```
DATABASE_URL=mysql+pymysql://root:27041971@localhost:3306/mentorship_db
```

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- Axios
- React Router

Backend connection (Axios): `frontend/src/api/client.ts`

```
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
export const apiClient = axios.create({ baseURL: API_BASE_URL })
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API routes
│   │   ├── utils/          # Utilities (auth)
│   │   ├── config.py       # Configuration
│   │   ├── db.py           # Database setup
│   │   └── main.py         # FastAPI app
│   ├── seed.py             # Seed script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/    # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.x

### Backend Setup

1. **Set up MySQL database:**
   
   **Option A: Using SQL Script (Recommended)**
   ```bash
   cd backend
   mysql -u root -p < database_setup.sql
   ```
   
   **Option B: Using Setup Script**
   ```bash
   # Linux/Mac
   chmod +x setup_database.sh
   ./setup_database.sh
   
   # Windows
   setup_database.bat
   ```
   
   See `backend/DATABASE_SETUP.md` for detailed instructions.

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and update with your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/mentorship_db
   SECRET_KEY=your-secret-key-change-in-production
   ```
   
   **Note:** Generate a secure SECRET_KEY for production:
   ```bash
   openssl rand -hex 32
   ```

3. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Seed sample data:**
   ```bash
   python seed.py
   ```

5. **Start the server:**
   ```bash
   python run.py
   # OR
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure API URL (optional):**
Create `.env` file:
```
VITE_API_URL=http://localhost:8000
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Sample Accounts

After running the seed script:

- **Admin**: `admin@college.edu` / `admin123`
- **Mentor**: `mentor1@college.edu` / `mentor123`
- **Mentee**: `mentee1@college.edu` / `mentee123`

## API Endpoints

### Auth
- `POST /auth/signup` - Sign up
- `POST /auth/login` - Login

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile

### Mentors
- `GET /mentors` - List mentors (with filters)
- `GET /mentors/{id}` - Get mentor
- `GET /mentors/by-user/{user_id}` - Get mentor by `users.id`
- `POST /mentors` - Create mentor profile (sets `verified=false` until admin verifies)
- `PUT /mentors/me` - Update mentor profile

### Mentees
- `POST /mentees` - Create mentee profile
- `GET /mentees/me` - Get mentee profile

### Posts
- `GET /posts` - List posts
- `GET /posts/{id}` - Get post
- `POST /posts` - Create post
- `POST /posts/{id}/like` - Like post

### Resources
- `GET /resources` - List approved resources; filters: `category`, `resource_type`, `user_id`
- `POST /resources` - Create resource (Mentor/Admin only; auto-approved)
- `DELETE /resources/{id}` - Delete resource (owner only)
  
Per-mentor resource pages: click a mentor name in Resources to open `/mentors/user/{userId}` and view their shared resources.

### Chats
- `POST /chats` - Send message
- `GET /chats/conversation/{user_id}` - Get conversation

### Leaderboard
- `GET /leaderboard` - Get leaderboard

### Admin
- `POST /admin/profile/create` - Create admin profile (sets `role=ADMIN`)
- `GET /admin/profile` / `PUT /admin/profile` - View/update admin profile
- `GET /admin/stats` - Get counts (mentors, mentees, posts, resources, pending mentors)
- `PUT /admin/mentors/{id}/verify` - Verify mentor
- `GET /admin/posts` / `GET /admin/resources` - List all posts/resources (moderation view)
- `PUT /admin/posts/{id}/approve|reject` - Approve or reject a post
- `PUT /admin/resources/{id}/approve|reject` - Approve or reject a resource
- `DELETE /admin/posts/{id}` / `DELETE /admin/resources/{id}` - Delete post/resource
- `POST /admin/db/install` - Install DB triggers and stored procedure (admin only)

## Leaderboard Formula

Points are calculated as:
```
Points = (total_resources × 10) + (total_posts × 5) + (package × 2)
```

Automatic updates via DB triggers keep these values in sync.

## Notes

- Chat uses polling (GET requests every 2 seconds) instead of WebSockets
- Resources store `file_url` as a string (no actual file upload)
- All protected routes require JWT token in Authorization header
- Pagination is supported for mentors, posts, and resources
- Admin link appears in the top navigation only for users with `role=ADMIN`

## Development

- Backend uses auto-reload with `--reload` flag
- Frontend uses Vite HMR for hot module replacement
- CORS is configured for `localhost:5173` and `localhost:3000`

## Admin Onboarding & Dashboard

- On signup, navigate to `/onboarding` and choose `Admin` to create the admin profile.
- Admin Dashboard route: `/admin`
- Admin Moderation page: `/admin/moderation` (tabs: Posts, Resources, Mentors)

### Installing DB Triggers & Procedure

- Log in as Admin and call:

```
POST /admin/db/install
```

This installs:
- `admin` BEFORE INSERT trigger limiting to 10 admins
- `resources` AFTER INSERT/DELETE triggers syncing `leaderboard.total_resources` and `points`
- `posts` AFTER INSERT/DELETE triggers syncing `leaderboard.total_posts` and `points`
- `mentors` AFTER UPDATE trigger syncing `leaderboard.package` and `points`
- `sp_recalc_leaderboard` stored procedure with a cursor to recompute all rows

To verify: `SHOW TRIGGERS;` and `SHOW PROCEDURE STATUS LIKE 'sp_recalc_leaderboard';`

To run the procedure manually:

```
CALL sp_recalc_leaderboard();
```

## CRUD Implementation Overview

- Insert:
  - Posts: `POST /posts` inserts and updates leaderboard totals
  - Resources: `POST /resources` inserts and updates leaderboard totals; Admin/Mentor only
  - Chat: `POST /chats` inserts messages
  - Profiles: `POST /mentors`, `POST /mentees`, `POST /admin/profile/create`
- Update:
  - Mentor: `PUT /mentors/me`
  - Admin profile: `PUT /admin/profile`
- Delete:
  - Posts/Resources: Admin moderation delete endpoints; resources owner delete
- Retrieve:
  - Listings: `GET /posts`, `GET /resources`, `GET /mentors`
  - Per-mentor resources: `GET /resources?user_id=<id>` and frontend route `/mentors/user/{userId}`
  - Counts: `GET /admin/stats`

## License

MIT

