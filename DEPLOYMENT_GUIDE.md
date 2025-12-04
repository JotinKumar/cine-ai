# Deployment Guide: Cine-AI

## Overview

Cine-AI is a full-stack monorepo application that can be deployed to various cloud platforms. This guide covers deployment on Vercel (frontend), Railway (backend), and Supabase (database).

---

## Architecture for Deployment

```
┌─────────────────────────────────────┐
│     Vercel (Frontend)               │
│  - Next.js 14                       │
│  - React Components                 │
│  - Static assets                    │
└────────────┬────────────────────────┘
             │ API calls (HTTPS)
             ↓
┌─────────────────────────────────────┐
│     Railway (Backend)               │
│  - Express.js API                   │
│  - 25+ endpoints                    │
│  - Model adapter integration        │
└────────────┬────────────────────────┘
             │ SQL queries
             ↓
┌─────────────────────────────────────┐
│   Supabase (PostgreSQL DB)          │
│  - 11 Prisma models                 │
│  - Full relational schema           │
└─────────────────────────────────────┘

External Services:
├─ OpenRouter API (LLMs)
├─ FAL.ai API (Image/Video)
└─ S3/Supabase Storage (Assets)
```

---

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Database schema verified
- [ ] API endpoints tested
- [ ] Frontend components optimized
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] SSL certificates ready

---

## Step 1: Database Setup (Supabase)

### Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Select organization and region
4. Set database password
5. Wait for provisioning (~5 min)

### Migrate Database Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref [project-ref]

# Push migrations
npx prisma migrate deploy

# Verify schema
psql [DATABASE_URL] -c "\dt"
```

### Environment Variables

```env
# Supabase Connection
DATABASE_URL="postgresql://[user]:[password]@db.[region].supabase.co:5432/postgres"
SHADOW_DATABASE_URL="postgresql://[user]:[password]@db.[region].supabase.co:5432/postgres_shadow"

# JWT for Auth
SUPABASE_JWT_SECRET="[your-jwt-secret]"

# API URL
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
```

---

## Step 2: Backend Deployment (Railway)

### Setup Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect GitHub account
5. Select cine-ai repository

### Configure Railway

Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd backend && npm install && npm run build && cd .."
  },
  "deploy": {
    "restartPolicyType": "always",
    "restartPolicyMaxRetries": 5,
    "startCommand": "cd backend && npm run start"
  }
}
```

### Set Environment Variables in Railway

```env
# Database
DATABASE_URL=postgresql://...

# API Keys
OPENROUTER_API_KEY=sk-or-...
FAL_AI_API_KEY=...

# Server
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=your-secret-key

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

### Deploy

```bash
# Push to main branch
git push origin main

# Railway automatically deploys on push
```

### Verify Deployment

```bash
# Test API endpoint
curl https://your-backend.railway.app/api/health

# Check logs
railway logs
```

---

## Step 3: Frontend Deployment (Vercel)

### Setup Vercel Project

1. Go to https://vercel.com
2. Click "New Project"
3. Import cine-ai repository
4. Select "Next.js" framework

### Configure Vercel

In project settings:

```
Root Directory: ./frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Set Environment Variables in Vercel

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api

# Supabase (if using for auth)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Deploy

```bash
# Push to main branch
git push origin main

# Or deploy manually via Vercel dashboard
```

### Verify Deployment

```bash
# Check frontend is accessible
curl https://your-frontend.vercel.app

# Check API connectivity
# (visible in browser console, Network tab)
```

---

## Step 4: Storage Configuration

### S3/Supabase Storage for Assets

Update `.env`:

```env
# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=cine-ai-assets

# Or Supabase Storage
SUPABASE_STORAGE_BUCKET=cine-ai-assets
SUPABASE_STORAGE_URL=https://...
```

Update `backend/src/services/stage4.service.ts` and `stage5.service.ts`:

```typescript
// Replace mock storage with real S3/Supabase storage
const storageKey = `s3://cine-ai-assets/${projectId}/${assetName}`;

// Upload to S3/Supabase
await uploadToStorage(asset, storageKey);
```

---

## Step 5: External API Configuration

### OpenRouter API

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3-5-sonnet
```

Test connectivity:

```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}], "model": "test"}'
```

### FAL.ai API

```env
FAL_AI_API_KEY=...
```

Test connectivity:

```bash
curl -X POST https://api.fal.ai/v1/models/flux/generate \
  -H "Authorization: Key $FAL_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

---

## Step 6: Security Configuration

### Enable HTTPS

- Vercel: Automatic (free SSL)
- Railway: Automatic (free SSL)
- Supabase: Automatic (free SSL)

### Configure CORS

Update `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

### Rate Limiting

