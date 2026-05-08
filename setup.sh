#!/bin/bash

# ========================================
# AI Interview Bot - Setup Script (Unix/macOS)
# Run this ONCE to initialize everything
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  AI Interview Bot - Initial Setup                      ║"
echo "║  This script will initialize all requirements          ║"
echo "║  Run this ONCE, then use start-servers.sh to run       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

CHECKS_PASSED=0
TOTAL_CHECKS=5

# ========================================
# 1. Check Node.js Installation
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}[✓]${NC} Node.js ${NODE_VERSION} found"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}[✗]${NC} Node.js not found! Please install from https://nodejs.org/"
    exit 1
fi

# ========================================
# 2. Check npm
# ========================================
echo -e "${YELLOW}[INFO]${NC} Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}[✓]${NC} npm ${NPM_VERSION} found"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}[✗]${NC} npm not found! Please install Node.js"
    exit 1
fi

# ========================================
# 3. Check PostgreSQL
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}[✓]${NC} PostgreSQL found: ${PSQL_VERSION}"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}[⚠]${NC}  PostgreSQL not found in PATH"
    echo "  Install from: https://www.postgresql.org/download/"
    echo ""
fi

# ========================================
# 4. Check Ollama
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version)
    echo -e "${GREEN}[✓]${NC} Ollama found: ${OLLAMA_VERSION}"
    ((CHECKS_PASSED++))
    
    # Check if Ollama server is running
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Checking if Ollama server is running..."
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo -e "${GREEN}[✓]${NC} Ollama server is running"
    else
        echo -e "${YELLOW}[⚠]${NC}  Ollama server not responding on localhost:11434"
        echo "  Start Ollama before running interviews (ollama serve)"
    fi
else
    echo -e "${YELLOW}[⚠]${NC}  Ollama not found in PATH"
    echo "  Download from: https://ollama.ai"
    echo "  AI features will not work without Ollama"
    echo ""
fi

# ========================================
# 5. Create .env file
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Checking environment configuration..."
if [ -f .env ]; then
    echo -e "${GREEN}[✓]${NC} .env file already exists"
    ((CHECKS_PASSED++))
else
    if [ -f .env.example ]; then
        echo -e "${YELLOW}[INFO]${NC} Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}[✓]${NC} .env file created"
        echo ""
        echo -e "${YELLOW}[⚠]${NC}  IMPORTANT: Edit .env with your actual credentials:"
        echo "  - DATABASE_URL: your PostgreSQL connection string"
        echo "  - JWT_SECRET: a secure random string (min 32 characters)"
        echo "  - Other variables as needed"
        echo ""
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}[✗]${NC} .env.example not found!"
        exit 1
    fi
fi

# ========================================
# 6. Install Dependencies
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Installing backend dependencies..."
if [ -f backend/package.json ]; then
    cd backend
    npm install --prefer-offline
    cd ..
    echo -e "${GREEN}[✓]${NC} Backend dependencies installed"
else
    echo -e "${RED}[✗]${NC} backend/package.json not found!"
    exit 1
fi

echo ""
echo -e "${YELLOW}[INFO]${NC} Installing frontend dependencies..."
if [ -f frontend/package.json ]; then
    cd frontend
    npm install --prefer-offline
    cd ..
    echo -e "${GREEN}[✓]${NC} Frontend dependencies installed"
else
    echo -e "${RED}[✗]${NC} frontend/package.json not found!"
    exit 1
fi

# ========================================
# 7. Database Setup Instructions
# ========================================
echo ""
echo -e "${YELLOW}[INFO]${NC} Database setup required (manual step)..."
echo ""
echo -e "${YELLOW}[IMPORTANT]${NC}: You need to create the database and tables:"
echo ""
echo "  1. Open PostgreSQL terminal"
echo "  2. Create database:"
echo "     CREATE DATABASE ai_interview_bot;"
echo ""
echo "  3. Execute the schema file:"
echo "     psql -U postgres -d ai_interview_bot -f database/schema.sql"
echo ""
echo "  Update DATABASE_URL in .env with your PostgreSQL credentials:"
echo "  DATABASE_URL=postgresql://username:password@localhost:5432/ai_interview_bot"
echo ""

# ========================================
# 8. Summary
# ========================================
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║             Setup Summary                              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}[✓]${NC} Node.js and npm verified"
echo -e "${GREEN}[✓]${NC} Dependencies installed (backend + frontend)"
echo -e "${GREEN}[✓]${NC} Environment file configured (.env)"
echo -e "${YELLOW}[⚠]${NC}  Database setup still needed (see above)"
echo -e "${YELLOW}[⚠]${NC}  Ollama setup still needed (see below)"
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║             Next Steps                                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "1. Setup .env file:"
echo "   - Open .env in a text editor"
echo "   - Update DATABASE_URL with your PostgreSQL credentials"
echo "   - Set JWT_SECRET to a secure random string (32+ chars)"
echo ""
echo "2. Setup Ollama:"
echo "   - Download from https://ollama.ai"
echo "   - Start: ollama serve"
echo "   - Pull models (in another terminal):"
echo "     ollama pull phi3:mini"
echo "     ollama pull deepseek-coder:1.3b"
echo "     ollama pull deepseek-r1:1.5b"
echo "     ollama pull gemma2:2b"
echo ""
echo "3. Setup PostgreSQL Database:"
echo "   - Create database: ai_interview_bot"
echo "   - Run: psql -U postgres -d ai_interview_bot -f database/schema.sql"
echo "   - Verify connection in .env"
echo ""
echo "4. Start the application:"
echo "   - Run: ./start-servers.sh"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5000"
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║             Setup Complete! 🎉                         ║"
echo "║  Next time, just run: ./start-servers.sh              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
