'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/client';
import { 
  Sparkles, 
  Layers, 
  Settings, 
  Send, 
  Download, 
  Rocket, 
  History, 
  Save, 
  Image as ImageIcon, 
  FileText, 
  Wand2, 
  Search, 
  Globe, 
  Upload, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface BlockItem {
  id: string;
  type: string;
  data: Record<string, any>;
  version?: number;
}

export default function BuilderPage() {
  const router = useRouter();

  // Core State
  const [siteId, setSiteId] = useState<string>('');
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used?: number; limit?: number; remaining?: number } | null>(null);
  
  // Loading & Generation States
  const [isGeneratingSite, setIsGeneratingSite] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Copilot Bar States
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotOutput, setCopilotOutput] = useState<string>('');
  
  // Additional Copilot Action States
  const [selectedText, setSelectedText] = useState<string>('Welcome to our brand new workspace!');
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  const [imagePrompt, setImagePrompt] = useState<string>('Modern tech desk setup in midnight blue lighting');

  // Version Control States
  const [commitMessage, setCommitMessage] = useState<string>('Updated hero section');
  const [versionList, setVersionList] = useState<any[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);

  // Deploy States
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deploySuccess, setDeploySuccess] = useState<string>('');

  // Domain Search States
  const [domainInput, setDomainInput] = useState<string>('');
  const [domainSuggestions, setDomainSuggestions] = useState<any[]>([]);

  // 1. ON MOUNT
  useEffect(() => {
    async function initBuilder() {
      // Auth check
      try {
        await client.users.getMe();
      } catch {
        router.push('/login');
        return;
      }

      // Read activeSiteId from localStorage — if missing redirect to /
      const activeId = localStorage.getItem('activeSiteId');
      if (!activeId) {
        router.push('/');
        return;
      }
      setSiteId(activeId);

      // Read pendingJobId from localStorage
      const pendingJobId = localStorage.getItem('pendingJobId');

      if (pendingJobId) {
        setIsGeneratingSite(true);
        const pollInterval = setInterval(async () => {
          try {
            const job = await client.ai.getGenerationJob(pendingJobId);
            if (job.status === 'completed') {
              clearInterval(pollInterval);
              setIsGeneratingSite(false);
              localStorage.removeItem('pendingJobId');
              // Load site blocks & quota
              const [bData, qData] = await Promise.all([
                client.sites.getBlocks(activeId),
                client.ai.getQuota(),
              ]);
              setBlocks(Array.isArray(bData) ? bData : []);
              setQuota(qData);
            } else if (job.status === 'failed') {
              clearInterval(pollInterval);
              setIsGeneratingSite(false);
              setErrorMessage('Site generation failed. Try again.');
            }
          } catch {
            clearInterval(pollInterval);
            setIsGeneratingSite(false);
            setErrorMessage('Site generation failed. Try again.');
          }
        }, 2000);
      } else {
        // If no pendingJobId: call getBlocks & getQuota in parallel
        try {
          const [bData, qData] = await Promise.all([
            client.sites.getBlocks(activeId),
            client.ai.getQuota(),
          ]);
          setBlocks(Array.isArray(bData) ? bData : []);
          setQuota(qData);
        } catch (err: any) {
          setErrorMessage(err.response?.data?.message || 'Failed to load builder workspace.');
        }
      }
    }

    initBuilder();
  }, [router]);

  // Selected Block getter
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];

  // 2. BLOCK UPDATES — right panel property changes (optimistic update)
  const handlePropChange = (fieldKey: string, newValue: any) => {
    if (!selectedBlock || !siteId) return;

    const updatedData = { ...selectedBlock.data, [fieldKey]: newValue };

    // Update block in local state immediately (optimistic update)
    setBlocks((prev) =>
      prev.map((b) => (b.id === selectedBlock.id ? { ...b, data: updatedData } : b))
    );

    // Call client.sites.updateBlock
    client.sites
      .updateBlock(siteId, selectedBlock.id, updatedData, selectedBlock.version || 1)
      .catch(() => {
        // Silent catch or fallback
      });
  };

  // 3. AI COPILOT BAR — bottom prompt input
  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim() || !siteId) return;

    setErrorMessage('');
    setCopilotLoading(true);
    setCopilotOutput('');

    try {
      await client.ai.streamPrompt({ prompt: copilotPrompt, siteId });

      client.ai.readStream({
        onChunk: (chunk: string) => {
          setCopilotOutput((prev) => prev + chunk);
        },
        onDone: async () => {
          setCopilotLoading(false);
          setCopilotPrompt('');
          // Reload blocks via client.sites.getBlocks()
          try {
            const reloaded = await client.sites.getBlocks(siteId);
            setBlocks(Array.isArray(reloaded) ? reloaded : []);
          } catch {}
        },
        onError: (err: any) => {
          setCopilotLoading(false);
          if (err?.status === 402 || err?.statusCode === 402) {
            setShowUpgradeModal(true);
          } else if (err?.status === 429 || err?.statusCode === 429) {
            setErrorMessage('Too many requests. Please wait a moment.');
          } else {
            setErrorMessage('AI stream error. Try again.');
          }
        },
      });
    } catch (err: any) {
      setCopilotLoading(false);
      if (err?.statusCode === 402 || err?.status === 402) {
        setShowUpgradeModal(true);
      } else if (err?.statusCode === 429 || err?.status === 429) {
        setErrorMessage('Too many requests. Please wait a moment.');
      } else {
        setErrorMessage('AI stream error. Try again.');
      }
    }
  };

  // 4. ADDITIONAL COPILOT ACTIONS
  const handleAssistCopy = async () => {
    try {
      const res = await client.ai.assistCopy({ text: selectedText, tone: selectedTone });
      if (res?.text) {
        setCopilotOutput(`Rewritten Copy (${selectedTone}):\n${res.text}`);
      }
    } catch {
      setErrorMessage('Failed to rewrite copy.');
    }
  };

  const handleGenerateImage = async () => {
    try {
      const res = await client.ai.generateImage({ prompt: imagePrompt });
      if (res?.url && selectedBlock) {
        handlePropChange('imageUrl', res.url);
        setToastMessage('Generated image inserted into selected block!');
      }
    } catch {
      setErrorMessage('Failed to generate image.');
    }
  };

  const handleGenerateLegal = async () => {
    try {
      const res = await client.ai.generateLegal({ businessName: 'Tridop App', businessType: 'SaaS' });
      if (res) {
        setCopilotOutput(`PRIVACY POLICY:\n${res.privacy || ''}\n\nTERMS OF SERVICE:\n${res.terms || ''}`);
      }
    } catch {
      setErrorMessage('Failed to generate legal pages.');
    }
  };

  // 5. VERSION CONTROL
  const handleSaveVersion = async () => {
    if (!siteId) return;
    try {
      await client.sites.saveVersion(siteId, { commitMessage });
      setToastMessage(`Version snapshot "${commitMessage}" saved successfully!`);
    } catch {
      setErrorMessage('Failed to save version.');
    }
  };

  const handleGetVersions = async () => {
    if (!siteId) return;
    try {
      const versions = await client.sites.getVersions(siteId);
      setVersionList(Array.isArray(versions) ? versions : []);
      setShowVersionHistory(true);
    } catch {
      setErrorMessage('Failed to fetch versions.');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!siteId) return;
    try {
      await client.sites.restoreVersion(siteId, versionId);
      const reloaded = await client.sites.getBlocks(siteId);
      setBlocks(Array.isArray(reloaded) ? reloaded : []);
      setToastMessage('Version restored successfully!');
      setShowVersionHistory(false);
    } catch {
      setErrorMessage('Failed to restore version.');
    }
  };

  // 6. EXPORT BUTTON
  const handleExport = async () => {
    if (!siteId) return;
    try {
      const res = await client.sites.export(siteId);
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `site-export-${siteId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage('Failed to export site.');
    }
  };

  // 7. UPLOAD IMAGE
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !siteId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        const result = await client.sites.uploadImage(siteId, { fileData: base64String });
        if (result?.url && selectedBlock) {
          handlePropChange('imageUrl', result.url);
          setToastMessage('Image uploaded and inserted!');
        }
      } catch {
        setErrorMessage('Failed to upload image.');
      }
    };
    reader.readAsDataURL(file);
  };

  // 8. DEPLOY BUTTON
  const handleDeploy = async () => {
    if (!siteId) return;
    setDeploying(true);
    setDeployLogs([]);
    setDeploySuccess('');

    try {
      const res = await client.deploy.trigger({ siteId });
      const jobId = res?.jobId || res?.id || 'job-1';

      client.deploy.streamLogs(jobId, {
        onChunk: (msg: string) => {
          setDeployLogs((prev) => [...prev, msg]);
        },
        onDone: () => {
          setDeploying(false);
          setDeploySuccess('Your site is live!');
        },
        onError: () => {
          setDeploying(false);
          setErrorMessage('Deploy failed.');
        },
      });
    } catch {
      setDeploying(false);
      setErrorMessage('Deploy failed.');
    }
  };

  // 9. DOMAIN SEARCH
  const handleDomainSearch = async () => {
    if (!domainInput.trim()) return;
    try {
      const res = await client.domains.search({ query: domainInput });
      setDomainSuggestions(Array.isArray(res) ? res : []);
    } catch {
      setErrorMessage('Failed to search domains.');
    }
  };

  const handleDomainRegister = async (domainName: string) => {
    if (!siteId) return;
    try {
      await client.domains.register({ domain: domainName, siteId });
      setToastMessage(`Domain ${domainName} linked to site successfully!`);
    } catch {
      setErrorMessage('Failed to register domain.');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Controls Header */}
      <header className="h-14 bg-slate-950 border-b border-slate-900 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => router.push('/')}
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs font-display cursor-pointer"
          >
            T
          </div>
          <span className="text-xs font-display font-extrabold tracking-wider uppercase text-white">
            Tridop Builder Studio
          </span>
          {quota && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[10px] font-mono text-cyan-400">
              <span>Quota: {quota.used ?? 0}/{quota.limit ?? 100}</span>
            </div>
          )}
        </div>

        {/* Top Controls: Save, Export, Deploy */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveVersion}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save Version</span>
          </button>

          <button
            onClick={handleGetVersions}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>History</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{deploying ? 'Deploying...' : 'Deploy'}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Pane Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast / Error Banner */}
        {errorMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="ml-2 font-mono">✕</button>
          </div>
        )}

        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage('')} className="ml-2 font-mono">✕</button>
          </div>
        )}

        {/* 1. LEFT PANEL: Block Panel & Library */}
        <aside className="w-64 bg-slate-950 border-r border-slate-900 p-4 flex flex-col gap-4 z-10 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Block Hierarchy</span>
          </div>

          <div className="space-y-1.5">
            {blocks.map((block, idx) => (
              <div
                key={block.id || idx}
                onClick={() => setSelectedBlockId(block.id)}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                  (selectedBlockId || blocks[0]?.id) === block.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{idx + 1}. {block.type || 'Section Block'}</span>
                <span className="text-[9px] text-slate-500">v{block.version || 1}</span>
              </div>
            ))}
          </div>

          {/* 9. DOMAIN SEARCH ELEMENT */}
          <div className="pt-4 border-t border-slate-900 space-y-2">
            <label className="block text-[10px] font-mono uppercase text-slate-400">Custom Domain Search</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="mybrand.com"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              />
              <button
                onClick={handleDomainSearch}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-lg text-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
            {domainSuggestions.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                {domainSuggestions.map((dom: any, dIdx) => (
                  <div key={dIdx} className="p-1.5 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between text-[10px] font-mono">
                    <span>{typeof dom === 'string' ? dom : dom.name || dom.domain}</span>
                    <button
                      onClick={() => handleDomainRegister(typeof dom === 'string' ? dom : dom.name || dom.domain)}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Link
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* 2. CENTRE CANVAS: Main Interactive Canvas */}
        <main className="flex-1 bg-[#090b17] p-8 overflow-y-auto flex flex-col items-center justify-start relative">
          {/* 1. Generating Site Loading State Overlay */}
          {isGeneratingSite && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-display font-bold text-white tracking-tight">
                Generating your site...
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Synthesizing page models and compiling Tailwind components.
              </p>
            </div>
          )}

          {/* Render Active Site Canvas */}
          <div className="max-w-3xl w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-8 space-y-6 shadow-2xl min-h-[500px]">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  selectedBlock?.id === block.id
                    ? 'border-cyan-500/60 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">
                  {block.type || 'Block'}
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">
                  {block.data?.title || block.data?.heading || 'Interactive Block Title'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {block.data?.description || block.data?.subheading || block.data?.content || 'Select this block to adjust parameters in the right property inspector panel.'}
                </p>

                {block.data?.imageUrl && (
                  <img
                    src={block.data.imageUrl}
                    alt="Block Visual"
                    className="mt-4 rounded-lg border border-slate-800 max-h-48 object-cover w-full"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Deploy Logs Overlay / Area */}
          {deployLogs.length > 0 && (
            <div className="w-full max-w-3xl mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-left font-mono text-xs max-h-40 overflow-y-auto">
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Deploy Live Telemetry Logs</div>
              {deployLogs.map((log, lIdx) => (
                <div key={lIdx} className="text-slate-300">{log}</div>
              ))}
              {deploySuccess && (
                <div className="text-emerald-400 font-bold pt-1">{deploySuccess}</div>
              )}
            </div>
          )}
        </main>

        {/* 3. RIGHT PROPERTIES PANEL */}
        <aside className="w-72 bg-slate-950 border-l border-slate-900 p-4 flex flex-col gap-4 z-10 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Block Inspector</span>
          </div>

          {selectedBlock ? (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Title / Heading</label>
                <input
                  type="text"
                  value={selectedBlock.data?.title || selectedBlock.data?.heading || ''}
                  onChange={(e) => handlePropChange('title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Description / Content</label>
                <textarea
                  rows={3}
                  value={selectedBlock.data?.description || selectedBlock.data?.subheading || selectedBlock.data?.content || ''}
                  onChange={(e) => handlePropChange('description', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* 7. UPLOAD IMAGE File Input */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Upload Block Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-cyan-400 hover:file:bg-slate-800 cursor-pointer"
                />
              </div>

              {/* 4. ADDITIONAL COPILOT ACTIONS in Properties Panel */}
              <div className="pt-4 border-t border-slate-900 space-y-3">
                <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">AI Assistant Tools</div>

                {/* Rewrite Copy */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-slate-400">Tone</label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Bold">Bold</option>
                  </select>
                  <button
                    onClick={handleAssistCopy}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Rewrite Copy</span>
                  </button>
                </div>

                {/* Generate Image */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleGenerateImage}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Generate AI Image</span>
                  </button>
                </div>

                {/* Generate Legal Pages */}
                <button
                  onClick={handleGenerateLegal}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Legal Pages</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">Select a block on the canvas to inspect properties.</div>
          )}
        </aside>
      </div>

      {/* 3. BOTTOM AI COPILOT BAR */}
      <footer className="bg-slate-950 border-t border-slate-900 p-3 flex flex-col gap-2 z-20">
        {copilotOutput && (
          <div className="max-w-4xl w-full mx-auto p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-left text-xs font-mono text-cyan-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
            {copilotOutput}
          </div>
        )}

        <form onSubmit={handleCopilotSubmit} className="max-w-4xl w-full mx-auto flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled={copilotLoading}
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
              placeholder="Ask Copilot: 'Add a pricing section with 3 tiers'..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={copilotLoading || !copilotPrompt.trim()}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {copilotLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send</span>
          </button>
        </form>
      </footer>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-100 font-display">Version History</h3>
              <button onClick={() => setShowVersionHistory(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {versionList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No versions recorded yet.</p>
              ) : (
                versionList.map((ver: any, vIdx) => (
                  <div key={ver.id || vIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="text-slate-200 font-bold">{ver.commitMessage || ver.message || `Version ${vIdx + 1}`}</div>
                      <div className="text-[10px] text-slate-500">{ver.createdAt || 'Snapshot'}</div>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(ver.id || ver.versionId)}
                      className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 text-[10px] cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal (402 Quota Exceeded) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 text-center">
            <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white font-display">AI Quota Exceeded</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have reached your free AI prompt limit. Upgrade your account plan to unlock unlimited copilot generations.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={() => router.push('/billing')}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
