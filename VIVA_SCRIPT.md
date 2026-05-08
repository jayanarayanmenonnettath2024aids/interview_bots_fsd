# 🎤 Viva Explanation Script

## Project: AI Interview Bot
A full-stack mock interview preparation platform for semester evaluation.

---

## Opening Statement (30 seconds)

"AI Interview Bot is a modern web application that helps students practice technical and HR interviews using AI-powered question generation. The platform has three layers: a React dashboard for the frontend, a Node.js API for business logic, and PostgreSQL for persistent data storage. It integrates Ollama for local AI models, ensuring privacy and offline functionality."

---

## Architecture Overview (1 minute)

### Frontend (React + Vite)
- **Purpose:** User interface for interview practice
- **Technology:** React for components, Vite for fast builds, Tailwind CSS for styling
- **Key Pages:**
  - Dashboard: Shows analytics, trends, and performance cards
  - Interview Session: Live question/answer flow with timer
  - Performance Page: Charts showing interview trends
  - Feedback: AI-generated assessment summaries
  - Question Bank: Search and filter past questions
- **State Management:** React Context for authentication
- **API Communication:** Axios with JWT interceptor for secure requests

### Backend (Node.js + Express)
- **Purpose:** Business logic and database management
- **Architecture:** MVC pattern
  - **Controllers:** Handle HTTP requests, call services
  - **Services:** Core business logic, AI integration
  - **Middleware:** Authentication, validation, error handling
  - **Routes:** Express endpoints
- **Key Features:**
  - JWT authentication for secure access
  - Zod validation for request data
  - Async error handling
  - Ollama integration for AI

### Database (PostgreSQL)
- **Purpose:** Persistent storage of all app data
- **Schema:**
  - Users: Account credentials and profiles
  - Interviews: Session metadata and scores
  - Questions: AI-generated interview questions
  - Responses: Student answers and evaluation
  - Reports: Aggregated feedback and analytics
- **Relationships:** Foreign keys link users → interviews → questions → responses
- **Performance:** Indexes on frequently queried columns

---

## Feature Walkthrough (3 minutes)

### 1. Authentication

**Flow:**
```
User registers/logs in → Backend validates credentials → 
Password hashed with bcrypt → JWT token generated → 
Token stored in localStorage → Protected routes verify token
```

**Why it matters:** 
- Security: Passwords never stored in plaintext
- Privacy: Each user sees only their own data
- Simplicity: JWT doesn't require server sessions

---

### 2. Mock Interview Session

**Flow:**
```
User selects domain/difficulty/type → Backend creates interview record →
Ollama generates a question → User types answer → 
AI evaluates answer → Score calculated → 
Feedback summarized → Stored in database
```

**Key Points:**
- Questions generated dynamically (not hardcoded)
- Different Ollama models for different question types
- Timer adds realism to interview experience
- Score normalized between 0-10
- Fallback answers for offline testing

**Ollama Models Used:**
- `phi3:mini` → HR questions
- `deepseek-coder:1.3b` → Technical questions
- `deepseek-r1:1.5b` → Answer evaluation
- `gemma2:2b` → Feedback summarization

---

### 3. AI Integration

**Why Ollama?**
- Local models: No cloud API calls needed
- Privacy: Data stays on student's machine
- Offline: Works without internet
- Free: No API costs

**How it works:**
```javascript
// API call to local Ollama
POST http://localhost:11434/api/generate
{
  "model": "deepseek-coder:1.3b",
  "prompt": "Generate a technical question...",
  "stream": false
}
```

**Evaluation Process:**
1. User submits answer
2. Backend sends answer + question + context to Ollama
3. Ollama returns evaluation JSON
4. Backend normalizes score (0-10)
5. Score and feedback saved to database
6. Frontend displays results

---

### 4. Analytics Dashboard

**What's Displayed:**
- **Stats Cards:** 4 key metrics
  - Interviews Taken
  - Average Score
  - Highest Score
  - Skills Practiced
