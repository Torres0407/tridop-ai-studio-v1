'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import { 
  Briefcase, 
  Layers, 
  Sparkles, 
  Palette, 
  Share2, 
  Users, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Lock,
  Upload,
  Globe
} from 'lucide-react';

export interface WizardData {
  businessName: string;
  tagline: string;
  logoUrl: string;
  category: string;
  vibe: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  audienceAge: string;
  audienceRegion: string;
  primaryColor: string;
  secondaryColor: string;
  buildMode: 'ai' | 'blocks';
}

const DEFAULT_CATEGORIES = [
  { id: 'restaurant', name: 'Restaurant & Dining', icon: '🍔' },
  { id: 'salon', name: 'Beauty & Salon', icon: '💇‍♀️' },
  { id: 'agency', name: 'Digital Agency', icon: '🚀' },
  { id: 'retail', name: 'E-Commerce Store', icon: '🛍️' },
  { id: 'fitness', name: 'Fitness & Health', icon: '💪' },
  { id: 'tech', name: 'SaaS & Tech', icon: '💻' },
  { id: 'consulting', name: 'Business Consulting', icon: '📈' },
  { id: 'creative', name: 'Creative Portfolio', icon: '🎨' },
];

export default function OnboardingPage() {
  const router = useRouter();

  // 1. ON MOUNT — auth guard
  useEffect(() => {
    client.users.getMe()
      .then(() => {
        // Authenticated — continue onboarding
      })
      .catch(() => {
        // Unauthenticated — redirect to /login
        router.push('/login');
      });
  }, [router]);

  // Current Step (1 to 8)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 2. Categories state
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    client.categories.getAll()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCategoriesList(res);
        }
      })
      .catch(() => {
        // Leave hardcoded categories in place
      });
  }, []);

  // 3. COLLECT ALL WIZARD DATA
  const [wizardData, setWizardData] = useState<WizardData>({
    businessName: '',
    tagline: '',
    logoUrl: '',
    category: 'tech',
    vibe: 'Modern',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    audienceAge: '25-45',
    audienceRegion: 'Worldwide',
    primaryColor: '#06b6d4',
    secondaryColor: '#a855f7',
    buildMode: 'ai',
  });

  // Step 8 Credentials Form State
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const updateWizard = (fields: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (loading) return; // Do not allow clicking Next while any call is in flight
    setErrorMessage('');
    if (step < 8) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (loading) return;
    setErrorMessage('');
    if (step > 1) setStep((s) => s - 1);
  };

  // 4. STEP 8 — Credentials Final Submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (authMode === 'signup') {
      // SIGNUP FLOW:
      try {
        // a. Signup
        await client.auth.signup({
          email: authEmail,
          password: authPassword,
          name: wizardData.businessName || 'Business Owner',
        });

        // b. Create or update business profile
        await client.users.createOrUpdateBusinessProfile({
          businessName: wizardData.businessName,
          category: wizardData.category,
          description: wizardData.tagline,
          phone: wizardData.phone,
          address: wizardData.address,
          logoUrl: wizardData.logoUrl,
        });

        // c. Check buildMode
        if (wizardData.buildMode === 'ai') {
          const res = await client.ai.generateSite({ ...wizardData });
          if (res?.jobId) localStorage.setItem('pendingJobId', res.jobId);
          if (res?.siteId) localStorage.setItem('activeSiteId', res.siteId);
          router.push('/builder');
        } else {
          const newSite = await client.sites.create({ name: wizardData.businessName || 'New Site' });
          if (newSite?.id) localStorage.setItem('activeSiteId', newSite.id);
          router.push('/builder');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Signup failed.';
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // LOGIN FLOW:
      try {
        // a. Login
        await client.auth.login({ email: authEmail, password: authPassword });

        // b. Check Business Profile
        try {
          const profile = await client.users.getBusinessProfile();
          if (profile) {
            router.push('/');
          } else {
            // Stay on onboarding to complete it
          }
        } catch {
          // No profile — stay on onboarding
        }
      } catch (err: any) {
        if (err.statusCode === 401 || err.response?.status === 401) {
          setErrorMessage('Invalid email or password');
        } else {
          const msg = err.response?.data?.message || err.message || 'Invalid email or password';
          setErrorMessage(msg);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto z-10 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm font-display">
            T
          </div>
          <span className="text-sm font-display font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Tridop Setup Wizard
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          Step {step} of 8
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-4xl w-full mx-auto z-10 my-4">
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <main className="max-w-xl w-full mx-auto my-auto py-6 z-10">
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-[0_15px_45px_rgba(0,0,0,0.6)] space-y-6">
          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Business Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 1: Business Identity</h3>
                <p className="text-xs text-slate-400">Enter your core brand details.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={wizardData.businessName}
                    onChange={(e) => updateWizard({ businessName: e.target.value })}
                    placeholder="e.g. Aether Tech Studio"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Tagline / Mission</label>
                  <input
                    type="text"
                    value={wizardData.tagline}
                    onChange={(e) => updateWizard({ tagline: e.target.value })}
                    placeholder="e.g. Next-Gen Cloud Automation"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Logo URL (Optional)</label>
                  <input
                    type="url"
                    value={wizardData.logoUrl}
                    onChange={(e) => updateWizard({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Category Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 2: Category</h3>
                <p className="text-xs text-slate-400">Select the primary industry for your business.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {categoriesList.map((cat: any) => (
                  <button
                    key={cat.id || cat.slug || cat.name}
                    type="button"
                    onClick={() => updateWizard({ category: cat.id || cat.slug || cat.name })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      wizardData.category === (cat.id || cat.slug || cat.name)
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base mr-2">{cat.icon || '⚡'}</span>
                    <span className="text-xs">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Brand Vibe */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 3: Brand Vibe</h3>
                <p className="text-xs text-slate-400">Choose the aesthetic tone for your design.</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {['Modern', 'Playful', 'Corporate', 'Bold', 'Elegant'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateWizard({ vibe: v })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      wizardData.vibe === v
                        ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{v} Aesthetic</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Contact Info */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 4: Contact Details</h3>
                <p className="text-xs text-slate-400">How clients can reach your business.</p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={wizardData.phone}
                      onChange={(e) => updateWizard({ phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={wizardData.whatsapp}
                      onChange={(e) => updateWizard({ whatsapp: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={wizardData.email}
                    onChange={(e) => updateWizard({ email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={wizardData.address}
                    onChange={(e) => updateWizard({ address: e.target.value })}
                    placeholder="100 Market St, San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Target Audience */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 5: Target Audience</h3>
                <p className="text-xs text-slate-400">Demographics and regional focus.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Age Group</label>
                  <input
                    type="text"
                    value={wizardData.audienceAge}
                    onChange={(e) => updateWizard({ audienceAge: e.target.value })}
                    placeholder="e.g. 18-35"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Target Region</label>
                  <input
                    type="text"
                    value={wizardData.audienceRegion}
                    onChange={(e) => updateWizard({ audienceRegion: e.target.value })}
                    placeholder="e.g. North America & Europe"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Palette & Theme */}
          {step === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 6: Color Tokens</h3>
                <p className="text-xs text-slate-400">Configure theme palette shades.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Primary Accent</label>
                  <input
                    type="color"
                    value={wizardData.primaryColor}
                    onChange={(e) => updateWizard({ primaryColor: e.target.value })}
                    className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Secondary Accent</label>
                  <input
                    type="color"
                    value={wizardData.secondaryColor}
                    onChange={(e) => updateWizard({ secondaryColor: e.target.value })}
                    className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Build Mode Selection */}
          {step === 7 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 7: Construction Mode</h3>
                <p className="text-xs text-slate-400">Choose how Tridop builds your site.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateWizard({ buildMode: 'ai' })}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    wizardData.buildMode === 'ai'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <div className="text-xs font-bold">AI Synthesizer</div>
                  <p className="text-[10px] text-slate-400 font-normal">Full AI generation of pages, components & layouts.</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateWizard({ buildMode: 'blocks' })}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    wizardData.buildMode === 'blocks'
                      ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <Layers className="w-5 h-5 text-purple-400" />
                  <div className="text-xs font-bold">Block Builder</div>
                  <p className="text-[10px] text-slate-400 font-normal">Modular component blocks configured manually.</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Final Credentials Signup/Login */}
          {step === 8 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-slate-100">Step 8: Finalize Account</h3>
                <p className="text-xs text-slate-400">Save profile & launch builder environment.</p>
              </div>

              <div className="flex border-b border-slate-800 gap-4 text-xs font-mono mb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    authMode === 'signup' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
                  }`}
                >
                  New Account (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    authMode === 'login' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
                  }`}
                >
                  Existing User (Log In)
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'signup' ? 'Complete & Launch Builder' : 'Log In & Check Profile'}</span>
                )}
              </button>
            </form>
          )}

          {/* Bottom Navigation Buttons (Steps 1 to 7) */}
          {step < 8 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-900">
              <button
                type="button"
                disabled={step === 1 || loading}
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto z-10 text-center text-[10px] font-mono text-slate-500">
        Tridop AI • Protected Multi-Step Onboarding Wizard
      </footer>
    </div>
  );
}
