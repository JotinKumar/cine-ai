#!/bin/bash

# Cine-AI Project Startup Script
# This script helps you get the project running quickly

set -e

echo "🎬 Cine-AI Project Setup"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if docker ps > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
    
    # Check if PostgreSQL container exists
    if docker ps -a | grep -q cine-ai-postgres; then
        echo "🗄️  PostgreSQL container exists"
        
        # Check if it's running
        if docker ps | grep -q cine-ai-postgres; then
            echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
        else
            echo "▶️  Starting PostgreSQL container..."
            docker start cine-ai-postgres
            echo -e "${GREEN}✓ PostgreSQL container started${NC}"
            echo "⏳ Waiting 5 seconds for PostgreSQL to be ready..."
            sleep 5
        fi
    else
        echo "🚀 Creating new PostgreSQL container..."
        docker run --name cine-ai-postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=cine_ai_dev \
            -p 5432:5432 \
            -d postgres:15
        echo -e "${GREEN}✓ PostgreSQL container created${NC}"
        echo "⏳ Waiting 10 seconds for PostgreSQL to initialize..."
        sleep 10
    fi
else
    echo -e "${YELLOW}⚠ Docker is not running${NC}"
    echo ""
    echo "Please choose an option:"
    echo "1. Start Docker Desktop and run this script again"
    echo "2. Use Supabase (cloud database) - see setup-database.md"
    echo "3. Install PostgreSQL locally - see setup-database.md"
    echo ""
    exit 1
fi

# Check if database is set up
echo ""
echo "🗄️  Checking database setup..."
if cd backend && npx prisma db push --skip-generate > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database schema is up to date${NC}"
    cd ..
else
    echo "📝 Setting up database schema..."
    cd backend
    npx prisma migrate dev --name init
    cd ..
    echo -e "${GREEN}✓ Database schema created${NC}"
fi

# Check API keys
echo ""
echo "🔑 Checking API keys..."
if grep -q "your_openrouter_api_key_here" backend/.env; then
    echo -e "${YELLOW}⚠ Warning: OpenRouter API key not configured${NC}"
    echo "   Edit backend/.env and add your OPENROUTER_API_KEY"
    echo "   Get one at: https://openrouter.ai"
else
    echo -e "${GREEN}✓ OpenRouter API key configured${NC}"
fi

if grep -q "your_fal_ai_api_key_here" backend/.env; then
    echo -e "${YELLOW}⚠ Warning: FAL.ai API key not configured${NC}"
    echo "   Edit backend/.env and add your FAL_AI_API_KEY"
    echo "   Get one at: https://fal.ai"
else
    echo -e "${GREEN}✓ FAL.ai API key configured${NC}"
fi

# Start the application
echo ""
echo "🚀 Starting Cine-AI..."
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start both servers
npm run dev
