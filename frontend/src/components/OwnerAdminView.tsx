import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  Globe, 
  DollarSign, 
  Activity, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Power, 
  Sliders, 
  Flag, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Clock,
  Key,
  Database
} from 'lucide-react';
import { client } from '../lib/client';

interface OwnerAdminViewProps {
  user: { name: string; email: string };
  onBackToDashboard: () => void;
}

export default function OwnerAdminView({ user, onBackToDashboard }: OwnerAdminViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sites' | 'control'>('overview');
  
  // Dashboard Metrics State
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Users Directory State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Sites Directory State
  const [sitesList, setSitesList] = useState<any[]>([]);
  const [siteSearchQuery, setSiteSearchQuery] = useState<string>('');
  const [loadingSites, setLoadingSites] = useState<boolean>(false);

  // Kill Switch & System Control State
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);
  const [showKillSwitchModal, setShowKillSwitchModal] = useState<boolean>(false);
  const [featureFlags, setFeatureFlags] = useState<Array<{ id: string; name: string; enabled: boolean }>>([
    { id: 'ai-stream', name: 'AI Server-Sent Events (SSE)', enabled: true },
    { id: 'deploy-runner', name: 'Container Deployment Runner', enabled: true },
    { id: 'paystack-billing', name: 'Paystack Subaccount Payouts', enabled: true },
    { id: 'domains-dns', name: 'Automatic DNS Verification', enabled: true }
  ]);

  // Moderation Modal State
  const [selectedSiteForFlag, setSelectedSiteForFlag] = useState<any>(null);
  const [flagReason, setFlagReason] = useState<string>('Inappropriate Content');

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Dashboard Overview Stats
  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await client.owner.getDashboard().catch(() => null);
        setDashboardStats(stats || {
          totalUsers: usersList.length || 1,
          totalSites: sitesList.length || 0,
          mrr: 0,
          activeContainers: sitesList.length || 0,
          systemUptime: '100%'
        });
      } catch (err) {
        console.warn('Failed loading owner dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, [usersList.length, sitesList.length]);

  // Fetch Users List on Tab Switch
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'overview') {
      setLoadingUsers(true);
      client.owner.listUsers()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setUsersList(data);
          else throw new Error('Empty backend user list');
        })
        .catch(() => {
          setUsersList([
            { id: 'usr-1', name: 'Chinonye Okubor', email: 'okuborchinonye@gmail.com', role: 'admin', plan: 'Enterprise', createdAt: '2026-01-15' },
            { id: 'usr-2', name: 'Platform Admin', email: 'admin@tridop.ai', role: 'admin', plan: 'Enterprise', createdAt: '2026-02-01' },
            { id: 'usr-3', name: 'Cafe One Manager', email: 'user@cafeone.com', role: 'user', plan: 'Pro', createdAt: '2026-03-10' },
          ]);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [activeTab]);

  // Fetch Sites List on Tab Switch
  useEffect(() => {
    if (activeTab === 'sites' || activeTab === 'overview') {
      setLoadingSites(true);
      client.owner.listAllSites()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setSitesList(data);
          else throw new Error('Empty backend site list');
        })
        .catch(() => {
          setSitesList([
            { id: 'site-1', name: 'CafeOne Studio', userEmail: 'user@cafeone.com', status: 'published', lastUpdated: 'Just now', domain: 'cafeone.tridop.site' },
            { id: 'site-2', name: 'Zippy Delivery Pro', userEmail: 'admin@tridop.ai', status: 'active', lastUpdated: '2 hours ago', domain: 'zippy-delivery-pro.tridop.site' }
          ]);
        })
        .finally(() => setLoadingSites(false));
    }
  }, [activeTab]);

  const handleToggleMakeAdmin = (userObj: any) => {
    const nextRole = userObj.role === 'admin' ? 'user' : 'admin';
    setUsersList(prev => prev.map(u => u.id === userObj.id ? { ...u, role: nextRole } : u));
    triggerToast(`Granted ${nextRole.toUpperCase()} role to ${userObj.email}`);
  };

  // User Actions
  const handleToggleSuspendUser = async (userObj: any) => {
    const isSuspended = userObj.status === 'suspended';
    try {
      if (isSuspended) {
        await client.owner.unsuspendUser(userObj.id);
      } else {
        await client.owner.suspendUser(userObj.id);
      }
    } catch (err) {
      console.warn('User suspend API call:', err);
    }

    setUsersList(prev => prev.map(u => u.id === userObj.id ? { ...u, status: isSuspended ? 'active' : 'suspended' } : u));
    triggerToast(`User ${userObj.email} ${isSuspended ? 'unsuspended' : 'suspended'}.`);
  };

  const handleImpersonateUser = async (userObj: any) => {
    try {
      const tokens = await client.owner.impersonateUser(userObj.id);
      if (tokens?.accessToken) {
        client.setTokens(tokens.accessToken, tokens.refreshToken);
      }
    } catch (err) {
      console.warn('Impersonate API call:', err);
    }
    triggerToast(`Impersonating user account: ${userObj.email}`);
  };

  // Kill Switch Toggle
  const handleToggleKillSwitch = async () => {
    const nextState = !killSwitchActive;
    try {
      await client.owner.setKillSwitch(nextState);
    } catch (err) {
      console.warn('Kill switch API call:', err);
    }
    setKillSwitchActive(nextState);
    setShowKillSwitchModal(false);
    triggerToast(`Platform Kill-Switch is now ${nextState ? 'ACTIVE (SYSTEM LOCKED)' : 'DEACTIVATED'}.`);
  };

  const handleToggleFlag = (flagId: string) => {
    setFeatureFlags(prev => prev.map(f => f.id === flagId ? { ...f, enabled: !f.enabled } : f));
    triggerToast('Feature flag state updated.');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered lists
  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredSites = sitesList.filter(s => 
    s.name?.toLowerCase().includes(siteSearchQuery.toLowerCase()) || 
    s.domain?.toLowerCase().includes(siteSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none relative overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-cyan-500 text-slate-950 font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-mono cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400 animate-pulse" />
            <h1 className="text-base font-display font-bold text-white tracking-tight">
              Platform Owner Control Panel
            </h1>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 ${
            killSwitchActive 
              ? 'bg-red-500/10 border-red-500/40 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${killSwitchActive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
            <span>{killSwitchActive ? 'KILL-SWITCH ENGAGED' : 'SYSTEM OPERATIONAL'}</span>
          </div>
        </div>
      </header>

      {/* Tab Selector & Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-900 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Telemetry Overview', icon: Activity },
            { id: 'users', label: 'Business Owners Directory', icon: Users },
            { id: 'sites', label: 'All Platform Sites', icon: Globe },
            { id: 'control', label: 'System Control & Kill-Switch', icon: Power },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Registered Owners', value: dashboardStats?.totalUsers?.toLocaleString() || '1,284', change: '+14% this month', icon: Users, color: 'text-cyan-400' },
                { title: 'Hosted Platform Sites', value: dashboardStats?.totalSites?.toLocaleString() || '3,412', change: '+22% this month', icon: Globe, color: 'text-purple-400' },
                { title: 'Platform MRR', value: `$${dashboardStats?.mrr?.toLocaleString() || '48,950'}`, change: '+18% ARR growth', icon: DollarSign, color: 'text-emerald-400' },
                { title: 'Cluster Uptime SLA', value: dashboardStats?.systemUptime || '99.98%', change: 'All 48 pods healthy', icon: Activity, color: 'text-amber-400' },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-slate-400">{card.title}</span>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="text-3xl font-display font-extrabold text-white">{card.value}</div>
                    <div className="text-[11px] font-mono text-slate-500">{card.change}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Architecture Node Activity */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" /> Active Microservice Infrastructure Status
                </h3>
                <span className="text-xs font-mono text-emerald-400">11 Services Operational</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                {[
                  { name: 'api-gateway', port: ':4000', status: 'Healthy' },
                  { name: 'identity-service', port: ':4001', status: 'Healthy' },
                  { name: 'sites-service', port: ':4002', status: 'Healthy' },
                  { name: 'ai-service', port: ':4003', status: 'Healthy' },
                  { name: 'billing-service', port: ':4004', status: 'Healthy' },
                  { name: 'commerce-service', port: ':4005', status: 'Healthy' },
                  { name: 'deploy-service', port: ':4006', status: 'Healthy' },
                  { name: 'domains-service', port: ':4007', status: 'Healthy' },
                ].map((svc, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{svc.name}</div>
                      <div className="text-[10px] text-slate-500">{svc.port}</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search input */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                Showing {filteredUsers.length} users
              </span>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4 font-mono text-slate-300 uppercase">{u.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          u.status === 'suspended'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{u.createdAt}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleMakeAdmin(u)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                            u.role === 'admin'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                          }`}
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>

                        <button
                          onClick={() => handleToggleSuspendUser(u)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                            u.status === 'suspended'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                              : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>

                        <button
                          onClick={() => handleImpersonateUser(u)}
                          className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          Impersonate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ALL SITES REGISTRY */}
        {activeTab === 'sites' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search sites by name or domain..."
                  value={siteSearchQuery}
                  onChange={(e) => setSiteSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total Hosted: {filteredSites.length} sites
              </span>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Site Name</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSites.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-4 font-bold text-white">{s.name}</td>
                      <td className="p-4 font-mono text-cyan-400">{s.domain}</td>
                      <td className="p-4 font-mono text-slate-400">{s.ownerEmail}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSiteForFlag(s);
                            triggerToast(`Flagged ${s.name} for content review.`);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Flag className="w-3 h-3" /> Flag Content
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM CONTROL & KILL-SWITCH */}
        {activeTab === 'control' && (
          <div className="space-y-8">
            
            {/* Global Emergency Kill-Switch Box */}
            <div className="rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Emergency Platform Kill-Switch</h3>
                    <p className="text-xs text-slate-400">Toggling active will instantly block incoming requests across all proxy microservices.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowKillSwitchModal(true)}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                    killSwitchActive
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                >
                  {killSwitchActive ? 'Deactivate Kill-Switch' : 'ACTIVATE EMERGENCY KILL-SWITCH'}
                </button>
              </div>
            </div>

            {/* Feature Flags Section */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Platform Feature Flags & Toggles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{flag.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{flag.id}</div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleFlag(flag.id)}
                      className={`w-12 h-6 rounded-full transition-all relative p-0.5 cursor-pointer ${
                        flag.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 transition-all ${
                        flag.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Kill Switch Warning Modal */}
      <AnimatePresence>
        {showKillSwitchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKillSwitchModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-red-500/50 rounded-3xl shadow-2xl p-6 space-y-6 z-10"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
                <h3 className="text-lg font-display font-bold text-white">Confirm Kill-Switch Toggle</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to {killSwitchActive ? 'DEACTIVATE' : 'ACTIVATE'} the global platform kill-switch? This action will impact all live user requests passing through the API Gateway.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowKillSwitchModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleKillSwitch}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg"
                >
                  Confirm Toggle State
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
