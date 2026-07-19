'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import { 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  Layers, 
  Globe, 
  Database, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Layout, 
  Code, 
  Server
} from 'lucide-react';

interface TemplateItem {
  slug: string;
  name: string;
  category: string;
  defaultBlocks?: any;
  globalSettings?: any;
}

export default function LandingPage() {
  const router = useRouter();

  // 1. ON PAGE LOAD — silent auth check
  useEffect(() => {
    client.users.getMe()
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        // Fail silently — stay on landing page with no loading spinner
      });
  }, [router]);

  // Current Slide State (0 = Hero, 1 = Prompt Planner, 2 = AI Architecture, 3 = Templates, 4 = CTA & Auth)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // 2. SLIDE 2 — Prompt Planner State
  const [promptInput, setPromptInput] = useState<string>('');
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [promptResult, setPromptResult] = useState<string>('');
  const [promptError, setPromptError] = useState<string>('');

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setPromptError('');
    setPromptResult('');
    setPromptLoading(true);

    try {
      const responseText = await client.ai.prompt({ prompt: promptInput });
      setPromptResult(responseText || 'Plan generated successfully.');
    } catch (err: any) {
      setPromptError('Could not generate plan. Try again.');
    } finally {
      setPromptLoading(false);
    }
  };

  // 3. SLIDE 3 — Template Previews State
  const defaultTemplates: TemplateItem[] = [
    { slug: 'e-commerce', name: 'Storefront Pro', category: 'E-Commerce' },
    { slug: 'saas-dashboard', name: 'Metric Cloud', category: 'Business Tool' },
    { slug: 'creative-portfolio', name: 'Aether Atelier', category: 'Creative Web' },
  ];
  const [templates, setTemplates] = useState<TemplateItem[]>(defaultTemplates);

  useEffect(() => {
    client.sites.getTemplates()
      .then((fetchedTemplates) => {
        if (fetchedTemplates && Array.isArray(fetchedTemplates) && fetchedTemplates.length > 0) {
          setTemplates(fetchedTemplates);
        }
      })
      .catch(() => {
        // If the call fails, leave existing hardcoded mock content in place — do not crash
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Abstract Glowing Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto z-10 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm font-display shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            T
          </div>
          <span className="text-sm font-display font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Tridop AI
          </span>
        </div>

        {/* Slide Indicators */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
          {['Hero', 'Prompt Planner', 'Architecture', 'Templates', 'Get Started'].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`text-[11px] font-mono px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeSlide === idx 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0{idx + 1}. {label}
            </button>
          ))}
        </div>

        {/* 4. SLIDE 4 — Header CTA shortcuts */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Slide Content Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 z-10 flex flex-col justify-center items-center text-center">
        {/* SLIDE 1: Hero */}
        {activeSlide === 0 && (
          <div className="space-y-6 max-w-3xl animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Software Synthesizer</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
              Build Production Apps at the Speed of Thought
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Tridop AI deconstructs your prompts into full-stack NestJS services, dynamic page routers, and responsive UI components.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setActiveSlide(1)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 px-7 rounded-full text-xs transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <span>Launch Prompt Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: Prompt Planner */}
        {activeSlide === 1 && (
          <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Slide 02 • Prompt Planner
              </span>
              <h2 className="text-3xl font-display font-bold text-slate-100">Describe Your Application Vision</h2>
              <p className="text-xs text-slate-400">Synthesize architectural specs and server endpoints instantly.</p>
            </div>

            <form onSubmit={handlePromptSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  disabled={promptLoading}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. A food delivery platform with live drone tracking and Stripe checkout..."
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500 rounded-full py-4 pl-12 pr-36 text-slate-200 placeholder-slate-500 focus:outline-none text-sm font-sans shadow-inner disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={promptLoading || !promptInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans text-xs font-bold py-2.5 px-5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  {promptLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Planning...</span>
                    </>
                  ) : (
                    <>
                      <span>Synthesize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message Element */}
            {promptError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                {promptError}
              </div>
            )}

            {/* Output / Result Element */}
            {promptResult && (
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl text-left space-y-2 max-h-60 overflow-y-auto">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">AI Architectural Response</span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{promptResult}</p>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 3: Template Previews */}
        {activeSlide === 2 && (
          <div className="w-full max-w-4xl space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Slide 03 • Template Previews
              </span>
              <h2 className="text-3xl font-display font-bold text-slate-100">Production-Ready Blueprints</h2>
              <p className="text-xs text-slate-400">Pre-configured architectures mapped directly to client services.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {templates.map((tpl, idx) => (
                <div key={tpl.slug || idx} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded">
                        {tpl.category || 'App Blueprint'}
                      </span>
                      <Layout className="w-4 h-4 text-slate-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{tpl.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Complete software template matching category "{tpl.category}". Includes default blocks, global settings, and routing endpoints.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/signup')}
                    className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Use Blueprint
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 4: Architecture */}
        {activeSlide === 3 && (
          <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Slide 04 • Microservice Engine
              </span>
              <h2 className="text-3xl font-display font-bold text-slate-100">Distributed Cloud Fabric</h2>
              <p className="text-xs text-slate-400">11 isolated NestJS microservices powering auth, billing, commerce, and deployments.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {[
                { name: 'Identity Service', icon: ShieldCheck, desc: 'JWT & OAuth Auth' },
                { name: 'Sites Service', icon: Layout, desc: 'Site Schema Engine' },
                { name: 'Deploy Service', icon: Server, desc: 'Docker Containers' },
                { name: 'AI Service', icon: Cpu, desc: 'Gemini Telemetry' },
              ].map((srv, idx) => {
                const IconComp = srv.icon;
                return (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <IconComp className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-xs font-bold text-slate-200">{srv.name}</h4>
                    <p className="text-[10px] text-slate-400">{srv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SLIDE 5 (SLIDE 4 CTA Buttons in prompt index): Get Started & Sign In */}
        {activeSlide === 4 && (
          <div className="w-full max-w-md space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Slide 05 • Ready to Build
              </span>
              <h2 className="text-3xl font-display font-extrabold text-white">Join Tridop AI Today</h2>
              <p className="text-xs text-slate-400">Launch your next full-stack project in seconds.</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* 4. SLIDE 4 — CTA buttons */}
              <button
                onClick={() => router.push('/signup')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans font-bold py-3.5 px-6 rounded-full text-xs transition-all shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-sans font-bold py-3.5 px-6 rounded-full text-xs transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign in</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation controls */}
      <footer className="max-w-6xl w-full mx-auto z-10 flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-900">
        <span className="font-mono text-[11px]">© 2026 Tridop AI Studio</span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : 4))}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:text-white transition-all text-[11px]"
          >
            ← Previous
          </button>
          <span className="font-mono text-[10px] text-slate-400">{activeSlide + 1} / 5</span>
          <button
            onClick={() => setActiveSlide((prev) => (prev < 4 ? prev + 1 : 0))}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:text-white transition-all text-[11px]"
          >
            Next →
          </button>
        </div>
      </footer>
    </div>
  );
}
