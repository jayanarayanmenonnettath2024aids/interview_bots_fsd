# 🚀 AI Interview Bot - Setup & Startup Guide

## Two-Step Startup Process

This project uses a **two-script approach** for easy management:

1. **`setup.bat` or `setup.sh`** - Run ONCE to initialize everything
2. **`start-servers.bat` or `start-servers.sh`** - Run every time you want to start the servers

---

## Step 1: Initial Setup (Run Once)

### Windows
```bash
setup.bat
```

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### What the Setup Script Does
✅ Checks Node.js and npm installation  
✅ Checks for PostgreSQL  
✅ Checks for Ollama  
✅ Creates `.env` file from `.env.example`  
✅ Installs all backend dependencies  
✅ Installs all frontend dependencies  
✅ Provides database setup instructions  

### Setup Output Example
```
╔════════════════════════════════════════════════════════╗
║  AI Interview Bot - Initial Setup                      ║
║  This script will initialize all requirements          ║
║  Run this ONCE, then use start-servers.bat to run      ║
╚════════════════════════════════════════════════════════╝

[INFO] Checking Node.js installation...
[✓] Node.js v18.17.1 found
[INFO] Checking npm installation...
[✓] npm 9.6.7 found
...
[✓] Backend dependencies installed
[✓] Frontend dependencies installed
...
Next time, just run: start-servers.bat
```

### After Setup Script Completes

You need to complete 3 manual steps:

#### 1️⃣ Setup PostgreSQL Database

Create database and run schema:
```bash
# Create database
CREATE DATABASE ai_interview_bot;

# Run schema
psql -U postgres -d ai_interview_bot -f database/schema.sql
```

Or use pgAdmin to:
- Create database named `ai_interview_bot`
- Execute the file `database/schema.sql`

#### 2️⃣ Configure `.env` File

Edit `.env` in the project root with your credentials:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_interview_bot

# JWT
JWT_SECRET=your-secure-random-string-min-32-characters
JWT_EXPIRES_IN=7d

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_HR_MODEL=phi3:mini
OLLAMA_TECH_MODEL=deepseek-coder:1.3b
OLLAMA_EVAL_MODEL=deepseek-r1:1.5b
OLLAMA_FEEDBACK_MODEL=gemma2:2b

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 3️⃣ Download Ollama Models

