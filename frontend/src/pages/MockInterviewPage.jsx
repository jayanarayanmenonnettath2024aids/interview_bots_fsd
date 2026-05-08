import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TimerReset } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const domains = ['Full Stack Development', 'Frontend', 'Backend', 'AI/ML', 'DBMS', 'HR', 'System Design'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const interviewTypes = ['Technical', 'HR', 'Mixed'];

export default function MockInterviewPage() {
  const [form, setForm] = useState({ domain: 'Full Stack Development', difficulty: 'Medium', interviewType: 'Technical' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleStart() {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/interview/start', form);
      navigate('/interview/session', { state: { interview: response.data.interview, config: form } });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start interview.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Start a Mock Interview</h1>
            <p className="text-sm text-slate-500">Choose the interview setup before the AI begins questioning.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Domain</label>
            <Select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}>
              {domains.map((domain) => (
                <option key={domain}>{domain}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</label>
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {difficulties.map((difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Interview Type</label>
            <Select value={form.interviewType} onChange={(e) => setForm({ ...form, interviewType: e.target.value })}>
              {interviewTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </div>
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <Button onClick={handleStart} disabled={loading} className="w-full">
            {loading ? 'Preparing interview...' : 'Launch Interview Session'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">What happens next?</h2>
              <p className="mt-1 text-sm text-slate-500">The session page handles question generation, answer capture, scoring, and feedback.</p>
            </div>
            <Badge tone="default">AI powered</Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-brand-700">
                <TimerReset className="h-4 w-4" />
                <span className="text-sm font-bold">Timer</span>
              </div>
              <p className="text-sm text-slate-600">Each question is timed so the student can practice under interview pressure.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-brand-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-bold">Adaptive flow</span>
              </div>
              <p className="text-sm text-slate-600">The flow alternates between question generation and AI feedback after every answer.</p>
            </div>
          </div>
        </Card>

        <Card className="p-7">
          <h3 className="text-lg font-black">Interview Types</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {interviewTypes.map((type) => (
              <span key={type} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {type}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
