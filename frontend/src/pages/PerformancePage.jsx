import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fallback = {
  summary: { interviewsTaken: 12, averageScore: 76, highestScore: 92, skillsPracticed: 18 },
  trend: [
    { label: 'Week 1', score: 60 },
    { label: 'Week 2', score: 68 },
    { label: 'Week 3', score: 72 },
    { label: 'Week 4', score: 85 },
    { label: 'Week 5', score: 78 },
    { label: 'Week 6', score: 90 },
  ],
  domainPerformance: [
    { name: 'Technical', score: 84 },
    { name: 'System Design', score: 92 },
    { name: 'HR', score: 75 },
    { name: 'Aptitude', score: 68 },
  ],
};

export default function PerformancePage() {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    api.get('/dashboard/overview').then((response) => setData(response.data)).catch(() => setData(fallback));
  }, []);

  const bestDomain = useMemo(() => {
    return data.domainPerformance.reduce((best, current) => (current.score > best.score ? current : best), data.domainPerformance[0]);
  }, [data.domainPerformance]);

  return (
    <div className="space-y-6 pb-10">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">My Performance</h1>
            <p className="mt-1 text-sm text-slate-500">A quick overview of interview consistency and domain strengths.</p>
          </div>
          <Badge tone="success">Best domain: {bestDomain?.name}</Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Interviews', data.summary.interviewsTaken],
            ['Average Score', `${data.summary.averageScore}%`],
            ['Highest Score', `${data.summary.highestScore}%`],
            ['Best Domain', bestDomain?.name || 'N/A'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <h3 className="text-lg font-black">Performance Trend</h3>
          <p className="mt-1 text-sm text-slate-500">Line chart for score progression across sessions.</p>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={4} dot={{ r: 5, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-black">Domain Performance</h3>
          <p className="mt-1 text-sm text-slate-500">Bar chart for score comparison by domain.</p>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.domainPerformance}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" radius={[12, 12, 0, 0]} fill="#7c3aed">
                  {data.domainPerformance.map((entry) => (
                    <Cell key={entry.name} fill={entry.name === bestDomain?.name ? '#5b21b6' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
