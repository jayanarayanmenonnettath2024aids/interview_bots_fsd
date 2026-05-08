#!/bin/bash

# ========================================
# AI Interview Bot - Server Startup
# Run setup.sh ONCE first, then use this
# ========================================

set -e
cd "$(dirname "$0")"

clear

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  AI Interview Bot - Starting Servers                   ║"
echo "║  Press Ctrl+C to stop all servers                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "[INFO] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found!"
    echo "Please run: ./setup.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo "Please run: ./setup.sh"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d backend/node_modules ]; then
    echo "[ERROR] Backend dependencies not installed!"
    echo "Please run: ./setup.sh"
    exit 1
fi

if [ ! -d frontend/node_modules ]; then
    echo "[ERROR] Frontend dependencies not installed!"
    echo "Please run: ./setup.sh"
    exit 1
fi

# Check for external services
echo ""
echo "[INFO] Checking required services..."

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "[✓] PostgreSQL found"
else
    echo "[⚠] PostgreSQL not in PATH - make sure it's running!"
fi

# Check Ollama
if curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "[✓] Ollama is running"
else
    echo "[⚠] Ollama not responding - start it with: ollama serve"
fi

# Start servers
echo ""
echo "[INFO] Starting servers..."
echo "[INFO] Backend: http://localhost:5000"
echo "[INFO] Frontend: http://localhost:5173"
echo "[INFO] Press Ctrl+C to stop"
echo ""

npm run dev

