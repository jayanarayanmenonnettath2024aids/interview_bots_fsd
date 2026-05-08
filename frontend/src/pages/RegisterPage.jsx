import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Register and start practicing full stack and HR interviews.">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] bg-white p-6 shadow-soft sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Johnson" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@example.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Create password" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
            <Input value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} type="password" placeholder="Repeat password" />
          </div>
        </div>
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register Now'}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/auth/login">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
