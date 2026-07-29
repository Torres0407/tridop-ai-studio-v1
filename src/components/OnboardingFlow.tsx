import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PromptExample, PlanningItem } from '../types';
import { client } from '../lib/client';
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  ShoppingBag,
  Lock
} from 'lucide-react';

interface OnboardingFlowProps {
  currentStep: number;
  onSelectPrompt: (promptText: string) => void;
  selectedPrompt: string;
  setStep: (step: number) => void;
  onFieldFocus?: (fieldName: string) => void;
  onAuthSuccess?: (name: string, email: string) => void;
}

export default function OnboardingFlow({
  currentStep,
  onSelectPrompt,
  selectedPrompt,
  setStep,
}: OnboardingFlowProps) {
  // Examples for Step 1 — populated from backend GET /categories API
  const [promptExamples, setPromptExamples] = useState<PromptExample[]>([
    { id: '1', text: 'Food Delivery App', category: 'Mobile & Web App' },
    { id: '2', text: 'Marketplace with Payments', category: 'E-Commerce' },
    { id: '3', text: 'SaaS Analytics Dashboard', category: 'Business Tool' },
    { id: '4', text: '3D Portfolio Website', category: 'Creative Web' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let backendCategories: any[] = [];
        if (client && (client as any).categories && typeof (client as any).categories.list === 'function') {
          backendCategories = await (client as any).categories.list();
        } else {
          const res = await fetch('http://localhost:4000/categories');
          if (res.ok) {
            backendCategories = await res.json();
          }
        }
        if (Array.isArray(backendCategories) && backendCategories.length > 0) {
          const mapped: PromptExample[] = backendCategories.slice(0, 6).map((cat: any, idx: number) => ({
            id: cat.id || String(idx + 1),
            text: cat.name || cat.title || 'Custom Web Application',
            category: cat.type || cat.group || 'Template',
          }));
          setPromptExamples(mapped);
        }
      } catch {
        // Safe fallback
      }
    };
    fetchCategories();
  }, []);

  // Planning checklist for Step 2
  const [planningItems, setPlanningItems] = useState<PlanningItem[]>([
    { id: '1', label: 'Compiling Features & User Stories', status: 'pending', details: ['User authentication', 'Payment gateway integration', 'Push notifications', 'Location search'] },
    { id: '2', label: 'Designing Pages & Router Paths', status: 'pending', details: ['/login', '/dashboard', '/cart', '/checkout', '/profile'] },
    { id: '3', label: 'Provisioning Database Schema', status: 'pending', details: ['Users table', 'Orders table', 'Products collection', 'Relation indices'] },
    { id: '4', label: 'Generating REST & WebSocket Endpoints', status: 'pending', details: ['POST /api/auth', 'GET /api/products', 'WS /api/live-tracking'] },
    { id: '5', label: 'Assembling React & Tailwind Components', status: 'pending', details: ['Navbar.tsx', 'ProductGrid.tsx', 'OrderTracker.tsx', 'PaymentForm.tsx'] },
  ]);

  const [customPages, setCustomPages] = useState<string[]>(['Home', 'Features', 'Contact']);
  const [activeCustomTab, setActiveCustomTab] = useState<string>('Home');
  const [customComments, setCustomComments] = useState<Record<string, string[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const lastGeneratedPromptRef = useRef<string>('');

  useEffect(() => {
    if (!selectedPrompt) {
      setCustomPages(['Home', 'Features', 'Contact']);
      lastGeneratedPromptRef.current = '';
      return;
    }

    const getInitialPagesForPrompt = (promptText: string): string[] => {
      const lower = promptText.toLowerCase();
      let pages: string[] = ['Home', 'Features', 'Contact'];

      if (lower.includes('food') || lower.includes('delivery') || lower.includes('restaurant')) {
        pages = ['Home', 'Menu', 'Cart', 'Track Order'];
      } else if (lower.includes('marketplace') || lower.includes('shop') || lower.includes('store')) {
        pages = ['Storefront', 'Shop', 'Cart', 'Secure Pay'];
      } else if (lower.includes('analytics') || lower.includes('saas') || lower.includes('dashboard')) {
        pages = ['Dashboard', 'Insights', 'Team Settings'];
      }
      return Array.from(new Set(pages));
    };

    const timer = setTimeout(() => {
      if (selectedPrompt !== lastGeneratedPromptRef.current) {
        setCustomPages(getInitialPagesForPrompt(selectedPrompt));
        lastGeneratedPromptRef.current = selectedPrompt;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPrompt]);

  useEffect(() => {
    if (customPages.length > 0 && !customPages.includes(activeCustomTab)) {
      setActiveCustomTab(customPages[0]);
    }
  }, [customPages, activeCustomTab]);

  // Handle step-by-step loading for Step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    const updatedItems: PlanningItem[] = [
      {
        id: '1',
        label: 'Compiling Features & User Stories',
        status: 'pending',
        details: ['User authentication', ...customPages.map(p => `Define core interaction models for ${p}`)]
      },
      {
        id: '2',
        label: 'Designing Pages & Router Paths',
        status: 'pending',
        details: customPages.map(p => `/${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
      },
      {
        id: '3',
        label: 'Provisioning Database Schema',
        status: 'pending',
        details: ['Users authentication records', ...customPages.slice(0, 3).map(p => `${p} Schema`)]
      },
      {
        id: '4',
        label: 'Generating REST & WebSocket Endpoints',
        status: 'pending',
        details: ['POST /api/auth', ...customPages.slice(0, 2).map(p => `GET /api/${p.toLowerCase()}`)]
      },
      {
        id: '5',
        label: 'Assembling React & Tailwind Components',
        status: 'pending',
        details: ['App.tsx manager', ...customPages.map(p => `${p}View.tsx`)]
      }
    ];

    setPlanningItems(updatedItems);
    let currentItemIdx = 0;

    const runPlanner = () => {
      if (currentItemIdx >= updatedItems.length) return;

      setPlanningItems((prev) =>
        prev.map((item, idx) => {
          if (idx === currentItemIdx) return { ...item, status: 'loading' };
          return item;
        })
      );

      setTimeout(() => {
        setPlanningItems((prev) =>
          prev.map((item, idx) => {
            if (idx === currentItemIdx) return { ...item, status: 'completed' };
            return item;
          })
        );
        currentItemIdx++;
        if (currentItemIdx < updatedItems.length) {
          runPlanner();
        } else {
          setTimeout(() => setStep(3), 1000);
        }
      }, 1200);
    };

    runPlanner();
  }, [currentStep, customPages, setStep]);

  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative px-6 md:px-12 z-10">
      <AnimatePresence mode="popLayout">
        
        {/* STEP 1: Prompt Input Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-3xl w-full flex flex-col items-center"
          >
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Step 1: Ideation
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mt-4">
                What would you like to build?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
              {promptExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => onSelectPrompt(example.text)}
                  className={`p-5 rounded-2xl text-left transition-all glass-panel ${
                    selectedPrompt === example.text ? 'border-cyan-400 bg-cyan-950/20' : 'hover:border-cyan-500/30'
                  }`}
                >
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">{example.category}</span>
                  <h4 className="text-lg font-display font-medium text-slate-200 mt-1">{example.text}</h4>
                </button>
              ))}
            </div>

            <div className="w-full max-w-2xl relative">
              <input
                type="text"
                value={selectedPrompt}
                onChange={(e) => onSelectPrompt(e.target.value)}
                placeholder="Describe your application idea..."
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-full py-4 pl-6 pr-32 text-slate-200 text-sm focus:outline-none"
              />
              <button
                disabled={!selectedPrompt.trim()}
                onClick={() => setStep(2)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold py-2 px-6 rounded-full transition-all"
              >
                Synthesize <ArrowRight className="w-4 h-4 inline" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-cyan-400 font-sans">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Prompting requires no business info now. Customize your business details during deployment!</span>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Compilation Checklist */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl w-full p-6 glass-panel rounded-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Synthesizing Project Architecture...
            </h3>
            <div className="space-y-3">
              {planningItems.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">{item.label}</span>
                  {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {item.status === 'loading' && <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
                  {item.status === 'pending' && <span className="text-slate-600 font-mono">Pending</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Preview Sandbox */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl w-full p-6 glass-panel rounded-2xl text-center space-y-6"
          >
            <h3 className="text-xl font-bold text-white">Application Prototype Ready</h3>
            <p className="text-xs text-slate-400">Click below to transition directly into the live builder workspace.</p>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold rounded-xl transition-all"
            >
              Open Builder Canvas <ArrowRight className="w-4 h-4 inline" />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
