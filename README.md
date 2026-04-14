# JARVIS OS — Business Operating System

A modern, AI-powered business management platform built with FastAPI and React.

## Features

- **Dashboard** — Overview of your business metrics, tasks, and upcoming events
- **Contacts / CRM** — Manage business contacts with search and filtering
- **Task Management** — Kanban-style task board with priorities and due dates
- **Calendar** — Event scheduling with monthly calendar view
- **Notes** — Rich note-taking with tags and search
- **AI Assistant** — Chat-based AI assistant for business productivity
- **Authentication** — Secure JWT-based authentication

## Tech Stack

### Backend
- **Python 3.11** + **FastAPI**
- **SQLAlchemy** (ORM) + **SQLite** (dev) / **PostgreSQL** (prod)
- **PyJWT** + **passlib** for authentication
- **Pydantic v2** for data validation

### Frontend
- **React 18** + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for HTTP client
- **Lucide React** for icons

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** for frontend serving and API proxy

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)

### With Docker (Recommended)

```bash
cp .env.example .env
# Edit .env with your configuration
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
JARVIS_OS/
├── backend/
│   ├── app/
│   │   ├── core/           # Database, security, dependencies
│   │   ├── modules/
│   │   │   ├── auth/       # Authentication (JWT)
│   │   │   ├── contacts/   # CRM / Contacts
│   │   │   ├── tasks/      # Task management
│   │   │   ├── calendar/   # Event scheduling
│   │   │   ├── notes/      # Note-taking
│   │   │   ├── dashboard/  # Analytics & overview
│   │   │   └── ai/         # AI assistant
│   │   ├── main.py
│   │   └── config.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # HTTP client & endpoints
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state stores
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Database connection string | `sqlite:///./jarvis.db` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRY_MINUTES` | Token expiry in minutes | `30` |
| `OPENAI_API_KEY` | OpenAI API key for AI chat | (optional) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## License

MIT
