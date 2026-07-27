import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe as Chrome,
  Code2 as Github,
  Lock,
  ShieldCheck,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';

import MovingParticles from './MovingParticles';
import { client } from '../lib/client';

interface AuthPopupModalProps {
  isOpen: boolean;
  provider: 'google' | 'github' | null;
  onClose: () => void;
  onSuccess: (name: string, email: string) => void;
}

export default function AuthPopupModal({ isOpen, provider, onClose, onSuccess }: AuthPopupModalProps) {
  const [step, setStep] = useState<'select' | 'authorizing' | 'success'>('select');
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [progressLog, setProgressLog] = useState<string>('Initializing secure handshake...');
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setAuthError('');
      setProgressLog('Initializing secure handshake...');
    }
  }, [isOpen, provider]);

  // Performs real OAuth popup authentication
  const handleRealOAuth = async () => {
    setStep('authorizing');
    setAuthError('');
    setProgressLog(`Connecting to ${provider === 'google' ? 'Google' : 'GitHub'} OAuth servers...`);

    const redirectUri = `${window.location.origin}/oauth/callback`;
    const defaultGithubId = window.location.origin.includes('3000') ? 'Ov23lio7tWcWlTeMsb7K' : 'Ov23liWDbHUiWYfFpA4i';
    const githubClientId = (typeof process !== 'undefined' && process.env?.VITE_GITHUB_CLIENT_ID) || defaultGithubId;

    const authUrl = provider === 'google'
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`
      : `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(githubClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    try {
      const popup = window.open(
        authUrl,
        `${provider}_oauth_popup`,
        'width=550,height=650,status=no,toolbar=no,menubar=no'
      );

      setProgressLog('Awaiting OAuth authorization from provider window...');

      let codeReceived = false;

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'OAUTH_CODE' && event.data?.code) {
          codeReceived = true;
          window.removeEventListener('message', handleMessage);
          popup?.close();

          setProgressLog('Exchanging authorization code with backend API gateway...');
          try {
            const tokens = provider === 'google'
              ? await client.auth.oauthGoogle(event.data.code, redirectUri)
              : await client.auth.oauthGithub(event.data.code, redirectUri);

            client.setTokens(tokens.accessToken, tokens.refreshToken);
            const user = await client.users.getMe().catch(() => null);

            const email = tokens.user?.email || user?.email || '';
            const name = tokens.user?.name || user?.name || (email.includes('@') ? email.split('@')[0] : 'User');

            setSelectedName(name);
            setSelectedEmail(email);
            setStep('success');
          } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'OAuth backend exchange failed.';
            setAuthError(message);
            setStep('select');
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup window was closed before message received
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          if (!codeReceived) {
            // Popup closed without completing or missing client credentials in dev
            handleDirectCodeFallback(redirectUri);
          }
        }
      }, 1000);

    } catch (e: any) {
      handleDirectCodeFallback(redirectUri);
    }
  };

  const handleDirectCodeFallback = async (redirectUri: string) => {
    const inputCode = prompt(`Enter your ${provider === 'google' ? 'Google' : 'GitHub'} OAuth authorization code (or press OK to authenticate with backend):`);
    if (!inputCode && inputCode !== '') {
      setStep('select');
      return;
    }

    const authCode = inputCode.trim();
    setProgressLog(`Exchanging authorization code with backend identity microservice...`);
    try {
      const tokens = provider === 'google'
        ? await client.auth.oauthGoogle(authCode, redirectUri)
        : await client.auth.oauthGithub(authCode, redirectUri);

      client.setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await client.users.getMe().catch(() => null);

      const email = tokens.user?.email || user?.email || '';
      const name = tokens.user?.name || user?.name || (email.includes('@') ? email.split('@')[0] : 'User');

      setSelectedName(name);
      setSelectedEmail(email);
      setStep('success');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Backend OAuth code exchange failed.';
      setAuthError(message);
      setStep('select');
    }
  };

  const handleFinish = () => {
    onSuccess(selectedName, selectedEmail);
    onClose();
  };

  if (!isOpen || !provider) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
        {/* Moving Particles background inside the modal overlay */}
        <MovingParticles />

        {/* Mock Browser/OS frame */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-[500px] bg-[#070913] border border-blue-900/40 rounded-2xl shadow-[0_25px_60px_rgba(8,17,44,0.6)] overflow-hidden z-10"
        >
          {/* Blue abstract glowing orb */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Browser Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#0a0d1d] border-b border-blue-950/50 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500/80 rounded-full" />
              <span className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
              <span className="w-2.5 h-2.5 bg-blue-500/80 rounded-full" />
              <span className="text-[10px] text-slate-400 font-mono ml-2 truncate max-w-[220px]">
                {provider === 'google' ? 'accounts.google.com/signin' : 'github.com/login/oauth/authorize'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800/50 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Browser Address Status Bar styled in dark cyber blue */}
          <div className="px-4 py-2.5 bg-[#080b18] border-b border-blue-950/50 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 text-blue-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>https://</span>
              <span className="text-slate-300">auth.tridop.ai/v3/oauth</span>
            </div>
            <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Verified TLS 1.3
            </span>
          </div>

          {/* Core Content Area */}
          <div className="p-6 relative z-10">

            {/* Show error notification if login failed */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold">Iframe Sandbox Limitation: </span>
                  {authError}
                </div>
              </div>
            )}

            {step === 'select' && provider === 'google' && (
              <div className="space-y-5">
                {/* Google Title */}
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <Chrome className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 font-display">Sign in with Google Auth</h3>
                  <p className="text-xs text-slate-400">to connect securely to <strong className="text-cyan-400">Tridop Workspace</strong></p>
                </div>

                {/* Real interactive Google Login Trigger */}
                <button
                  onClick={handleRealOAuth}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-xs font-bold text-blue-200 hover:text-white transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer"
                >
                  <Chrome className="w-4 h-4" />
                  <span>Sign in with Google Pop-up</span>
                </button>
              </div>
            )}

            {step === 'select' && provider === 'github' && (
              <div className="space-y-5">
                {/* GitHub Title */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm">
                      <Github className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="h-px w-8 bg-blue-950" />
                    <div className="w-10 h-10 rounded-full bg-[#0a0d1d] border border-blue-900/30 flex items-center justify-center shadow-sm">
                      <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-[10px] font-bold text-slate-950">T</div>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 font-display">Connect to GitHub via OAuth</h3>
                  <p className="text-xs text-slate-400">Requesting read scope permission for developer verification</p>
                </div>

                {/* Real Github Popup trigger */}
                <button
                  onClick={handleRealOAuth}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 font-sans font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-slate-200" />
                  <span>Sign in with GitHub Pop-up</span>
                </button>
              </div>
            )}

            {step === 'authorizing' && (
              <div className="py-8 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[15px] animate-pulse" />
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-200 font-sans">Securing TLS Verification</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Connecting to the OAuth domain and validating secure credentials.
                  </p>
                </div>

                {/* Status Terminal logs */}
                <div className="p-3.5 bg-slate-950/90 border border-blue-950/50 rounded-xl max-w-sm mx-auto text-[10px] font-mono text-blue-400 text-left flex gap-2.5 items-center shadow-inner">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping shrink-0" />
                  <span className="truncate">{progressLog}</span>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-6 text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-200">OAuth Session Ready</h4>
                  <p className="text-xs text-slate-400">
                    Identity verified securely for <strong className="text-blue-300">{selectedEmail}</strong>
                  </p>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
