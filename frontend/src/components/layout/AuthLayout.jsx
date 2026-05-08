import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Brain, BarChart3 } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI question generation', text: 'Generate realistic technical and HR questions with Ollama.' },
  { icon: ShieldCheck, title: 'JWT authentication', text: 'Secure login, protected routes, and profile access.' },
  { icon: BarChart3, title: 'Performance analytics', text: 'Track scores, trends, and interview strengths over time.' },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] card-glass lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#6d28d9_0%,#8b5cf6_55%,#c4b5fd_100%)] p-8 text-white lg:p-12">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_0),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.2),transparent_0)]" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3 text-white no-underline">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-extrabold">AI Interview Bot</div>
                <div className="text-sm text-white/75">Full Stack Development Semester Project</div>
              </div>
            </Link>

            <div className="mt-12 max-w-xl">
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">Practice interviews like a modern product team would build them.</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/80">
                A visually polished AI mock interview platform with real authentication, PostgreSQL storage, analytics, and Ollama-powered feedback.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-white/15 p-3">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">{feature.title}</div>
                        <div className="mt-1 text-sm text-white/75">{feature.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative mt-8 text-sm text-white/75">Built for viva, demonstration, and semester review.</div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-lg">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
