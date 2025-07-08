# Burnout Detection Agent

A comprehensive AI-powered burnout detection system built with Next.js (frontend), FastAPI (backend), and PostgreSQL (database).

## Features

- **JWT Authentication**: Secure user authentication with signup/signin
- **Real-time Burnout Analysis**: AI-powered analysis of work patterns, email stress, meeting load, and journal sentiment
- **Google Vertex AI Integration**: Advanced sentiment analysis and emotion detection
- **Calendar & Email Sync**: Integration with Google Calendar and Gmail APIs
- **Interactive Dashboard**: Real-time charts and visualizations
- **Journal Tracking**: Mood and sentiment analysis of journal entries
- **Work Pattern Analysis**: Comprehensive work hour and productivity tracking
- **WebSocket Support**: Real-time updates and notifications

## Tech Stack

### Frontend
- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

### Backend
- FastAPI with Python
- SQLAlchemy ORM
- PostgreSQL database
- JWT authentication
- WebSocket support
- Google Vertex AI
- Google Calendar API
- Gmail API

### Infrastructure
- Docker & Docker Compose
- CORS enabled
- Environment-based configuration

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp .env.local.example .env.local
   ```
3. Start all services:
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

#### Database Setup
```bash
# Using Docker
docker run --name burnout-db -e POSTGRES_PASSWORD=burnout_password -e POSTGRES_USER=burnout_user -e POSTGRES_DB=burnout_db -p 5432:5432 -d postgres:15-alpine
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### Burnout Analysis
- `GET /api/burnout/metrics` - Get burnout metrics
- `GET /api/burnout/history` - Get burnout history
- `POST /api/burnout/calculate` - Calculate burnout score

### Journal
- `POST /api/journal/` - Create journal entry
- `GET /api/journal/recent` - Get recent entries

### Work Sessions
- `POST /api/work-sessions/` - Create work session
- `GET /api/work-sessions/` - Get work sessions
- `GET /api/work-sessions/patterns` - Get work patterns

### Integrations
- `POST /api/integrations/sync/calendar` - Sync calendar data
- `POST /api/integrations/sync/emails` - Sync email data

## Configuration

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/burnout_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Google Cloud Setup

1. Create a Google Cloud project
2. Enable Vertex AI API
3. Create a service account and download credentials
4. Enable Google Calendar API and Gmail API
5. Update environment variables

## Burnout Calculation

The system calculates burnout based on:
- **Work Hours** (25%): Average daily work hours
- **Sentiment Analysis** (25%): Journal entry sentiment
- **Meeting Load** (25%): Meeting frequency and duration
- **Email Stress** (25%): Email volume and sentiment

Score ranges:
- Low: 0-0.3
- Moderate: 0.3-0.6
- High: 0.6-1.0

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- SQL injection prevention
- Environment-based secrets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.