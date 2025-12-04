# Database Setup Guide

## Option 1: Docker PostgreSQL (Recommended - Fastest)

1. **Start Docker Desktop** 
   - Open Docker Desktop application
   - Wait for it to start completely

2. **Run PostgreSQL container:**
   ```bash
   docker run --name cine-ai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cine_ai_dev -p 5432:5432 -d postgres:15
   ```

3. **Verify it's running:**
   ```bash
   docker ps
   ```

4. **The DATABASE_URL in backend/.env is already configured:**
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cine_ai_dev
   ```

5. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

---

## Option 2: Supabase (Cloud PostgreSQL - No Local Setup)

1. **Create a free Supabase account:**
   - Go to https://supabase.com
   - Create a new project

2. **Get your connection string:**
   - Go to Project Settings > Database
   - Copy the "Connection string" (Direct connection)
   - It looks like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

3. **Update backend/.env:**
   ```
   DATABASE_URL=your_supabase_connection_string
   ```

4. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

---

## Option 3: Local PostgreSQL Installation

If you have PostgreSQL installed locally:

1. **Create database:**
   ```bash
   createdb cine_ai_dev
   ```

2. **Update backend/.env with your credentials:**
   ```
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/cine_ai_dev
   ```

3. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

---

## After Database Setup

Once your database is configured and running:

```bash
# From the root directory
npm run dev
```

This will start both backend (port 3001) and frontend (port 3000).

## Troubleshooting

**Docker container already exists:**
```bash
docker rm cine-ai-postgres
# Then run the docker run command again
```

**Port 5432 already in use:**
```bash
# Stop existing PostgreSQL service
# Windows: services.msc > PostgreSQL > Stop
# Or use a different port in docker:
docker run --name cine-ai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cine_ai_dev -p 5433:5432 -d postgres:15
# Update DATABASE_URL to use port 5433
```

**Connection refused:**
- Make sure Docker container is running: `docker ps`
- Check Docker Desktop is fully started
- Wait 5-10 seconds after starting container
