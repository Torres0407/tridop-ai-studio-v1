import React, { useState, useRef } from 'react';
import TriMascot from './TriMascot';
import { 
  User as UserIcon, 
  Briefcase, 
  Palette, 
  Share2, 
  Users, 
  Sparkles, 
  Layers, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Share2 as Instagram, 
  Share2 as Facebook, 
  Share2 as Twitter, 
  Share2 as Linkedin, 
  Share2 as Youtube, 
  MessageSquare,
  Compass
} from 'lucide-react';

const Tiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14 1.13 1.11 2.68 1.7 4.26 1.79v3.9c-1.74-.02-3.41-.6-4.75-1.73-.13-.11-.25-.23-.37-.35v6.52c-.07 3.44-2.22 6.57-5.46 7.7-3.41 1.25-7.29-.11-9.13-3.2-1.95-3.13-1.42-7.38 1.25-9.9 2.11-2.02 5.3-2.52 7.96-1.33v3.92c-1.41-.71-3.17-.43-4.29.69-1.2 1.12-1.44 2.98-.57 4.38.86 1.45 2.64 2.16 4.25 1.71 1.54-.4 2.56-1.85 2.51-3.45.02-3.69.01-7.38.01-11.07z"/>
  </svg>
);

interface OnboardingWizardProps {
  userEmail?: string;
  userName?: string;
  onComplete?: (data: OnboardingState) => void;
  onExit?: () => void;
}

export interface OnboardingState {
  // Step 1: Account
  accountName: string;
  accountEmail: string;
  // Step 2: Basics
  businessName: string;
  tagline: string;
  businessType: string;
  customBusinessType?: string;
  // Step 3: Brand
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  language: string;
  // Step 4: Contact
  phone: string;
  whatsApp: string;
  contactEmail: string;
  address: string;
  mapPin: string;
  socials: {
    instagram: string;
    facebook: string;
    x: string;
    tiktok: string;
    linkedin: string;
    youtube: string;
  };
  // Step 5: Audience
  ageRange: string;
  audienceLocation: string;
  audienceLanguage: string;
  interests: string[];
  // Step 6: Vibe
  vibe: 'Modern' | 'Playful' | 'Corporate' | 'Bold' | 'Elegant' | '';
  // Step 7: Build Mode
  buildMode: 'AI' | 'Blocks' | '';
}

