# College Mentorship Platform

A full-stack mentorship platform where mentors (placed seniors) guide mentees. Built with FastAPI (backend) and React + TypeScript (frontend).

## Features

- **User Authentication**: Signup, login with JWT tokens
- **Role-based Profiles**: Mentor and Mentee profiles
- **Mentor Directory**: Browse mentors with filters (branch, graduation year, verification status)
- **Posts Feed**: Create and like posts
- **Resources**: Share and download resources
- **Chat**: Real-time messaging (polling-based)
- **Leaderboard**: Points system based on contributions
- **Admin Panel**: Verify mentors

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- SQLAlchemy ORM (sync)
- MySQL 8.x
- Pydantic for validation
- JWT authentication

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- Axios
- React Router

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
- `POST /mentors` - Create mentor profile
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
- `GET /resources` - List resources
- `POST /resources` - Create resource
- `DELETE /resources/{id}` - Delete resource

### Chats
- `POST /chats` - Send message
- `GET /chats/conversation/{user_id}` - Get conversation

### Leaderboard
- `GET /leaderboard` - Get leaderboard

### Admin
- `PUT /admin/mentors/{id}/verify` - Verify mentor

## Leaderboard Formula

Points are calculated as:
```
Points = (total_resources × 10) + (total_posts × 5) + (package × 2)
```

## Notes

- Chat uses polling (GET requests every 2 seconds) instead of WebSockets
- Resources store `file_url` as a string (no actual file upload)
- All protected routes require JWT token in Authorization header
- Pagination is supported for mentors, posts, and resources

## Development

- Backend uses auto-reload with `--reload` flag
- Frontend uses Vite HMR for hot module replacement
- CORS is configured for `localhost:5173` and `localhost:3000`

## License

MIT

