# ⚡ Quick Start Guide

## Overview
Your **AI Interview Bot** project is **100% complete** and ready to run. This guide covers startup, validation, and troubleshooting.

---

## Prerequisites

### Required Software
1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/)
3. **Ollama** - [Download](https://ollama.ai)

### Optional
- Visual Studio Code with JavaScript extensions
- Git (for version control)

---

## Setup Instructions

### Step 1: Create Database

Open **PostgreSQL** and run:

```sql
CREATE DATABASE ai_interview_bot;
\c ai_interview_bot
\i 'path/to/database/schema.sql'
```

Or use pgAdmin to create the database and run the schema.

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Update `.env` with your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ai_interview_bot
   JWT_SECRET=your_super_secret_key_here
   ```

### Step 3: Install Ollama Models

Open terminal and run:
```bash
ollama serve
```

In another terminal, pull the required models:
```bash
ollama pull phi3:mini
ollama pull deepseek-coder:1.3b
ollama pull deepseek-r1:1.5b
ollama pull gemma2:2b
```

---

## Starting the Project

### Option A: Using Startup Script (Recommended)

**Windows:**
```bash
start-servers.bat
```

**macOS/Linux:**
```bash
chmod +x start-servers.sh
./start-servers.sh
```

The script will:
- ✅ Check Node.js installation
- ✅ Install dependencies
- ✅ Verify external services
- ✅ Create .env file if missing
- ✅ Start backend and frontend servers

### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option C: Both Together
```bash
npm run dev
```

---

## Verify Everything is Working

### ✅ Check Backend

Open `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "ok",
  "service": "ai-interview-bot-api"
}
```

### ✅ Check Frontend

Open `http://localhost:5173`

You should see the login page with purple branding.

### ✅ Check Database Connection

Backend will print:
```
AI Interview Bot backend running on port 5000
```

### ✅ Check Ollama Connection

Try starting an interview and generating a question. Backend console should show Ollama requests.

---

## Demo Flow

1. **Register/Login**
   - Go to http://localhost:5173
   - Create account or login
   - JWT token saved automatically

2. **View Dashboard**
   - See analytics cards
   - Charts and recent interviews
   - All data from fallback (demo mode)

3. **Start Mock Interview**
   - Click "Start Interview"
   - Select domain, difficulty, type
   - Backend creates interview session

4. **Answer Questions**
   - Question displayed from Ollama
   - Type your answer
   - Submit for evaluation
   - Get score and feedback

5. **Review Analytics**
   - Dashboard shows performance trends
   - Performance page shows charts
   - Feedback page shows summary

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install --prefix backend
npm install --prefix frontend
```

### Issue: "PostgreSQL connection refused"
**Solution:**
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database exists: `psql -l`

### Issue: "Ollama not responding"
**Solution:**
1. Start Ollama: `ollama serve`
2. Verify models: `ollama list`
3. Check port 11434 is open

### Issue: Frontend shows "Cannot GET"
**Solution:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Try incognito window
3. Check browser console for errors

### Issue: "JWT token is invalid"
**Solution:**
1. Clear localStorage in browser dev tools
2. Log out and back in
3. Check JWT_SECRET in .env

### Issue: Port already in use
**Solution:**
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

---

## File Structure

```
interview bot/
├── start-servers.bat          ← Run this (Windows)
├── start-servers.sh           ← Run this (macOS/Linux)
├── .env.example               ← Copy to .env
├── README.md                  ← Full documentation
├── IMPLEMENTATION_CHECKLIST.md ← What's implemented
├── QUICKSTART.md              ← This file
│
├── backend/
│   ├── src/
│   │   ├── server.js          ← Entry point
│   │   ├── app.js             ← Express setup
│   │   ├── controllers/       ← Route handlers
│   │   ├── routes/            ← Route definitions
│   │   ├── services/          ← Business logic
│   │   ├── middleware/        ← Auth, validation
│   │   ├── config/            ← DB, Ollama
│   │   └── utils/             ← Helpers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           ← Entry point
│   │   ├── App.jsx            ← Routes
│   │   ├── pages/             ← All 10 pages
│   │   ├── components/        ← Reusable UI
│   │   ├── context/           ← Auth state
│   │   ├── lib/               ← Axios, utils
│   │   └── index.css          ← Styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   └── schema.sql             ← PostgreSQL schema
│
└── docs/
    └── PROJECT_REPORT.md      ← Viva guide
```

---

## Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | User login |
| POST | `/api/interview/start` | Start mock interview |
| POST | `/api/interview/question` | Generate AI question |
| POST | `/api/interview/answer` | Submit answer & get evaluation |
| GET | `/api/dashboard/overview` | Get analytics |
| GET | `/api/reports` | Get feedback report |
| GET | `/api/profile` | User profile |
| GET | `/api/questions/bank` | Search questions |

---

## Environment Variables

```env
# Backend (required)
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ai_interview_bot
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TECH_MODEL=deepseek-coder:1.3b
OLLAMA_HR_MODEL=phi3:mini
OLLAMA_EVAL_MODEL=deepseek-r1:1.5b
OLLAMA_FEEDBACK_MODEL=gemma2:2b

# Frontend (optional)
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Testing Credentials

After registering, use any email/password to test:

```
Email: student@example.com
Password: password123
```

---

## Performance Tips

1. **Faster builds:** `npm run build --prefix frontend` generates optimized JS
2. **Development:** `npm run dev` uses hot reload
3. **Database queries:** Schema has indexes for common filters
4. **Caching:** Recharts memoizes chart data automatically

---

## Viva Talking Points

1. **Architecture:** React frontend → Express API → PostgreSQL database
2. **Authentication:** JWT tokens with bcrypt hashing
3. **AI Integration:** Ollama local models for privacy-first operation
4. **Modularity:** Controllers → Services → Database (clean separation)
5. **Real-time:** Interview session with timer and live feedback
6. **Analytics:** Trend charts, domain performance, and score tracking

---

## Support

If you encounter issues:

1. Check `IMPLEMENTATION_CHECKLIST.md` to verify everything is in place
2. Look at terminal output for error messages
3. Check browser DevTools console (F12)
4. Verify .env file has correct values
5. Ensure all prerequisites are installed

---

**You're ready to go! Run `start-servers.bat` or `npm run dev` and enjoy your demo.** 🚀
