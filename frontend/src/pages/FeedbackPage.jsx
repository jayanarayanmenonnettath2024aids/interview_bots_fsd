import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fallback = {
  report: {
    strengths: 'You demonstrate good awareness of core concepts and show willingness to explain ideas clearly.',
    weaknesses: 'A few answers need more structure, technical depth, and examples.',
    suggestions: 'Practice the STAR method, mention tradeoffs, and refine your technical storytelling.',
  },
};

export default function FeedbackPage() {
  const [report, setReport] = useState(fallback.report);

  useEffect(() => {
    api.get('/reports').then((response) => setReport(response.data.report || fallback.report)).catch(() => setReport(fallback.report));
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Feedback Report</h1>
            <p className="mt-1 text-sm text-slate-500">A concise summary of your latest AI-generated interview review.</p>
          </div>
          <Badge tone="default">Ollama powered</Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ['Strengths', report.strengths, 'success'],
          ['Weaknesses', report.weaknesses, 'warning'],
          ['Suggestions', report.suggestions, 'default'],
        ].map(([title, value, tone]) => (
          <Card key={title} className="p-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-lg font-black">{title}</h3>
              <Badge tone={tone}>{title}</Badge>
            </div>
            <p className="text-sm leading-7 text-slate-600">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
