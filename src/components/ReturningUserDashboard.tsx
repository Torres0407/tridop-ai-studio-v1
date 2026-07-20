import React, { useState } from 'react';
import { motion } from 'motion/react';
import TriMascot from './TriMascot';
import Typewriter from './Typewriter';
import { TriExpression, User as UserType, Project } from '../types';
import { 
  FolderPlus, 
  Play, 
  History, 
  ChevronRight, 
  GitBranch, 
  Server, 
  Sparkles,
  Wand2,
  Trash2,
  User,
  Settings,
  LogOut,
  X,
  Shield,
  Sliders
} from 'lucide-react';

interface ReturningUserDashboardProps {
  user: UserType;
  projects: Project[];
  onLogout: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onContinueProject: () => void;
  onNewProject: () => void;
  onViewHistory: () => void;
}

export default function ReturningUserDashboard({ 
  user, 
  projects, 
  onLogout, 
  onSelectProject, 
  onDeleteProject, 
  onContinueProject, 
  onNewProject,
  onViewHistory
}: ReturningUserDashboardProps) {
  const [hoveredButton, setHoveredButton] = useState<null | 'new' | 'continue' | 'recent' | 'prompt'>(null);
  const [promptText, setPromptText] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'profile' | 'settings'>('none');
  
  // Determine Tri's current state based on button hovering
  let triExpression: TriExpression = 'idle';
  let triSpeech = 'Welcome back!';

  if (hoveredButton === 'new') {
    triExpression = 'excited';
    triSpeech = 'Ready to create?';
  } else if (hoveredButton === 'continue') {
    triExpression = 'thinking';
    triSpeech = 'Loading your workspace...';
  } else if (hoveredButton === 'recent') {
    triExpression = 'talking';
    triSpeech = 'Here are your latest builds.';
  } else if (hoveredButton === 'prompt') {
    triExpression = 'excited';
    triSpeech = 'Describe your dream site!';
  } else if (promptText.length > 5) {
    triExpression = 'thinking';
    triSpeech = 'Synthesizing layout ideas...';
  }

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      localStorage.setItem('initialPrompt', promptText);
      onNewProject();
    }
  };

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative px-4 md:px-12 lg:px-24 py-6 md:py-8 z-10 overflow-y-auto">
      
      {/* Top Header Row inside Dashboard */}
      <div className="w-full flex justify-between items-center mb-6 md:mb-8 select-none">
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Tridop <span className="text-white font-light">Console</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono tracking-widest uppercase border border-purple-500/20">
            Developer Space
          </span>
        </div>
        
        {/* User Avatar Chip & Interactive Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="group flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg"
            id="user-profile-menu-button"
            title="Account Menu"
          >
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 text-slate-950 font-bold text-sm flex items-center justify-center border border-cyan-300/60 shadow-[0_0_12px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-all">
              {initialLetter}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 pr-1">
              {user.name}
            </span>
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              
              <div className="absolute right-0 top-12 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 font-sans animate-in fade-in duration-150">
                {/* Profile Header */}
                <div className="p-3 border-b border-slate-900/80 mb-1">
                  <div className="text-xs font-bold text-slate-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">Active Workspace</span>
                  </div>
                </div>

                {/* Dropdown Actions */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveModal('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Profile Overview</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveModal('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-purple-400 hover:bg-slate-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Studio Settings</span>
                </button>

                <div className="h-[1px] bg-slate-900 my-1" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Responsive Grid Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center max-w-7xl mx-auto w-full">
        
        {/* Left Side: Refined Greeting, Prompt Input, and Navigation Actions */}
        <div className="lg:col-span-7 space-y-5 md:space-y-6 flex flex-col justify-center">
          
          {/* Greeting Header */}
          <div className="space-y-1 text-left">
            <div className="text-[10px] md:text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Authenticated Session
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 font-display tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user.name}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed">
              Enter your project prompt below or select a workspace action to get started.
            </p>
          </div>

          {/* AI Prompt Input Box (Mobile Optimized) */}
          <div 
            onMouseEnter={() => setHoveredButton('prompt')}
            onMouseLeave={() => setHoveredButton(null)}
            className="space-y-2.5 font-sans"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Build with AI Prompt
              </label>
              <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Instant Generation
              </span>
            </div>

            <form 
              onSubmit={handlePromptSubmit}
              className="relative flex flex-col gap-3 p-3.5 md:p-4 bg-slate-900/40 border border-slate-800 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 rounded-2xl transition-all shadow-xl"
            >
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe the website you want to build (e.g., 'A modern SaaS landing page for an AI photography startup with dark mode, pricing grid, and lead capture form')..."
                rows={3}
                className="w-full bg-transparent text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                {/* Horizontal Scrollable Presets on Mobile */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {['SaaS Landing Page', 'Portfolio & Blog', 'E-Commerce Store', 'Restaurant'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPromptText(`Create a modern ${preset.toLowerCase()} with a sleek dark theme, dynamic components, and responsive layout.`)}
                      className="text-[10px] font-mono text-slate-400 bg-slate-950 hover:bg-slate-800 hover:text-cyan-400 px-2.5 py-1 rounded-lg border border-slate-800 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer shrink-0"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Website</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Action Navigation Grid (Mobile Responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-1">
            <button
              onMouseEnter={() => setHoveredButton('new')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onNewProject}
              className="group interactive-chip p-4 rounded-2xl glass-panel-neon-cyan hover:scale-[1.02] text-left transition-all duration-300 flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 min-h-[70px] sm:min-h-[120px] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/25 shrink-0">
                <FolderPlus className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-display font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  New Studio
                </h4>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Start custom synthesis</p>
              </div>
            </button>

            <button
              onMouseEnter={() => setHoveredButton('continue')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onContinueProject}
              className="group interactive-chip p-4 rounded-2xl glass-panel-neon-purple hover:scale-[1.02] text-left transition-all duration-300 flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 min-h-[70px] sm:min-h-[120px] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 border border-purple-500/25 shrink-0">
                <Play className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-display font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Continue Workspace
                </h4>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Jump to last build</p>
              </div>
            </button>

            <button
              onMouseEnter={() => setHoveredButton('recent')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onViewHistory}
              className="group interactive-chip p-4 rounded-2xl glass-panel hover:border-slate-700 hover:scale-[1.02] text-left transition-all duration-300 flex sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3 sm:gap-0 min-h-[70px] sm:min-h-[120px] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-700/50 shrink-0">
                <History className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-display font-semibold text-slate-100 group-hover:text-slate-300 transition-colors">
                  Project Registry
                </h4>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">Browse past builds</p>
              </div>
            </button>
          </div>

        </div>

        {/* Right Side: Dynamic Tri Mascot */}
        <div className="lg:col-span-5 flex justify-center items-center py-4 md:py-0">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/10 blur-[90px] rounded-full scale-125 pointer-events-none" />
            <div className="absolute inset-0 bg-purple-500/10 blur-[110px] rounded-full scale-105 pointer-events-none" />

            <TriMascot 
              expression={triExpression} 
              speechText={triSpeech} 
              size="lg"
            />
          </div>
        </div>

      </div>

      {/* Footer statistics bar */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-6 md:mt-8 border-t border-slate-900 pt-4 text-[10px] md:text-[11px] text-slate-500 font-mono gap-2 sm:gap-3 select-none">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Server Load: 12.4%
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Branch: production
          </span>
        </div>
        <span>Connected to Tridop cluster cloud-west2-a</span>
      </div>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800/80 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 text-slate-950 font-bold text-xl flex items-center justify-center border-2 border-cyan-400/50 shadow-lg">
                {initialLetter}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">{user.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                  Developer Account
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> Authentication
                </span>
                <span className="text-slate-200 font-mono">OAuth 2.0 / JWT</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-cyan-400" /> Tier
                </span>
                <span className="text-emerald-400 font-mono font-semibold">Pro Unlimited</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal('none')}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Studio Settings</h3>
                <p className="text-xs text-slate-400">Configure your synthesis environment</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <div className="font-semibold text-slate-200">AI Layout Engine</div>
                  <div className="text-[10px] text-slate-500">Auto-generate component variants</div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <div className="font-semibold text-slate-200">Default Tech Stack</div>
                  <div className="text-[10px] text-slate-500">TailwindCSS, React, Vite</div>
                </div>
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 font-mono text-[10px]">Vite+React</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer mt-2"
            >
              Save & Apply
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
