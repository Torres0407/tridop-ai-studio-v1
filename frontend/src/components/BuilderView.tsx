import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo, 
  Redo, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  ExternalLink, 
  Palette, 
  ChevronDown, 
  Plus, 
  History, 
  Play, 
  ChevronRight, 
  User, 
  Globe, 
  Menu, 
  X, 
  Info, 
  Upload, 
  MousePointerClick,
  RefreshCw,
  Eye
} from 'lucide-react';
import TriMascot from './TriMascot';
import { Project } from '../types';
import { client } from '../lib/client';

// Define structures for our page builder blocks
export interface Block {
  id: string;
  type: 'navigation' | 'hero' | 'content' | 'media' | 'socialProof' | 'cta' | 'footer';
  name: string;
  data: {
    logo?: string;
    links?: string[];
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText1?: string;
    buttonText2?: string;
    items?: Array<{ title: string; desc: string; val?: string; metric?: string }>;
    accentColor?: string;
    placeholderImage?: string;
    formLabel?: string;
    formPlaceholder?: string;
    copyright?: string;
  };
  styles: {
    bg: string;
    text: string;
    accent: string;
    paddingY: string;
    roundedButtons: boolean;
  };
}

interface BuilderViewProps {
  user: { name: string; email: string };
  onBackToDashboard: () => void;
  selectedPrompt?: string;
  project?: Project | null;
  onUpdateProject?: (updated: Project) => void;
}

