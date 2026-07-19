import React, { useState } from 'react';
import { motion } from 'motion/react';
import TriMascot from './TriMascot';
import Typewriter from './Typewriter';
import { TriExpression, User, Project } from '../types';
import { 
  FolderPlus, 
  Play, 
  History, 
  ChevronRight, 
  GitBranch, 
  Server, 
  ExternalLink,
  Cpu,
  Trash2
} from 'lucide-react';

interface ReturningUserDashboardProps {
  user: User;
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
  const [hoveredButton, setHoveredButton] = useState<null | 'new' | 'continue' | 'recent'>(null);
  
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
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative px-6 md:px-12 lg:px-24 py-8 z-10 overflow-y-auto">
      
      {/* Top Header Row inside Dashboard */}
      <div className="w-full flex justify-between items-center mb-10 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Tridop <span className="text-white font-light">Console</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono tracking-widest uppercase border border-purple-500/20">
            Developer Space
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium text-slate-200">{user.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="interactive-chip px-4 py-1.5 rounded-full border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-sans transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        
        {/* Left Side: Typewriter Greeting, Options and Recent builds */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <Typewriter 
              lines={[`Welcome back, ${user.name}`]} 
              speed={50} 
              delayBetweenLines={300} 
            />
            <p className="text-slate-400 text-lg md:text-xl font-light font-sans">
              What would you like to build today?
            </p>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onMouseEnter={() => setHoveredButton('new')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onNewProject}
              className="group interactive-chip p-5 rounded-2xl glass-panel-neon-cyan hover:scale-[1.02] text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/25">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-display font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  New Project
                </h4>
                <p className="text-xs text-slate-400 mt-1">Start custom synthesis</p>
              </div>
            </button>

            <button
              onMouseEnter={() => setHoveredButton('continue')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onContinueProject}
              className="group interactive-chip p-5 rounded-2xl glass-panel-neon-purple hover:scale-[1.02] text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 border border-purple-500/25">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-display font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Continue Project
                </h4>
                <p className="text-xs text-slate-400 mt-1">Jump to last workspace</p>
              </div>
            </button>

            <button
              onMouseEnter={() => setHoveredButton('recent')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onViewHistory}
              className="group interactive-chip p-5 rounded-2xl glass-panel hover:border-slate-700 hover:scale-[1.02] text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-700/50">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-display font-semibold text-slate-100 group-hover:text-slate-300 transition-colors">
                  Recent Projects
                </h4>
                <p className="text-xs text-slate-400 mt-1">Browse past history</p>
              </div>
            </button>
          </div>

          {/* Recent Builds List */}
          <div className="space-y-3 font-sans">
            <h5 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              Active Sandbox Deployments
            </h5>

            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="interactive-chip flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-slate-800/60 bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-700/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{project.name}</span>
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {project.stack.map((tech, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/5 px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-900 sm:border-0">
                    <span className="text-xs text-slate-500 font-mono">
                      Updated {project.lastUpdated}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => onDeleteProject(project.id)}
                        className="p-1.5 rounded-lg bg-slate-800/40 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-slate-800 hover:border-rose-500/20"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onSelectProject(project.id)}
                        className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/40"
                        title="Open in Builder"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center">
                  <p className="text-sm text-slate-500 font-mono">No synthesized builds found. Click "New Project" to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Large dynamic Tri Mascot reacting to cursor hover actions */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative">
            {/* Soft background light orb behind Tri */}
            <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] rounded-full scale-110 pointer-events-none" />
            <div className="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full scale-90 pointer-events-none" />

            <TriMascot 
              expression={triExpression} 
              speechText={triSpeech} 
            />
          </div>
        </div>

      </div>

      {/* Footer statistics bar */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-12 border-t border-slate-900 pt-6 text-[11px] text-slate-500 font-mono gap-3 select-none">
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

    </div>
  );
}
