import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const fallback = [
  { question_text: 'Explain the difference between client-side rendering and server-side rendering.', domain: 'Frontend', difficulty: 'Medium', question_type: 'technical' },
  { question_text: 'How does indexing improve database query performance?', domain: 'DBMS', difficulty: 'Easy', question_type: 'technical' },
  { question_text: 'Tell me about a project challenge you solved with a team.', domain: 'HR', difficulty: 'Medium', question_type: 'hr' },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState(fallback);
  const [filters, setFilters] = useState({ search: '', domain: '', difficulty: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/questions/bank', { params: filters })
        .then((response) => setQuestions(response.data.questions.length ? response.data.questions : fallback))
        .catch(() => setQuestions(fallback));
    }, 250);

    return () => clearTimeout(timer);
  }, [filters]);

  // Reset to first page when filters change
  useEffect(() => setPage(1), [filters]);

  const filtered = useMemo(() => questions, [questions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  function toggleExpand(id) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="space-y-6 pb-10">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Question Bank</h1>
            <p className="mt-1 text-sm text-slate-500">Search and filter previously generated AI interview questions.</p>
          </div>
          <Badge tone="default">{questions.length} questions</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input placeholder="Search questions..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <Select value={filters.domain} onChange={(e) => setFilters({ ...filters, domain: e.target.value })}>
            <option value="">All Domains</option>
            <option>Full Stack Development</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>AI/ML</option>
            <option>DBMS</option>
            <option>HR</option>
            <option>System Design</option>
          </Select>
          <Select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
            <option value="">All Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-4">
        {paginated.map((item, idx) => {
          const id = item.question_id || `${item.question_text}-${(page - 1) * itemsPerPage + idx}`;
          const isExpanded = !!expanded[id];
          return (
            <Card key={id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="default">{item.domain || 'General'}</Badge>
                    <Badge tone={item.difficulty === 'Hard' ? 'danger' : item.difficulty === 'Medium' ? 'warning' : 'success'}>
                      {item.difficulty || 'Medium'}
                    </Badge>
                    <Badge tone="default">{item.question_type || 'technical'}</Badge>
                  </div>

                  <p className={`mt-4 text-base font-semibold leading-7 text-slate-800 ${isExpanded ? '' : 'line-clamp-4'}`}>
                    {item.question_text}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                    {item.created_at && <div>Created: {new Date(item.created_at).toLocaleString()}</div>}
                    {item.interview_id && <div>Source Interview: #{item.interview_id}</div>}
                  </div>

                  {item.question_text && item.question_text.length > 400 && (
                    <button className="mt-2 text-sm text-primary-600" onClick={() => toggleExpand(id)}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                <div className="flex-shrink-0 text-xs text-slate-400">#{(page - 1) * itemsPerPage + idx + 1}</div>
              </div>
            </Card>
          );
        })}

        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-slate-600">Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}</div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <div className="px-3">{page} / {totalPages}</div>
            <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
