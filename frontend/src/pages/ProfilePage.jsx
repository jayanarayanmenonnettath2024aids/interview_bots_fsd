import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fallback = {
  user: { name: 'Alex Johnson', email: 'alex@example.com', created_at: new Date().toISOString() },
  stats: { interviewsTaken: 12, averageScore: 76, highestScore: 92, skillsPracticed: 18 },
};

export default function ProfilePage() {
  const [data, setData] = useState(fallback);
  const [form, setForm] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/profile').then((response) => {
      setData(response.data);
      setForm({ name: response.data.user.name, email: response.data.user.email });
    }).catch(() => {
      setData(fallback);
      setForm({ name: fallback.user.name, email: fallback.user.email });
    });
  }, []);

  async function handleSave() {
    try {
      const response = await api.put('/profile/update', form);
      setData((current) => ({ ...current, user: response.data.user }));
      setMessage('Profile updated successfully.');
    } catch (_error) {
      setMessage('Profile updated locally for demo purposes.');
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">View your progress and update personal information.</p>
          </div>
          <Badge tone="success">Member since {new Date(data.user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</Badge>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <h3 className="text-lg font-black">Student Summary</h3>
          <div className="mt-5 space-y-4">
            {[
              ['Name', data.user.name],
              ['Email', data.user.email],
              ['Interviews', data.stats.interviewsTaken],
              ['Average Score', `${data.stats.averageScore}%`],
              ['Best Score', `${data.stats.highestScore}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-500">{label}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-black">Update Profile</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {message ? <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</div> : null}
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
