import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Archive, 
  FolderOpen, 
  Sparkles, 
  Plus, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal,
  FolderArchive,
  Terminal,
  Activity,
  Award,
  User as UserIcon,
  Settings,
  LogOut,
  X,
  Shield,
  Sliders
} from 'lucide-react';
import { Project, User, TriExpression } from '../types';
import TriMascot from './TriMascot';

interface ProjectHistoryViewProps {
  user: User;
  projects: Project[];
  onBackToDashboard: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (updated: Project) => void;
  onNewProject: () => void;
}

export default function ProjectHistoryView({
  user,
  projects,
  onBackToDashboard,
  onSelectProject,
  onDeleteProject,
  onUpdateProject,
  onNewProject
}: ProjectHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [triHoveredState, setTriHoveredState] = useState<TriExpression | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'profile' | 'settings'>('none');

  // Statistics
  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const archivedCount = projects.filter(p => p.status === 'archived').length;

  // Filter projects based on search query & status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'active') return matchesSearch && project.status === 'active';
    if (statusFilter === 'archived') return matchesSearch && project.status === 'archived';
    return matchesSearch;
  });

  const toggleArchiveProject = (project: Project) => {
    const updatedStatus = project.status === 'archived' ? 'active' : 'archived';
    onUpdateProject({
      ...project,
      status: updatedStatus,
      lastUpdated: 'Just now'
    });
  };

  // Tri Mascot states & comments
  const expression: TriExpression = triHoveredState || (searchQuery ? 'thinking' : 'idle');
  const speech = searchQuery 
    ? `Searching registry for "${searchQuery}"... Found ${filteredProjects.length} matches.` 
    : 'Welcome to your central project registry! You can edit, archive, or completely purge synthesized blueprints.';

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden" id="project-history-root">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-mono cursor-pointer"
            id="history-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Console</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800" />
          
          <div className="flex flex-col">
            <h1 className="text-xs md:text-sm font-semibold tracking-wide text-slate-200">Synthesis History</h1>
            <p className="text-[10px] text-slate-500 font-mono hidden sm:inline">PROJECT REGISTRY & DEPLOYMENTS</p>
          </div>
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 text-slate-950 font-bold text-xs flex items-center justify-center border border-cyan-300/60 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              {initialLetter}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 pr-1">
              {user.name}
            </span>
          </button>

          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              
              <div className="absolute right-0 top-12 w-60 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 font-sans animate-in fade-in duration-150">
                <div className="p-3 border-b border-slate-900 mb-1">
                  <div className="text-xs font-bold text-slate-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveModal('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <UserIcon className="w-4 h-4 text-cyan-400" />
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
                  <span>Settings</span>
                </button>

                <div className="h-[1px] bg-slate-900 my-1" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onBackToDashboard();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit to Dashboard</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Filter Controls & Single Row Projects Carousel */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 font-display">Recent Projects</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Single-row workspace snapshots ({filteredProjects.length} total)</p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 gap-1">
                {(['all', 'active', 'archived'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-slate-900 text-cyan-400 border border-slate-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search projects, technologies, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 text-slate-300 font-sans"
              />
            </div>

            {/* SINGLE COLUMN VERTICAL SCROLLABLE LIST */}
            <div className="relative">
              {filteredProjects.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-900 rounded-3xl bg-slate-950/40">
                  <FolderArchive className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-sans font-medium">No projects found</p>
                  <p className="text-xs text-slate-600 font-mono mt-1">Try resetting filters or search query.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-slate-900/40">
                  {filteredProjects.map((project) => {
                    const isArchived = project.status === 'archived';
                    return (
                      <div
                        key={project.id}
                        className={`group w-full flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border ${
                          isArchived 
                            ? 'border-purple-950/40 bg-purple-950/[0.04] opacity-75 hover:opacity-100 hover:border-purple-500/30' 
                            : 'border-slate-800/80 bg-slate-900/30 hover:border-cyan-500/30 hover:bg-slate-900/60'
                        } p-4 transition-all duration-300 shadow-md`}
                      >
                        {/* Status & Project Name */}
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isArchived ? 'bg-purple-500' : 'bg-emerald-400 animate-pulse'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors font-display">
                                {project.name}
                              </h4>
                              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${isArchived ? 'bg-purple-950/50 text-purple-400' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-sans line-clamp-1 mt-0.5">
                              {project.tagline || 'No tagline specified.'}
                            </p>
                          </div>
                        </div>

                        {/* Tech stack badges */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {project.stack?.map((tech, i) => (
                            <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Actions & Timestamp */}
                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-800/60 pt-2 md:pt-0">
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {project.lastUpdated}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleArchiveProject(project)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/30 hover:text-purple-400 text-slate-400 transition-all cursor-pointer"
                              title={isArchived ? 'Restore' : 'Archive'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectProject(project.id)}
                              className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-sans text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer"
                            >
                              <span>Launch</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TriMascot Panel & Summary Statistics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* TriMascot Card */}
            <div className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-wider uppercase border border-cyan-500/20 font-semibold">
                AI Assistant Tri
              </span>

              <div className="drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <TriMascot expression={expression} size="sm" />
              </div>

              <div className="space-y-1.5 z-10">
                <h3 className="text-base font-bold text-slate-200 font-display">
                  Synthesis Assistant
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {speech}
                </p>
              </div>
            </div>

            {/* Quick Metrics Panel */}
            <div className="bg-slate-900/15 border border-slate-900 rounded-3xl p-6 space-y-5 shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                Blueprints Overview
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 text-[10px] font-mono uppercase">Total</span>
                  <span className="text-2xl font-bold text-slate-200 font-mono mt-1">{totalProjects}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-emerald-500/80 text-[10px] font-mono uppercase">Active</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1">{activeCount}</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 text-[10px] font-mono uppercase">Saved</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono mt-1">{archivedCount}</span>
                </div>
              </div>

              <button
                onClick={onNewProject}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Synthesize New App
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
