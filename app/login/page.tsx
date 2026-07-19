'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await client.auth.login({ email, password });
      router.push('/');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage === 'Account is suspended') {
        setErrorMessage('Your account has been suspended. Contact support.');
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-md p-8 bg-[#09090b] border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div>
          <h4 className="text-xl font-display font-bold text-slate-100 tracking-tight">
            Welcome Back
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Please input your credentials to log into your account.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs">
            <div className="text-rose-400 font-medium leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eg. johnfrans@gmail.com"
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-sans font-bold py-3 px-4 rounded-xl text-xs transition-all duration-300 hover:scale-[1.01] mt-2 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
