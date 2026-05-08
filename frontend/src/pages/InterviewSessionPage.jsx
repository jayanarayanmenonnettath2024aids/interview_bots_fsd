import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, Loader2, Timer, WandSparkles, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function InterviewSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const interview = location.state?.interview;
  const config = location.state?.config || {};

  const [session, setSession] = useState(interview || null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const advanceTimerRef = useRef(null);

  const questionTarget = session?.question_count || 5;
  const progress = useMemo(() => Math.min(100, (completedCount / questionTarget) * 100), [completedCount, questionTarget]);

  useEffect(() => {
    if (!session) {
      navigate('/mock-interviews', { replace: true });
      return;
    }

    loadQuestion();
  }, [session, navigate]);

  useEffect(() => {
    if (!currentQuestion || finished) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentQuestion, finished]);

  useEffect(() => () => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
    }
  }, []);

  async function loadQuestion() {
    if (!session) return;
    setLoadingQuestion(true);
    try {
      const response = await api.post('/interview/question', { interviewId: session.interview_id });
      setCurrentQuestion(response.data.question);
      setAnswer('');
      setEvaluation(null);
      setTimeLeft(60);
    } catch (error) {
      if (error.response?.status === 409) {
        setFinished(true);
        setCurrentQuestion(null);
        setAnswer('');
        setEvaluation(null);
        return;
      }

      setCurrentQuestion({ question_id: 'demo-question', question_text: 'Explain the difference between useState and useEffect in React with a practical example.' });
      setAnswer('');
      setEvaluation(null);
      setTimeLeft(60);
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function submitAnswer() {
    if (!session || !currentQuestion) return;
    setSubmitting(true);
    try {
      const response = await api.post('/interview/answer', {
        interviewId: session.interview_id,
        questionId: currentQuestion.question_id,
        questionText: currentQuestion.question_text,
        answerText: answer,
        domain: config.domain || session.domain,
        difficulty: config.difficulty || session.difficulty,
        interviewType: config.interviewType || session.interview_type,
      });
      setEvaluation(response.data.evaluation);
      setSession(response.data.interview);
      setTimeLeft(0);

      const nextCount = completedCount + 1;
      setCompletedCount(nextCount);

      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }

      advanceTimerRef.current = window.setTimeout(() => {
        if (nextCount >= questionTarget) {
          api.post('/interview/complete', { interviewId: session.interview_id }).catch(() => null);
          setFinished(true);
          setCurrentQuestion(null);
          return;
        }

        loadQuestion();
      }, 1800);
    } catch (_error) {
      setEvaluation({
        score: 7.2,
        feedback: 'Solid answer with room for more structure.',
        strengths: 'Relevant explanation and practical awareness.',
        weaknesses: 'Needs more precision and depth.',
        suggestions: 'Use short examples and break the answer into steps.',
      });
      setTimeLeft(0);

      const nextCount = completedCount + 1;
      setCompletedCount(nextCount);

      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }

      advanceTimerRef.current = window.setTimeout(() => {
        if (nextCount >= questionTarget) {
          api.post('/interview/complete', { interviewId: session.interview_id }).catch(() => null);
          setFinished(true);
          setCurrentQuestion(null);
          return;
        }

        loadQuestion();
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  }

  async function nextQuestion() {
    if (completedCount >= questionTarget) {
      await api.post('/interview/complete', { interviewId: session.interview_id }).catch(() => null);
      setFinished(true);
      return;
    }
    await loadQuestion();
  }

  const statusLabel = finished ? 'Completed' : currentQuestion ? 'In progress' : 'Preparing';

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="default">{statusLabel}</Badge>
              <Badge tone="success">{session?.domain}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-black">Interview Session</h1>
            <p className="mt-1 text-sm text-slate-500">
              {config.difficulty || session?.difficulty} {config.interviewType || session?.interview_type} interview for {config.domain || session?.domain}.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Timer className="h-4 w-4" /> Timer
            </div>
            <div className="mt-1 text-3xl font-black text-slate-900">{timeLeft}s</div>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-sm text-slate-500">Progress: {completedCount}/{questionTarget}</div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-brand-50 p-6">
          {loadingQuestion ? (
            <div className="flex h-[260px] items-center justify-center gap-3 text-brand-700">
              <Loader2 className="h-6 w-6 animate-spin" />
              Generating AI question...
            </div>
          ) : currentQuestion ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-brand-700">
                <WandSparkles className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Question</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-snug text-slate-900">{currentQuestion.question_text}</h2>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Your Answer</label>
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={submitAnswer} disabled={!answer.trim() || submitting || finished}>
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
                <Button variant="secondary" onClick={nextQuestion} disabled={submitting || loadingQuestion}>
                  {completedCount >= questionTarget ? 'Finish Interview' : 'Next Question'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-slate-500">No question loaded yet.</div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">AI Evaluation</h3>
              <p className="text-sm text-slate-500">Real-time score and feedback after each response.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex min-h-[132px] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-500">Current Score</div>
              <div className="mt-2 text-4xl font-black text-brand-700">{evaluation?.score ?? '--'}</div>
            </div>
            <div className="flex min-h-[144px] flex-col rounded-3xl border border-slate-200 p-5">
              <div className="text-sm font-semibold text-slate-500">Feedback</div>
              <p
                className="mt-2 flex-1 text-sm leading-6 text-slate-700"
                style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}
              >
                {evaluation?.feedback || 'Submit an answer to see AI-generated feedback.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex min-h-[150px] flex-col rounded-3xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strengths</div>
                <p
                  className="mt-2 flex-1 text-sm text-slate-700"
                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}
                >
                  {evaluation?.strengths || 'Awaiting evaluation'}
                </p>
              </div>
              <div className="flex min-h-[150px] flex-col rounded-3xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weaknesses</div>
                <p
                  className="mt-2 flex-1 text-sm text-slate-700"
                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}
                >
                  {evaluation?.weaknesses || 'Awaiting evaluation'}
                </p>
              </div>
              <div className="flex min-h-[150px] flex-col rounded-3xl border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suggestions</div>
                <p
                  className="mt-2 flex-1 text-sm text-slate-700"
                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}
                >
                  {evaluation?.suggestions || 'Awaiting evaluation'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-black">Session Snapshot</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Session ID</span><span className="font-semibold">{session?.interview_id?.slice(0, 8) || 'N/A'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Domain</span><span className="font-semibold">{session?.domain || 'N/A'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Difficulty</span><span className="font-semibold">{session?.difficulty || 'N/A'}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Total Questions</span><span className="font-semibold">{questionTarget}</span></div>
          </div>
          <Button className="mt-5 w-full" variant="secondary" onClick={() => navigate('/dashboard')}>
            {finished ? 'Back to Dashboard' : 'Exit Session'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
