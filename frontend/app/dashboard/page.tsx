'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Archive, 
  Edit3, 
  LogOut, 
  Bell, 
  Cpu, 
  Globe, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Folder
} from 'lucide-react';

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

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [user, setUser] = useState<any>(null);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [quota, setQuota] = useState<{ usage?: number; limit?: number; current?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Published' | 'Draft' | 'Archived'>('All');
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // 1. ON MOUNT — load all dashboard data in parallel & check auth guard
  useEffect(() => {
    let unsubscribeStream: (() => void) | null = null;

    async function loadDashboardData() {
      try {
        const [userData, sitesData, quotaData] = await Promise.all([
          client.users.getMe(),
          client.sites.getAll(),
          client.ai.getQuota(),
        ]);

        setUser(userData);
        setSites(Array.isArray(sitesData) ? sitesData : []);
        setQuota(quotaData);
      } catch (err) {
        // Protected route — redirect to /login on failure
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();

    // 6. REAL-TIME NOTIFICATIONS
    try {
      unsubscribeStream = client.notifications.stream({
        onMessage: (msgString: string) => {
          try {
            const parsed = JSON.parse(msgString);
            const text = typeof parsed === 'string' ? parsed : parsed?.message || parsed?.text || 'System notification received';
            setNotifications((prev) => [
              { id: String(Date.now()), text, time: 'Just now' },
              ...prev,
            ]);
          } catch {
            setNotifications((prev) => [
              { id: String(Date.now()), text: msgString, time: 'Just now' },
              ...prev,
            ]);
          }
        },
        onError: () => {
          // Handle stream errors silently — do not crash the page
        },
      });
    } catch {
      // Handle stream errors silently
    }

    return () => {
      if (unsubscribeStream) unsubscribeStream();
    };
  }, [router]);

  // 2. PROJECT FEED FILTERING
  const filteredSites = sites.filter((s) => {
    if (activeTab === 'Published') return s.status === 'Published';
    if (activeTab === 'Draft') return s.status === 'Draft';
    if (activeTab === 'Archived') return s.status === 'Archived';
    return true; // 'All'
  });

  // 3. PROJECT CARD ACTIONS
  const handleEdit = (site: SiteItem) => {
    const sId = site.siteId || site.id;
    if (sId) {
      localStorage.setItem('activeSiteId', sId);
      router.push('/builder');
    }
  };

  const handleClone = async (site: SiteItem) => {
    const sId = site.siteId || site.id;
    if (!sId) return;
    setActionLoadingId(sId);
    try {
      const clonedSite = await client.sites.clone(sId);
      if (clonedSite) {
        setSites((prev) => [clonedSite as SiteItem, ...prev]);
      }
    } catch (err) {
      // Silent catch or fallback
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (site: SiteItem) => {
    const sId = site.siteId || site.id;
    if (!sId) return;
    setActionLoadingId(sId);
    try {
      await client.sites.delete(sId);
      setSites((prev) => prev.filter((s) => (s.siteId || s.id) !== sId));
    } catch (err) {
      // Silent catch
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (site: SiteItem) => {
    const sId = site.siteId || site.id;
    if (!sId) return;
    setActionLoadingId(sId);
    try {
      const updated = await client.sites.update(sId, { status: 'Archived' });
      setSites((prev) =>
        prev.map((s) => ((s.siteId || s.id) === sId ? { ...s, status: 'Archived' } : s))
      );
    } catch (err) {
      // Silent catch
    } finally {
      setActionLoadingId(null);
    }
  };

  // 7. LOGOUT
  const handleLogout = async () => {
    try {
      await client.auth.logout();
    } catch {
      // Continue redirect
    } finally {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Tridop Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-6 relative font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto z-10 py-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-base font-display">
            T
          </div>
          <div>
            <h1 className="text-sm font-display font-extrabold text-white tracking-wider uppercase">
              Tridop Studio
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Developer'}
            </p>
          </div>
        </div>

        {/* 4. AI QUOTA BADGE & Top Controls */}
        <div className="flex items-center gap-4">
          {quota && (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">AI Quota:</span>
              <span className="text-cyan-400 font-bold">
                {quota.usage ?? quota.current ?? 0} / {quota.limit ?? 100}
              </span>
            </div>
          )}

          {/* 7. LOGOUT Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-6xl w-full mx-auto my-6 z-10 space-y-6">
        {/* Header Bar with 5. NEW PROJECT BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Your Projects</h2>
            <p className="text-xs text-slate-400">Manage and deploy your web applications.</p>
          </div>

          <button
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* 2. FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          {(['All', 'Published', 'Draft', 'Archived'] as const).map((tab) => {
            const count = sites.filter((s) => {
              if (tab === 'Published') return s.status === 'Published';
              if (tab === 'Draft') return s.status === 'Draft';
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

        {/* 2. PROJECT FEED GRID */}
        {filteredSites.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <Folder className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No {activeTab.toLowerCase()} projects found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a new project using the onboarding wizard to populate your dashboard workspace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSites.map((site) => {
              const siteId = site.siteId || site.id || '';
              const isLoadingThis = actionLoadingId === siteId;

              return (
                <div
                  key={siteId || Math.random()}
                  className="p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4 shadow-lg"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                          site.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : site.status === 'Archived'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {site.status || 'Draft'}
                      </span>
                      <Globe className="w-4 h-4 text-slate-500" />
                    </div>

                    <h3 className="text-base font-bold text-slate-100 font-display">
                      {site.name || site.slug || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      slug: {site.slug || siteId.substring(0, 8)}
                    </p>
                  </div>

                  {/* 3. PROJECT CARD ACTIONS */}
                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-1">
                    <button
                      onClick={() => handleEdit(site)}
                      disabled={isLoadingThis}
                      className="flex-1 py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleClone(site)}
                      disabled={isLoadingThis}
                      title="Duplicate"
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleArchive(site)}
                      disabled={isLoadingThis}
                      title="Archive"
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-all cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(site)}
                      disabled={isLoadingThis}
                      title="Delete"
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. REAL-TIME NOTIFICATIONS AREA */}
        {notifications.length > 0 && (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Real-Time Notifications Stream</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between text-xs text-slate-300 font-mono">
                  <span>{n.text}</span>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto z-10 text-center text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-900">
        Tridop AI Studio Dashboard • Protected Session
      </footer>
    </div>
  );
}