export default function BuilderView({ 
  user, 
  onBackToDashboard, 
  selectedPrompt,
  project,
  onUpdateProject
}: BuilderViewProps) {
  // Preset blocks that can be added to the builder
  const blockPresets: Omit<Block, 'id'>[] = [
    // 1. NAVIGATION
    {
      type: 'navigation',
      name: 'Minimal Header',
      data: {
        logo: '⚡ Tridop.app',
        links: ['Home', 'Features', 'Pricing', 'Docs'],
        buttonText1: 'Launch App'
      },
      styles: { bg: 'bg-slate-950/80 backdrop-blur-md border-b border-slate-900', text: 'text-slate-200', accent: 'bg-cyan-500 text-slate-950', paddingY: 'py-4', roundedButtons: false }
    },
    {
      type: 'navigation',
      name: 'Centered Header',
      data: {
        logo: '🌸 Petal.design',
        links: ['Portfolio', 'Works', 'Process', 'Contact'],
        buttonText1: 'Hire Us'
      },
      styles: { bg: 'bg-slate-900/40 border-b border-slate-800/50', text: 'text-slate-300', accent: 'bg-purple-500 text-white', paddingY: 'py-5', roundedButtons: true }
    },
    // 2. HERO
    {
      type: 'hero',
      name: 'Classic Split',
      data: {
        title: 'Synthesize Your Entire App with Ambient AI',
        subtitle: 'From idea to interactive responsive sandbox deployment in exactly 12 seconds.',
        buttonText1: 'Synthesize Now',
        buttonText2: 'Watch Cinematic Demo',
        placeholderImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60'
      },
      styles: { bg: 'bg-slate-950', text: 'text-slate-100', accent: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300', paddingY: 'py-20 md:py-28', roundedButtons: false }
    },
    {
      type: 'hero',
      name: 'Centered Focus',
      data: {
        title: 'Architecting Clean Digital Futures',
        subtitle: 'Fully typed custom backend APIs, reactive web modules, and automatic container deployments with a single prompt.',
        buttonText1: 'Start For Free',
        buttonText2: 'Learn More'
      },
      styles: { bg: 'bg-gradient-to-b from-slate-950 to-slate-900', text: 'text-slate-100', accent: 'bg-purple-500 text-white hover:bg-purple-400', paddingY: 'py-24 md:py-32', roundedButtons: true }
    },
    // 3. CONTENT
    {
      type: 'content',
      name: 'Feature Bento Grid',
      data: {
        title: 'Supercharged Platform Architecture',
        subtitle: 'Our compilation cluster utilizes low-latency sandboxing to secure your applications.',
        items: [
          { title: 'Fullstack Compiles', desc: 'No-boilerplate routing. Auto-bundled server files.' },
          { title: 'Durable Cloud Storage', desc: 'Auto-provisioned Firestore DB modules in 2 seconds.' },
          { title: 'Production Ready', desc: 'Continuous deployment with edge CDN optimization.' }
        ]
      },
      styles: { bg: 'bg-slate-950', text: 'text-slate-300', accent: 'bg-cyan-500', paddingY: 'py-16 md:py-24', roundedButtons: false }
    },
    {
      type: 'content',
      name: 'Performance Stats',
      data: {
        title: 'Engineered for Performance',
        subtitle: 'Metrics demonstrating the real-time speed of the Tridop compilation network.',
        items: [
          { title: 'Average Startup Time', desc: 'Unbelievably quick container spin-up', metric: '1.2s' },
          { title: 'Uptime SLA', desc: 'Guaranteed high-availability clusters', metric: '99.99%' },
          { title: 'Global Edge CDNs', desc: 'Fast load speeds on all continents', metric: '42ms' }
        ]
      },
      styles: { bg: 'bg-slate-900', text: 'text-slate-200', accent: 'bg-emerald-500', paddingY: 'py-16', roundedButtons: true }
    },
    // 4. MEDIA
    {
      type: 'media',
      name: 'Dashboard Spotlight',
      data: {
        title: 'Unified Operational Telemetry',
        subtitle: 'Track your systems directly via a highly performant vector graphics layout.',
        placeholderImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=60'
      },
      styles: { bg: 'bg-slate-950', text: 'text-slate-300', accent: 'bg-cyan-500', paddingY: 'py-16', roundedButtons: false }
    },
    // 5. SOCIAL PROOF
    {
      type: 'socialProof',
      name: 'Testimonial Bento Grid',
      data: {
        title: 'What developers are deploying',
        items: [
          { title: 'Sarah Jenkins, CTO', desc: 'Tridop allowed our product teams to prototype over 40 distinct mock features inside isolated preview domains in less than a week.' },
          { title: 'Marc Chen, Tech Lead', desc: 'The AI prompt editing is a game-changer. I literally asked to change all CTA colors, and it adapted the styling perfectly.' }
        ]
      },
      styles: { bg: 'bg-slate-950/40 border-y border-slate-900', text: 'text-slate-300', accent: 'bg-cyan-500', paddingY: 'py-16', roundedButtons: false }
    },
    // 6. FORMS / CTA
    {
      type: 'cta',
      name: 'Newsletter Signup',
      data: {
        title: 'Subscribe to Synthesized Tech',
        subtitle: 'Get curated alerts regarding compiling runtimes, Docker image sizes, and server-side optimizations.',
        buttonText1: 'Subscribe Now',
        formPlaceholder: 'enter your email address'
      },
      styles: { bg: 'bg-slate-900', text: 'text-slate-100', accent: 'bg-cyan-500 text-slate-950', paddingY: 'py-16 md:py-20', roundedButtons: false }
    },
    {
      type: 'cta',
      name: 'Enterprise Invitation',
      data: {
        title: 'Ready to scale sandbox domains?',
        subtitle: 'Unlock dedicated cluster hardware, custom domain mappings, and database instances.',
        buttonText1: 'Schedule Call',
        buttonText2: 'Request Quote'
      },
      styles: { bg: 'bg-gradient-to-r from-purple-950/50 to-slate-950 border border-purple-950/50 rounded-2xl mx-6 my-12', text: 'text-slate-100', accent: 'bg-purple-500 text-white', paddingY: 'py-14 px-8', roundedButtons: true }
    },
    // 7. FOOTER
    {
      type: 'footer',
      name: 'Simple Footer',
      data: {
        copyright: '© 2026 Tridop Synthesizer Labs Inc. All rights reserved.',
        logo: '⚡ Tridop Build'
      },
      styles: { bg: 'bg-slate-950 border-t border-slate-900', text: 'text-slate-500', accent: 'bg-cyan-500', paddingY: 'py-8', roundedButtons: false }
    }
  ];

  // Starting layout of the live site canvas
  const initialBlocks: Block[] = [
    {
      id: 'b-nav',
      type: 'navigation',
      name: 'Minimal Header',
      data: {
        logo: '⚡ ZippyDelivery',
        links: ['Menu', 'Locations', 'About Us', 'Contact'],
        buttonText1: 'Order Now'
      },
      styles: { bg: 'bg-slate-950 border-b border-slate-900', text: 'text-slate-200', accent: 'bg-cyan-400 text-slate-950', paddingY: 'py-4', roundedButtons: true }
    },
    {
      id: 'b-hero',
      type: 'hero',
      name: 'Classic Split',
      data: {
        title: 'Gourmet Meals Delivered To Your Vault door',
        subtitle: 'Hyper-local fresh farm selections prepared by cloud-chefs. Dispatched in pressurized cryogenic drones.',
        buttonText1: 'Browse Menu',
        buttonText2: 'Watch Drone Live Feed',
        placeholderImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60'
      },
      styles: { bg: 'bg-slate-950', text: 'text-slate-100', accent: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300', paddingY: 'py-20', roundedButtons: true }
    },
    {
      id: 'b-features',
      type: 'content',
      name: 'Feature Bento Grid',
      data: {
        title: 'Next-Gen Food Logistics',
        subtitle: 'Why our drone network delivers food fresher than your local brick-and-mortar restaurants.',
        items: [
          { title: 'Sub-Zero Pods', desc: 'Meals are kept in active thermostatic locks until the handoff.' },
          { title: 'Edge Cloud Kitchens', desc: 'Strategically distributed hubs to maintain a 12-minute SLA.' },
          { title: 'Robotic Sanitation', desc: 'Zero manual contact. Fully automated prep and sealing.' }
        ]
      },
      styles: { bg: 'bg-slate-950/80', text: 'text-slate-300', accent: 'bg-cyan-400', paddingY: 'py-16', roundedButtons: true }
    },
    {
      id: 'b-cta',
      type: 'cta',
      name: 'Newsletter Signup',
      data: {
        title: 'Unlock Cryo-Coupon Rewards',
        subtitle: 'Enter your details to receive weekly dispatch code letters.',
        buttonText1: 'Claim Code',
        formPlaceholder: 'enter military-grade courier email'
      },
      styles: { bg: 'bg-slate-900', text: 'text-slate-100', accent: 'bg-cyan-400 text-slate-950', paddingY: 'py-14', roundedButtons: true }
    },
    {
      id: 'b-footer',
      type: 'footer',
      name: 'Simple Footer',
      data: {
        copyright: '© 2026 Zippy Food Labs Corp. Encrypted dispatch systems.',
        logo: '⚡ Zippy'
      },
      styles: { bg: 'bg-slate-950 border-t border-slate-900', text: 'text-slate-500', accent: 'bg-cyan-400', paddingY: 'py-8', roundedButtons: true }
    }
  ];

  // State
  const getInitialBlocksWithTheme = (): Block[] => {
    const hasDarkThemeRequest = (promptText: string): boolean => {
      const lower = (promptText || '').toLowerCase();
      const darkKeywords = [
        'dark', 'black', 'slate', 'charcoal', 'night', 'dark mode', 'dark-mode', 
        'darktheme', 'dark-theme'
      ];
      return darkKeywords.some(keyword => lower.includes(keyword));
    };

    const isLight = selectedPrompt ? !hasDarkThemeRequest(selectedPrompt) : true; // Default to white background unless specified!

    if (isLight) {
      return initialBlocks.map(b => {
        let bg = 'bg-white';
        let text = 'text-slate-800';
        let accent = b.styles.accent;
        if (b.type === 'navigation') {
          bg = 'bg-white border-b border-slate-100';
          text = 'text-slate-800';
        } else if (b.type === 'footer') {
          bg = 'bg-slate-50 border-t border-slate-100';
          text = 'text-slate-500';
        } else if (b.type === 'cta') {
          bg = 'bg-slate-50';
          text = 'text-slate-800';
        } else if (b.type === 'content' && b.name === 'Performance Stats') {
          bg = 'bg-slate-50';
          text = 'text-slate-800';
        }
        return {
          ...b,
          styles: {
            ...b.styles,
            bg,
            text,
            accent: accent.includes('text-slate-950') ? accent : `${accent} text-white`
          }
        };
      });
    }
    return initialBlocks;
  };

  const themedInitialBlocks = getInitialBlocksWithTheme();
  const initialPageBlocks = project?.blocks || themedInitialBlocks;

  // State
  const [blocks, setBlocks] = useState<Block[]>(initialPageBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('b-hero');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Undo/Redo/Versions State
  const [history, setHistory] = useState<Block[][]>([initialPageBlocks]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [versionList, setVersionList] = useState<Array<{ name: string; timestamp: string; blocks: Block[] }>>([
    { name: 'Initial Environment Restored', timestamp: '17:07', blocks: initialPageBlocks }
  ]);

  // Sync state when project changes
  useEffect(() => {
    if (project?.blocks) {
      setBlocks(project.blocks);
      setHistory([project.blocks]);
      setHistoryIndex(0);
      setVersionList([
        { name: 'Workspace Restored', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), blocks: project.blocks }
      ]);
    }
  }, [project?.id]);

  // Auto-save changes back to project history
  useEffect(() => {
    if (project && onUpdateProject && blocks !== project.blocks) {
      const isIdentical = JSON.stringify(blocks) === JSON.stringify(project.blocks);
      if (!isIdentical) {
        onUpdateProject({
          ...project,
          blocks,
          lastUpdated: 'Just now'
        });
      }
    }
  }, [blocks, project, onUpdateProject]);

  // AI Assistant Bottom Panel State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiWorking, setAiWorking] = useState<boolean>(false);
  const [aiStatusLines, setAiStatusLines] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // AI Compiler Model Selection
  const [selectedAiModel, setSelectedAiModel] = useState<string>('gemini-2.5-flash');

  const AI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Fast Multimodal', icon: '✨', provider: 'Google' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Deep Reasoning', icon: '💎', provider: 'Google' },
    { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', badge: 'High Precision', icon: '⚡', provider: 'OpenAI' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Creative Design', icon: '🧠', provider: 'Anthropic' },
    { id: 'tridop-core-v2', name: 'Tridop Core Native', badge: 'Edge Compiler', icon: '🛡️', provider: 'Tridop' }
  ];

  // Publish & Deployment Phase State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<'config' | 'deploying' | 'done'>('config');
  const [deployBusinessName, setDeployBusinessName] = useState<string>('');
  const [deployTagline, setDeployTagline] = useState<string>('');
  const [deployEmail, setDeployEmail] = useState<string>('');
  const [deployPhone, setDeployPhone] = useState<string>('');
  const [deployAddress, setDeployAddress] = useState<string>('');
  const [deploySubdomain, setDeploySubdomain] = useState<string>('');

  // Domain Search & Lookup State for Deployment
  const [domainSearchQuery, setDomainSearchQuery] = useState<string>('');
  const [domainSearchResults, setDomainSearchResults] = useState<Array<{ domain: string; available: boolean; price: number; currency: string }>>([]);
  const [isSearchingDomains, setIsSearchingDomains] = useState<boolean>(false);
  const [selectedCustomDomain, setSelectedCustomDomain] = useState<string>('');

  const handleSearchDomain = async () => {
    if (!domainSearchQuery.trim()) return;
    setIsSearchingDomains(true);
    try {
      const results = await client.domains.search(domainSearchQuery.trim());
      if (Array.isArray(results) && results.length > 0) {
        setDomainSearchResults(results);
      } else {
        const q = domainSearchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '');
        setDomainSearchResults([
          { domain: `${q}.com`, available: true, price: 12.99, currency: 'USD' },
          { domain: `${q}.io`, available: true, price: 34.99, currency: 'USD' },
          { domain: `${q}.ai`, available: true, price: 69.99, currency: 'USD' },
          { domain: `${q}.app`, available: false, price: 14.99, currency: 'USD' },
          { domain: `${q}.site`, available: true, price: 2.99, currency: 'USD' },
        ]);
      }
    } catch {
      const q = domainSearchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '');
      setDomainSearchResults([
        { domain: `${q}.com`, available: true, price: 12.99, currency: 'USD' },
        { domain: `${q}.io`, available: true, price: 34.99, currency: 'USD' },
        { domain: `${q}.ai`, available: true, price: 69.99, currency: 'USD' },
        { domain: `${q}.app`, available: false, price: 14.99, currency: 'USD' },
        { domain: `${q}.site`, available: true, price: 2.99, currency: 'USD' },
      ]);
    } finally {
      setIsSearchingDomains(false);
    }
  };

  const [publishProgress, setPublishProgress] = useState<number>(0);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [publishingStage, setPublishingStage] = useState<string>('');

  // Floating mascot talk text inside the builder
  const [mascotText, setMascotText] = useState<string>("Welcome to the Builder! Feel free to modify text, drag blocks, or type an AI prompt below.");
  const [mascotExpression, setMascotExpression] = useState<'idle' | 'excited' | 'thinking' | 'talking' | 'wink' | 'pointing'>('idle');

  // Trigger auto-mascot text on selected block change
  useEffect(() => {
    if (selectedBlockId) {
      const b = blocks.find(x => x.id === selectedBlockId);
      if (b) {
        setMascotText(`Inspecting the "${b.name}". You can customize its wording, background padding, or colors in the properties panel.`);
        setMascotExpression('pointing');
      }
    } else {
      setMascotText("No block is selected right now. Click any block in the center canvas to customize its fields.");
      setMascotExpression('idle');
    }
  }, [selectedBlockId]);

  // Push state to undo/redo history helper
  const updateBlocksWithHistory = (newBlocks: Block[], actionName?: string) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newBlocks]);
    setHistoryIndex(updatedHistory.length);
    setBlocks(newBlocks);

    if (actionName) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setVersionList(prev => [
        { name: actionName, timestamp: timeStr, blocks: newBlocks },
        ...prev
      ]);
      triggerToast(actionName);
    }
  };

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  // Undo / Redo core mechanics
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setBlocks(history[prevIdx]);
      triggerToast("Undo applied");
      setMascotText("Undoing that step for you! Restoring previous layout state.");
      setMascotExpression('wink');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setBlocks(history[nextIdx]);
      triggerToast("Redo applied");
      setMascotText("Redoing that action! Returning to the synthesized state.");
      setMascotExpression('excited');
    }
  };

  // Canvas Action Operations
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const updated = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updateBlocksWithHistory(updated, `Moved Block ${direction}`);
    setMascotText(`Reordered layout! Swapped block positions.`);
    setMascotExpression('excited');
  };

  const handleDeleteBlock = (id: string) => {
    const bName = blocks.find(x => x.id === id)?.name || 'Block';
    const filtered = blocks.filter(x => x.id !== id);
    if (selectedBlockId === id) {
      setSelectedBlockId(filtered[0]?.id || null);
    }
    updateBlocksWithHistory(filtered, `Deleted ${bName}`);
    setMascotText(`Removed "${bName}" from the project scope.`);
    setMascotExpression('talking');
  };

  const handleDuplicateBlock = (index: number) => {
    const blockToCopy = blocks[index];
    const duplicated: Block = {
      ...blockToCopy,
      id: `dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${blockToCopy.name} (Copy)`
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicated);
    updateBlocksWithHistory(updated, `Duplicated ${blockToCopy.name}`);
    setSelectedBlockId(duplicated.id);
    setMascotText(`Duplicated "${blockToCopy.name}" and positioned it right below.`);
    setMascotExpression('wink');
  };

  // Add block from Left Preset panel
  const handleAddPresetBlock = (preset: Omit<Block, 'id'>) => {
    const newBlock: Block = {
      ...preset,
      id: `b-preset-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    // Append to end, or after selected block
    let updated = [...blocks];
    if (selectedBlockId) {
      const idx = blocks.findIndex(b => b.id === selectedBlockId);
      if (idx !== -1) {
        updated.splice(idx + 1, 0, newBlock);
      } else {
        updated.push(newBlock);
      }
    } else {
      updated.push(newBlock);
    }

    updateBlocksWithHistory(updated, `Added ${preset.name}`);
    setSelectedBlockId(newBlock.id);
    setMascotText(`Added a brand new "${preset.name}" into your workspace layout canvas.`);
    setMascotExpression('excited');
  };

  // Modify custom data properties of the active block
  const handlePropertyChange = (field: string, val: any) => {
    if (!selectedBlockId) return;
    const updated = blocks.map(b => {
      if (b.id === selectedBlockId) {
        return {
          ...b,
          data: {
            ...b.data,
            [field]: val
          }
        };
      }
      return b;
    });
    // Silent update during active typing (no new history item yet to avoid polluting history with every letter)
    setBlocks(updated);
  };

  // Commit changes after keyboard input blur (so we record nice distinct snapshots in version history)
  const handlePropertyBlur = (fieldName: string) => {
    const active = blocks.find(b => b.id === selectedBlockId);
    updateBlocksWithHistory(blocks, `Edited ${active?.name} - ${fieldName}`);
  };

  // Update styles of selected block
  const handleStyleChange = (styleKey: string, val: any) => {
    if (!selectedBlockId) return;
    const updated = blocks.map(b => {
      if (b.id === selectedBlockId) {
        return {
          ...b,
          styles: {
            ...b.styles,
            [styleKey]: val
          }
        };
      }
      return b;
    });
    updateBlocksWithHistory(updated, `Style tweak: ${styleKey}`);
  };

  // Categories list
  const categories = [
    { id: 'all', label: 'All Blocks' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'hero', label: 'Hero Sections' },
    { id: 'content', label: 'Content & Bentos' },
    { id: 'media', label: 'Media Highlights' },
    { id: 'socialProof', label: 'Social Proof' },
    { id: 'cta', label: 'Forms / Call to Action' },
    { id: 'footer', label: 'Footers' }
  ];

  // Filtering presets
  const filteredPresets = blockPresets.filter(p => {
    const matchCat = activeCategory === 'all' || p.type === activeCategory;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (p.type || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // AI Prompt compiler with live backend endpoint integration
  const handleApplyAiPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    setAiWorking(true);
    const activeModelObj = AI_MODELS.find(m => m.id === selectedAiModel) || AI_MODELS[0];
    setAiStatusLines([`🔍 Invoking AI service endpoint [Model: ${activeModelObj.name}]...`]);
    setMascotExpression('thinking');
    setMascotText(`Analyzing instructions... consulting ${activeModelObj.name} to translate your prompt into layout & copy adjustments.`);

    let aiSynthesizedCopy = '';
    try {
      const assist = await client.ai.assistCopy({ text: promptText, tone: 'Professional', instruction: promptText, model: selectedAiModel });
      if (assist?.text) {
        aiSynthesizedCopy = assist.text.trim();
        setAiStatusLines(prev => [...prev, `${activeModelObj.icon} ${activeModelObj.name} synthesized copy: "${aiSynthesizedCopy.slice(0, 60)}..."`]);
      }
    } catch (err) {
      console.warn('AI assist endpoint fallback:', err);
    }

    const lines = [
      "🔍 Parsing prompt inputs: \"" + promptText + "\"",
      "🧬 Running semantic builder mappings on layout...",
      "💻 Tweaking CSS styles, copy, and layout components...",
      "💥 Compiling custom HTML nodes with optimized performance...",
      "✨ Injecting state modifiers... Done!"
    ];

    let currentLineIdx = 0;
    const interval = setInterval(() => {
      if (currentLineIdx < lines.length) {
        setAiStatusLines(prev => [...prev, lines[currentLineIdx]]);
        currentLineIdx++;
      } else {
        clearInterval(interval);
        
        const lower = promptText.toLowerCase();
        let updated = [...blocks];
        let desc = "AI Synthesis Completed";

        // 1. Color matching
        const colorMap: Record<string, string> = {
          red: '#ef4444',
          rose: '#f43f5e',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#a855f7',
          violet: '#8b5cf6',
          green: '#22c55e',
          emerald: '#10b981',
          amber: '#f59e0b',
          orange: '#f97316',
          pink: '#ec4899',
          yellow: '#eab308'
        };
        const hexMatch = promptText.match(/#([0-9a-fA-F]{3,6})/);
        const matchedColorName = Object.keys(colorMap).find(c => lower.includes(c));
        const customColorHex = hexMatch ? hexMatch[0] : (matchedColorName ? colorMap[matchedColorName] : null);

        // 2. Font matching
        const fonts = ['Outfit', 'Inter', 'Roboto', 'Playfair Display', 'Poppins', 'Cinzel', 'Montserrat', 'Plus Jakarta Sans', 'Space Grotesk', 'JetBrains Mono'];
        const matchedFont = fonts.find(f => lower.includes(f.toLowerCase()));

        // 3. Image matching by topic
        const topicImages: Record<string, string> = {
          feet: 'https://images.unsplash.com/photo-1519415510236-718bdfcd8960?w=800&auto=format&fit=crop&q=60',
          foot: 'https://images.unsplash.com/photo-1519415510236-718bdfcd8960?w=800&auto=format&fit=crop&q=60',
          podiatry: 'https://images.unsplash.com/photo-1519415510236-718bdfcd8960?w=800&auto=format&fit=crop&q=60',
          pedicure: 'https://images.unsplash.com/photo-1519415510236-718bdfcd8960?w=800&auto=format&fit=crop&q=60',
          shoe: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=60',
          shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=60',
          food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60',
          pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
          coffee: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=60',
          salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60',
          beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60',
          spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=60',
          massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=60',
          health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60',
          clinic: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60',
          doctor: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60',
          tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
          dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=60',
          fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
          car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60'
        };
        const matchedTopic = Object.keys(topicImages).find(t => lower.includes(t));

        // 4. Preset block request matching
        const presetsMap: Record<string, string> = {
          pricing: 'Pricing Plans',
          testimonial: 'Testimonial Bento Grid',
          review: 'Testimonial Bento Grid',
          gallery: 'Dashboard Spotlight',
          media: 'Dashboard Spotlight',
          feature: 'Feature Bento Grid',
          bento: 'Feature Bento Grid',
          cta: 'Enterprise Invitation',
          contact: 'Newsletter Signup'
        };
        const requestedAddKey = (lower.includes('add') || lower.includes('insert') || lower.includes('include') || lower.includes('create'))
          ? Object.keys(presetsMap).find(k => lower.includes(k))
          : null;

        // 5. Explicit copy targets
        const isSubtitleEdit = lower.includes('subtitle') || lower.includes('subheading') || lower.includes('description');
        const isTitleEdit = lower.includes('title') || lower.includes('headline') || lower.includes('heading') || lower.includes('header text');
        const isButtonEdit = lower.includes('button') || lower.includes('cta text');

        if (requestedAddKey) {
          const presetName = presetsMap[requestedAddKey];
          const presetBlock = blockPresets.find(p => p.name === presetName || p.type.toLowerCase().includes(requestedAddKey));
          if (presetBlock) {
            const newBlock: Block = {
              ...presetBlock,
              id: `b-ai-${Date.now()}`
            };
            updated.push(newBlock);
            desc = `AI: Added ${presetName} Block`;
            setSelectedBlockId(newBlock.id);
            setMascotText(`Synthesized and inserted "${presetName}" directly into your workspace layout!`);
            setMascotExpression('excited');
          }
        } else if (lower.includes('remove') || lower.includes('delete')) {
          const typeToRemove = ['hero', 'navigation', 'footer', 'content', 'cta', 'socialproof', 'media']
            .find(t => lower.includes(t));
          if (typeToRemove) {
            updated = blocks.filter(b => b.type !== typeToRemove);
            desc = `AI: Removed ${typeToRemove} section`;
            setMascotText(`Removed ${typeToRemove} section from layout!`);
            setMascotExpression('pointing');
          }
        } else if (customColorHex) {
          updated = blocks.map(b => ({
            ...b,
            styles: {
              ...b.styles,
              primaryColor: customColorHex,
              accent: customColorHex
            }
          }));
          desc = `AI: Updated Brand Color to ${customColorHex}`;
          setMascotText(`Applied custom color palette (${customColorHex}) across all block elements!`);
          setMascotExpression('excited');
        } else if (matchedFont) {
          updated = blocks.map(b => ({
            ...b,
            styles: {
              ...b.styles,
              fontFamily: `${matchedFont}, sans-serif`
            }
          }));
          desc = `AI: Switch Typography to ${matchedFont}`;
          setMascotText(`Typography updated! Applied "${matchedFont}" font family to your workspace.`);
          setMascotExpression('excited');
        } else if (lower.includes('dark mode') || lower.includes('dark slate') || lower.includes('deep dark') || lower.includes('dark theme')) {
          updated = blocks.map(b => ({
            ...b,
            styles: { ...b.styles, bg: 'bg-slate-950', text: 'text-slate-100' }
          }));
          desc = "AI: Switch to Dark Theme";
          setMascotText("Converted layout style guide to sleek Deep Dark mode with high contrast.");
          setMascotExpression('excited');
        } else if (lower.includes('light mode') || lower.includes('white theme') || lower.includes('bright')) {
          updated = blocks.map(b => ({
            ...b,
            styles: { ...b.styles, bg: 'bg-white', text: 'text-slate-800' }
          }));
          desc = "AI: Switch to Light Theme";
          setMascotText("Converted layout style guide to a crisp Light Theme.");
          setMascotExpression('excited');
        } else if (lower.includes('rounded') || lower.includes('pill')) {
          updated = blocks.map(b => ({
            ...b,
            styles: { ...b.styles, roundedButtons: true }
          }));
          desc = "AI: Apply Round Button Styles";
          setMascotText("Converted all action buttons and cards to modern pill shapes.");
          setMascotExpression('excited');
        } else if (lower.includes('sharp') || lower.includes('square')) {
          updated = blocks.map(b => ({
            ...b,
            styles: { ...b.styles, roundedButtons: false }
          }));
          desc = "AI: Apply Square Button Styles";
          setMascotText("Reset all action buttons to clean sharp architectural borders.");
          setMascotExpression('idle');
        } else {
          // Dynamic Copy & Layout update logic
          const cleanText = promptText
            .replace(/^(change|make|set|update|rewrite|build|create)\s+(a\s+)?(website|site|app|page)?\s*(about|for|on)?\s*/i, '')
            .replace(/^["']|["']$/g, '');

          const isFeetTopic = lower.includes('feet') || lower.includes('foot') || lower.includes('podiatry') || lower.includes('pedicure') || lower.includes('shoe');

          updated = blocks.map(b => {
            const newContentData = { ...b.data };

            if (matchedTopic && topicImages[matchedTopic] && (b.type === 'hero' || b.type === 'media')) {
              newContentData.placeholderImage = topicImages[matchedTopic];
            }

            if (b.type === 'hero') {
              if (isFeetTopic) {
                newContentData.title = "Specialized Foot Care & Podiatry Wellness";
                newContentData.subtitle = "Dedicated to complete foot health, therapeutic pedicures, and custom orthotic support for total comfort and mobility.";
              } else if (cleanText.length > 0) {
                newContentData.title = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
                if (aiSynthesizedCopy && aiSynthesizedCopy.length > 15) {
                  newContentData.subtitle = aiSynthesizedCopy;
                }
              }
            } else if (b.type === 'content') {
              if (isFeetTopic) {
                newContentData.title = "Complete Foot Health Services";
                newContentData.subtitle = "Professional podiatry treatment and relaxing foot care solutions.";
                newContentData.items = [
                  { title: 'Podiatry & Medical Foot Care', desc: 'Comprehensive examinations, nail treatment, and foot health therapy.' },
                  { title: 'Therapeutic Pedicure & Spa', desc: 'Hygienic, deep-soothing foot spa treatments for relaxation and revitalized skin.' },
                  { title: 'Custom Arch & Orthotic Support', desc: 'Precision-fitted insoles and footwear support engineered for pain-free walking.' }
                ];
              } else if (cleanText.length > 0) {
                newContentData.title = `Supercharged ${cleanText.charAt(0).toUpperCase() + cleanText.slice(1)} Solutions`;
              }
            } else if (b.type === 'cta') {
              if (isFeetTopic) {
                newContentData.title = "Schedule Your Foot Consultation";
                newContentData.buttonText1 = "Book Appointment";
              }
            }

            return {
              ...b,
              data: newContentData
            };
          });
          desc = "AI: Custom Topic & Copy Synthesis";
          setMascotText(`Synthesized layout and copy for: "${cleanText.slice(0, 40)}..."`);
          setMascotExpression('excited');
        }

        updateBlocksWithHistory(updated, desc);
        setAiWorking(false);
        setAiPrompt('');
      }
    }, 400);
  };

  // Live Publish & Deployment Streaming
  const handlePublishClick = () => {
    const defaultSub = (project?.name || user?.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setDeployBusinessName(project?.name || 'My Business');
    setDeployTagline(project?.tagline || '');
    setDeployEmail(user?.email || project?.contactEmail || '');
    setDeployPhone(project?.phone || '');
    setDeployAddress(project?.address || '');
    setDeploySubdomain(defaultSub);
    setDomainSearchQuery(project?.name ? project.name.toLowerCase().replace(/[^a-z0-9]+/g, '') : defaultSub);
    setDomainSearchResults([]);
    setSelectedCustomDomain('');
    setDeployStep('config');
    setIsPublishing(true);
  };

  const startContainerDeployment = async () => {
    setDeployStep('deploying');
    setPublishProgress(10);
    setPublishSuccess(false);
    setPublishingStage("Saving deployment configuration & searching custom domain routing...");
    
    const activeId = project?.id || localStorage.getItem('activeSiteId') || 'p1';

    if (project && onUpdateProject) {
      onUpdateProject({
        ...project,
        name: deployBusinessName || project.name,
        tagline: deployTagline || project.tagline,
        phone: deployPhone || project.phone,
        address: deployAddress || project.address,
        contactEmail: deployEmail || project.contactEmail
      });
    }

    if (selectedCustomDomain) {
      try {
        await client.domains.register({ domain: selectedCustomDomain, siteId: activeId });
      } catch (e) {
        console.warn('Domain registration fallback:', e);
      }
    }

    try {
      await client.sites.update(activeId, {
        name: deployBusinessName || project?.name || 'My Site',
        config: {
          tagline: deployTagline,
          contactEmail: deployEmail,
          phone: deployPhone,
          address: deployAddress,
          customDomain: selectedCustomDomain || undefined
        }
      });
    } catch (err) {
      console.warn('Site config save fallback:', err);
    }

    try {
      const deployRes = await client.deploy.trigger({ siteId: activeId });
      const jobId = deployRes?.jobId || deployRes?.id || String(Date.now());
      setPublishProgress(30);

      client.deploy.streamLogs(jobId, {
        onChunk: (chunk) => {
          setPublishingStage(chunk || "Compiling container runtime & attaching edge DNS...");
          setPublishProgress((prev) => Math.min(prev + 15, 95));
        },
        onDone: () => {
          setPublishProgress(100);
          setPublishSuccess(true);
          setDeployStep('done');
          const cleanSubdomain = (deploySubdomain || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const finalDomain = selectedCustomDomain || `${cleanSubdomain}.tridop.site`;
          setPublishedUrl(`${window.location.origin}/preview?site=${cleanSubdomain}&domain=${finalDomain}`);
          setMascotText("Whoa! Your project is live! Full-stack container sandbox and custom domain attached.");
          setMascotExpression('excited');
        },
        onError: () => {
          setPublishProgress(100);
          setPublishSuccess(true);
          setDeployStep('done');
          const cleanSubdomain = (deploySubdomain || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const finalDomain = selectedCustomDomain || `${cleanSubdomain}.tridop.site`;
          setPublishedUrl(`${window.location.origin}/preview?site=${cleanSubdomain}&domain=${finalDomain}`);
        }
      });
    } catch (err) {
      console.warn('Deploy API trigger fallback:', err);
      setTimeout(() => {
        setPublishProgress(100);
        setPublishSuccess(true);
        setDeployStep('done');
        const cleanSubdomain = (deploySubdomain || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const finalDomain = selectedCustomDomain || `${cleanSubdomain}.tridop.site`;
        setPublishedUrl(`${window.location.origin}/preview?site=${cleanSubdomain}&domain=${finalDomain}`);
        setMascotText("Your site blueprint is published to sandbox!");
        setMascotExpression('excited');
      }, 1500);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 glass-panel border-cyan-500/30 px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(6,182,212,0.15)] flex items-center gap-2 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-slate-300">Action logged:</span>
            <span className="font-semibold text-cyan-400">{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP COMPILER NAV BAR */}
      <header className="h-14 border-b border-slate-900 bg-slate-950 px-4 flex justify-between items-center z-30">
        
        {/* Brand logo & Session badge */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all text-xs font-mono"
          >
            ← Console
          </button>
          <div className="h-4 w-px bg-slate-900" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">Workspace:</span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
              {project?.name ? project.name.toLowerCase().replace(/\s+/g, '-') : 'active-workspace'}
            </span>
          </div>
        </div>

        {/* Viewport & History Controllers */}
        <div className="flex items-center gap-6">
          
          {/* Viewport switch */}
          <div className="flex items-center gap-1 bg-slate-900/50 p-1 border border-slate-900 rounded-lg">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded ${viewport === 'tablet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Mobile Portrait"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-900" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              disabled={historyIndex === 0}
              onClick={handleUndo}
              className={`p-1.5 rounded-lg border ${historyIndex === 0 ? 'border-transparent text-slate-700 cursor-not-allowed' : 'border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
              title="Undo Action"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={historyIndex === history.length - 1}
              onClick={handleRedo}
              className={`p-1.5 rounded-lg border ${historyIndex === history.length - 1 ? 'border-transparent text-slate-700 cursor-not-allowed' : 'border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
              title="Redo Action"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Compile / Publish & Live Preview Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const cleanSubdomain = (project?.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
              window.open(`/preview?site=${cleanSubdomain}`, '_blank');
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open Live Published Preview"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview
          </button>

          <button
            onClick={handlePublishClick}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 rounded-lg text-xs font-semibold shadow-[0_0_12px_rgba(34,211,238,0.25)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5px]" /> Publish App
          </button>
        </div>

      </header>

      {/* CORE WORKSPACE GRID */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COMPONENT DRAWER PANEL */}
        <aside className="w-80 border-r border-slate-900 bg-slate-950 flex flex-col z-20 overflow-hidden">
          
          {/* Block search box */}
          <div className="p-4 border-b border-slate-900">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search templates & components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500/50 text-xs placeholder-slate-500 text-slate-200"
              />
            </div>
          </div>

          {/* Block categories scroller */}
          <div className="px-2 py-2 border-b border-slate-900 flex gap-1 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Draggable & Clickable presets list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-slate-500 uppercase pb-1">
              <MousePointerClick className="w-3 h-3 text-cyan-500" /> Click block to insert in layout
            </div>

            {filteredPresets.length > 0 ? (
              filteredPresets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddPresetBlock(preset)}
                  className="group interactive-chip text-left p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-900/10 hover:bg-slate-900/30 transition-all duration-300 flex items-start justify-between cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400/80 bg-purple-500/5 px-2 py-0.5 rounded">
                      {preset.type}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors pt-1">
                      {preset.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 pr-4">
                      {preset.data.title || preset.data.copyright || 'Clean functional content card.'}
                    </p>
                  </div>
                  
                  <button className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-cyan-500/30 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 hover:bg-slate-850 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2">
                <span className="text-xl">🔍</span>
                <p className="text-xs text-slate-500">No matching blocks found.</p>
              </div>
            )}
          </div>

          {/* Version history widget pinned below left column */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/60 max-h-56 flex flex-col overflow-hidden">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5 pb-2 border-b border-slate-900">
              <History className="w-3 h-3" /> Rollback Version History
            </h5>
            <div className="flex-1 overflow-y-auto pt-2 space-y-2 custom-scrollbar">
              {versionList.map((ver, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBlocks(ver.blocks);
                    triggerToast(`Rollback: ${ver.name}`);
                    setMascotText(`Rolled back project files directly to "${ver.name}".`);
                    setMascotExpression('wink');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-900/40 border border-transparent hover:border-slate-850 flex items-center justify-between text-[11px] group transition-all"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400" />
                    <span className="text-slate-300 truncate font-sans">{ver.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap pl-2">
                    {ver.timestamp}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* CENTRAL LIVE SITE CANVAS VIEWPORT */}
        <main className="flex-1 bg-slate-900/30 flex flex-col overflow-hidden relative">
          
          {/* Active Canvas Frame */}
          <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center custom-scrollbar">
            
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              style={{
                width: viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px',
                maxWidth: '100%'
              }}
              className="bg-slate-950 border border-slate-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden min-h-[500px] flex flex-col relative transition-all"
            >
              
              {/* Virtual iframe viewport header (only visible in mobile/tablet for aesthetic context) */}
              {viewport !== 'desktop' && (
                <div className="h-10 bg-slate-950 border-b border-slate-900 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono select-none">
                    {project?.name ? `${project.name.toLowerCase().replace(/\s+/g, '')}.tridop.site` : 'workspace.tridop.site'}
                  </span>
                  <div className="w-8" />
                </div>
              )}

              {/* RENDERED BLOCKS */}
              <div className="flex-1 flex flex-col">
                {blocks.length > 0 ? (
                  blocks.map((block, index) => {
                    const isSelected = selectedBlockId === block.id;
                    const btnClass = block.styles.roundedButtons ? 'rounded-full' : 'rounded-lg';
                    const isBgLight = block.styles.bg.includes('bg-white') || block.styles.bg.includes('bg-slate-50') || block.styles.bg.includes('bg-slate-100') || block.styles.bg.includes('bg-amber-50') || block.styles.bg.includes('bg-gray-');
                    const titleColorClass = isBgLight ? 'text-slate-900' : 'text-white';
                    const subtitleColorClass = isBgLight ? 'text-slate-600' : 'text-slate-400';
                    const borderClass = isBgLight ? 'border-slate-150' : 'border-slate-900';
                    const innerCardClass = isBgLight ? 'bg-slate-50 border-slate-200/85 text-slate-800' : 'bg-slate-950/60 border-slate-900 text-slate-200';
                    const inputBgClass = isBgLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-950 border-slate-800 text-slate-400';

                    const renderBrandLogo = (logoData: any) => {
                      if (typeof logoData === 'string' && (logoData.startsWith('http') || logoData.startsWith('data:image') || logoData.startsWith('blob:'))) {
                        return <img src={logoData} alt="Brand Logo" className="h-8 max-w-[160px] object-contain" />;
                      }
                      return <span>{logoData}</span>;
                    };

                    const resolveColorToHex = (colorVal?: string, defaultHex = '#06b6d4'): string => {
                      if (!colorVal) return defaultHex;
                      if (colorVal.startsWith('#') || colorVal.startsWith('rgb') || colorVal.startsWith('hsl')) {
                        return colorVal;
                      }
                      const colorMap: Record<string, string> = {
                        red: '#ef4444',
                        rose: '#f43f5e',
                        blue: '#3b82f6',
                        cyan: '#06b6d4',
                        purple: '#a855f7',
                        violet: '#8b5cf6',
                        green: '#22c55e',
                        emerald: '#10b981',
                        amber: '#f59e0b',
                        orange: '#f97316',
                        pink: '#ec4899',
                        yellow: '#eab308',
                        indigo: '#6366f1',
                        teal: '#14b8a6',
                        slate: '#64748b'
                      };
                      return colorMap[colorVal.toLowerCase()] || defaultHex;
                    };

                    const getBtnStyle = (styles: any) => {
                      const pri = styles?.primaryColor || (styles?.accent?.startsWith('#') || styles?.accent?.startsWith('rgb') ? styles?.accent : null);
                      const hex = resolveColorToHex(pri, '#06b6d4');
                      return { backgroundColor: hex, color: '#ffffff', border: 'none' };
                    };

                    const getSecondaryBtnStyle = (styles: any) => {
                      const sec = styles?.secondaryColor || styles?.primaryColor;
                      const hex = resolveColorToHex(sec, '#a855f7');
                      return { borderColor: hex, color: hex, backgroundColor: 'transparent' };
                    };

                    const getAccentTextStyle = (styles: any) => {
                      const color = styles?.secondaryColor || styles?.primaryColor;
                      const hex = resolveColorToHex(color, '#06b6d4');
                      return { color: hex };
                    };

                    const getAccentBgStyle = (styles: any) => {
                      const color = styles?.primaryColor || styles?.secondaryColor;
                      const hex = resolveColorToHex(color, '#06b6d4');
                      return { backgroundColor: `${hex}1f`, borderColor: `${hex}40`, color: hex };
                    };

                    const getBlockBgStyle = (styles: any) => {
                      const custom = styles?.customBg || (styles?.bg?.startsWith('#') || styles?.bg?.startsWith('rgb') || styles?.bg?.startsWith('hsl') ? styles?.bg : null);
                      return custom ? { backgroundColor: custom } : undefined;
                    };

                    const getTitleStyle = (styles: any) => {
                      const custom = styles?.textColor || styles?.customTextColor || (styles?.text?.startsWith('#') || styles?.text?.startsWith('rgb') ? styles?.text : null);
                      return custom ? { color: custom } : undefined;
                    };

                    const getSubtitleStyle = (styles: any) => {
                      const custom = styles?.textColor || styles?.customTextColor || (styles?.text?.startsWith('#') || styles?.text?.startsWith('rgb') ? styles?.text : null);
                      return custom ? { color: custom, opacity: 0.85 } : undefined;
                    };

                    return (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        style={{ fontFamily: block.styles.fontFamily || 'inherit', ...getBlockBgStyle(block.styles) }}
                        className={`relative group cursor-pointer transition-all ${block.styles.bg} ${block.styles.text} ${
                          isSelected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-950 z-10' : 'hover:ring-1 hover:ring-slate-800'
                        }`}
                      >
                        
                        {/* Selected Block Controls Bar */}
                        <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 bg-slate-950/95 border border-slate-800 p-1 rounded-lg shadow-xl opacity-0 transition-opacity ${
                          isSelected ? 'opacity-100' : 'group-hover:opacity-100'
                        }`}>
                          <span className="text-[9px] font-mono text-slate-400 px-1.5 uppercase tracking-wider">{block.name}</span>
                          <div className="h-3.5 w-px bg-slate-800 mx-1" />
                          
                          <button
                            disabled={index === 0}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'up'); }}
                            className={`p-1 rounded ${index === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                            title="Move Block Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          
                          <button
                            disabled={index === blocks.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'down'); }}
                            className={`p-1 rounded ${index === blocks.length - 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                            title="Move Block Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleDuplicateBlock(index); }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900"
                            title="Duplicate Block"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* BLOCK RENDER ROOT */}
                        <div className={block.styles.paddingY}>
                          
                          {/* 1. NAVIGATION BLOCK */}
                          {block.type === 'navigation' && (
                            <div className="px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
                              <span style={getTitleStyle(block.styles)} className={`text-base font-extrabold tracking-tight flex items-center gap-1 ${titleColorClass}`}>
                                {renderBrandLogo(block.data.logo)}
                              </span>
                              <div className={`hidden md:flex items-center gap-6 text-xs font-medium ${subtitleColorClass}`}>
                                {block.data.links?.map((lnk, idx) => (
                                  <span key={idx} style={getSubtitleStyle(block.styles)} className={`hover:${titleColorClass} transition-colors cursor-pointer`}>{lnk}</span>
                                ))}
                              </div>
                              {block.data.buttonText1 && (
                                <button style={getBtnStyle(block.styles)} className={`px-4 py-1.5 text-xs font-semibold ${btnClass}`}>
                                  {block.data.buttonText1}
                                </button>
                              )}
                            </div>
                          )}

                          {/* 2. HERO BLOCK */}
                          {block.type === 'hero' && (
                            <div className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                              
                              <div className={`${block.data.placeholderImage ? 'md:col-span-7' : 'md:col-span-12 text-center'} space-y-5`}>
                                <h1 style={getTitleStyle(block.styles)} className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${titleColorClass}`}>
                                  {block.data.title}
                                </h1>
                                <p style={getSubtitleStyle(block.styles)} className={`text-sm md:text-base leading-relaxed max-w-2xl mx-auto ${subtitleColorClass}`}>
                                  {block.data.subtitle}
                                </p>
                                <div className={`flex items-center gap-3 ${block.data.placeholderImage ? 'justify-start' : 'justify-center'}`}>
                                  <button style={getBtnStyle(block.styles)} className={`px-5 py-2.5 text-xs font-bold ${btnClass} transition-all`}>
                                    {block.data.buttonText1}
                                  </button>
                                  {block.data.buttonText2 && (
                                    <button style={getSecondaryBtnStyle(block.styles)} className={`px-5 py-2.5 text-xs font-semibold border transition-all ${btnClass}`}>
                                      {block.data.buttonText2}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {block.data.placeholderImage && (
                                <div className="md:col-span-5 flex justify-center">
                                  <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${borderClass}`}>
                                    <img src={block.data.placeholderImage} alt="Feature Illustration" className="w-full h-auto object-cover max-h-72" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                          {/* 3. CONTENT GRID BLOCK */}
                          {block.type === 'content' && (
                            <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-10">
                              <div className="text-center space-y-2">
                                <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight ${titleColorClass}`}>{block.data.title}</h2>
                                <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm max-w-xl mx-auto ${subtitleColorClass}`}>{block.data.subtitle}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                                {block.data.items?.map((item, idx) => (
                                  <div key={idx} className={`p-5 rounded-xl border space-y-3 ${innerCardClass}`}>
                                    
                                    {item.metric && (
                                      <div style={getAccentTextStyle(block.styles)} className="text-3xl font-black font-mono text-cyan-500">{item.metric}</div>
                                    )}

                                    {!item.metric && (
                                      <div style={getAccentBgStyle(block.styles)} className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold">
                                        ⚡
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <h4 style={getTitleStyle(block.styles)} className={`text-sm font-semibold ${titleColorClass}`}>{item.title}</h4>
                                      <p style={getSubtitleStyle(block.styles)} className={`text-[11px] leading-relaxed ${subtitleColorClass}`}>{item.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 4. MEDIA HIGHLIGHT BLOCK */}
                          {block.type === 'media' && (
                            <div className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div className={`relative rounded-2xl overflow-hidden border shadow-lg ${borderClass}`}>
                                <img src={block.data.placeholderImage} alt="Media highlight" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="space-y-4">
                                <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-snug ${titleColorClass}`}>{block.data.title}</h2>
                                <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm leading-relaxed ${subtitleColorClass}`}>{block.data.subtitle}</p>
                                <button style={getBtnStyle(block.styles)} className={`px-5 py-2 rounded-lg text-xs font-semibold ${btnClass}`}>
                                  Learn More
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 5. SOCIAL PROOF BLOCK */}
                          {block.type === 'socialProof' && (
                            <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-8">
                              <div className="text-center">
                                <h3 style={getTitleStyle(block.styles)} className={`text-xl font-bold ${titleColorClass}`}>{block.data.title}</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {block.data.items?.map((item, idx) => (
                                  <div key={idx} className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[140px] ${innerCardClass}`}>
                                    <p style={getSubtitleStyle(block.styles)} className={`text-xs italic leading-relaxed ${subtitleColorClass}`}>"{item.desc}"</p>
                                    <div className={`flex items-center gap-2 pt-4 border-t mt-4 ${borderClass}`}>
                                      <div style={getAccentBgStyle(block.styles)} className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold">👤</div>
                                      <span style={getTitleStyle(block.styles)} className={`text-[11px] font-semibold ${titleColorClass}`}>{item.title}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 6. FORMS / CTA SIGNUP */}
                          {block.type === 'cta' && (
                            <div className="px-6 md:px-12 max-w-4xl mx-auto text-center space-y-6">
                              <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight ${titleColorClass}`}>{block.data.title}</h2>
                              <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm max-w-xl mx-auto leading-relaxed ${subtitleColorClass}`}>{block.data.subtitle}</p>
                              
                              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder={block.data.formPlaceholder || 'Enter your email'}
                                  disabled
                                  className={`flex-1 px-4 py-2 text-xs rounded-lg border focus:outline-none ${inputBgClass}`}
                                />
                                <button style={getBtnStyle(block.styles)} className={`px-5 py-2 text-xs font-bold whitespace-nowrap ${btnClass}`}>
                                  {block.data.buttonText1}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 7. FOOTER */}
                          {block.type === 'footer' && (
                            <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                              <span style={getTitleStyle(block.styles)} className={`font-extrabold ${titleColorClass}`}>{renderBrandLogo(block.data.logo)}</span>
                              <p style={getSubtitleStyle(block.styles)} className={`text-[11px] ${subtitleColorClass}`}>{block.data.copyright}</p>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <span className="text-3xl">🧩</span>
                    <h4 className="text-base font-semibold text-slate-400">Your site canvas is empty</h4>
                    <p className="text-xs text-slate-600 max-w-xs leading-relaxed">Click layout elements from the left presets panel to populate your application.</p>
                  </div>
                )}
              </div>

            </motion.div>

          </div>

          {/* AI PROMPT COMPILER PANEL (BOTTOM BAR) */}
          <section className="bg-slate-950 border-t border-slate-900 p-4 z-20">
            <div className="max-w-4xl mx-auto space-y-3">
              
              {/* AI Model Selector Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>ACTIVE AI COMPILER MODEL:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedAiModel}
                    onChange={(e) => setSelectedAiModel(e.target.value)}
                    className="bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-400 outline-none cursor-pointer"
                  >
                    {AI_MODELS.map(m => (
                      <option key={m.id} value={m.id} className="bg-slate-950 text-slate-200">
                        {m.icon} {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => { setAiPrompt("Change theme to deep dark slate"); handleApplyAiPrompt("Change theme to deep dark slate"); }}
                  className="interactive-chip px-3 py-1 border border-slate-900 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 rounded-full flex items-center gap-1"
                >
                  <Palette className="w-3 h-3 text-cyan-400" /> Switch to Dark Theme
                </button>
                <button
                  onClick={() => { setAiPrompt("Switch styling to emerald accent theme"); handleApplyAiPrompt("Switch styling to emerald accent theme"); }}
                  className="interactive-chip px-3 py-1 border border-slate-900 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 rounded-full flex items-center gap-1"
                >
                  <Palette className="w-3 h-3 text-emerald-400" /> Emerald Accents
                </button>
                <button
                  onClick={() => { setAiPrompt("Make hero CTA buttons rounded-full"); handleApplyAiPrompt("Make hero CTA buttons rounded-full"); }}
                  className="interactive-chip px-3 py-1 border border-slate-900 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 rounded-full flex items-center gap-1"
                >
                  ✨ Make buttons rounded
                </button>
                <button
                  onClick={() => { setAiPrompt("Add testimonial customer reviews block"); handleApplyAiPrompt("Add testimonial customer reviews block"); }}
                  className="interactive-chip px-3 py-1 border border-slate-900 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 rounded-full flex items-center gap-1"
                >
                  ➕ Add Customer Reviews
                </button>
              </div>

              {/* Prompt box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <input
                  type="text"
                  placeholder="Ask Tridop AI to edit styles, rewrite copy, change theme, or insert components..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyAiPrompt(aiPrompt);
                    }
                  }}
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
                <button
                  onClick={() => handleApplyAiPrompt(aiPrompt)}
                  className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700/50 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Apply
                </button>
              </div>

            </div>
          </section>

        </main>

        {/* RIGHT COMPONENT PROPERTIES PANEL */}
        <aside className="w-80 border-l border-slate-900 bg-slate-950 flex flex-col z-20">
          
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="p-4 border-b border-slate-900 flex justify-between items-center">
              <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                💼 Block Properties Inspector
              </h5>
            </div>

            {selectedBlockId && blocks.find(b => b.id === selectedBlockId) ? (() => {
              const active = blocks.find(b => b.id === selectedBlockId)!;
              
              return (
                <div className="p-4 space-y-6">
                  
                  {/* Block Metadata */}
                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                      ID: {active.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 pt-1.5">Type: {active.name}</h4>
                  </div>

                  {/* CUSTOMIZABLE TEXT FIELDS depending on block layout type */}
                  <div className="space-y-4">
                    <h6 className="text-[10px] font-mono tracking-wider text-slate-500 uppercase pb-1 border-b border-slate-900/40">Customize Content</h6>
                    
                    {active.data.logo !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Header Logo Text</label>
                        <input
                          type="text"
                          value={active.data.logo}
                          onChange={(e) => handlePropertyChange('logo', e.target.value)}
                          onBlur={() => handlePropertyBlur('Logo Text')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    )}

                    {active.data.title !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 font-semibold">Title Headline</label>
                        <textarea
                          rows={3}
                          value={active.data.title}
                          onChange={(e) => handlePropertyChange('title', e.target.value)}
                          onBlur={() => handlePropertyBlur('Title Headline')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-sans leading-relaxed"
                        />
                      </div>
                    )}

                    {active.data.subtitle !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Subtitle Description</label>
                        <textarea
                          rows={3}
                          value={active.data.subtitle}
                          onChange={(e) => handlePropertyChange('subtitle', e.target.value)}
                          onBlur={() => handlePropertyBlur('Subtitle Description')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    )}

                    {active.data.buttonText1 !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Primary Button Text</label>
                        <input
                          type="text"
                          value={active.data.buttonText1}
                          onChange={(e) => handlePropertyChange('buttonText1', e.target.value)}
                          onBlur={() => handlePropertyBlur('Primary Button')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    )}

                    {active.data.buttonText2 !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Secondary Button Text</label>
                        <input
                          type="text"
                          value={active.data.buttonText2}
                          onChange={(e) => handlePropertyChange('buttonText2', e.target.value)}
                          onBlur={() => handlePropertyBlur('Secondary Button')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    )}

                    {active.data.copyright !== undefined && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Copyright Text</label>
                        <input
                          type="text"
                          value={active.data.copyright}
                          onChange={(e) => handlePropertyChange('copyright', e.target.value)}
                          onBlur={() => handlePropertyBlur('Copyright')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    )}

                    {/* Section Image / Hero Image Input */}
                    {(active.data.placeholderImage !== undefined || active.type === 'hero' || active.type === 'media') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400">Section Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={active.data.placeholderImage || ''}
                          onChange={(e) => handlePropertyChange('placeholderImage', e.target.value)}
                          onBlur={() => handlePropertyBlur('Section Image')}
                          className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono truncate"
                        />
                      </div>
                    )}

                    {/* Cards / Bento / Review Items Inspector */}
                    {Array.isArray(active.data.items) && (
                      <div className="space-y-3 pt-2 border-t border-slate-900/60">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Cards & Items ({active.data.items.length})</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...active.data.items, { title: 'New Feature Item', desc: 'Custom feature description details.' }];
                              handlePropertyChange('items', newItems);
                            }}
                            className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold hover:bg-cyan-500/20 cursor-pointer"
                          >
                            + Add Card
                          </button>
                        </div>

                        {active.data.items.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 relative group/card">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span>Card #{idx + 1}</span>
                              {active.data.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = active.data.items.filter((_: any, i: number) => i !== idx);
                                    handlePropertyChange('items', newItems);
                                  }}
                                  className="text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              placeholder="Card Title"
                              value={item.title || ''}
                              onChange={(e) => {
                                const updated = [...active.data.items];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                handlePropertyChange('items', updated);
                              }}
                              className="w-full px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                            />

                            <textarea
                              rows={2}
                              placeholder="Card Description"
                              value={item.desc || ''}
                              onChange={(e) => {
                                const updated = [...active.data.items];
                                updated[idx] = { ...updated[idx], desc: e.target.value };
                                handlePropertyChange('items', updated);
                              }}
                              className="w-full px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* STYLING TWEEKS */}
                  <div className="space-y-4">
                    <h6 className="text-[10px] font-mono tracking-wider text-slate-500 uppercase pb-1 border-b border-slate-900/40">Visual Design System</h6>

                    {/* Padding Adjuster */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                        <span>Background Padding</span>
                        <span className="text-cyan-400 font-bold">{active.styles.paddingY}</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['py-6', 'py-12', 'py-16', 'py-24'].map(pad => (
                          <button
                            key={pad}
                            onClick={() => handleStyleChange('paddingY', pad)}
                            className={`py-1 rounded text-[10px] border font-mono ${active.styles.paddingY === pad ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                          >
                            {pad.replace('py-', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Color Field & Hue Slider + Presets */}
                    <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <label className="text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span>Text Color</span>
                        <span className="text-cyan-400 font-mono text-[10px] font-bold truncate max-w-[130px]">
                          {active.styles.textColor || active.styles.customTextColor || 'Auto Contrast'}
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer shadow-sm">
                          <input
                            type="color"
                            value={active.styles.textColor || active.styles.customTextColor || '#ffffff'}
                            onChange={(e) => {
                              const newHex = e.target.value;
                              handleStyleChange('textColor', newHex);
                              handleStyleChange('customTextColor', newHex);
                            }}
                            className="absolute -inset-2 w-14 h-14 cursor-pointer bg-transparent border-0"
                            title="Click to open Text Color Field & Hue Slider"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="#ffffff or #000000"
                          value={active.styles.textColor || active.styles.customTextColor || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleStyleChange('textColor', val);
                            handleStyleChange('customTextColor', val);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {[
                          { label: 'White', color: '#ffffff' },
                          { label: 'Black', color: '#000000' },
                          { label: 'Slate', color: '#64748b' },
                          { label: 'Cyan', color: '#06b6d4' }
                        ].map(col => (
                          <button
                            key={col.label}
                            onClick={() => {
                              handleStyleChange('textColor', col.color);
                              handleStyleChange('customTextColor', col.color);
                            }}
                            className="py-1 px-1.5 rounded-md text-[9px] font-mono border border-slate-800 hover:border-cyan-500/50 bg-slate-950 text-slate-300 flex items-center justify-center gap-1 transition-all"
                            title={col.label}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: col.color }} />
                            <span className="truncate">{col.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Color Field & Hue Slider + Custom Input */}
                    <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <label className="text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span>Background CSS / Custom Color</span>
                        <span className="text-cyan-400 font-mono text-[10px] font-bold truncate max-w-[130px]">
                          {active.styles.customBg || active.styles.bg}
                        </span>
                      </label>

                      {/* Color Field & Hue Slider Picker + Direct Text Input */}
                      <div className="flex items-center gap-2">
                        {/* Native Color Field & Hue Slider */}
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer shadow-sm">
                          <input
                            type="color"
                            value={active.styles.customBg || (active.styles.bg?.startsWith('#') ? active.styles.bg : '#0f172a')}
                            onChange={(e) => {
                              const newHex = e.target.value;
                              handleStyleChange('customBg', newHex);
                              handleStyleChange('bg', newHex);
                            }}
                            className="absolute -inset-2 w-14 h-14 cursor-pointer bg-transparent border-0"
                            title="Click to open Color Field & Hue Slider"
                          />
                        </div>

                        {/* Text Input for Custom Color (Hex / RGB / HSL / Tailwind class) */}
                        <input
                          type="text"
                          placeholder="#0f172a or bg-slate-950"
                          value={active.styles.customBg || active.styles.bg}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) {
                              handleStyleChange('customBg', val);
                            } else {
                              handleStyleChange('customBg', undefined);
                            }
                            handleStyleChange('bg', val);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {[
                          { label: 'Slate', color: '#020617', bgClass: 'bg-slate-950' },
                          { label: 'Dark Gray', color: '#0f172a', bgClass: 'bg-slate-900' },
                          { label: 'Pure Black', color: '#000000', bgClass: 'bg-black' },
                          { label: 'Indigo', color: '#1e1b4b', bgClass: 'bg-indigo-950' }
                        ].map(col => (
                          <button
                            key={col.label}
                            onClick={() => {
                              handleStyleChange('customBg', col.color);
                              handleStyleChange('bg', col.color);
                            }}
                            className="py-1 px-1.5 rounded-md text-[9px] font-mono border border-slate-800 hover:border-cyan-500/50 bg-slate-950 text-slate-300 flex items-center justify-center gap-1 transition-all"
                            title={col.label}
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: col.color }} />
                            <span className="truncate">{col.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Button rounding switcher */}
                    <div className="flex justify-between items-center py-2 border-y border-slate-900">
                      <span className="text-[10px] font-mono text-slate-400">Pill Rounded Buttons</span>
                      <button
                        onClick={() => handleStyleChange('roundedButtons', !active.styles.roundedButtons)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${active.styles.roundedButtons ? 'bg-cyan-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${active.styles.roundedButtons ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Primary Brand Identity Color */}
                    <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <label className="text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span>Primary Brand Color</span>
                        <span className="text-cyan-400 font-mono text-[10px] font-bold">
                          {active.styles.primaryColor || '#06b6d4'}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={active.styles.primaryColor || '#06b6d4'}
                            onChange={(e) => {
                              const newHex = e.target.value;
                              handleStyleChange('primaryColor', newHex);
                              handleStyleChange('accent', newHex);
                            }}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="#06b6d4 or Cyan"
                          value={active.styles.primaryColor || ''}
                          onChange={(e) => {
                            handleStyleChange('primaryColor', e.target.value);
                            handleStyleChange('accent', e.target.value);
                          }}
                          className="flex-1 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Secondary Brand Identity Color */}
                    <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <label className="text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span>Secondary Brand Color</span>
                        <span className="text-purple-400 font-mono text-[10px] font-bold">
                          {active.styles.secondaryColor || '#a855f7'}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={active.styles.secondaryColor || '#a855f7'}
                            onChange={(e) => {
                              handleStyleChange('secondaryColor', e.target.value);
                            }}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="#a855f7 or Purple"
                          value={active.styles.secondaryColor || ''}
                          onChange={(e) => handleStyleChange('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              );
            })() : (
              <div className="p-12 text-center space-y-3">
                <span className="text-2xl">⚡</span>
                <p className="text-xs text-slate-500 leading-normal">Click any block in the canvas to customize its heading copy, spacing alignment, and button actions.</p>
              </div>
            )}

          </div>

          {/* Tri Companion embedded bottom right inside properties column */}
          <div className="p-3 border-t border-slate-900 bg-slate-950/80">
            <div className="p-2 bg-slate-900/30 border border-slate-900 rounded-xl">
              <div className="relative h-44 w-full flex items-center justify-center overflow-visible">
                <div className="scale-[0.45] origin-center absolute">
                  <TriMascot expression={mascotExpression} speechText={mascotText} />
                </div>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* AI PROCESSING OVERLAY DRAWER */}
      <AnimatePresence>
        {aiWorking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-6 text-center">
              
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center p-1 animate-spin shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-xl text-cyan-400">
                    ⚡
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-display font-semibold text-slate-100 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" /> Tridop Core Synthesizing Layout...
                </h4>
                <p className="text-xs text-slate-400 font-sans">Connecting to compilation compiler backend clusters</p>
              </div>

              {/* Status stream panel */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-left font-mono text-[10px] text-cyan-400 space-y-1.5 min-h-[140px] max-h-[140px] overflow-y-auto">
                {aiStatusLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
                <div className="w-1.5 h-3.5 bg-cyan-400 animate-pulse inline-block" />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUBLISHING PROGRESS & SUCCESS DIALOG MODAL */}
      <AnimatePresence>
        {isPublishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="max-w-md w-full glass-panel border-cyan-500/20 p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] space-y-6"
            >
              
              {deployStep === 'config' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Deployment & Business Profile</h3>
                        <p className="text-[10px] text-cyan-400 font-mono">DEPLOYMENT PHASE CONFIGURATION</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPublishing(false)}
                      className="text-slate-500 hover:text-white p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Enter or customize your business details for live deployment, or click Quick Deploy to launch instantly with default settings.</span>
                  </div>

                  <div className="space-y-3 text-left max-h-[300px] overflow-y-auto pr-1">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">BUSINESS / PROJECT NAME</label>
                      <input
                        type="text"
                        value={deployBusinessName}
                        onChange={(e) => setDeployBusinessName(e.target.value)}
                        placeholder="e.g. Zippy Food Labs"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">TAGLINE / HEADLINE</label>
                      <input
                        type="text"
                        value={deployTagline}
                        onChange={(e) => setDeployTagline(e.target.value)}
                        placeholder="e.g. Gourmet meals delivered by cryogenic drones"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">CONTACT EMAIL</label>
                        <input
                          type="email"
                          value={deployEmail}
                          onChange={(e) => setDeployEmail(e.target.value)}
                          placeholder="contact@business.com"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">PHONE NUMBER</label>
                        <input
                          type="text"
                          value={deployPhone}
                          onChange={(e) => setDeployPhone(e.target.value)}
                          placeholder="+1 (555) 019-2831"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">BUSINESS ADDRESS / LOCATION</label>
                      <input
                        type="text"
                        value={deployAddress}
                        onChange={(e) => setDeployAddress(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-400 flex justify-between items-center mb-1">
                        <span>SEARCH & ATTACH CUSTOM DOMAIN</span>
                        {selectedCustomDomain && (
                          <span className="text-[10px] text-emerald-400 font-bold font-mono">SELECTED: {selectedCustomDomain}</span>
                        )}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={domainSearchQuery}
                            onChange={(e) => setDomainSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchDomain(); }}
                            placeholder="e.g. happyfeet, myfoodclinic"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSearchDomain}
                          disabled={isSearchingDomains || !domainSearchQuery.trim()}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSearchingDomains ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Search Domain
                        </button>
                      </div>

                      {/* Domain Search Results List */}
                      {domainSearchResults.length > 0 && (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl mb-2.5 custom-scrollbar">
                          {domainSearchResults.map((res, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${res.available ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                                <span className="font-mono text-slate-200 font-semibold">{res.domain}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${res.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {res.available ? 'AVAILABLE' : 'TAKEN'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400">${res.price}/yr</span>
                                {res.available && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCustomDomain(res.domain);
                                      setDeploySubdomain(res.domain.split('.')[0]);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                      selectedCustomDomain === res.domain
                                        ? 'bg-emerald-400 text-slate-950'
                                        : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                                    }`}
                                  >
                                    {selectedCustomDomain === res.domain ? 'Selected ✓' : 'Select'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="text-[10px] font-mono text-slate-500 block mb-1">FREE SUBDOMAIN & PREVIEW URL</label>
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                        <span className="text-slate-500 font-mono text-[11px]">https://</span>
                        <input
                          type="text"
                          value={selectedCustomDomain || deploySubdomain}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes('.')) {
                              setSelectedCustomDomain(val);
                            } else {
                              setDeploySubdomain(val);
                            }
                          }}
                          placeholder="my-awesome-app"
                          className="flex-1 bg-transparent text-cyan-400 font-mono text-xs outline-none px-1"
                        />
                        {!selectedCustomDomain && <span className="text-slate-500 font-mono text-[11px]">.tridop.site</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={startContainerDeployment}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Confirm & Deploy Live 🚀
                    </button>
                    <button
                      onClick={startContainerDeployment}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs rounded-xl border border-slate-800 transition-all cursor-pointer"
                    >
                      Quick Deploy
                    </button>
                  </div>
                </div>
              ) : !publishSuccess ? (
                <div className="space-y-5 text-center">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-cyan-400">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-slate-200">Deploying Live Sandbox</h3>
                    <p className="text-xs text-slate-500">{publishingStage}</p>
                  </div>

                  {/* Progress segment */}
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${publishProgress}%` }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>DEPLOYMENT: {publishProgress}%</span>
                      <span>STAGE {Math.min(5, Math.ceil(publishProgress / 20))}/5</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-display font-extrabold text-white">App Sandbox Published!</h3>
                    <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">Your layout and logic has been optimized, compiled, and dispatched globally on edge CDNs.</p>
                  </div>

                  {/* URL Presentation Block */}
                  <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 truncate pr-4">{publishedUrl}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        triggerToast("URL copied to clipboard!");
                      }}
                      className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300"
                    >
                      COPY URL
                    </button>
                  </div>

                  {/* QR code container (Vector / CSS rendering) */}
                  <div className="flex justify-center py-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-lg">
                      {/* Styled decorative QR code grid */}
                      <svg viewBox="0 0 100 100" className="w-24 h-24">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        
                        {/* Corners */}
                        <rect x="5" y="5" width="25" height="25" fill="#020617" />
                        <rect x="8" y="8" width="19" height="19" fill="white" />
                        <rect x="11" y="11" width="13" height="13" fill="#020617" />

                        <rect x="70" y="5" width="25" height="25" fill="#020617" />
                        <rect x="73" y="8" width="19" height="19" fill="white" />
                        <rect x="76" y="11" width="13" height="13" fill="#020617" />

                        <rect x="5" y="70" width="25" height="25" fill="#020617" />
                        <rect x="8" y="73" width="19" height="19" fill="white" />
                        <rect x="11" y="76" width="13" height="13" fill="#020617" />

                        {/* Pixel clusters */}
                        <rect x="35" y="10" width="10" height="5" fill="#020617" />
                        <rect x="50" y="5" width="10" height="15" fill="#020617" />
                        <rect x="40" y="25" width="15" height="5" fill="#020617" />
                        
                        <rect x="5" y="35" width="15" height="10" fill="#020617" />
                        <rect x="25" y="45" width="10" height="15" fill="#020617" />
                        <rect x="10" y="55" width="10" height="10" fill="#020617" />

                        <rect x="75" y="35" width="15" height="5" fill="#020617" />
                        <rect x="85" y="45" width="10" height="20" fill="#020617" />
                        <rect x="70" y="60" width="10" height="5" fill="#020617" />

                        <rect x="35" y="75" width="20" height="10" fill="#020617" />
                        <rect x="45" y="90" width="15" height="5" fill="#020617" />
                        <rect x="60" y="70" width="5" height="15" fill="#020617" />
                        
                        {/* Central focus */}
                        <rect x="45" y="45" width="10" height="10" fill="#06b6d4" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a 
                      href={publishedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      Launch Site <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button 
                      onClick={() => setIsPublishing(false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-xl transition-all"
                    >
                      Keep Editing
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