const BUSINESS_TYPES = [
  { id: 'restaurant', name: 'Restaurant', icon: '🍔' },
  { id: 'salon', name: 'Salon', icon: '💇‍♀️' },
  { id: 'agency', name: 'Agency', icon: '🚀' },
  { id: 'retail', name: 'Retail', icon: '🛍️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'tech', name: 'Tech', icon: '💻' },
  { id: 'consulting', name: 'Consulting', icon: '📈' },
  { id: 'healthcare', name: 'Healthcare', icon: '🩺' },
  { id: 'other', name: 'Other', icon: '✨' },
];

const FONTS = [
  { id: 'font-sans', name: 'Inter (Sans)', value: 'Inter, sans-serif' },
  { id: 'font-display', name: 'Space Grotesk (Tech)', value: '"Space Grotesk", sans-serif' },
  { id: 'font-serif', name: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { id: 'font-mono', name: 'JetBrains Mono (Technical)', value: '"JetBrains Mono", monospace' },
  { id: 'font-playful', name: 'Outfit (Friendly)', value: '"Outfit", sans-serif' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'zh', name: 'Mandarin (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
];

const VIBES = [
  { id: 'Modern', title: 'Modern', desc: 'Sleek, minimalist grids, high-tech aesthetics and spacious whitespace.', bg: 'from-cyan-950/40 to-slate-900/60', border: 'border-cyan-500/20' },
  { id: 'Playful', title: 'Playful', desc: 'Vibrant gradients, organic rounded shapes, and friendly animations.', bg: 'from-pink-950/40 to-purple-900/60', border: 'border-pink-500/20' },
  { id: 'Corporate', title: 'Corporate', desc: 'Trustworthy dark navy, structured sections, sharp professional margins.', bg: 'from-blue-950/40 to-slate-900/60', border: 'border-blue-500/20' },
  { id: 'Bold', title: 'Bold', desc: 'High-contrast neon colors, thick brutalist lines, and massive display typography.', bg: 'from-amber-950/40 to-stone-900/60', border: 'border-amber-500/20' },
  { id: 'Elegant', title: 'Elegant', desc: 'Sophisticated editorial layouts, delicate gold borders, and timeless serif typography.', bg: 'from-emerald-950/40 to-slate-900/60', border: 'border-emerald-500/20' },
];

const COLOR_PRESETS = [
  { name: 'Cyan (Standard)', hex: '#06b6d4' },
  { name: 'Purple (Tech)', hex: '#a855f7' },
  { name: 'Emerald (Growth)', hex: '#10b981' },
  { name: 'Blue (Trust)', hex: '#3b82f6' },
  { name: 'Rose (Vibrant)', hex: '#f43f5e' },
  { name: 'Amber (Warmth)', hex: '#f59e0b' },
  { name: 'Teal (Calm)', hex: '#0d9488' },
  { name: 'Indigo (Professional)', hex: '#6366f1' },
  { name: 'Orange (Energy)', hex: '#f97316' },
  { name: 'Red (Bold)', hex: '#ef4444' },
  { name: 'Pink (Playful)', hex: '#ec4899' },
  { name: 'Fuchsia (Creative)', hex: '#d946ef' },
  { name: 'Violet (Mystic)', hex: '#8b5cf6' },
  { name: 'Sky (Fresh)', hex: '#0ea5e9' },
  { name: 'Lime (Energetic)', hex: '#84cc16' },
  { name: 'Slate (Sophisticated)', hex: '#64748b' },
];

const STEP_METADATA = [
  { step: 1, label: 'Basics', icon: Briefcase, id: 'step-2-basics' },
  { step: 2, label: 'Brand', icon: Palette, id: 'step-3-brand' },
  { step: 3, label: 'Contact', icon: Share2, id: 'step-4-contact' },
  { step: 4, label: 'Audience', icon: Users, id: 'step-5-audience' },
  { step: 5, label: 'Vibe', icon: Sparkles, id: 'step-6-vibe' },
  { step: 6, label: 'Build', icon: Layers, id: 'step-7-build' },
];

const colorNameToHex = (colorName: string): string => {
  const name = colorName.trim().toLowerCase();
  const colors: Record<string, string> = {
    cyan: '#06b6d4',
    purple: '#a855f7',
    emerald: '#10b981',
    blue: '#3b82f6',
    rose: '#f43f5e',
    amber: '#f59e0b',
    teal: '#0d9488',
    indigo: '#6366f1',
    orange: '#f97316',
    red: '#ef4444',
    pink: '#ec4899',
    fuchsia: '#d946ef',
    violet: '#8b5cf6',
    sky: '#0ea5e9',
    green: '#22c55e',
    yellow: '#eab308',
    lime: '#84cc16',
    slate: '#64748b',
    white: '#ffffff',
    black: '#000000',
  };
  if (colors[name]) return colors[name];
  if (/^#?[0-9a-fA-F]{6}$/.test(name)) {
    return name.startsWith('#') ? name : `#${name}`;
  }
  if (/^#?[0-9a-fA-F]{3}$/.test(name)) {
    const withoutHash = name.startsWith('#') ? name.slice(1) : name;
    const expanded = withoutHash.split('').map(char => char + char).join('');
    return `#${expanded}`;
  }
  return '';
};

export default function OnboardingWizard({ 
  userEmail = 'okuborchinonye@gmail.com', 
  userName = 'Chinonye Okubor',
  onComplete,
  onExit
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [state, setState] = useState<OnboardingState>({
    accountName: userName,
    accountEmail: userEmail,
    businessName: '',
    tagline: '',
    businessType: 'tech',
    customBusinessType: '',
    logoUrl: null,
    primaryColor: '#06b6d4',
    secondaryColor: '#a855f7',
    fontFamily: 'Inter, sans-serif',
    language: 'English',
    phone: '',
    whatsApp: '',
    contactEmail: userEmail,
    address: '',
    mapPin: 'San Francisco, CA',
    socials: {
      instagram: '',
      facebook: '',
      x: '',
      tiktok: '',
      linkedin: '',
      youtube: ''
    },
    ageRange: '25-45',
    audienceLocation: 'Worldwide',
    audienceLanguage: 'English',
    interests: [],
    vibe: 'Modern',
    buildMode: 'AI'
  });

  const [interestInput, setInterestInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updater: Partial<OnboardingState> | ((prev: OnboardingState) => OnboardingState)) => {
    if (typeof updater === 'function') {
      setState(updater);
    } else {
      setState(prev => ({ ...prev, ...updater }));
    }
  };

  const updateSocial = (key: keyof OnboardingState['socials'], value: string) => {
    setState(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [key]: value
      }
    }));
  };

  const handleColorTextChange = (key: 'primaryColor' | 'secondaryColor', text: string) => {
    updateState({ [key]: text });
  };

  const getSafeHexForPicker = (colorValue: string, fallback: string) => {
    const resolved = colorNameToHex(colorValue);
    if (/^#[0-9a-fA-F]{6}$/.test(resolved)) {
      return resolved;
    }
    return fallback;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !state.interests.includes(interestInput.trim())) {
      updateState({ interests: [...state.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const removeInterest = (tag: string) => {
    updateState({ interests: state.interests.filter(i => i !== tag) });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onComplete) onComplete(state);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onExit) {
      onExit();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    updateState({ businessType: categoryId });
    if (categoryId !== 'other') {
      if (state.businessName.trim().length > 0) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 220); // clean delay for delightful transition
      }
    }
  };

  // Check if current step inputs are valid enough to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return state.businessName.trim().length > 0 && 
               (state.businessType !== 'other' || (state.customBusinessType !== undefined && state.customBusinessType.trim().length > 0));
      case 5:
        return state.vibe !== '';
      case 6:
        return state.buildMode !== '';
      default:
        return true;
    }
  };

  // Helper to determine TriMascot's state based on currentStep
  const getTriMascotProps = () => {
    switch (currentStep) {
      case 1: // Business Basics
        return {
          expression: 'thinking' as const,
          speechText: `Let's design a spectacular foundation! Tell me: what is the name of your business?`
        };
      case 2: // Brand Identity
        return {
          expression: 'excited' as const,
          speechText: `A brand is the soul of synthesis! Upload your logo or customize your signature colors.`
        };
      case 3: // Contact + Social
        return {
          expression: 'pointing' as const,
          speechText: `Let's make sure clients can reach you! Enter your contact details and social media coordinates.`
        };
      case 4: // Target Audience
        return {
          expression: 'talking' as const,
          speechText: `Who are we building this for? Tell me a bit about your target audience!`
        };
      case 5: // Vibe
        return {
          expression: 'wink' as const,
          speechText: `Choose a design vibe that fits your style. Personally, I love the Modern layout!`
        };
      case 6: // Build Mode
        return {
          expression: 'excited' as const,
          speechText: `We are ready to build! Choose between full AI symmetric synthesis or block-by-block layout.`
        };
      default:
        return {
          expression: 'idle' as const,
          speechText: `Welcome back operator! Let's get started on your workspace setup.`
        };
    }
  };

  // Compute font styling for live mini preview based on selected font
  const getPreviewFontFamily = () => {
    return state.fontFamily;
  };

  const renderNavigationButtons = (maxWidthClass: string = 'max-w-md') => {
    return (
      <div className={`flex items-center gap-3 pt-6 border-t border-slate-800/20 mt-6 w-full ${maxWidthClass}`}>
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`flex-1 px-6 py-3 rounded-xl font-display font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isStepValid()
              ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
              : 'bg-slate-800/80 border border-slate-700/50 text-slate-400 opacity-60 cursor-not-allowed'
          }`}
        >
          {currentStep === totalSteps ? 'Finalize Workspace' : 'Next'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans" id="onboarding-root">
      {/* Dynamic Top Progress Bar */}
      <div className="w-full bg-slate-900/60 border-b border-slate-800/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-display font-black text-slate-950 text-base shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            T
          </div>
          <div>
            <h1 className="text-sm font-display font-bold tracking-tight text-slate-100">Tridop Workspace</h1>
            <p className="text-[10px] text-slate-400 font-mono">ONBOARDING STREAM</p>
          </div>
        </div>

        {/* Floating Steps Indicator */}
        <div className="flex flex-col items-end gap-1.5 w-1/3 max-w-[280px]">
          <div className="flex justify-between w-full text-[10px] text-slate-400 font-mono">
            <span>STEP {currentStep} OF {totalSteps}</span>
            <span className="text-cyan-400 font-bold">{Math.round((currentStep / totalSteps) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Close/Exit button */}
        <button 
          onClick={onExit}
          className="px-3 py-1.5 rounded-md border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          Exit Setup
        </button>
      </div>

      {/* Main Centered Interface */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-12">
        
        {/* Left Side: Onboarding Content */}
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-6">
          
          <div className="w-full max-w-xl mx-auto flex-1 flex flex-col">
            {/* Clickable Step Navigation */}
            <div className="w-full mb-6 bg-slate-900/20 border border-slate-800/40 rounded-xl p-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-thin">
              {STEP_METADATA.map((m) => {
                const Icon = m.icon;
                const isActive = currentStep === m.step;
                const isCompleted = currentStep > m.step;
                return (
                  <button
                    key={m.step}
                    type="button"
                    onClick={() => setCurrentStep(m.step)}
                    className={`flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-mono transition-all border ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.05)]'
                        : isCompleted
                        ? 'bg-slate-900/40 border-slate-800/40 text-slate-300 hover:bg-slate-900/60'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <span className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-cyan-500 text-slate-950 font-bold text-[10px]' 
                        : isCompleted 
                        ? 'bg-slate-800 text-cyan-400 font-bold text-[10px]' 
                        : 'bg-slate-900/60 text-slate-600 text-[10px]'
                    }`}>
                      {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[2.5]" /> : m.step}
                    </span>
                    <span className="hidden md:inline font-sans font-medium text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Step Wrapper */}
            <div className="flex-1 pr-2 mb-6 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in" id="step-2-basics">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
                    <Briefcase className="w-3 h-3" /> Core Foundation
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Tell us about your business
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    Define the core identity that drives this synthesis.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Business Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corporation" 
                      value={state.businessName}
                      onChange={(e) => updateState({ businessName: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-900/40 border rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all ${
                        state.businessName.trim() === '' ? 'border-amber-500/30 focus:border-amber-500' : 'border-slate-800'
                      }`}
                      required
                    />
                    {state.businessName.trim() === '' && (
                      <span className="text-[10px] text-amber-400/80 mt-1 block font-mono">⚠️ Please type a Business Name before choosing a category</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Brand Tagline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Modern tools for beautiful systems" 
                      value={state.tagline}
                      onChange={(e) => updateState({ tagline: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Business Category</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {BUSINESS_TYPES.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleCategorySelect(b.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            state.businessType === b.id 
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.1)]' 
                              : 'bg-slate-900/30 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-xl">{b.icon}</span>
                          <span className="text-sm font-medium">{b.name}</span>
                        </button>
                      ))}
                    </div>

                    {state.businessType === 'other' && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Custom Category Name <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="e.g. Consulting, Art, Education, Marketing..." 
                          value={state.customBusinessType || ''}
                          onChange={(e) => updateState({ customBusinessType: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                  {renderNavigationButtons('max-w-md')}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in" id="step-3-brand">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                    <Palette className="w-3 h-3" /> Visual System
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Establish brand identity
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    Curate colors, fonts, and assets to configure the design theme.
                  </p>
                </div>

                <div className="space-y-5 max-w-md">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Brand Logo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/20 rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      {state.logoUrl ? (
                        <div className="flex items-center gap-3 w-full justify-between px-2">
                          <img src={state.logoUrl} alt="Logo preview" className="h-10 max-w-[120px] object-contain rounded-md bg-slate-950/80 p-1 border border-slate-800" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); updateState({ logoUrl: null }); }} 
                            className="text-xs text-rose-400 hover:text-rose-300 font-mono"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-500" />
                          <span className="text-xs text-slate-400">Click to upload brand logo</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Primary Color Theme</label>
                      <div className="space-y-2">
                        <select
                          value={COLOR_PRESETS.find(p => p.hex.toLowerCase() === state.primaryColor.toLowerCase() || p.name.toLowerCase() === state.primaryColor.toLowerCase())?.hex || 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              updateState({ primaryColor: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-cyan-500 outline-none"
                        >
                          {COLOR_PRESETS.map(p => (
                            <option key={`pri-${p.hex}`} value={p.hex}>{p.name} ({p.hex})</option>
                          ))}
                          <option value="custom">Custom Color / Type Name...</option>
                        </select>

                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={getSafeHexForPicker(state.primaryColor, '#06b6d4')}
                            onChange={(e) => updateState({ primaryColor: e.target.value })}
                            className="w-10 h-10 rounded border border-slate-800 bg-transparent cursor-pointer shrink-0"
                            title="Color Picker"
                          />
                          <input 
                            type="text" 
                            placeholder="Type name (e.g. Red, Blue) or Hex"
                            value={state.primaryColor}
                            onChange={(e) => handleColorTextChange('primaryColor', e.target.value)}
                            className="flex-1 text-xs font-mono px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg outline-none text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Secondary Color Theme</label>
                      <div className="space-y-2">
                        <select
                          value={COLOR_PRESETS.find(p => p.hex.toLowerCase() === state.secondaryColor.toLowerCase() || p.name.toLowerCase() === state.secondaryColor.toLowerCase())?.hex || 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              updateState({ secondaryColor: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-cyan-500 outline-none"
                        >
                          {COLOR_PRESETS.map(p => (
                            <option key={`sec-${p.hex}`} value={p.hex}>{p.name} ({p.hex})</option>
                          ))}
                          <option value="custom">Custom Color / Type Name...</option>
                        </select>

                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={getSafeHexForPicker(state.secondaryColor, '#a855f7')}
                            onChange={(e) => updateState({ secondaryColor: e.target.value })}
                            className="w-10 h-10 rounded border border-slate-800 bg-transparent cursor-pointer shrink-0"
                            title="Color Picker"
                          />
                          <input 
                            type="text" 
                            placeholder="Type name (e.g. Emerald, Purple) or Hex"
                            value={state.secondaryColor}
                            onChange={(e) => handleColorTextChange('secondaryColor', e.target.value)}
                            className="flex-1 text-xs font-mono px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg outline-none text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font Dropdown */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Primary Font Family</label>
                    <select 
                      value={state.fontFamily}
                      onChange={(e) => updateState({ fontFamily: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-cyan-500 outline-none"
                    >
                      {FONTS.map(f => (
                        <option key={f.id} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">System Language</label>
                    <select 
                      value={state.language}
                      onChange={(e) => updateState({ language: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-cyan-500 outline-none"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.name}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  {renderNavigationButtons('max-w-md')}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in" id="step-4-contact">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
                    <Share2 className="w-3 h-3" /> Integrations & Connect
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Contact & social indices
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    Supply active endpoints to automatically feed communications and footers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 019-2834" 
                      value={state.phone}
                      onChange={(e) => updateState({ phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 019-2834" 
                      value={state.whatsApp}
                      onChange={(e) => updateState({ whatsApp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" /> Public Email
                    </label>
                    <input 
                      type="email" 
                      value={state.contactEmail}
                      onChange={(e) => updateState({ contactEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Location address */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Headquarters Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="123 Science Way, Suite 100" 
                      value={state.address}
                      onChange={(e) => updateState({ address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Map Pin query */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" /> Geographic Coordinates / City
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. San Francisco, California" 
                      value={state.mapPin}
                      onChange={(e) => updateState({ mapPin: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Social grids */}
                  <div className="md:col-span-2 mt-2 space-y-3">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900/60 pb-1">Social media handles</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Instagram className="w-4 h-4 text-pink-400" /></span>
                        <input 
                          type="text" 
                          placeholder="instagram.com/handle" 
                          value={state.socials.instagram}
                          onChange={(e) => updateSocial('instagram', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>

                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Facebook className="w-4 h-4 text-blue-400" /></span>
                        <input 
                          type="text" 
                          placeholder="facebook.com/page" 
                          value={state.socials.facebook}
                          onChange={(e) => updateSocial('facebook', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>

                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Twitter className="w-4 h-4 text-slate-200" /></span>
                        <input 
                          type="text" 
                          placeholder="x.com/handle" 
                          value={state.socials.x}
                          onChange={(e) => updateSocial('x', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>

                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Tiktok className="w-4 h-4 text-slate-100" /></span>
                        <input 
                          type="text" 
                          placeholder="tiktok.com/@handle" 
                          value={state.socials.tiktok}
                          onChange={(e) => updateSocial('tiktok', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>

                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Linkedin className="w-4 h-4 text-blue-500" /></span>
                        <input 
                          type="text" 
                          placeholder="linkedin.com/in/handle" 
                          value={state.socials.linkedin}
                          onChange={(e) => updateSocial('linkedin', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>

                      <div className="flex items-center bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden">
                        <span className="px-3 text-slate-400"><Youtube className="w-4 h-4 text-red-500" /></span>
                        <input 
                          type="text" 
                          placeholder="youtube.com/c/channel" 
                          value={state.socials.youtube}
                          onChange={(e) => updateSocial('youtube', e.target.value)}
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  {renderNavigationButtons('max-w-xl')}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in" id="step-5-audience">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
                    <Users className="w-3 h-3" /> Demographics
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Map target audience
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    Identify your consumer core to align content tone and design priorities.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Age Demographic</label>
                    <select 
                      value={state.ageRange}
                      onChange={(e) => updateState({ ageRange: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-cyan-500 outline-none"
                    >
                      <option value="15-24">Gen Z (15-24 yrs)</option>
                      <option value="25-45">Millennials (25-45 yrs)</option>
                      <option value="46-60">Gen X (46-60 yrs)</option>
                      <option value="60+">Seniors (60+ yrs)</option>
                      <option value="All">All ages / Broad Audience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Target Location / Region</label>
                    <input 
                      type="text" 
                      placeholder="e.g. United States, North America" 
                      value={state.audienceLocation}
                      onChange={(e) => updateState({ audienceLocation: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Target Audience Language</label>
                    <input 
                      type="text" 
                      placeholder="e.g. English, Bilingual" 
                      value={state.audienceLanguage}
                      onChange={(e) => updateState({ audienceLanguage: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Interests & Key terms</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type interest and press enter" 
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                        className="flex-1 px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-cyan-500 outline-none text-sm transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={addInterest} 
                        className="px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {state.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 p-2 bg-slate-900/20 border border-slate-800/50 rounded-lg">
                        {state.interests.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/25 text-cyan-300 rounded text-xs">
                            {tag}
                            <button type="button" onClick={() => removeInterest(tag)} className="hover:text-rose-400 text-[10px]">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderNavigationButtons('max-w-md')}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in" id="step-6-vibe">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                    <Sparkles className="w-3 h-3" /> Core Expression
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Choose the design vibe <span className="text-rose-500">*</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    This selection controls the entire visual composition, grids, and style.
                  </p>
                </div>

                <div className="space-y-3 max-w-lg">
                  {VIBES.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => updateState({ vibe: v.id as OnboardingState['vibe'] })}
                      className={`group p-4 rounded-xl border cursor-pointer bg-gradient-to-r transition-all duration-300 relative ${v.bg} ${v.border} ${
                        state.vibe === v.id 
                          ? 'border-cyan-500 ring-1 ring-cyan-500/30 translate-x-1' 
                          : 'hover:border-slate-700 hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-display font-semibold text-slate-100">{v.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-md">{v.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          state.vibe === v.id ? 'bg-cyan-500 border-cyan-500 text-slate-950 scale-110' : 'border-slate-700'
                        }`}>
                          {state.vibe === v.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderNavigationButtons('max-w-lg')}
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 animate-fade-in" id="step-7-build">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
                    <Layers className="w-3 h-3" /> Project Creation Mode
                  </div>
                  <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-100">
                    Choose how to build your project <span className="text-rose-500">*</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md">
                    Select a method to generate your website layout and pages.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mt-4">
                  {/* Option 1: AI */}
                  <div
                    onClick={() => updateState({ buildMode: 'AI' })}
                    className={`p-5 rounded-xl border cursor-pointer bg-slate-900/30 flex flex-col justify-between transition-all duration-300 min-h-[170px] ${
                      state.buildMode === 'AI'
                        ? 'border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/35 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-slate-100">AI Generator</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Use AI to design your layouts, generate pages, and write initial code automatically.
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Recommended</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        state.buildMode === 'AI' ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {state.buildMode === 'AI' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Blocks */}
                  <div
                    onClick={() => updateState({ buildMode: 'Blocks' })}
                    className={`p-5 rounded-xl border cursor-pointer bg-slate-900/30 flex flex-col justify-between transition-all duration-300 min-h-[170px] ${
                      state.buildMode === 'Blocks'
                        ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/35 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                        <Layers className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-display font-bold text-slate-100">Block Builder</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Build your project manually by inserting pre-configured layout sections.
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">Standard Block</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        state.buildMode === 'Blocks' ? 'bg-purple-500 border-purple-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {state.buildMode === 'Blocks' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl max-w-lg">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ⚙️ <strong className="text-slate-300 font-medium">Project Setup:</strong> The editor will pre-configure your files, folders, and components automatically based on the chosen method.
                  </p>
                </div>
                {renderNavigationButtons('max-w-lg')}
              </div>
            )}
          </div>

          </div>
        </div>

        {/* Right Side Panel: Tri Mascot Interaction Panel */}
        <div className="hidden lg:flex lg:w-[360px] xl:w-[400px] flex-col justify-center items-center relative overflow-hidden bg-slate-900/10 rounded-2xl border border-slate-800/20 p-6 md:p-8">
          {/* Subtle background glow */}
          <div className="absolute w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none -bottom-10" />
          
          <div className="w-full max-w-xs relative z-10 flex flex-col items-center justify-center">
            <TriMascot 
              expression={getTriMascotProps().expression} 
              speechText={getTriMascotProps().speechText} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
