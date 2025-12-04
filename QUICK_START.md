# Cine-AI Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm 9+
- PostgreSQL database running
- OpenRouter API key
- FAL.ai API key

## Installation & Setup

### 1. Clone and Install Dependencies
```bash
cd cine-ai
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cine_ai_dev

# AI APIs
OPENROUTER_API_KEY=your_key_here
FAL_AI_API_KEY=your_key_here

# JWT (generate secure random string)
JWT_SECRET=your_jwt_secret_here
```

### 3. Setup Database
```bash
# From backend directory
cd backend
npm run prisma:generate
npm run migrate

# Or use Prisma Studio to view/manage data
npm run prisma:studio
```

### 4. Start Development Servers
```bash
# From root directory, runs both frontend and backend
npm run dev

# Or separately:
npm run dev:backend    # Backend on http://localhost:3001
npm run dev:frontend   # Frontend on http://localhost:3000
```

## Project Structure

```
cine-ai/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── adapters/    # AI model adapters
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── schemas/     # Validation schemas
│   │   └── prompts/     # System prompts
│   ├── prisma/          # Database schema
│   └── package.json
├── frontend/             # Next.js React app
│   ├── src/
│   │   ├── app/        # Pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── store/      # State management
│   └── package.json
├── shared/              # Shared types/utilities (optional)
└── docs/               # Documentation
```

## Available Commands

### Backend
```bash
cd backend
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Run compiled server
npm run migrate         # Run database migrations
npm run prisma:studio   # Open Prisma Studio (data viewer)
npm run prisma:generate # Generate Prisma client
npm run test            # Run tests
```

### Frontend
```bash
cd frontend
npm run dev             # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## API Endpoints

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/user/:userId` - List user's projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Stage 1: Story Generation
- `POST /api/stage1/story-generation` - Generate story from blueprint
- `GET /api/stage1/story/:projectId` - Get generated story

### Stage 2: Story Editing
- `POST /api/stage2/story-editing` - Edit and validate story
- `POST /api/stage2/validate` - Validate story only
- `POST /api/stage2/regenerate-scene` - Regenerate individual scene

## Workflow: Story Generation Example

### 1. Create a Project
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "name": "My Sci-Fi Story"
  }'
```

### 2. Generate Story
```bash
curl -X POST http://localhost:3001/api/stage1/story-generation \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id-from-step-1",
    "coreIdea": "A lone astronaut discovers an ancient alien signal",
    "genre": "Science Fiction",
    "toneMood": "Suspenseful",
    "wordCount": 1500,
    "languageStyle": "English, cinematic",
    "narration": "third-person",
    "sceneCount": 5,
    "characters": ["Commander Sarah", "AI Assistant"],
    "selectedModel": "anthropic/claude-3.5-sonnet",
    "apiKey": "your-openrouter-api-key"
  }'
```

### 3. View Generated Story
```bash
curl http://localhost:3001/api/stage1/story/project-id
```

## Frontend Usage

### 1. Home Page
- Visit `http://localhost:3000`
- Click "Get Started" or "View Projects"

### 2. Projects Page
- See all your projects
- Create new project
- Delete existing projects
- Open project to edit

### 3. Project Detail Page
- View story generation progress
- Fill in story blueprint form
- View generated story
- Proceed to next stage

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### API Key Error
```
Error: OpenRouter API error: Unauthorized
```
**Solution**: Check OPENROUTER_API_KEY is correctly set in .env.local

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution**: Change PORT in .env.local or kill process on port 3001

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` from the root directory

## Development Tips

1. **Use Prisma Studio** to view and manage database data:
   ```bash
   cd backend && npm run prisma:studio
   ```

2. **Check API responses** using VS Code REST Client or similar

3. **Enable TypeScript strict mode** for better type checking

4. **Use environment variables** for sensitive data, never commit to git

5. **Monitor logs** - Backend logs appear in terminal with timestamps

## Next Steps

After completing Phase 2:
- Implement Stage 3 (Scene Generation with PWA-4.0)
- Add Stage 4 (Image Generation)
- Add Stage 5 (Video Assembly)
- Implement authentication
- Add user profile management
- Deploy to production

## Support

For issues or questions:
1. Check error messages carefully
2. Review logs in terminal
3. Ensure all environment variables are set
4. Verify database connection
5. Check API keys are valid

---

Last Updated: December 4, 2025
