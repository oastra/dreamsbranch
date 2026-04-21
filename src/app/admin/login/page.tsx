'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError('Invalid email or password');
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  async function handleForgotPassword() {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email above first');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo('Password reset email sent. Check your inbox.');
    }
  }

  return (
    <div className="min-h-screen bg-surface-tertiary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Image src="/logo-blue.svg" alt="DreamsBranch" width={180} height={48} priority />
          <p className="text-body-sm text-text-secondary">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-body-sm font-medium mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-body-sm" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-body-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-small" required />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-small text-text-secondary hover:text-secondary">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <p className="text-body-sm text-red-600">{error}</p>}
          {info && <p className="text-body-sm text-green-700">{info}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-secondary text-white text-body font-medium hover:bg-secondary-120 transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button type="button" onClick={handleForgotPassword} disabled={loading}
            className="w-full text-small text-secondary hover:underline disabled:opacity-50">
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
