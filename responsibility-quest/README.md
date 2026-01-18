# 🎮 IT Responsibility Quest

A gamified web application for creating IT responsibility matrices. Turn the world's most boring spreadsheet into the world's most satisfying sorting game—with a sarcastic AI guide who's seen some things.

## Features

- 🎯 **Drag-and-drop sorting** - Move responsibilities between "Handled", "Need Help", and "Unknown" piles
- 👥 **Player management** - Assign responsibilities to team members with cascade logic
- 🤖 **Jane AI assistant** - Sarcastic, helpful guide with ElevenLabs voice integration
- 🏆 **Gamified completion** - Earn medals based on your sorting performance
- 📄 **Export to Markdown** - Generate documentation automatically
- 🎨 **Per-client branding** - Customize logo and colors for each client

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- (Optional) ElevenLabs API key for Jane's voice

### 1. Clone and configure

```bash
# Clone the repository
git clone <your-repo-url>
cd responsibility-quest

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Start the application

```bash
# Build and start all services
docker-compose up -d

# Run database migrations and seed data
docker-compose up migrate

# View logs
docker-compose logs -f
```

### 3. Access the application

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Frontend port | 3000 |
| `DB_NAME` | PostgreSQL database name | responsibility_quest |
| `DB_USER` | PostgreSQL user | postgres |
| `DB_PASSWORD` | PostgreSQL password | postgres |
| `ELEVENLABS_API_KEY` | ElevenLabs API key (optional) | - |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID (optional) | - |

## Creating a New Client Session

### Via API

```bash
# 1. Create a client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "primary_color": "#FF6B35",
    "secondary_color": "#1A1A2E"
  }'

# Response: { "id": "client-uuid-here", ... }

# 2. Create a game session
curl -X POST http://localhost:3000/api/sessions/create/CLIENT_ID_HERE

# Response: { "accessToken": "abc123...", "gameUrl": "/play/abc123..." }
```

### Via Direct Database

```sql
-- Insert a client
INSERT INTO clients (name, primary_color, secondary_color) 
VALUES ('Acme Corp', '#FF6B35', '#1A1A2E')
RETURNING id;

-- Use the returned ID to create a session via the API
```

## Project Structure

```
responsibility-quest/
├── backend/
│   ├── src/
│   │   ├── db/           # Database connection & migrations
│   │   ├── routes/       # API endpoints
│   │   └── index.js      # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Route pages
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Helper functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create a client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Sessions
- `GET /api/sessions/token/:token` - Get session by access token
- `POST /api/sessions/create/:clientId` - Create new session
- `PATCH /api/sessions/:id` - Update session
- `POST /api/sessions/:id/complete` - Complete the game
- `GET /api/sessions/:id/export` - Export as Markdown

### Players
- `GET /api/players/session/:sessionId` - List players
- `POST /api/players/session/:sessionId` - Add player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Remove player

### Responsibilities
- `GET /api/responsibilities/templates` - Get all templates
- `GET /api/responsibilities/assignments/:sessionId` - Get assignments
- `PATCH /api/responsibilities/assignments/:id` - Update assignment
- `POST /api/responsibilities/assignments/bulk-update` - Bulk update

### Jane AI
- `GET /api/jane/intro` - Get introduction
- `POST /api/jane/respond` - Get contextual response
- `GET /api/jane/explain/:templateId` - Get item explanation

## Development

### Local Development (without Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Adding New Responsibilities

Edit `backend/src/db/seed.js` and add new items to the `responsibilities` array:

```javascript
{
  title: "New Responsibility",
  description: "What this responsibility covers",
  why_it_matters: "Jane's sarcastic take on why this matters",
  typical_owner: "Who usually handles this",
  category: "leadership|governance|security|infrastructure|...",
  children: [
    // Nested responsibilities
  ]
}
```

Then re-run migrations:
```bash
docker-compose up migrate
```

## Deployment to Dokploy

1. Push your code to a Git repository
2. In Dokploy, create a new project
3. Add the repository URL
4. Set environment variables in Dokploy's UI
5. Deploy!

The `docker-compose.yml` is already configured for production deployment.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, dnd-kit
- **Backend**: Node.js, Express, PostgreSQL
- **Infrastructure**: Docker, Nginx
- **AI**: ElevenLabs (optional voice integration)

## License

MIT

---

Built with ❤️ by [ITernative](https://iternative.com)
