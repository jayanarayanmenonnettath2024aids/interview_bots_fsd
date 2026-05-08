import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your interview practice journey.">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] bg-white p-6 shadow-soft sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
          <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="••••••••" />
        </div>
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login to Dashboard'}
        </Button>
        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/auth/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
