import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BriefcaseBusiness, Trophy, Users, ArrowUpRight, CalendarDays, Play } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fallback = {
  summary: { interviewsTaken: 12, averageScore: 76, highestScore: 92, skillsPracticed: 18 },
  recentInterviews: [
    { interviewId: '1', title: 'Java Developer Interview', domain: 'Technical', date: '2025-05-18T00:00:00Z', score: 85, feedback: 'Good' },
    { interviewId: '2', title: 'System Design Round', domain: 'System Design', date: '2025-05-17T00:00:00Z', score: 92, feedback: 'Excellent' },
    { interviewId: '3', title: 'HR Interview', domain: 'HR', date: '2025-05-16T00:00:00Z', score: 75, feedback: 'Average' },
    { interviewId: '4', title: 'Aptitude Test', domain: 'Aptitude', date: '2025-05-15T00:00:00Z', score: 68, feedback: 'Average' },
  ],
  trend: [
    { label: 'Interview 1', score: 60 },
    { label: 'Interview 2', score: 72 },
    { label: 'Interview 3', score: 68 },
    { label: 'Interview 4', score: 85 },
    { label: 'Interview 5', score: 78 },
    { label: 'Interview 6', score: 90 },
  ],
  domainPerformance: [
    { name: 'Technical (DSA)', score: 35 },
    { name: 'System Design', score: 25 },
    { name: 'HR Interview', score: 20 },
    { name: 'Aptitude', score: 20 },
  ],
};

const donutColors = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b'];
const metrics = [
  { label: 'Interviews Taken', icon: BriefcaseBusiness, tone: 'text-brand-700 bg-brand-50', key: 'interviewsTaken' },
  { label: 'Average Score', icon: BarChart3, tone: 'text-blue-600 bg-blue-50', key: 'averageScore', suffix: '%' },
  { label: 'Highest Score', icon: Trophy, tone: 'text-emerald-700 bg-emerald-50', key: 'highestScore', suffix: '%' },
  { label: 'Skills Practiced', icon: Users, tone: 'text-orange-600 bg-orange-50', key: 'skillsPracticed' },
];

export default function DashboardPage() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get('/dashboard/overview');
        setData(response.data);
      } catch (_error) {
        setData(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const pieData = useMemo(
    () =>
      data.domainPerformance.map((item, index) => ({
        ...item,
        value: item.score,
        fill: donutColors[index % donutColors.length],
      })),
    [data.domainPerformance],
  );

  return (
    <div className="space-y-6 pb-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                  {loading ? '...' : `${data.summary[metric.key]}${metric.suffix || ''}`}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {metric.label === 'Average Score' ? 'Across all interviews' : metric.label === 'Highest Score' ? 'In system design' : metric.label === 'Skills Practiced' ? 'Total skills' : 'Total interviews'}
                </p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${metric.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Start a New Mock Interview</h2>
            <p className="mt-1 text-sm text-slate-500">Select a domain and start practicing with AI.</p>
          </div>
          <Button asChild>
            <Link to="/mock-interviews" className="inline-flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Interview
            </Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black">Interview Performance Trend</h3>
              <p className="text-sm text-slate-500">Last 6 interviews</p>
            </div>
            <Badge tone="default">Latest 6 interviews</Badge>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e9e7f6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={4} dot={{ r: 5, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-black">Domain Wise Performance</h3>
            <p className="text-sm text-slate-500">Score distribution by domain</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }} />
                    <span className="text-sm font-semibold text-slate-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{entry.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black">Recent Interviews</h3>
            <p className="text-sm text-slate-500">Review past performance and feedback</p>
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline" to="/performance">
            View analytics <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Interview Title</th>
                <th className="px-5 py-3 font-semibold">Domain</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.recentInterviews.map((row) => (
                <tr key={row.interviewId} className="transition hover:bg-brand-50/40">
                  <td className="px-5 py-4 font-semibold text-slate-800">{row.title}</td>
                  <td className="px-5 py-4 text-slate-600">{row.domain}</td>
                  <td className="px-5 py-4 text-slate-600">{new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-4 font-bold text-emerald-700">{row.score}%</td>
                  <td className="px-5 py-4 text-slate-600">{row.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
