'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-surface-tertiary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Image src="/logo-blue.svg" alt="DreamsBranch" width={180} height={48} priority />
          <p className="text-body-sm text-text-secondary">Set a new password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-body-sm font-medium mb-1">New password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-body-sm" required />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-body-sm text-text-secondary hover:text-secondary">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-body-sm font-medium mb-1">Confirm password</label>
            <input id="confirm" type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-body-sm" required />
          </div>
          {error && <p className="text-body-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-secondary text-white text-body font-medium hover:bg-secondary-120 transition-colors disabled:opacity-50">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
