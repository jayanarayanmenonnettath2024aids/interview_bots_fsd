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