- **Performance Trend:** Line chart of recent scores
- **Domain Performance:** Pie chart showing domain distribution
- **Recent Interviews:** Table of last 4 sessions

**Why Charts?**
- Recharts library for efficient rendering
- Memoization prevents unnecessary re-renders
- Real data from database queries
- Fallback data for demo when database is empty

---

### 5. Data Flow Example

**Student takes an interview:**

```
1. Frontend: User starts interview
   POST /api/interview/start
   { domain: "Full Stack Development", difficulty: "Medium", interviewType: "Technical" }

2. Backend: Creates record in 'interviews' table
   INSERT INTO interviews (user_id, domain, difficulty, ...)
   Returns interview_id

3. Frontend: Requests question
   POST /api/interview/question
   { interviewId: "uuid-123" }

4. Backend: 
   - Checks existing questions to avoid repeats
   - Calls Ollama with prompt
   - Stores question in 'questions' table
   - Returns question to frontend

5. Frontend: Displays question with timer

6. User submits answer:
   POST /api/interview/answer
   { questionId, answerText, ... }

7. Backend:
   - Calls Ollama for evaluation
   - Parses AI response
   - Stores response in 'responses' table
   - Updates interview score
   - Updates user's report table
   - Returns evaluation to frontend

8. Frontend: Shows score, strengths, weaknesses, suggestions

9. Dashboard: Query updates automatically
   - Average score recalculated
   - Trend chart updated
   - Recent interviews table refreshed
```

---

## Technical Highlights (2 minutes)

### 1. Clean Code Structure
- **Separation of concerns:** Each file has one responsibility
- **Reusable components:** UI components used across pages
- **Service layer:** Business logic separate from routes
- **Easy to explain:** Quick to point out where each feature lives

### 2. Security
- JWT tokens prevent unauthorized access
- Password hashing with bcrypt
- Validation middleware checks input
- Error handling doesn't expose sensitive info

### 3. Database Design
- Normalized schema (no data duplication)
- Foreign keys maintain referential integrity
- Indexes on common filters
- Timestamps for tracking

### 4. Error Handling
- Try-catch in async handlers
- Custom ApiError class
- Meaningful error messages
- Fallback data for graceful degradation

### 5. Scalability
- Modular code easy to extend
- Service layer can add features without touching routes
- Database indexes support growth
- Monorepo structure for team development

---

## Demo Walkthrough (3-5 minutes)

### Show 1: Authentication
"Let me register a new account..."
- Show register form
- Submit
- Explain JWT token stored in localStorage
- Show login page
- Mention password hashing with bcrypt

### Show 2: Dashboard
"After login, here's the main analytics dashboard..."
- Point to stats cards
- Show the purple SaaS design (matches reference)
- Explain each chart
- Mention real data from database
- Show responsive design

### Show 3: Start Interview
"Let me start a mock interview..."
- Select domain, difficulty, type
- Explain these choices affect question generation
- Click "Launch Interview"

### Show 4: Interview Session
"Here's a live interview session..."
- Explain the flow: question → answer → evaluation
- Type an answer
- Submit
- Show score and feedback from AI
- Explain different Ollama models

### Show 5: Performance Page
"After several interviews, let's check performance..."
- Show trend line chart
- Explain the data comes from database
- Show domain performance pie chart
- Mention analytics help identify weak areas

### Show 6: Question Bank
"All generated questions are stored and searchable..."
- Search by keyword
- Filter by domain
- Filter by difficulty
- Explain questions avoid repeating

---

## Code Snippets to Reference

### Authentication Flow
```javascript
// Registration
POST /api/auth/register
{ name, email, password }

// Backend hashes and stores
const passwordHash = await bcrypt.hash(password, 10);
const user = await createUser({ name, email, passwordHash });

// Returns JWT token
const token = jwt.sign(
  { userId: user.user_id, email: user.email },
  process.env.JWT_SECRET
);
```

