# 🚀 Quick Start - Cine-AI Project

## Step 1: Start Docker Desktop

**IMPORTANT:** Before running the project, you need to start Docker Desktop.

1. Open **Docker Desktop** application from your Start menu
2. Wait for it to fully start (the Docker icon in system tray should be stable)
3. You should see the Docker Desktop window open

## Step 2: Run the Project

Once Docker Desktop is running, simply double-click:

```
start.bat
```

Or run from the terminal:

```bash
./start.bat
```

This script will automatically:
- ✅ Check if Docker is running
- ✅ Create/start PostgreSQL container
- ✅ Set up database schema
- ✅ Check API keys
- ✅ Start backend (port 3001) and frontend (port 3000)

## Step 3: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Step 4: Configure API Keys (Optional for full functionality)

The app will run without API keys, but you'll need them to generate content:

1. Edit `backend/.env`
2. Add your API keys:
   - **OpenRouter:** Get from https://openrouter.ai (for LLM models)
   - **FAL.ai:** Get from https://fal.ai (for image/video generation)

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
FAL_AI_API_KEY=your-fal-key-here
```

## Alternative: Manual Setup

If you prefer manual control:

### 1. Start PostgreSQL (Docker)
```bash
docker run --name cine-ai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cine_ai_dev -p 5432:5432 -d postgres:15
```

### 2. Setup Database
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 3. Start Servers
```bash
npm run dev
```

This starts both backend and frontend simultaneously.

Or start them separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Troubleshooting

### Docker Desktop not installed?
Download from: https://www.docker.com/products/docker-desktop

### Port 5432 already in use?
```bash
# Stop existing PostgreSQL or use different port
docker run --name cine-ai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cine_ai_dev -p 5433:5432 -d postgres:15

# Then update backend/.env:
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cine_ai_dev
```

### Container already exists?
```bash
docker rm cine-ai-postgres
# Then run the docker run command again
```

### Want to use cloud database instead?
See `setup-database.md` for Supabase setup (no local Docker needed)

## What to Test

Once running, try this workflow:

1. Go to http://localhost:3000
2. Click "Create New Project"
3. Fill in the story blueprint form
4. Click "Generate Story" (Stage 1)
5. View and edit the generated story (Stage 2)
6. Generate scene breakdowns (Stage 3)
7. Generate images for scenes (Stage 4)
8. Assemble into video with narration (Stage 5)

**Note:** Stages 3-5 require valid API keys to work.

## Stop the Project

Press `Ctrl+C` in the terminal to stop both servers.

To stop the PostgreSQL container:
```bash
docker stop cine-ai-postgres
```

To start it again later:
```bash
docker start cine-ai-postgres
```

## Need Help?

See detailed guides:
- `setup-database.md` - Database configuration options
- `QUICK_START.md` - Detailed setup guide
- `TESTING_GUIDE.md` - Testing procedures
- `README.md` - Full project documentation
