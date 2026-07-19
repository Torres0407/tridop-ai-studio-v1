'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must agree to the Terms and Conditions.');
      return;
    }

    setLoading(true);
    try {
      await client.auth.signup({ name, email, password });
      router.push('/onboarding');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.message || 'Signup failed.';
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-md p-8 bg-[#09090b] border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div>
          <h4 className="text-xl font-display font-bold text-slate-100 tracking-tight">
            Sign Up Account
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Enter your personal data to create your account.
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="eg. John Francisco"
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            />
          </div>

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

          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 cursor-pointer">
              I agree to the <span className="text-slate-200 underline">Terms & Conditions</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-sans font-bold py-3 px-4 rounded-xl text-xs transition-all duration-300 hover:scale-[1.01] mt-2 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