### Question Generation
```javascript
// Service method
async function generateInterviewQuestion({ domain, difficulty, interviewType }) {
  const model = interviewType === 'HR' ? 'phi3:mini' : 'deepseek-coder:1.3b';
  
  const response = await generateWithOllama({
    model,
    prompt: `Generate a ${difficulty} level ${interviewType} question for ${domain}`
  });
  
  return response.trim();
}
```

### Answer Evaluation
```javascript
// Service method
async function evaluateAnswer({ question, answer, domain, difficulty }) {
  const response = await generateWithOllama({
    model: 'deepseek-r1:1.5b',
    prompt: `Evaluate this answer: ${answer} to: ${question}`
  });
  
  // Parse JSON response with score, strengths, weaknesses
  return normalizeEvaluation(parsed);
}
```

### Database Query for Dashboard
```javascript
// Gets all analytics in one efficient query
const overview = await pool.query(`
  SELECT 
    COUNT(*)::int AS interviews_taken,
    ROUND(AVG(overall_score)::numeric, 2) AS average_score,
    MAX(overall_score) AS highest_score
  FROM interviews
  WHERE user_id = $1
`, [userId]);
```

---

## Expected Questions & Answers

### Q: Why use Ollama instead of OpenAI API?
**A:** 
- Privacy: Data stays on local machine
- Offline: Works without internet
- Free: No API costs
- Control: Can choose which models to use
- Realistic: Local models are faster than cloud API

### Q: How do you prevent students from cheating?
**A:**
- Timer adds pressure like real interviews
- Score tracking shows improvement over time
- Different question generation prevents memorization
- Timestamps track when interviews were taken
- Future enhancement: Browser locking during session

### Q: What if Ollama generates a bad question?
**A:**
- Fallback questions in database for demo
- Validation ensures question is minimum length
- Previous questions checked to avoid repeats
- In production: Manual review of question quality

### Q: How is student data protected?
**A:**
- Passwords hashed with bcrypt (never stored plain)
- JWT tokens expire after 7 days
- Each user can only access their own data
- Database has foreign key constraints
- Validation middleware prevents injection attacks

### Q: Why PostgreSQL over MongoDB?
**A:**
- Relational data: Students → Interviews → Questions → Responses
- ACID transactions: Data consistency
- Foreign keys: Referential integrity
- Efficient queries: Indexes support analytics
- Industry standard for production apps

### Q: Can this scale to 1000 users?
**A:**
- Database: Indexes support queries at scale
- Backend: Stateless design allows horizontal scaling
- Frontend: React handles users efficiently
- Bottleneck: Ollama response time (but caching possible)

### Q: How does the interview timer work?
**A:**
- Frontend uses `setInterval` to update UI every second
- Timer purely for UX pressure (not enforced on backend)
- Can submit answer after time expires (demo mode)
- Future: Backend could enforce strict timeout

### Q: What happens if database goes offline?
**A:**
- Frontend falls back to demo data
- Charts still render with sample data
- Error messages explain the problem
- Users see "demo mode" notification
- Real implementation: Show retry button

---

## Summary Statement (30 seconds)

"AI Interview Bot demonstrates full-stack development: a modern React frontend with real-time updates, a scalable Node.js API with clean separation of concerns, PostgreSQL for persistent storage, and Ollama for local AI integration. The project shows authentication, data relationships, analytics, and practical AI usage—all the concepts needed for production applications."

---

## Strong Points to Emphasize

1. **Complete:** All 9 modules fully implemented
2. **Modular:** Easy to explain each part independently
3. **Modern:** Uses current tech (React 18, Node 18+, PostgreSQL, Vite)
4. **Practical:** Solves a real problem (interview prep)
5. **Scalable:** Architecture supports growth
6. **Secure:** JWT, bcrypt, validation
7. **User-friendly:** Attractive UI following SaaS design
8. **Documented:** README, checklist, and this viva guide

---

**You're ready to present!** 🚀

Practice explaining each section in 2-3 minutes, then you can demo the full project in 5-10 minutes depending on time available.
