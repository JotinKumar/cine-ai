@echo off
REM Cine-AI Project Startup Script for Windows
REM This script helps you get the project running quickly

echo.
echo ================================
echo   Cine-AI Project Setup
echo ================================
echo.

REM Check if Docker is running
echo Checking Docker...
docker ps >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker is running
    
    REM Check if PostgreSQL container exists
    docker ps -a | findstr cine-ai-postgres >nul 2>&1
    if %errorlevel% equ 0 (
        echo PostgreSQL container exists
        
        REM Check if it's running
        docker ps | findstr cine-ai-postgres >nul 2>&1
        if %errorlevel% equ 0 (
            echo [OK] PostgreSQL container is running
        ) else (
            echo Starting PostgreSQL container...
            docker start cine-ai-postgres
            echo [OK] PostgreSQL container started
            echo Waiting 5 seconds for PostgreSQL to be ready...
            timeout /t 5 /nobreak >nul
        )
    ) else (
        echo Creating new PostgreSQL container...
        docker run --name cine-ai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cine_ai_dev -p 5432:5432 -d postgres:15
        echo [OK] PostgreSQL container created
        echo Waiting 10 seconds for PostgreSQL to initialize...
        timeout /t 10 /nobreak >nul
    )
) else (
    echo [WARNING] Docker is not running!
    echo.
    echo Please choose an option:
    echo 1. Start Docker Desktop and run this script again
    echo 2. Use Supabase (cloud database) - see setup-database.md
    echo 3. Install PostgreSQL locally - see setup-database.md
    echo.
    pause
    exit /b 1
)

REM Check if database is set up
echo.
echo Checking database setup...
cd backend
npx prisma db push --skip-generate >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Database schema is up to date
) else (
    echo Setting up database schema...
    npx prisma migrate dev --name init
    echo [OK] Database schema created
)
cd ..

REM Check API keys
echo.
echo Checking API keys...
findstr /C:"your_openrouter_api_key_here" backend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] OpenRouter API key not configured
    echo           Edit backend\.env and add your OPENROUTER_API_KEY
    echo           Get one at: https://openrouter.ai
) else (
    echo [OK] OpenRouter API key configured
)

findstr /C:"your_fal_ai_api_key_here" backend\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] FAL.ai API key not configured
    echo           Edit backend\.env and add your FAL_AI_API_KEY
    echo           Get one at: https://fal.ai
) else (
    echo [OK] FAL.ai API key configured
)

REM Start the application
echo.
echo ================================
echo   Starting Cine-AI...
echo ================================
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

REM Start both servers
npm run dev
