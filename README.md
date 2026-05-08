# AI Interview Bot

AI Interview Bot is a semester project full-stack application that helps students practice technical and HR interviews using local Ollama models. It combines a modern React dashboard, a Node.js/Express API, and PostgreSQL persistence to simulate a realistic interview preparation platform.

## Features

- JWT registration and login
- Protected dashboard with analytics cards
- Mock interview setup by domain, difficulty, and interview type
- Ollama-powered question generation and answer evaluation
- Interview score tracking and feedback reports
- Question bank with search and filters
- Profile page with interview summary
- Modern purple SaaS-style UI inspired by the reference design

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Axios, React Router
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: PostgreSQL
- AI: Ollama local models
  - `phi3:mini` for HR questions
  - `deepseek-coder:1.3b` for technical questions
  - `deepseek-r1:1.5b` for answer evaluation
  - `gemma2:2b` for feedback summaries

## Folder Structure

- `frontend/` React dashboard and interview screens
- `backend/` Express API and PostgreSQL queries
- `database/` SQL schema
- `docs/` project notes and report material

## Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your database and JWT values.

### 3. Create the PostgreSQL schema

Run `database/schema.sql` in your PostgreSQL database.

### 4. Start Ollama

Make sure Ollama is running locally:

```bash
ollama serve
```

Verify the models are available:

```bash
ollama list
```

### 5. Run the app

```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Environment Variables

Backend:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_interview_bot
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TECH_MODEL=deepseek-coder:1.3b
OLLAMA_HR_MODEL=phi3:mini
OLLAMA_EVAL_MODEL=deepseek-r1:1.5b
OLLAMA_FEEDBACK_MODEL=gemma2:2b
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/interview/start`
- `POST /api/interview/question`
- `POST /api/interview/answer`
- `GET /api/interview/history`
- `GET /api/reports/:userId`
- `GET /api/profile`
- `PUT /api/profile/update`
- `GET /api/dashboard/overview`
- `GET /api/questions/bank`

## Viva Talking Points

- The system uses PostgreSQL for persistent storage of users, interviews, questions, answers, and reports.
- JWT protects all student routes after login.
- Ollama runs locally, so the project works without cloud AI dependencies.
- Technical and HR questions use different models for more realistic mock interviews.
- The dashboard uses Recharts to show trends, pie charts, and bar charts for easy analytics explanation.
- The code is intentionally modular so the controllers, services, and database access are easy to explain.

## Demo Flow

1. Register and log in.
2. Start a mock interview.
3. Generate questions and answer them.
4. Submit answers to receive scores and feedback.
5. Review dashboard analytics, performance charts, and the question bank.
6. Open the feedback and profile pages to show stored results.
