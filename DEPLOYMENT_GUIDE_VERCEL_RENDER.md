# Deployment Guide: Frontend on Vercel + Backend on Render

This guide deploys:
- Frontend (`frontend/`) to Vercel
- Backend (`backend/`) to Render Web Service
- PostgreSQL on Render

## 1) Prerequisites

- GitHub repo connected to both Vercel and Render
- Render account
- Vercel account
- Production-safe secrets ready (`JWT_SECRET`, `ADMIN_API_KEY`, SMTP credentials)

## 2) Database on Render

1. In Render dashboard: **New +** -> **PostgreSQL**.
2. Create DB (Free/Starter as needed).
3. After creation, copy the **External Database URL**.
4. Run schema SQL from `database/schema.sql`.

Use Render PostgreSQL query runner or any SQL client to execute:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interviews (
  interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  interview_type VARCHAR(20) NOT NULL,
  overall_score NUMERIC(4,2) NOT NULL DEFAULT 0,
  question_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  report_email_sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(interview_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL DEFAULT 'technical',
  domain VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  score NUMERIC(4,2) NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL,
  strengths TEXT NOT NULL DEFAULT '',
  weaknesses TEXT NOT NULL DEFAULT '',
  suggestions TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  strengths TEXT NOT NULL DEFAULT '',
  weaknesses TEXT NOT NULL DEFAULT '',
  suggestions TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_interviews_domain ON interviews(domain);
```

## 3) Backend Deployment on Render

1. Render: **New +** -> **Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<Render Postgres External Database URL>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d

# AI provider (IMPORTANT)
# If using hosted Ollama endpoint:
OLLAMA_BASE_URL=<public-ollama-url>
OLLAMA_TECH_MODEL=deepseek-coder:1.3b
OLLAMA_HR_MODEL=phi3:mini
OLLAMA_EVAL_MODEL=deepseek-r1:1.5b
OLLAMA_FEEDBACK_MODEL=gemma2:2b

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail-address>
SMTP_PASSWORD=<gmail-app-password>
EMAIL_FROM="AI Interview Bot <your-email@gmail.com>"

# Admin API key
ADMIN_API_KEY=<random-admin-key>
```

5. Deploy and note backend URL, for example:
   - `https://ai-interview-bot-api.onrender.com`

### AI Hosting Note (Important)

Current backend is configured for Ollama HTTP API. `http://localhost:11434` will NOT work on Render.

Choose one of these:
- Host Ollama on a VM/GPU service and set `OLLAMA_BASE_URL` to that public URL.
- Replace Ollama integration with a cloud LLM provider (OpenAI/Groq/etc.).

If no reachable AI URL is set, app still runs but AI responses may fall back and quality will be limited.

## 4) Frontend Deployment on Vercel

1. Vercel: **Add New Project** and import same repo.
2. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add env var in Vercel:

```env
VITE_API_BASE_URL=https://<your-render-backend-domain>/api
```

Example:

```env
VITE_API_BASE_URL=https://ai-interview-bot-api.onrender.com/api
```

4. Deploy frontend.

## 5) CORS and API Checks

Backend currently uses permissive CORS (`origin: true`), so Vercel frontend should connect without extra changes.

Post-deploy check:

```bash
curl https://<your-render-backend-domain>/api/health
```

Expected:

```json
{"status":"ok","service":"ai-interview-bot-api"}
```

## 6) Production Smoke Test Checklist

1. Open Vercel URL.
2. Register new user.
3. Login and start interview.
4. Submit answers and complete interview.
5. Verify:
   - Dashboard updates
   - Feedback/report appears
   - Auto report email received
6. Check logs:
   - Render logs for API errors
   - Vercel logs for frontend runtime/build errors

## 7) Common Issues and Fixes

### 1. Frontend cannot reach backend
- Ensure `VITE_API_BASE_URL` points to Render URL + `/api`.
- Redeploy frontend after env changes.

### 2. 500 errors on interview endpoints
- Verify `DATABASE_URL` and DB schema exist.
- Ensure AI endpoint (`OLLAMA_BASE_URL`) is reachable from Render.

### 3. Emails not sending
- Confirm Gmail App Password is used (not account password).
- Check `SMTP_*` env vars.
- Verify sender in `EMAIL_FROM`.

### 4. Duplicate report emails
- `report_email_sent_at` prevents duplicate sends for same interview.

## 8) Recommended Hardening

- Rotate all secrets after first production deploy.
- Set Render health checks (path: `/api/health`).
- Restrict `ADMIN_API_KEY` usage to internal/admin operations only.
- Add rate limiting and stricter CORS for production domains.

---

If you want, next step can be a production-ready `render.yaml` + `vercel.json` so deployment is fully one-click from repo config.
