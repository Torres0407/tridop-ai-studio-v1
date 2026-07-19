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
  Award
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

  // Statistics
  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'active').length;
  const archivedCount = projects.filter(p => p.status === 'archived').length;

  // Get all unique technologies used across all projects
  const allStackTechs = Array.from(
    new Set(projects.flatMap(p => p.stack || []))
  );

  const toggleArchiveProject = (project: Project) => {
    const updated: Project = {
      ...project,
      status: project.status === 'active' ? 'archived' : 'active',
      lastUpdated: 'Just now'
    };
    onUpdateProject(updated);
  };

  // Filter projects based on search query & status filter
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stack.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Tri Mascot states & comments
  let expression: TriExpression = 'idle';
  let speech = `I am tracking ${totalProjects} total synthesized environments in your secure workspace pipeline.`;

  if (triHoveredState) {
    expression = triHoveredState;
  } else if (searchQuery) {
    expression = 'thinking';
    speech = `Filtering our system cache for "${searchQuery}"... Found ${filteredProjects.length} matching deployments.`;
  } else if (statusFilter === 'archived') {
    expression = 'wink';
    speech = `Reviewing your ${archivedCount} archived blueprints. They are safe in cold storage and can be restored anytime!`;
  } else if (statusFilter === 'active') {
    expression = 'excited';
    speech = `We have ${activeCount} active sandboxes ready for custom front-end development!`;
  } else {
    expression = 'talking';
    speech = `Welcome to your central project registry! You can edit, archive, or completely purge synthesized blueprints.`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="project-history-root">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-mono"
            id="history-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Console</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800" />
          
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-wide text-slate-200">Synthesis History</h1>
            <p className="text-[10px] text-slate-500 font-mono hidden sm:inline">PROJECT REGISTRY & DEPLOYMENTS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-medium text-slate-300">{user.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(34,211,238,0.1)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Banner with Tri Mascot & Summary Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Tri Interactive Box */}
          <div className="lg:col-span-8 bg-slate-900/35 border border-slate-900 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="shrink-0 drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <TriMascot expression={expression} />
            </div>

            <div className="flex-1 space-y-3 z-10 text-center md:text-left">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-mono tracking-wider uppercase border border-cyan-500/20">
                AI Assistant Tri
              </span>
              <h2 className="text-lg font-medium text-slate-200 font-display">
                Synthesis Control Center
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                {speech}
              </p>
            </div>
          </div>

          {/* Quick Metrics Panel */}
          <div className="lg:col-span-4 bg-slate-900/15 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-4">
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
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Synthesize New App
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/10 border border-slate-900 p-4 rounded-2xl">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects, technologies, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 text-slate-300 font-sans"
            />
          </div>

          {/* Filter Actions */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Filter Chips */}
            <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  statusFilter === 'active' 
                    ? 'bg-slate-900 text-emerald-400 border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  statusFilter === 'archived' 
                    ? 'bg-slate-900 text-purple-400 border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Layout Toggle */}
            <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-slate-900 text-cyan-400' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-slate-900 text-cyan-400' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Project Layout */}
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div 
              layout
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project) => {
                const isArchived = project.status === 'archived';
                const blocksCount = project.blocks?.length || 0;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={project.id}
                    className={`group relative flex flex-col justify-between rounded-2xl border ${
                      isArchived 
                        ? 'border-purple-950/40 bg-purple-950/[0.02] opacity-75 hover:opacity-100 hover:border-purple-500/20' 
                        : 'border-slate-900 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/20'
                    } p-5 transition-all duration-300`}
                  >
                    {/* Top status indicator & actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isArchived ? 'bg-purple-500' : 'bg-emerald-400 animate-pulse'}`} />
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isArchived ? 'bg-purple-950/50 text-purple-400' : 'bg-slate-900 text-slate-400'}`}>
                          {project.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleArchiveProject(project)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-purple-500/30 hover:text-purple-400 text-slate-500 transition-all"
                          title={isArchived ? 'Restore to Active' : 'Move to Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-500 transition-all"
                          title="Purge Blueprint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Section: Project Name & Tagline */}
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {project.name}
                      </h4>
                      
                      {project.tagline && (
                        <p className="text-xs text-slate-400 font-sans line-clamp-2">
                          {project.tagline}
                        </p>
                      )}

                      {/* Tech stack badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.stack?.map((tech, i) => (
                          <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-900/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-slate-900/80 my-4" />

                    {/* Footer stats & open action */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-slate-500">LAST SAVED</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {project.lastUpdated}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectProject(project.id)}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 font-sans text-xs font-semibold flex items-center gap-1.5 border border-slate-700/50 hover:border-cyan-400 transition-all"
                      >
                        Launch
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              layout
              key="list"
              className="space-y-3"
            >
              {filteredProjects.map((project) => {
                const isArchived = project.status === 'archived';
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    key={project.id}
                    className={`group flex flex-col md:flex-row justify-between md:items-center p-4 rounded-xl border ${
                      isArchived 
                        ? 'border-purple-950/30 bg-purple-950/[0.01] opacity-80 hover:opacity-100 hover:border-purple-500/20' 
                        : 'border-slate-900 bg-slate-900/10 hover:border-slate-800'
                    } gap-4 transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isArchived ? 'bg-purple-500' : 'bg-emerald-400 animate-pulse'}`} />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {project.name}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block">
                          Status: {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-md hidden lg:block">
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {project.tagline || 'No tagline synthesized.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 md:justify-center">
                      {project.stack?.map((tech, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t border-slate-900/60 md:border-0">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.lastUpdated}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleArchiveProject(project)}
                          className="p-1.5 rounded bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 hover:text-purple-400 text-slate-500 transition-all"
                          title="Toggle Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-1.5 rounded bg-slate-900/60 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-500 transition-all"
                          title="Purge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectProject(project.id)}
                          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 font-sans text-xs font-semibold flex items-center gap-1 border border-slate-700/60 transition-all"
                        >
                          Launch
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {filteredProjects.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-16 border border-dashed border-slate-900 rounded-3xl"
            >
              <FolderArchive className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-sans font-medium">No blueprints matching your filters</p>
              <p className="text-xs text-slate-600 font-mono mt-1">Try broadening your search query or reset status filters.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
