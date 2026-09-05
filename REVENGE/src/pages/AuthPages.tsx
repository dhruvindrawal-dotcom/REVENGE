import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { DEMO_ACCOUNTS } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Role } from '../types';

export function LoginPage() {
  const { signIn } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      show('Welcome back!', 'success');
      navigate(location.state?.from?.pathname ?? '/');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not sign in.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Log in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" loading={loading}>Log in</Button>
      </form>
      <p className="mt-4 text-sm text-[--color-ink-soft]">No account? <Link to="/signup" className="font-medium text-[--color-indigo]">Sign up</Link></p>

      {!isSupabaseConfigured && (
        <div className="mt-8 rounded-[--radius-md] border border-[--color-marigold]/30 bg-[--color-marigold]/8 p-4">
          <p className="mb-2 text-sm font-medium text-[--color-ink]">Demo mode — no Supabase project connected</p>
          <div className="space-y-1.5 text-xs text-[--color-ink-soft]">
            {Object.values(DEMO_ACCOUNTS).map((a) => (
              <button key={a.role} onClick={() => { setEmail(a.email); setPassword(a.password); }} className="block w-full rounded-[--radius-sm] px-2 py-1.5 text-left hover:bg-white">
                <span className="font-medium capitalize text-[--color-ink]">{a.role}:</span> {a.email} / {a.password}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SignupPage() {
  const { signUp } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      show('Account created!', 'success');
      navigate(role === 'provider' ? '/providers/register' : '/');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not sign up.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Sign up</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Select label="I am a…" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
        </Select>
        <Button type="submit" className="w-full" loading={loading}>Create account</Button>
      </form>
      <p className="mt-4 text-sm text-[--color-ink-soft]">Already have an account? <Link to="/login" className="font-medium text-[--color-indigo]">Log in</Link></p>
    </div>
  );
}
