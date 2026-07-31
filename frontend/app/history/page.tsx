'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import { 
  History, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Edit3, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Folder,
} from 'lucide-react';
import TriMascot from '@/components/TriMascot';

interface SiteItem {
  id?: string;
  siteId?: string;
  name?: string;
  slug?: string;
  status: 'Draft' | 'Published' | 'Archived';
  blocks?: any[];
  globalSettings?: any;
  updatedAt?: string;
}

interface VersionItem {
  id?: string;
  versionId?: string;
  versionNumber?: number;
  commitMessage?: string;
  message?: string;
  createdAt?: string;
  createdBy?: string;
}

export default function ProjectHistoryPage() {
  const router = useRouter();

  // Core States
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Drafts' | 'Archived'>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Row Expand & Version History State
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [versionsMap, setVersionsMap] = useState<Record<string, VersionItem[]>>({});
  const [loadingVersionsId, setLoadingVersionsId] = useState<string | null>(null);

  // Action Loading & Confirmation States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 1. ON MOUNT — load all sites
  useEffect(() => {
    async function loadSites() {
      // Auth guard check
      try {
        await client.users.getMe();
      } catch {
        router.push('/login');
        return;
      }

      setLoading(true);
      setErrorMessage('');
      try {
        const data = await client.sites.getAll();
        setSites(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setErrorMessage('Could not load projects. Try again.');
      } finally {
        setLoading(false);
      }
    }

    loadSites();
  }, [router]);

  // 2. TAB FILTERING (Client-side)
  const filteredSites = sites.filter((site) => {
    if (activeTab === 'Active') return site.status === 'Published';
    if (activeTab === 'Drafts') return site.status === 'Draft';
    if (activeTab === 'Archived') return site.status === 'Archived';
    return true; // 'All'
  });

  // 3. VERSION HISTORY — on project row expand
  const handleToggleExpand = async (site: SiteItem) => {
    const sId = site.siteId || site.id;
    if (!sId) return;

    if (expandedSiteId === sId) {
      setExpandedSiteId(null);
      return;
    }

    setExpandedSiteId(sId);

    // Fetch versions if not already loaded
    if (!versionsMap[sId]) {
      setLoadingVersionsId(sId);
      try {
        const versions = await client.sites.getVersions(sId);
        setVersionsMap((prev) => ({
          ...prev,
          [sId]: Array.isArray(versions) ? versions : [],
        }));
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Could not load version history.';
        setErrorMessage(msg);
      } finally {
        setLoadingVersionsId(null);
      }
    }
  };

  // 4. ACTION BUTTON HANDLERS
  const handleRestoreVersion = async (siteId: string, versionId: string) => {
    setActionLoadingId(`restore-${versionId}`);
    setErrorMessage('');
    try {
      await client.sites.restoreVersion(siteId, versionId);
      setToastMessage('Version restored successfully!');
      // Reload sites list
      const updatedSites = await client.sites.getAll();
      setSites(Array.isArray(updatedSites) ? updatedSites : []);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to restore version.';
      setErrorMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePermanently = async (siteId: string) => {
    setActionLoadingId(`delete-${siteId}`);
    setErrorMessage('');
    try {
      await client.sites.delete(siteId);
      setSites((prev) => prev.filter((s) => (s.siteId || s.id) !== siteId));
      setDeleteConfirmId(null);
      setToastMessage('Project permanently deleted.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete project.';
      setErrorMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicate = async (siteId: string) => {
    setActionLoadingId(`clone-${siteId}`);
    setErrorMessage('');
    try {
      const clonedSite = await client.sites.clone(siteId);
      if (clonedSite) {
        setSites((prev) => [clonedSite as SiteItem, ...prev]);
        setToastMessage('Project duplicated successfully!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to duplicate project.';
      setErrorMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (siteId: string) => {
    setActionLoadingId(`archive-${siteId}`);
    setErrorMessage('');
    try {
      await client.sites.update(siteId, { status: 'Archived' });
      setSites((prev) =>
        prev.map((s) => ((s.siteId || s.id) === siteId ? { ...s, status: 'Archived' } : s))
      );
      setToastMessage('Project archived.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to archive project.';
      setErrorMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnarchive = async (siteId: string) => {
    setActionLoadingId(`unarchive-${siteId}`);
    setErrorMessage('');
    try {
      await client.sites.update(siteId, { status: 'Draft' });
      setSites((prev) =>
        prev.map((s) => ((s.siteId || s.id) === siteId ? { ...s, status: 'Draft' } : s))
      );
      setToastMessage('Project unarchived into Drafts.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to unarchive project.';
      setErrorMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenInBuilder = (siteId: string) => {
    localStorage.setItem('activeSiteId', siteId);
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-6 relative font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto z-10 py-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-base font-display cursor-pointer"
          >
            T
          </div>
          <div>
            <h1 className="text-sm font-display font-extrabold text-white tracking-wider uppercase">
              Project History & Archives
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Track project snapshots, versions, and archived workspaces
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-mono text-cyan-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:text-white transition-all cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="max-w-6xl w-full mx-auto my-3 z-20">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white font-mono">✕</button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="max-w-6xl w-full mx-auto my-3 z-20">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-slate-400 hover:text-white font-mono">✕</button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto my-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Projects List in a Single Row */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 2. TAB FILTERING */}
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 overflow-x-auto">
              {(['All', 'Active', 'Drafts', 'Archived'] as const).map((tab) => {
                const count = sites.filter((s) => {
                  if (tab === 'Active') return s.status === 'Published';
                  if (tab === 'Drafts') return s.status === 'Draft';
                  if (tab === 'Archived') return s.status === 'Archived';
                  return true;
                }).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-mono px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900'
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* 5. LOADING STATE */}
            {loading ? (
              <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading projects & archives...</p>
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
                <Folder className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No projects found in {activeTab}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your saved snapshots and archived projects will be listed here.
                </p>
              </div>
            ) : (
              /* SINGLE COLUMN VERTICAL SCROLLABLE PROJECT LIST */
              <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-slate-900">
                {filteredSites.map((site) => {
                  const sId = site.siteId || site.id || '';
                  const isExpanded = expandedSiteId === sId;
                  const versions = versionsMap[sId] || [];
                  const isVersionsLoading = loadingVersionsId === sId;

                  return (
                    <div
                      key={sId || Math.random()}
                      className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Row Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100 font-display line-clamp-1">
                            {site.name || site.slug || 'Untitled Project'}
                          </h3>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                              site.status === 'Published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : site.status === 'Archived'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {site.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleOpenInBuilder(sId)}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Builder</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(sId)}
                          disabled={actionLoadingId === `clone-${sId}`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Clone</span>
                        </button>

                        {site.status === 'Archived' ? (
                          <button
                            onClick={() => handleUnarchive(sId)}
                            disabled={actionLoadingId === `unarchive-${sId}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(sId)}
                            disabled={actionLoadingId === `archive-${sId}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePermanently(sId)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TriMascot & Information Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center space-y-4 shadow-xl">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-wider uppercase border border-cyan-500/20 font-semibold">
                AI Assistant Tri
              </span>

              <div className="drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <TriMascot expression="idle" size="sm" />
              </div>

              <div className="space-y-1.5 z-10">
                <h3 className="text-base font-bold text-slate-200 font-display">
                  Project Registry
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track, restore, or edit your saved workspace snapshots.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto z-10 text-center text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-900">
        Tridop AI Studio • Project History & Version Control
      </footer>
    </div>
  );
}