Download and install Ollama from [ollama.ai](https://ollama.ai)

Then pull the required models:
```bash
# Terminal 1: Start Ollama server
ollama serve

# Terminal 2: Pull models (while server is running)
ollama pull phi3:mini
ollama pull deepseek-coder:1.3b
ollama pull deepseek-r1:1.5b
ollama pull gemma2:2b
```

---

## Step 2: Start Servers (Every Time)

### Windows
```bash
start-servers.bat
```

### macOS/Linux
```bash
./start-servers.sh
```

### What the Start Script Does
✓ Verifies Node.js installation  
✓ Checks `.env` file exists  
✓ Verifies dependencies are installed  
✓ Checks PostgreSQL is accessible  
✓ Checks Ollama is running  
✓ Starts backend on port 5000  
✓ Starts frontend on port 5173  

### Start Output Example
```
╔════════════════════════════════════════════════════════╗
║  AI Interview Bot - Starting Servers                   ║
║  Press Ctrl+C to stop all servers                      ║
╚════════════════════════════════════════════════════════╝

[INFO] Checking Node.js...
[INFO] Checking required services...
[✓] PostgreSQL found
[✓] Ollama is running

[INFO] Starting servers...
[INFO] Backend: http://localhost:5000
[INFO] Frontend: http://localhost:5173
[INFO] Press Ctrl+C to stop

> ai-interview-bot@1.0.0 dev
> concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"

[0] 
[0] > backend@1.0.0 dev
[0] > node src/server.js
...
[1] 
[1] > frontend@1.0.0 dev
[1] > vite
...
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## Troubleshooting

### "Node.js not found"
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### "Backend dependencies not installed"
**Solution:** Run `setup.bat` again, or manually:
```bash
npm install --prefix backend
```

### "Frontend dependencies not installed"
**Solution:** Run `setup.bat` again, or manually:
```bash
npm install --prefix frontend
```

### ".env file not found"
**Solution:** Run `setup.bat` to create `.env` from template

### "PostgreSQL not found"
**Solution:** 
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/)
2. Ensure PostgreSQL service is running
3. Ensure `psql` is in system PATH

### "Ollama not responding"
**Solution:** Start Ollama in a separate terminal:
```bash
ollama serve
```

Then in another terminal, pull models:
```bash
ollama pull phi3:mini
ollama pull deepseek-coder:1.3b
ollama pull deepseek-r1:1.5b
ollama pull gemma2:2b
```

### "Cannot connect to database"
**Solution:**
1. Verify DATABASE_URL in `.env` is correct
2. Verify PostgreSQL is running
3. Verify database `ai_interview_bot` exists
4. Run schema: `psql -U postgres -d ai_interview_bot -f database/schema.sql`

### "Ports already in use"
**Solution:** Change ports in `.env` if needed:
```env
PORT=5001              # Change backend port
VITE_API_URL=http://localhost:5001  # Update frontend to match
```

---

## File Structure

```
interview bot/
├── setup.bat              ← Run ONCE (Windows)
├── setup.sh               ← Run ONCE (macOS/Linux)
├── start-servers.bat      ← Run every time (Windows)
├── start-servers.sh       ← Run every time (macOS/Linux)
├── .env                   ← Created by setup script (don't commit)
├── .env.example           ← Template for .env
├── package.json           ← Workspace config
├── backend/               ← Node.js API
│   ├── src/
│   ├── package.json
│   └── node_modules/      ← Installed by setup script
├── frontend/              ← React Vite app
│   ├── src/
│   ├── package.json
│   └── node_modules/      ← Installed by setup script
└── database/
    └── schema.sql         ← PostgreSQL schema
```

---

## Environment Variables Reference

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | 5000 | No | Backend server port |
| `NODE_ENV` | development | No | Environment mode |
| `DATABASE_URL` | - | **Yes** | PostgreSQL connection string |
| `JWT_SECRET` | - | **Yes** | Secret key for JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | 7d | No | JWT token expiration time |
| `OLLAMA_BASE_URL` | http://localhost:11434 | No | Ollama server URL |
| `OLLAMA_HR_MODEL` | phi3:mini | No | Model for HR questions |
| `OLLAMA_TECH_MODEL` | deepseek-coder:1.3b | No | Model for technical questions |
| `OLLAMA_EVAL_MODEL` | deepseek-r1:1.5b | No | Model for answer evaluation |
| `OLLAMA_FEEDBACK_MODEL` | gemma2:2b | No | Model for feedback generation |
| `FRONTEND_URL` | http://localhost:5173 | No | Frontend URL for CORS |

---

## Quick Reference

| Task | Command |
|------|---------|
| First time setup | `setup.bat` (Windows) or `./setup.sh` (macOS/Linux) |
| Start servers | `start-servers.bat` (Windows) or `./start-servers.sh` (macOS/Linux) |
| Stop servers | Press `Ctrl+C` in terminal |
| Access frontend | http://localhost:5173 |
| Access backend | http://localhost:5000 |
| Check backend health | http://localhost:5000/api/health |
| Install backend deps | `npm install --prefix backend` |
| Install frontend deps | `npm install --prefix frontend` |
| Setup PostgreSQL DB | `psql -U postgres -d ai_interview_bot -f database/schema.sql` |

---

## Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review **QUICKSTART.md** for detailed setup
3. Check **README.md** for architecture overview
4. Look at **IMPLEMENTATION_CHECKLIST.md** for what's implemented

---

**You're all set!** 🎉

After running `setup.bat/sh` once, use `start-servers.bat/sh` every time you want to run the app.