Install and configure:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Environment Variables Security

Use Railway/Vercel secrets:
- Never commit `.env` files
- Use `---` to separate secrets
- Rotate API keys regularly

---

## Step 7: Monitoring & Logging

### Add Logging Service (Optional)

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

Add health endpoint:

```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## Step 8: Database Backups

### Supabase Automated Backups

Backups are automatic (daily):

1. Go to Supabase Dashboard
2. Settings → Backups
3. View backup history
4. Download backup if needed

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Step 9: Scaling Considerations

### Horizontal Scaling

For Railway backend:

1. Go to Railway Dashboard
2. Select service
3. Scale → Increase instances
4. Set concurrency limits

### Database Scaling

For Supabase:

1. Go to Supabase Dashboard
2. Settings → Billing
3. Upgrade plan if needed
4. Monitor connection count

### CDN for Static Assets

Configure Vercel edge caching:

```
vercel.json:
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

---

## Step 10: Post-Deployment Testing

### Smoke Tests

```bash
# Test frontend loading
curl -I https://your-frontend.vercel.app

# Test backend API
curl https://your-backend.railway.app/api/health

# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Test external APIs
# (via application workflow)
```

### End-to-End Testing

1. Open production frontend
2. Create new project
3. Generate story (Stage 1)
4. Edit story (Stage 2)
5. Generate scenes (Stage 3)
6. Generate images (Stage 4)
7. Generate video (Stage 5)
8. Download output

---

## Troubleshooting Deployment

### Backend Won't Start

```bash
# Check logs
railway logs

# Common issues:
# - DATABASE_URL not set
# - Prisma migrations not run
# - Environment variables missing

# Solution:
railway shell
npx prisma migrate deploy
npm start
```

### Frontend Not Connecting to Backend

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify CORS is enabled
3. Check API key validity
4. Test API directly with curl

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Common issues:
# - Wrong connection string
# - Database down
# - IP not whitelisted

# Solution:
# Check Supabase settings → Database → Connection string
# Whitelist IPs in Supabase firewall
```

---

## Performance Optimization

### Frontend

1. Enable image optimization in `next.config.js`
2. Use dynamic imports for code splitting
3. Enable ISR (Incremental Static Regeneration)
4. Compress assets with gzip

### Backend

1. Enable query result caching
2. Use connection pooling for database
3. Implement request caching headers
4. Optimize database indexes

### Database

```sql
-- Create indexes for common queries
CREATE INDEX idx_project_user ON "Project"("userId");
CREATE INDEX idx_story_project ON "Story"("projectId");
CREATE INDEX idx_scene_project ON "Scene"("projectId");
CREATE INDEX idx_character_project ON "Character"("projectId");
CREATE INDEX idx_asset_project ON "Asset"("projectId");
```

---

## Rollback Procedure

If deployment fails:

### Frontend (Vercel)

```bash
# Revert to previous deployment
# Via Vercel dashboard: Deployments → Click previous → Promote
```

### Backend (Railway)

```bash
# Revert to previous commit
git revert [commit-hash]
git push origin main

# Railway automatically redeploys
```

### Database (Supabase)

```bash
# Restore from backup
# Via Supabase dashboard: Settings → Backups → Restore
```

---

## Monitoring Checklist

- [ ] Monitor error rates (Sentry/Logs)
- [ ] Monitor API response times
- [ ] Monitor database query performance
- [ ] Monitor storage usage
- [ ] Monitor API quota usage (OpenRouter, FAL.ai)
- [ ] Monitor uptime (Status page)
- [ ] Review logs weekly
- [ ] Test backups monthly

---

## Scaling Beyond Initial Deployment

### Phase 2: Enterprise Features

1. Add user authentication (Supabase Auth)
2. Implement multi-user workspaces
3. Add team collaboration features
4. Implement audit logging
5. Add admin dashboard

### Phase 3: Advanced Features

1. Implement video streaming (HLS)
2. Add real-time collaboration
3. Implement marketplace for templates
4. Add API for third-party integrations
5. Create mobile app (React Native)

---

## Cost Estimation

| Service | Free Tier | Pro Tier | Estimated Monthly |
|---------|-----------|----------|-------------------|
| Vercel | ✅ | $20/mo | $20 |
| Railway | ✅ | $5-50/mo | $20 |
| Supabase | ✅ (500MB) | $25/mo | $25 |
| OpenRouter | ✅ (credits) | Usage-based | $50-200 |
| FAL.ai | ✅ (credits) | Usage-based | $50-200 |
| **Total** | - | - | **$165-465** |

---

**Deployment complete! Your Cine-AI application is now live.** 🚀

For support or questions, refer to:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Express Docs: https://expressjs.com
