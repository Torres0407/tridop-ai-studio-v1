import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PromptExample, PlanningItem } from '../types';
import MovingParticles from './MovingParticles';
import AuthPopupModal from './AuthPopupModal';
import { client } from '../lib/client';

import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  Database, 
  Cpu, 
  Globe, 
  ArrowRight,
  ShieldAlert,
  FolderTree,
  Play,
  Monitor,
  Activity,
  Heart,
  Search,
  ShoppingBag,
  TrendingUp,
  User,
  Mail,
  Compass,
  Clock,
  Utensils,
  CreditCard,
  Settings,
  Lock,
  Check,
  Plus,
  Trash2,
  Send,
  ArrowUpRight,
  Chrome,
  Github,
  Eye,
  EyeOff
} from 'lucide-react';

interface OnboardingFlowProps {
  currentStep: number;
  onSelectPrompt: (promptText: string) => void;
  selectedPrompt: string;
  setStep: (step: number) => void;
  onFieldFocus?: (fieldName: string) => void;
  onAuthSuccess?: (name: string, email: string) => void;
}

export default function OnboardingFlow({
  currentStep,
  onSelectPrompt,
  selectedPrompt,
  setStep,
  onFieldFocus,
  onAuthSuccess,
}: OnboardingFlowProps) {
  // Examples for Step 1
  const promptExamples: PromptExample[] = [
    { id: '1', text: 'Food Delivery App', category: 'Mobile & Web App' },
    { id: '2', text: 'Marketplace with Payments', category: 'E-Commerce' },
    { id: '3', text: 'SaaS Analytics Dashboard', category: 'Business Tool' },
    { id: '4', text: '3D Portfolio Website', category: 'Creative Web' },
  ];

  // Planning checklist for Step 2
  const [planningItems, setPlanningItems] = useState<PlanningItem[]>([
    { id: '1', label: 'Compiling Features & User Stories', status: 'pending', details: ['User authentication', 'Payment gateway integration', 'Push notifications', 'Location search'] },
    { id: '2', label: 'Designing Pages & Router Paths', status: 'pending', details: ['/login', '/dashboard', '/cart', '/checkout', '/profile'] },
    { id: '3', label: 'Provisioning Database Schema', status: 'pending', details: ['Users table', 'Orders table', 'Products collection', 'Relation indices'] },
    { id: '4', label: 'Generating REST & WebSocket Endpoints', status: 'pending', details: ['POST /api/auth', 'GET /api/products', 'WS /api/live-tracking'] },
    { id: '5', label: 'Assembling React & Tailwind Components', status: 'pending', details: ['Navbar.tsx', 'ProductGrid.tsx', 'OrderTracker.tsx', 'PaymentForm.tsx'] },
  ]);

  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authFirstName, setAuthFirstName] = useState<string>('');
  const [authLastName, setAuthLastName] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState<boolean>(false);
  const [activeAuthProvider, setActiveAuthProvider] = useState<'google' | 'github' | null>(null);

  const [customPages, setCustomPages] = useState<string[]>(['Home', 'Features', 'Contact']);
  const [activeCustomTab, setActiveCustomTab] = useState<string>('Home');
  const [newPageName, setNewPageName] = useState('');
  const [customComments, setCustomComments] = useState<Record<string, string[]>>({});
  const [newCommentText, setNewCommentText] = useState('');

  // Keep track of the last prompt we auto-generated pages for to avoid overwriting user adjustments on every keystroke
  const lastGeneratedPromptRef = useRef<string>('');

  useEffect(() => {
    if (!selectedPrompt) {
      setCustomPages(['Home', 'Features', 'Contact']);
      lastGeneratedPromptRef.current = '';
      return;
    }

    const getInitialPagesForPrompt = (promptText: string): string[] => {
      const lower = promptText.toLowerCase();
      let pages: string[] = ['Home', 'Features', 'Contact'];

      if (lower.includes('food') || lower.includes('delivery') || lower.includes('restaurant') || lower.includes('eat') || lower.includes('pizza') || lower.includes('burger')) {
        pages = ['Home', 'Menu', 'Cart', 'Track Order'];
      } else if (lower.includes('marketplace') || lower.includes('shop') || lower.includes('store') || lower.includes('e-commerce') || lower.includes('payment') || lower.includes('stripe') || lower.includes('checkout') || lower.includes('sales')) {
        pages = ['Storefront', 'Shop', 'Cart', 'Secure Pay'];
      } else if (lower.includes('analytics') || lower.includes('saas') || lower.includes('dashboard') || lower.includes('business') || lower.includes('metrics') || lower.includes('charts')) {
        pages = ['Dashboard', 'Insights', 'Team Settings'];
      } else if (lower.includes('portfolio') || lower.includes('creative') || lower.includes('design') || lower.includes('3d') || lower.includes('resume') || lower.includes('gallery')) {
        pages = ['Home', 'Selected Work', 'Get in Touch'];
      } else if (lower.includes('pages')) {
        const afterPages = promptText.substring(lower.indexOf('pages') + 5);
        const parsed = afterPages.split(/[,;|•\+]/).map(p => p.trim()).filter(p => p.length > 1 && p.length < 25);
        if (parsed.length > 0) {
          pages = parsed;
        }
      }

      // De-duplicate pages to avoid key collisions
      return Array.from(new Set(pages));
    };

    // Only auto-generate pages if the prompt has changed significantly, and not on every single character if they are editing
    const timer = setTimeout(() => {
      if (selectedPrompt !== lastGeneratedPromptRef.current) {
        setCustomPages(getInitialPagesForPrompt(selectedPrompt));
        lastGeneratedPromptRef.current = selectedPrompt;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPrompt]);

  useEffect(() => {
    if (customPages.length > 0 && !customPages.includes(activeCustomTab)) {
      setActiveCustomTab(customPages[0]);
    }
  }, [customPages, activeCustomTab]);

  // Handle step-by-step loading for Step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    // Dynamically build the checklist details based on customPages!
    const updatedItems: PlanningItem[] = [
      {
        id: '1',
        label: 'Compiling Features & User Stories',
        status: 'pending',
        details: [
          'User authentication and session management',
          ...customPages.map(p => `Define core interaction models for ${p} view`),
          'Real-time workspace sync and persistence engine'
        ]
      },
      {
        id: '2',
        label: 'Designing Pages & Router Paths',
        status: 'pending',
        details: customPages.map(p => `/${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)
      },
      {
        id: '3',
        label: 'Provisioning Database Schema',
        status: 'pending',
        details: [
          'Users authentication records collection',
          ...customPages.slice(0, 3).map(p => `${p.replace(/\s+/g, '')}Collection schema indices`),
          'Relation indexes & document field validators'
        ]
      },
      {
        id: '4',
        label: 'Generating REST & WebSocket Endpoints',
        status: 'pending',
        details: [
          'POST /api/auth/register',
          ...customPages.slice(0, 2).map(p => `GET /api/${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
          ...customPages.slice(0, 2).map(p => `POST /api/${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
          'WS /api/live-sync-socket'
        ]
      },
      {
        id: '5',
        label: 'Assembling React & Tailwind Components',
        status: 'pending',
        details: [
          'App.tsx global state manager',
          ...customPages.map(p => `${p.replace(/\s+/g, '')}View.tsx template layout`),
          'UILayoutContainer.tsx responsive frames'
        ]
      }
    ];

    setPlanningItems(updatedItems);

    let currentItemIdx = 0;

    const runPlanner = () => {
      if (currentItemIdx >= updatedItems.length) return;

      // Set current item to loading
      setPlanningItems((prev) =>
        prev.map((item, idx) => {
          if (idx === currentItemIdx) return { ...item, status: 'loading' };
          return item;
        })
      );

      // Complete current item after 1.2s and start next
      setTimeout(() => {
        setPlanningItems((prev) =>
          prev.map((item, idx) => {
            if (idx === currentItemIdx) return { ...item, status: 'completed' };
            return item;
          })
        );
        currentItemIdx++;
        if (currentItemIdx < updatedItems.length) {
          runPlanner();
        } else {
          // Auto advance to Step 3 after completion
          setTimeout(() => {
            setStep(3);
          }, 1000);
        }
      }, 1200);
    };

    runPlanner();
  }, [currentStep, customPages]);

  // Tab state for the Step 3 mockup preview
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'orders'>('home');
  const [mockLikes, setMockLikes] = useState(142);
  const [mockIsSubmitting, setMockIsSubmitting] = useState(false);
  const [refreshes, setRefreshes] = useState<number>(0);

  // High-fidelity interactive mock app states
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [orderTrackStep, setOrderTrackStep] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Alex Mercer', role: 'Product Lead', active: true },
    { name: 'Sarah Chen', role: 'Lead Architect', active: true },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Simulate order preparation steps over time
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setInterval(() => {
        setOrderTrackStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 3500);
      return () => clearInterval(timer);
    } else {
      setOrderTrackStep(0);
    }
  }, [paymentStatus]);

  // Premium helper functions for the interactive sandbox app
  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setTeamMembers(prev => [...prev, { name: inviteEmail, role: 'Developer', active: true }]);
    setInviteEmail('');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim()) return;
    setContactSuccess(true);
  };

  const hasDarkThemeRequest = (promptText: string): boolean => {
    const lower = (promptText || '').toLowerCase();
    const darkKeywords = [
      'dark', 'black', 'slate', 'charcoal', 'night', 'dark mode', 'dark-mode', 
      'darktheme', 'dark-theme'
    ];
    return darkKeywords.some(keyword => lower.includes(keyword));
  };

  const getPreviewTheme = () => {
    const isLight = !hasDarkThemeRequest(selectedPrompt);
    return {
      isLight,
      containerBg: isLight ? 'bg-white' : 'bg-[#080710]',
      headerText: isLight ? 'text-slate-900 border-slate-200' : 'text-slate-100 border-slate-900',
      tabActive: isLight ? 'bg-slate-150 border-slate-300 text-cyan-600 shadow-sm' : 'bg-slate-800 border-slate-700 text-cyan-400 shadow-sm',
      tabInactive: isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200',
      headerBorder: isLight ? 'border-slate-200' : 'border-slate-900',
      cardBg: isLight ? 'bg-slate-50 border border-slate-200/80 shadow-sm' : 'bg-gradient-to-b from-slate-950 to-slate-900/40 border border-slate-800/80',
      cardBgSimple: isLight ? 'bg-slate-50 border border-slate-200 shadow-sm' : 'border border-slate-800/60 bg-slate-950/20',
      cardBgItems: isLight ? 'border border-slate-200 bg-white shadow-sm p-3 rounded-xl flex flex-col justify-between' : 'border border-slate-800/80 bg-slate-950/40 rounded-xl flex flex-col justify-between p-3',
      textPrimary: isLight ? 'text-slate-900 font-bold' : 'text-slate-100 font-semibold',
      textSecondary: isLight ? 'text-slate-600' : 'text-slate-400',
      textMuted: isLight ? 'text-slate-400 font-medium' : 'text-slate-500',
      textNav: isLight ? 'text-slate-900' : 'text-slate-100',
      badge: isLight ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-purple-300 bg-purple-950/30 border border-purple-500/10',
      btnPrimary: isLight ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm' : 'bg-cyan-600 hover:bg-cyan-500 text-white',
      btnSecondary: isLight ? 'bg-slate-900 hover:bg-slate-800 text-white shadow' : 'bg-slate-100 hover:bg-white text-slate-950',
      btnOutline: isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 border' : 'bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 hover:text-white hover:bg-cyan-600',
      inputBg: isLight ? 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-950 border border-slate-800 text-slate-200',
      metaText: isLight ? 'text-slate-500' : 'text-cyan-400',
      accentText: isLight ? 'text-cyan-600 font-semibold' : 'text-cyan-400',
      chartPath: isLight ? '#0891b2' : '#22d3ee',
    };
  };

  const renderCustomPageContent = (pageName: string) => {
    const lower = pageName.toLowerCase();
    const theme = getPreviewTheme();
    
    // 1. HOME / WELCOME / LANDING PAGE
    if (lower.includes('home') || lower.includes('welcome') || lower.includes('landing') || lower.includes('index') || lower.includes('overview') || lower.includes('about')) {
      return (
        <div className={`space-y-4 font-sans text-left animate-fadeIn ${theme.textSecondary}`}>
          <div className={`p-5 rounded-2xl ${theme.cardBg}`}>
            <span className={`text-[10px] font-mono tracking-[0.25em] uppercase ${theme.metaText}`}>Interactive Preview Workspace</span>
            <h5 className={`text-xl font-display font-bold mt-1 uppercase tracking-tight ${theme.textPrimary}`}>
              {selectedPrompt || "Custom System Portal"}
            </h5>
            <p className={`text-xs mt-2 leading-relaxed max-w-lg font-sans ${theme.textSecondary}`}>
              Welcome to the interactive preview of your application. Tri has analyzed your ideas and rendered a highly optimized frontend interface with a secure database pipeline, ready for immediate exploration.
            </p>
            
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const firstOther = customPages.find(p => p !== pageName);
                  if (firstOther) setActiveCustomTab(firstOther);
                }}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${theme.btnSecondary}`}
              >
                Explore Components
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
            <div className={`p-3 border border-slate-800/60 bg-slate-950/20 rounded-xl ${theme.cardBgSimple}`}>
              <h6 className={`text-xs font-bold ${theme.textPrimary}`}>💎 Premium Architecture</h6>
              <p className={`text-[10px] mt-1 leading-relaxed font-sans ${theme.textSecondary}`}>Responsive Tailwind frames styled for clean desktop grids.</p>
            </div>
            <div className={`p-3 border border-slate-800/60 bg-slate-950/20 rounded-xl ${theme.cardBgSimple}`}>
              <h6 className={`text-xs font-bold ${theme.textPrimary}`}>🔒 Secure Sessions</h6>
              <p className={`text-[10px] mt-1 leading-relaxed font-sans ${theme.textSecondary}`}>Pre-integrated JWT authentication guards on all api controllers.</p>
            </div>
            <div className={`p-3 border border-slate-800/60 bg-slate-950/20 rounded-xl ${theme.cardBgSimple}`}>
              <h6 className={`text-xs font-bold ${theme.textPrimary}`}>🚀 Dynamic Router</h6>
              <p className={`text-[10px] mt-1 leading-relaxed font-sans ${theme.textSecondary}`}>Seamless transition curves and dynamic parameters initialized.</p>
            </div>
          </div>
        </div>
      );
    }

    // 2. SHOP / MENU / CATALOG / LISTINGS / INVENTORY / STORE
    if (lower.includes('menu') || lower.includes('shop') || lower.includes('store') || lower.includes('catalog') || lower.includes('product') || lower.includes('property') || lower.includes('properties') || lower.includes('listings') || lower.includes('inventory') || lower.includes('items') || lower.includes('books') || lower.includes('courses') || lower.includes('gal')) {
      let items = [
        { id: 'item1', name: 'Premium Workspace Hub', desc: 'Anodized alloy hub with dual Type-C power lines.', price: 129.00 },
        { id: 'item2', name: 'Merino Wool Desk Mat', desc: 'Organic grey felt with rubberized non-slip grip base.', price: 45.00 },
        { id: 'item3', name: 'Titanium Mechanical Pen', desc: 'Precision-weighted writing utility with matte grip.', price: 68.00 },
      ];

      if (selectedPrompt.toLowerCase().includes('food') || selectedPrompt.toLowerCase().includes('restaurant') || selectedPrompt.toLowerCase().includes('delivery') || selectedPrompt.toLowerCase().includes('pizza')) {
        items = [
          { id: 'item1', name: 'Spicy Tuna Crunch Roll', desc: 'Fresh sriracha mayo tuna, cucumber & tempura chips.', price: 14.50 },
          { id: 'item2', name: 'Smoked Truffle Burger', desc: 'Aged wagyu beef patty, black truffle gruyère & rocket.', price: 16.00 },
          { id: 'item3', name: 'Margherita Rustica Pizza', desc: 'Sourdough crust, fresh buffalo mozzarella, heirloom tomato & basil.', price: 15.00 },
        ];
      } else if (selectedPrompt.toLowerCase().includes('house') || selectedPrompt.toLowerCase().includes('property') || selectedPrompt.toLowerCase().includes('real-estate') || selectedPrompt.toLowerCase().includes('home') || selectedPrompt.toLowerCase().includes('rent') || selectedPrompt.toLowerCase().includes('apartment')) {
        items = [
          { id: 'item1', name: 'Modern Studio Loft', desc: 'Sleek brick-and-steel space featuring premium skyline views.', price: 1450.00 },
          { id: 'item2', name: 'Heated Pool Villa', desc: 'Luxurious 4-bedroom estate with private garden yards.', price: 3200.00 },
          { id: 'item3', name: 'Minimalist Penthouse', desc: 'High-ceiling glass luxury in the heart of downtown.', price: 2100.00 },
        ];
      }

      return (
        <div className="space-y-3 font-sans text-left animate-fadeIn">
          <div className="flex justify-between items-center">
            <h5 className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>{pageName} Collection</h5>
            <span className={`text-[10px] font-mono ${theme.metaText}`}>Total Items: {items.length}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {items.map((item) => {
              const inCart = cart.find(i => i.id === item.id)?.quantity || 0;
              return (
                <div key={item.id} className={`rounded-xl flex flex-col justify-between ${theme.cardBgItems}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold leading-tight ${theme.textPrimary}`}>{item.name}</span>
                      <span className={`text-xs font-semibold ${theme.accentText}`}>${item.price.toFixed(2)}</span>
                    </div>
                    <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${theme.textSecondary}`}>{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className={`w-full mt-3 py-1.5 text-[10px] text-center rounded-lg transition-all border font-medium cursor-pointer ${theme.btnOutline}`}
                  >
                    {inCart > 0 ? `Added (${inCart})` : `Add to ${selectedPrompt.toLowerCase().includes('rent') ? 'Lease' : 'Cart'}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 3. CART / CHECKOUT / BASKET / SECURE PAY / PRICING
    if (lower.includes('cart') || lower.includes('checkout') || lower.includes('basket') || lower.includes('pay') || lower.includes('pricing') || lower.includes('subscribe') || lower.includes('billing') || lower.includes('order') || lower.includes('receipt')) {
      return (
        <div className={`space-y-4 font-sans text-left animate-fadeIn ${theme.textSecondary}`}>
          {paymentStatus === 'idle' ? (
            cart.length === 0 ? (
              <div className={`p-6 text-center border border-dashed rounded-xl ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800'}`}>
                <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${theme.isLight ? 'text-slate-300' : 'text-slate-600'}`} />
                <p className={`text-xs ${theme.textSecondary}`}>Your shopping list is currently empty.</p>
                <button
                  type="button"
                  onClick={() => {
                    const catalogTab = customPages.find(p => {
                      const l = p.toLowerCase();
                      return l.includes('menu') || l.includes('shop') || l.includes('store') || l.includes('catalog') || l.includes('listings') || l.includes('properties');
                    });
                    if (catalogTab) setActiveCustomTab(catalogTab);
                  }}
                  className={`text-xs hover:underline mt-1.5 font-medium cursor-pointer ${theme.accentText}`}
                >
                  Browse Available Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side items */}
                <div className={`p-3.5 rounded-xl space-y-3 ${theme.cardBgSimple}`}>
                  <h5 className={`text-xs font-semibold ${theme.textPrimary}`}>Selected Items</h5>
                  <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.id} className={`flex justify-between items-center text-xs ${theme.textSecondary}`}>
                        <span>{item.name} <span className="text-[10px] text-slate-500">x{item.quantity}</span></span>
                        <div className="flex items-center gap-2">
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                          <button type="button" onClick={() => handleRemoveFromCart(item.id)} className="text-[10px] text-rose-500 hover:text-rose-400 cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`border-t pt-2 flex justify-between items-center text-xs font-bold ${theme.isLight ? 'border-slate-200 text-slate-900' : 'border-slate-900 text-slate-200'}`}>
                    <span>Total Cost</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Right side checkout form */}
                <div className={`p-3.5 rounded-xl space-y-2.5 ${theme.cardBg}`}>
                  <h5 className={`text-xs font-semibold flex items-center gap-1.5 ${theme.textPrimary}`}>
                    <Lock className="w-3 h-3 text-emerald-500" /> Secure Payment Session
                  </h5>
                  <div className="space-y-2">
                    <div className={`p-2 border rounded text-xs font-mono flex justify-between ${theme.isLight ? 'border-slate-200 bg-white text-slate-750' : 'border-slate-800 bg-slate-950 text-slate-300'}`}>
                      <span>4242 4242 4242 4242</span>
                      <span className="text-slate-500">Stripe</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 border rounded text-xs font-mono ${theme.isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                        12 / 29
                      </div>
                      <div className={`p-2 border rounded text-xs font-mono ${theme.isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                        ***
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('processing');
                      setTimeout(() => {
                        setPaymentStatus('success');
                      }, 1500);
                    }}
                    className={`w-full py-1.5 text-xs text-center rounded-lg font-semibold transition-colors mt-1 cursor-pointer ${theme.btnPrimary}`}
                  >
                    Pay ${getCartTotal().toFixed(2)} Securely
                  </button>
                </div>
              </div>
            )
          ) : paymentStatus === 'processing' ? (
            <div className={`p-8 text-center border rounded-xl space-y-3 ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-xs font-mono ${theme.textSecondary}`}>Connecting with Stripe secure billing channels...</p>
            </div>
          ) : (
            <div className={`p-6 text-center border rounded-xl space-y-3 ${theme.isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/20 bg-emerald-950/10'}`}>
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
              <h5 className={`text-sm font-semibold ${theme.textPrimary}`}>Transaction Approved!</h5>
              <p className={`text-xs max-w-sm mx-auto leading-relaxed font-sans ${theme.textSecondary}`}>
                Your transaction has been securely processed. All assets are successfully initialized and a database log was created under session token ID <strong>TR-{Math.floor(100000 + Math.random() * 900000)}</strong>.
              </p>
              <button type="button" onClick={() => { setPaymentStatus('idle'); setCart([]); }} className={`text-xs hover:underline cursor-pointer ${theme.accentText}`}>Clear & Reset Preview</button>
            </div>
          )}
        </div>
      );
    }

    // 4. DASHBOARD / ANALYTICS / METRICS / INSIGHTS / REPORT
    if (lower.includes('dashboard') || lower.includes('analytic') || lower.includes('insight') || lower.includes('chart') || lower.includes('metric') || lower.includes('report') || lower.includes('status') || lower.includes('logs')) {
      const baseVal = 42950 + (refreshes * 340);
      return (
        <div className="space-y-3 font-sans text-left animate-fadeIn">
          <div className="flex justify-between items-center">
            <h5 className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>{pageName} Console</h5>
            <button type="button" onClick={() => setRefreshes(r => r + 1)} className={`text-[10px] hover:text-cyan-700 font-mono flex items-center gap-1 cursor-pointer ${theme.accentText}`}>
              🔄 Refresh Core Data
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2.5 border rounded-xl ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className={`text-[9px] uppercase tracking-wider font-mono ${theme.textMuted}`}>Active Queries</div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${theme.textPrimary}`}>{(1420 + (refreshes * 23)).toLocaleString()}</div>
              <div className="text-[9px] text-emerald-500 mt-0.5 font-sans">+4.1% latency decrease</div>
            </div>
            <div className={`p-2.5 border rounded-xl ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className={`text-[9px] uppercase tracking-wider font-mono ${theme.textMuted}`}>Calculated MRR</div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${theme.textPrimary}`}>${baseVal.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-500 mt-0.5 font-sans">+9.2% Growth rate</div>
            </div>
            <div className={`p-2.5 border rounded-xl ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'}`}>
              <div className={`text-[9px] uppercase tracking-wider font-mono ${theme.textMuted}`}>Database Load</div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${theme.textPrimary}`}>{(12.4 + (refreshes * 0.12)).toFixed(2)}%</div>
              <div className={`text-[9px] mt-0.5 font-sans ${theme.accentText}`}>Fully Optimized</div>
            </div>
          </div>

          {/* Custom Mini Graph */}
          <div className={`p-3 rounded-xl h-20 flex flex-col justify-between ${theme.cardBg}`}>
            <div className={`text-[9px] uppercase tracking-wider font-mono ${theme.textMuted}`}>Network Ingress Volumes</div>
            <svg className={`w-full h-10 overflow-visible ${theme.isLight ? 'text-cyan-600' : 'text-cyan-400'}`} viewBox="0 0 400 40">
              <defs>
                <linearGradient id="custom-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.chartPath} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={theme.chartPath} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0,35 Q 80,${30 - (refreshes % 3) * 5} 150,${25 + (refreshes % 2) * 5} T 300,${15 - (refreshes % 4) * 2} L 400,10`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M 0,35 Q 80,${30 - (refreshes % 3) * 5} 150,${25 + (refreshes % 2) * 5} T 300,${15 - (refreshes % 4) * 2} L 400,10 L 400,40 L 0,40 Z`}
                fill="url(#custom-chart-grad)"
              />
            </svg>
          </div>
        </div>
      );
    }

    // 5. TEAM / USERS / PROFILE / SETTINGS / ACCESS
    if (lower.includes('team') || lower.includes('user') || lower.includes('member') || lower.includes('profile') || lower.includes('setting') || lower.includes('access') || lower.includes('account') || lower.includes('admin')) {
      return (
        <div className={`space-y-3 font-sans text-left animate-fadeIn ${theme.textSecondary}`}>
          <h5 className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>{pageName} Access Control</h5>
          
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
            {teamMembers.map((member, idx) => (
              <div key={idx} className={`p-2 border rounded-lg flex justify-between items-center ${theme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-850 bg-slate-950/40'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${theme.isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-xs ${theme.textPrimary}`}>{member.name}</span>
                </div>
                <span className={`text-[10px] font-mono ${theme.accentText}`}>{member.role}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleInviteMember} className="flex gap-2">
            <input
              type="email"
              placeholder="Invite workspace member email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={`flex-1 text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500 rounded-lg ${theme.inputBg}`}
            />
            <button type="submit" className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${theme.btnPrimary}`}>
              Invite
            </button>
          </form>
        </div>
      );
    }

    // 6. CONTACT / FEEDBACK / MESSAGE / SUPPORT
    if (lower.includes('contact') || lower.includes('touch') || lower.includes('support') || lower.includes('form') || lower.includes('feedback') || lower.includes('message') || lower.includes('inbox')) {
      return (
        <div className={`space-y-4 font-sans text-left animate-fadeIn ${theme.textSecondary}`}>
          {contactSuccess ? (
            <div className={`p-6 text-center border rounded-xl space-y-2 ${theme.isLight ? 'border-purple-200 bg-purple-50' : 'border-purple-500/20 bg-purple-950/10'}`}>
              <CheckCircle2 className="w-8 h-8 text-purple-500 mx-auto" />
              <h5 className={`text-xs font-semibold ${theme.textPrimary}`}>Response Submitted!</h5>
              <p className={`text-[11px] max-w-xs mx-auto leading-relaxed font-sans ${theme.textSecondary}`}>
                Thank you for testing the interactive feedback forms. A mock document has been logged to Firestore correctly.
              </p>
              <button type="button" onClick={() => setContactSuccess(false)} className="text-[10px] text-purple-500 hover:underline cursor-pointer font-medium">Submit another form</button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className={`p-3.5 rounded-xl space-y-2 ${theme.cardBgSimple}`}>
              <h5 className={`text-xs font-semibold font-display font-medium ${theme.textPrimary}`}>Send an Inquiry</h5>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                  className={`text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500 rounded-lg ${theme.inputBg}`}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className={`text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500 rounded-lg ${theme.inputBg}`}
                />
              </div>
              <textarea
                placeholder="What details should we process..."
                rows={2}
                value={contactForm.message}
                onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                className={`w-full text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500 rounded-lg resize-none ${theme.inputBg}`}
              />
              <button type="submit" className={`w-full py-1.5 text-xs text-center font-medium rounded-lg transition-colors cursor-pointer ${theme.btnPrimary}`}>
                Dispatch Message
              </button>
            </form>
          )}
        </div>
      );
    }

    // 7. OTHER CUSTOM PAGES (WITH INTERACTIVE FEEDBACK & LIKES!)
    const pageLikes = mockLikes + (lower.charCodeAt(0) % 15);
    const commentsList = customComments[pageName] || [];

    return (
      <div className={`space-y-4 font-sans text-left animate-fadeIn ${theme.textSecondary}`}>
        <div className={`p-4 rounded-xl flex flex-col justify-between ${theme.cardBgSimple}`}>
          <div>
            <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
              Dynamic Custom View
            </span>
            <h5 className={`text-base font-semibold mt-2 flex items-center gap-1.5 ${theme.textPrimary}`}>
              <Sparkles className="w-4 h-4 text-purple-500" />
              {pageName} View
            </h5>
            <p className={`text-xs mt-1 leading-relaxed font-sans ${theme.textSecondary}`}>
              Your custom application layout for the <strong>"{pageName}"</strong> page is fully configured. It is designed around sleek grid patterns, spacious typography margins, and modern interaction loops.
            </p>
          </div>

          <div className={`mt-4 flex items-center justify-between border-t pt-3.5 ${theme.isLight ? 'border-slate-100' : 'border-slate-900'}`}>
            <button
              type="button"
              onClick={() => setMockLikes(l => l + 1)}
              className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                theme.isLight 
                  ? 'text-purple-750 bg-purple-50 hover:bg-purple-100 border-purple-200' 
                  : 'text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
              }`}
            >
              👍 Support View ({pageLikes})
            </button>
            <span className={`text-[10px] font-mono ${theme.textMuted}`}>
              Linked to Firestore Database
            </span>
          </div>
        </div>

        {/* Interactive Comments Box for this custom page */}
        <div className={`p-3 rounded-xl space-y-2 ${theme.isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/20 border border-slate-850'}`}>
          <h6 className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
            Leave a Note on {pageName}
          </h6>
          
          {commentsList.length > 0 ? (
            <div className="space-y-1 max-h-[60px] overflow-y-auto mb-2 pr-1">
              {commentsList.map((comm, cIdx) => (
                <div key={cIdx} className={`text-[10px] font-sans pb-1 flex justify-between items-center ${theme.isLight ? 'border-b border-slate-100 text-slate-750' : 'border-b border-slate-900 text-slate-300'}`}>
                  <span>{comm}</span>
                  <span className={`text-[8px] font-mono ${theme.textMuted}`}>Active User</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-[10px] italic pb-1 ${theme.textMuted}`}>No comments posted yet. Start the conversation!</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Say something about the ${pageName} layout...`}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCommentText.trim()) {
                  const text = newCommentText.trim();
                  setCustomComments(prev => ({
                    ...prev,
                    [pageName]: [...(prev[pageName] || []), text]
                  }));
                  setNewCommentText('');
                }
              }}
              className={`flex-1 text-[10px] px-2 py-1 rounded focus:outline-none focus:border-purple-500 ${theme.inputBg}`}
            />
            <button
              type="button"
              onClick={() => {
                if (newCommentText.trim()) {
                  const text = newCommentText.trim();
                  setCustomComments(prev => ({
                    ...prev,
                    [pageName]: [...(prev[pageName] || []), text]
                  }));
                  setNewCommentText('');
                }
              }}
              className="text-[10px] bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-white font-medium cursor-pointer"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;
    setSearchSubmitted(true);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative px-6 md:px-12 z-10">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Prompt Input Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full flex flex-col items-center"
          >
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Step 1: Ideation
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mt-4">
                What would you like to build?
              </h2>
              <p className="text-slate-400 mt-3 font-sans text-base md:text-lg max-w-xl mx-auto">
                Select an archetype below or input a custom concept. Tri is ready to synthesize your requirements.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
              {promptExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => onSelectPrompt(example.text)}
                  className={`group relative p-5 rounded-2xl text-left transition-all duration-300 glass-panel hover:scale-[1.02] ${
                    selectedPrompt === example.text
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'hover:border-cyan-500/30'
                  }`}
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                        {example.category}
                      </span>
                      <h4 className="text-lg font-display font-medium text-slate-200 mt-1 group-hover:text-cyan-300 transition-colors">
                        {example.text}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Interactive Terminal Input Bar */}
            <div className="w-full max-w-2xl relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={selectedPrompt}
                onChange={(e) => onSelectPrompt(e.target.value)}
                placeholder="Or describe anything: 'A decentralized fitness logs tracker with Stripe subscriptions...'"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500/60 rounded-full py-4 pl-12 pr-32 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/60 text-sm md:text-base font-sans shadow-inner backdrop-blur-md"
              />
              <button
                disabled={!selectedPrompt.trim() || customPages.length === 0}
                onClick={() => setStep(2)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-sans text-sm font-semibold py-2 px-6 rounded-full shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Synthesize <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Pages Interactive Configurator */}
            <AnimatePresence>
              {selectedPrompt.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-2xl mt-5 p-5 rounded-2xl border border-slate-800/85 bg-slate-950/45 backdrop-blur-md overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                        📂 Custom Page Architecture
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {customPages.length} {customPages.length === 1 ? 'Page' : 'Pages'} Configured
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                    Based on your prompt, Tri suggested these core pages to build. You can remove them or type new ones to customize the application layout.
                  </p>

                  {/* Pills List */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {customPages.map((page, index) => (
                      <motion.span
                        key={page}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-xs font-medium text-slate-200 transition-all"
                      >
                        {page}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPages(customPages.filter((_, idx) => idx !== index));
                          }}
                          className="w-3.5 h-3.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-200 flex items-center justify-center transition-colors text-[10px]"
                        >
                          ✕
                        </button>
                      </motion.span>
                    ))}
                    {customPages.length === 0 && (
                      <span className="text-xs text-rose-400 italic font-medium">
                        No pages added yet! Add at least one page below to proceed.
                      </span>
                    )}
                  </div>

                  {/* Add Page Row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPageName.trim() && !customPages.includes(newPageName.trim())) {
                            setCustomPages([...customPages, newPageName.trim()]);
                            setNewPageName('');
                          }
                        }
                      }}
                      placeholder="Add another page (e.g. Settings, Listings, Chat)..."
                      className="flex-1 bg-slate-950 border border-slate-800/80 focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPageName.trim() && !customPages.includes(newPageName.trim())) {
                          setCustomPages([...customPages, newPageName.trim()]);
                          setNewPageName('');
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all"
                    >
                      + Add
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2: Real-time Planning & Compilation Terminal */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl w-full flex flex-col md:flex-row gap-6 items-stretch"
          >
            {/* Left side checklist */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  Step 2: Generation
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mt-4">
                  Structuring your codebase...
                </h2>
                <p className="text-slate-400 mt-2 font-sans text-sm">
                  Tri is decomposing your idea, <span className="text-cyan-400 font-mono">"{selectedPrompt || 'Custom App'}"</span>, into functional services and database models.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                {planningItems.map((item, idx) => {
                  const isPending = item.status === 'pending';
                  const isLoading = item.status === 'loading';
                  const isCompleted = item.status === 'completed';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3.5 rounded-xl border transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-950/10 border-emerald-500/20'
                          : isLoading
                          ? 'bg-purple-950/10 border-purple-500/40 glow-purple'
                          : 'bg-slate-900/20 border-slate-800 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
                          ) : isLoading ? (
                            <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800" />
                          )}
                          <span className={`text-sm font-medium ${isCompleted ? 'text-slate-200' : isLoading ? 'text-purple-300' : 'text-slate-500'}`}>
                            {item.label}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            SUCCESS
                          </span>
                        )}
                        {isLoading && (
                          <span className="text-[10px] font-mono text-purple-400 animate-pulse">
                            COMPILING...
                          </span>
                        )}
                      </div>

                      {/* Staggered details list when compiling or complete */}
                      {(isLoading || isCompleted) && (
                        <div className="mt-2.5 pl-8 border-l border-slate-800/80 space-y-1">
                          {item.details.map((detail, dIdx) => (
                            <motion.div
                              key={dIdx}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: dIdx * 0.1 }}
                              className="text-xs font-mono text-slate-400 flex items-center gap-1.5"
                            >
                              <span className="text-cyan-500/60">→</span> {detail}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side high-tech mock server shell output */}
            <div className="w-full md:w-80 glass-panel-neon-purple rounded-2xl p-4 font-mono text-xs flex flex-col justify-between overflow-hidden relative min-h-[300px]">
              {/* Scanline laser layer */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/5 to-purple-500/0 h-1/3 w-full pointer-events-none"
                style={{ animation: 'scanline 4s linear infinite' }}
              />

              <div className="space-y-3 z-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-red-500/60 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-yellow-500/60 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-green-500/60 rounded-full" />
                  </div>
                  <span className="text-[9px] text-purple-400 tracking-wider">compiler.ts</span>
                </div>

                <div className="space-y-1.5 text-slate-300 max-h-[300px] overflow-y-auto">
                  <p className="text-cyan-400"># tridop-compiler init</p>
                  <p className="text-slate-500">Initializing compiler virtual space...</p>
                  <p className="text-slate-500">Retrieving LLM vector schemas...</p>
                  
                  {planningItems[0].status === 'completed' && (
                    <>
                      <p className="text-purple-400 mt-2">&gt; [Features] Parsed successfully</p>
                      <p className="text-slate-500"> - Created 8 user stories</p>
                    </>
                  )}
                  {planningItems[1].status === 'completed' && (
                    <>
                      <p className="text-purple-400">&gt; [Pages] Generated App router</p>
                      <p className="text-slate-500"> - Bound Auth guards to dashboard</p>
                    </>
                  )}
                  {planningItems[2].status === 'completed' && (
                    <>
                      <p className="text-purple-400">&gt; [Database] Provisioning SQLite/PG</p>
                      <p className="text-slate-500"> - Setup standard indices</p>
                    </>
                  )}
                  {planningItems[3].status === 'completed' && (
                    <>
                      <p className="text-purple-400">&gt; [API] Mounting REST controllers</p>
                      <p className="text-emerald-400"> - CORS Configured (0.0.0.0:3000)</p>
                    </>
                  )}
                  {planningItems[4].status === 'completed' && (
                    <>
                      <p className="text-cyan-400 mt-2"># Compiling static visual assets...</p>
                      <p className="text-slate-200 animate-pulse"># Vite Bundler success!</p>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] text-slate-500 z-10">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  STABLE RUNTIME
                </span>
                <span>v3.12.0-beta</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Completed Project Live Preview */}
        {currentStep === 3 && (() => {
          const promptLower = (selectedPrompt || '').toLowerCase();
          const theme = getPreviewTheme();
          let appType: 'food' | 'marketplace' | 'analytics' | 'portfolio' | 'generic' = 'generic';

          if (promptLower.includes('food') || promptLower.includes('delivery') || promptLower.includes('restaurant') || promptLower.includes('eat') || promptLower.includes('pizza') || promptLower.includes('burger')) {
            appType = 'food';
          } else if (promptLower.includes('marketplace') || promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('e-commerce') || promptLower.includes('payment') || promptLower.includes('stripe') || promptLower.includes('checkout') || promptLower.includes('sales')) {
            appType = 'marketplace';
          } else if (promptLower.includes('analytics') || promptLower.includes('saas') || promptLower.includes('dashboard') || promptLower.includes('business') || promptLower.includes('metrics') || promptLower.includes('charts')) {
            appType = 'analytics';
          } else if (promptLower.includes('portfolio') || promptLower.includes('creative') || promptLower.includes('design') || promptLower.includes('3d') || promptLower.includes('resume') || promptLower.includes('gallery')) {
            appType = 'portfolio';
          }

          const getTabLabel = (tab: 'home' | 'catalog' | 'orders') => {
            switch (appType) {
              case 'food':
                return tab === 'home' ? 'Overview' : tab === 'catalog' ? 'Order Menu' : `Cart (${getCartCount()})`;
              case 'marketplace':
                return tab === 'home' ? 'Storefront' : tab === 'catalog' ? 'Shop' : `Bag (${getCartCount()})`;
              case 'analytics':
                return tab === 'home' ? 'Platform' : tab === 'catalog' ? 'Live Insights' : 'Team';
              case 'portfolio':
                return tab === 'home' ? 'About' : tab === 'catalog' ? 'Selected Work' : 'Get in Touch';
              case 'generic':
              default:
                return tab === 'home' ? 'Welcome' : tab === 'catalog' ? 'Features' : 'Connect';
            }
          };

          return (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl w-full flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Step 3: Live Preview
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mt-4">
                  Experience your live sandbox.
                </h2>
                <p className="text-slate-400 mt-2 font-sans text-sm md:text-base">
                  Interact with the compiled preview below to see exactly how your application functions.
                </p>
              </div>

              {/* Huge mock production editor panel */}
              <div className="w-full glass-panel border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[460px]">
                
                {/* File navigation rail */}
                <div className="w-full md:w-52 border-r border-slate-800/80 bg-slate-950/40 p-4 font-mono text-xs text-slate-400 space-y-4 select-none hidden md:block">
                  <div className="flex items-center gap-2 text-slate-200 font-medium pb-2 border-b border-slate-900">
                    <FolderTree className="w-4 h-4 text-cyan-400" />
                    <span>WORKSPACE</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-600 tracking-wider font-semibold uppercase">Source Code</div>
                    <div className="pl-2 space-y-1.5">
                      <div className="text-cyan-400 flex items-center gap-1.5 cursor-pointer hover:text-cyan-300 font-medium">
                        <span>⚡</span> App.tsx
                      </div>
                      {customPages.map((pageName) => {
                        const componentName = pageName.replace(/\s+/g, '') + 'View.tsx';
                        return (
                          <div
                            key={pageName}
                            onClick={() => setActiveCustomTab(pageName)}
                            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                              activeCustomTab === pageName
                                ? 'text-cyan-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>📄</span> {componentName}
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                        <span>🎨</span> index.css
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-600 tracking-wider font-semibold uppercase">Configuration</div>
                    <div className="pl-2 space-y-1.5">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                        <span>⚙️</span> package.json
                      </div>
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                        <span>🛡️</span> firestore.rules
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Simulated Interactive Application Inside workspace */}
                <div className="flex-1 flex flex-col bg-slate-900/30">
                  {/* Simulated browser location header bar */}
                  <div className="bg-slate-950/80 border-b border-slate-800/80 p-3 flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      <div className="bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-400 px-3 py-0.5 rounded-full flex items-center gap-1.5 w-48 md:w-72 truncate ml-2">
                        <span className="text-emerald-400">https://</span>
                        <span>{selectedPrompt ? selectedPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'custom-sandbox'}.tridop.app</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        PREVIEW
                      </span>
                    </div>
                  </div>

                  {/* Sub App View Content Area */}
                  <div className={`flex-1 p-5 flex flex-col justify-between overflow-y-auto font-sans ${theme.containerBg}`}>
                    {/* Interactive App Mock Interface */}
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center pb-2 border-b ${theme.headerBorder}`}>
                        <div>
                          <h4 className={`text-lg font-display font-semibold flex items-center gap-2 ${theme.textNav}`}>
                            {(() => {
                              const titleLower = (selectedPrompt || '').toLowerCase();
                              if (titleLower.includes('food') || titleLower.includes('restaurant') || titleLower.includes('delivery')) {
                                return <Utensils className="w-4 h-4 text-orange-400" />;
                              }
                              if (titleLower.includes('shop') || titleLower.includes('store') || titleLower.includes('market') || titleLower.includes('sale')) {
                                return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
                              }
                              if (titleLower.includes('dashboard') || titleLower.includes('analytic') || titleLower.includes('metrics') || titleLower.includes('chart')) {
                                return <TrendingUp className="w-4 h-4 text-emerald-400" />;
                              }
                              if (titleLower.includes('portfolio') || titleLower.includes('art') || titleLower.includes('resume') || titleLower.includes('design')) {
                                return <User className="w-4 h-4 text-purple-400" />;
                              }
                              return <Globe className="w-4 h-4 text-cyan-400" />;
                            })()}
                            <span>{selectedPrompt || 'My Sandbox Application'}</span>
                          </h4>
                        </div>
                        <div className="flex gap-1.5 text-xs overflow-x-auto max-w-[120px] md:max-w-none pb-1 md:pb-0 scrollbar-none">
                          {customPages.map((pageName) => (
                            <button
                              key={pageName}
                              onClick={() => {
                                setActiveCustomTab(pageName);
                                setContactSuccess(false);
                              }}
                              className={`px-2.5 py-1 rounded-md border transition-all duration-200 text-[11px] font-medium whitespace-nowrap ${
                                activeCustomTab === pageName
                                  ? theme.tabActive
                                  : theme.tabInactive
                              }`}
                            >
                              {pageName}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* App states based on active tab selection */}
                      <div className="min-h-[220px] flex flex-col justify-between">
                        {renderCustomPageContent(activeCustomTab)}
                        {false && (
                          <>
                            {/* 1. FOOD APP */}
                            {appType === 'food' && (
                          <div className="space-y-4">
                            {activeTab === 'home' && (
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                                  <h5 className="text-sm font-semibold text-slate-200">Craving something special?</h5>
                                  <p className="text-xs text-slate-400 mt-1">Get top restaurants delivered instantly to your doorstep.</p>
                                  <form onSubmit={handleAddressSubmit} className="flex gap-2 mt-3">
                                    <div className="relative flex-1">
                                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                      <input
                                        type="text"
                                        placeholder="Enter delivery address..."
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                                      />
                                    </div>
                                    <button type="submit" className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
                                      Search
                                    </button>
                                  </form>
                                </div>
                                
                                {searchSubmitted ? (
                                  <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                                    <span>Showing top-rated delivery options near <strong>{searchAddress}</strong>...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    {['🍕 Pizza', '🍣 Sushi', '🍔 Burgers', '🥗 Salads'].map((food) => (
                                      <div key={food} className="p-2.5 rounded-lg border border-slate-800/60 bg-slate-950/20 text-xs text-slate-300">
                                        {food}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {activeTab === 'catalog' && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chef's Specialties</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {[
                                    { id: 'f1', name: 'Spicy Tuna Crunch', desc: 'Fresh tuna with spicy sriracha mayo & tempura.', price: 14.50 },
                                    { id: 'f2', name: 'Smoked Truffle Burger', desc: 'Wagyu beef patty with black truffle gruyère.', price: 16.00 },
                                    { id: 'f3', name: 'Margherita Rustica', desc: 'Buffalo mozzarella, heirloom tomatoes & basil.', price: 15.00 },
                                  ].map((item) => {
                                    const inCart = cart.find(i => i.id === item.id)?.quantity || 0;
                                    return (
                                      <div key={item.id} className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl flex flex-col justify-between">
                                        <div>
                                          <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-slate-200">{item.name}</span>
                                            <span className="text-xs text-orange-400 font-semibold">${item.price.toFixed(2)}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                                        </div>
                                        <button
                                          onClick={() => handleAddToCart(item)}
                                          className="w-full mt-3 py-1 text-[10px] text-center bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-lg transition-all border border-cyan-500/20 font-medium"
                                        >
                                          {inCart > 0 ? `Add Another (${inCart})` : 'Add to Order'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="space-y-4">
                                {paymentStatus === 'idle' ? (
                                  cart.length === 0 ? (
                                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                                      <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                      <p className="text-xs text-slate-400">Your order basket is empty.</p>
                                      <button onClick={() => setActiveTab('catalog')} className="text-xs text-cyan-400 hover:underline mt-1">Browse our Order Menu</button>
                                    </div>
                                  ) : (
                                    <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl space-y-3">
                                      <h5 className="text-xs font-semibold text-slate-300">Order Summary</h5>
                                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                                        {cart.map(item => (
                                          <div key={item.id} className="flex justify-between items-center text-xs text-slate-300">
                                            <span>{item.name} <span className="text-[10px] text-slate-500">x{item.quantity}</span></span>
                                            <div className="flex items-center gap-2">
                                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                                              <button onClick={() => handleRemoveFromCart(item.id)} className="text-[10px] text-rose-500 hover:text-rose-400">Remove</button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-xs font-bold text-slate-200">
                                        <span>Total Amount</span>
                                        <span>${getCartTotal().toFixed(2)}</span>
                                      </div>
                                      <button
                                        onClick={() => setPaymentStatus('success')}
                                        className="w-full mt-2 py-2 text-xs text-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-semibold"
                                      >
                                        Place Delivery Order & Track Live
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                        Simulated Live Delivery Track
                                      </span>
                                      <button onClick={() => { setPaymentStatus('idle'); setCart([]); }} className="text-[10px] text-slate-500 hover:text-slate-300 underline">Reset</button>
                                    </div>

                                    {/* Tracking Stepper */}
                                    <div className="grid grid-cols-4 gap-2 relative">
                                      {[
                                        { icon: Clock, label: 'Received' },
                                        { icon: Utensils, label: 'Kitchen' },
                                        { icon: Compass, label: 'On Road' },
                                        { icon: CheckCircle2, label: 'Arrived' },
                                      ].map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const isDone = orderTrackStep >= idx;
                                        const isActive = orderTrackStep === idx;
                                        return (
                                          <div key={idx} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                                              isDone ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-600'
                                            }`}>
                                              <StepIcon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <span className={`text-[9px] mt-1.5 font-medium ${isDone ? 'text-slate-200' : 'text-slate-600'}`}>{step.label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <p className="text-[11px] text-slate-400 text-center italic mt-2">
                                      {orderTrackStep === 0 && "Your order is safe with us. Our kitchen is currently heating things up!"}
                                      {orderTrackStep === 1 && "The chefs are handcrafting your meal with care."}
                                      {orderTrackStep === 2 && "Our delivery rider is heading towards your location at top speed!"}
                                      {orderTrackStep === 3 && "Arrived! Your fresh delivery is waiting for you at your doorstep."}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. MARKETPLACE APP */}
                        {appType === 'marketplace' && (
                          <div className="space-y-4">
                            {activeTab === 'home' && (
                              <div className="space-y-4 text-center py-2">
                                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/40 border border-slate-800">
                                  <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase">Premium Desktop Gear</span>
                                  <h5 className="text-xl font-display font-medium text-slate-100 mt-1">ELEVATED CREATIVE WORKSPACES</h5>
                                  <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                                    A capsule series of hand-finished Merino wool desk pads, full-grain leather sleeves, and precision machined utility gear.
                                  </p>
                                  <div className="mt-4 flex justify-center gap-3">
                                    <button onClick={() => setActiveTab('catalog')} className="text-xs bg-slate-100 hover:bg-white text-slate-950 font-bold px-4 py-2 rounded-lg transition-all shadow-md">
                                      Shop the Collection
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'catalog' && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Artifacts</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {[
                                    { id: 'm1', name: 'Merino Wool Desk Pad', desc: '100% natural organic felt. Non-slip grip floor.', price: 38.00 },
                                    { id: 'm2', name: 'Vegetable Leather Folio', desc: 'Padded sleeve tailored for tablet & tools.', price: 75.00 },
                                    { id: 'm3', name: 'Anodized Key Loop', desc: 'Aircraft alloy carabiner quick release mechanism.', price: 22.00 },
                                  ].map((item) => {
                                    const inCart = cart.find(i => i.id === item.id)?.quantity || 0;
                                    return (
                                      <div key={item.id} className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl flex flex-col justify-between">
                                        <div>
                                          <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-slate-200">{item.name}</span>
                                            <span className="text-xs text-cyan-400 font-semibold">${item.price.toFixed(2)}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                                        </div>
                                        <button
                                          onClick={() => handleAddToCart(item)}
                                          className="w-full mt-3 py-1.5 text-[10px] text-center bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg transition-all border border-slate-800 font-medium"
                                        >
                                          {inCart > 0 ? `In Bag (${inCart})` : 'Add to Bag'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="space-y-4">
                                {paymentStatus === 'idle' ? (
                                  cart.length === 0 ? (
                                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                                      <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                      <p className="text-xs text-slate-400">Your shopping bag is currently empty.</p>
                                      <button onClick={() => setActiveTab('catalog')} className="text-xs text-cyan-400 hover:underline mt-1">Explore Shop Gear</button>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Left side items */}
                                      <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl space-y-3">
                                        <h5 className="text-xs font-semibold text-slate-300">Bag Summary</h5>
                                        <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                                          {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-xs text-slate-300">
                                              <span>{item.name} <span className="text-[10px] text-slate-500">x{item.quantity}</span></span>
                                              <div className="flex items-center gap-2">
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                <button onClick={() => handleRemoveFromCart(item.id)} className="text-[10px] text-rose-500 hover:text-rose-400">Remove</button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-xs font-bold text-slate-200">
                                          <span>Total Price</span>
                                          <span>${getCartTotal().toFixed(2)}</span>
                                        </div>
                                      </div>

                                      {/* Right side checkout form */}
                                      <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5">
                                        <h5 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                          <Lock className="w-3 h-3 text-emerald-400" /> Secure Payment Details
                                        </h5>
                                        <div className="space-y-2">
                                          <div className="p-2 border border-slate-800 rounded bg-slate-950 text-xs font-mono text-slate-300 flex justify-between">
                                            <span>4242 4242 4242 4242</span>
                                            <span className="text-slate-500">Stripe</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 border border-slate-800 rounded bg-slate-950 text-xs font-mono text-slate-400">
                                              12 / 29
                                            </div>
                                            <div className="p-2 border border-slate-800 rounded bg-slate-950 text-xs font-mono text-slate-400">
                                              ***
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setPaymentStatus('processing');
                                            setTimeout(() => {
                                              setPaymentStatus('success');
                                            }, 1500);
                                          }}
                                          className="w-full py-1.5 text-xs text-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors mt-1"
                                        >
                                          Pay ${getCartTotal().toFixed(2)} via Stripe
                                        </button>
                                      </div>
                                    </div>
                                  )
                                ) : paymentStatus === 'processing' ? (
                                  <div className="p-8 text-center border border-slate-800 bg-slate-950/40 rounded-xl space-y-3">
                                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-slate-400 font-mono">Verifying secure payment session via Stripe gateways...</p>
                                  </div>
                                ) : (
                                  <div className="p-6 text-center border border-emerald-500/20 bg-emerald-950/10 rounded-xl space-y-3">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                                    <h5 className="text-sm font-semibold text-slate-200">Payment Successful!</h5>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                      Receipt is registered and dispatch details are processed. Estimated delivery of your workspace gear is <strong>Friday, July 3rd</strong>.
                                    </p>
                                    <button onClick={() => { setPaymentStatus('idle'); setCart([]); }} className="text-xs text-cyan-400 hover:underline">Shop more</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. SAAS ANALYTICS DASHBOARD */}
                        {appType === 'analytics' && (
                          <div className="space-y-4">
                            {activeTab === 'home' && (
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">System Operational</span>
                                  <h5 className="text-base font-semibold text-slate-200 mt-2">Team Analytics Engine</h5>
                                  <p className="text-xs text-slate-400 mt-1">
                                    A robust cloud metric data pipeline designed to parse real-time event logging, retention patterns, and sales pipelines in a single dashboard space.
                                  </p>
                                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                    <span>Sync Frequency: 10s</span>
                                    <span>•</span>
                                    <span>Latency: 12ms</span>
                                    <span>•</span>
                                    <span>Location: EU West</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeTab === 'catalog' && (() => {
                              const baseVal = 42950 + (refreshes * 340);
                              return (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Analytics Overview</h5>
                                    <button onClick={() => setRefreshes(r => r + 1)} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono">
                                      🔄 Force Update
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-xl">
                                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Weekly Visitors</div>
                                      <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono">{(18240 + (refreshes * 42)).toLocaleString()}</div>
                                      <div className="text-[9px] text-emerald-400 mt-0.5 font-sans">+12% vs last week</div>
                                    </div>
                                    <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-xl">
                                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Monthly MRR</div>
                                      <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono">${baseVal.toLocaleString()}</div>
                                      <div className="text-[9px] text-emerald-400 mt-0.5 font-sans">+8.4% MRR Growth</div>
                                    </div>
                                    <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-xl">
                                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Funnel Conversion</div>
                                      <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono">{(3.4 + (refreshes * 0.05)).toFixed(2)}%</div>
                                      <div className="text-[9px] text-cyan-400 mt-0.5 font-sans">Highly Optimal</div>
                                    </div>
                                  </div>

                                  {/* Custom High-Fidelity Mini SVG Chart */}
                                  <div className="p-3 border border-slate-800 bg-slate-950/80 rounded-xl h-20 flex flex-col justify-between">
                                    <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Visitor Volume Timeline</div>
                                    <svg className="w-full h-10 text-cyan-400 overflow-visible" viewBox="0 0 400 40">
                                      <defs>
                                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        d={`M 0,35 Q 80,${30 - (refreshes % 3) * 5} 150,${25 + (refreshes % 2) * 5} T 300,${15 - (refreshes % 4) * 2} L 400,10`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d={`M 0,35 Q 80,${30 - (refreshes % 3) * 5} 150,${25 + (refreshes % 2) * 5} T 300,${15 - (refreshes % 4) * 2} L 400,10 L 400,40 L 0,40 Z`}
                                        fill="url(#chart-grad)"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              );
                            })()}

                            {activeTab === 'orders' && (
                              <div className="space-y-3">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Access Control</h5>
                                <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                                  {teamMembers.map((member, idx) => (
                                    <div key={idx} className="p-2 border border-slate-850 bg-slate-950/40 rounded-lg flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[9px] font-bold">
                                          {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-slate-200">{member.name}</span>
                                      </div>
                                      <span className="text-[10px] font-mono text-cyan-400">{member.role}</span>
                                    </div>
                                  ))}
                                </div>

                                <form onSubmit={handleInviteMember} className="flex gap-2">
                                  <input
                                    type="email"
                                    placeholder="Add team member's email..."
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1 text-xs bg-slate-950 border border-slate-805 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 rounded-lg"
                                  />
                                  <button type="submit" className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
                                    Invite
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. CREATIVE PORTFOLIO WEBSITE */}
                        {appType === 'portfolio' && (
                          <div className="space-y-4">
                            {activeTab === 'home' && (
                              <div className="space-y-3 py-2 text-center">
                                <h5 className="text-xs font-mono tracking-widest text-purple-400 uppercase">Interactive Digital Space</h5>
                                <h4 className="text-xl font-display font-medium text-slate-200">HI, I'm A CREATIVE DEVELOPER</h4>
                                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                  I specialize in custom WebGL systems, procedural animation mechanics, and designing sleek minimalist web frontends.
                                </p>
                                <button onClick={() => setActiveTab('catalog')} className="text-xs border border-purple-500/30 hover:border-purple-400 bg-purple-950/20 text-purple-300 hover:text-white px-4 py-1.5 rounded-full transition-all mt-1">
                                  Selected Work
                                </button>
                              </div>
                            )}

                            {activeTab === 'catalog' && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured Interactive Projects</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {[
                                    { name: 'Aether Engine', desc: 'WebGL fluid particles simulation running 60fps in-browser.', tags: ['WebGL', 'GLSL'] },
                                    { name: 'Helios Protocol', desc: 'High-speed automated liquidity aggregator and router dashboard.', tags: ['React', 'DeFi'] },
                                    { name: 'Procedural Art', desc: 'SVG generator rendering mathematical generative pattern maps.', tags: ['SVG', 'Math'] },
                                  ].map((project, pIdx) => (
                                    <div key={pIdx} className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl flex flex-col justify-between">
                                      <div>
                                        <h6 className="text-xs font-bold text-slate-200">{project.name}</h6>
                                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{project.desc}</p>
                                      </div>
                                      <div className="mt-3 flex gap-1">
                                        {project.tags.map(t => (
                                          <span key={t} className="text-[8px] font-mono text-purple-300 bg-purple-950/30 border border-purple-500/10 px-1.5 py-0.5 rounded">
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="space-y-4">
                                {contactSuccess ? (
                                  <div className="p-6 text-center border border-purple-500/20 bg-purple-950/10 rounded-xl space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto" />
                                    <h5 className="text-xs font-semibold text-slate-200">Message Sent Successfully!</h5>
                                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                      Thank you for your response! I have registered your email and will follow up within 24 hours.
                                    </p>
                                    <button onClick={() => setContactSuccess(false)} className="text-[10px] text-purple-400 hover:underline">Send another message</button>
                                  </div>
                                ) : (
                                  <form onSubmit={handleContactSubmit} className="space-y-2.5 bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl">
                                    <h5 className="text-xs font-semibold text-slate-300">Drop a Line</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                                        className="text-xs bg-slate-950 border border-slate-850 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 rounded-lg"
                                      />
                                      <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                                        className="text-xs bg-slate-950 border border-slate-850 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 rounded-lg"
                                      />
                                    </div>
                                    <textarea
                                      placeholder="Write your message details..."
                                      rows={2}
                                      value={contactForm.message}
                                      onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                                      className="w-full text-xs bg-slate-950 border border-slate-850 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 rounded-lg resize-none"
                                    />
                                    <button type="submit" className="w-full py-1.5 text-xs text-center bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors">
                                      Send Message
                                    </button>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. GENERIC / CUSTOM PROMPT */}
                        {appType === 'generic' && (
                          <div className="space-y-4">
                            {activeTab === 'home' && (
                              <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Fully Structured App</span>
                                  <h5 className="text-base font-semibold text-slate-200 mt-1">Workspace Template</h5>
                                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                    Your custom app targeting <strong>"{selectedPrompt}"</strong> is initialized. All modules are correctly linked, routes are configured, and tailwind elements are compiled successfully.
                                  </p>
                                </div>
                              </div>
                            )}

                            {activeTab === 'catalog' && (
                              <div className="space-y-2.5">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dynamic App Structure</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                  {[
                                    { title: 'Secure Authentication', desc: 'Pre-linked secure login paths protecting dashboard resources.' },
                                    { title: 'Responsive Grid', desc: 'Adaptive slate interface rendering smoothly on ultra-wide & mobile viewports.' },
                                    { title: 'Local Data Cache', desc: 'Secure local client-side state hooks keeping UI elements fully synced.' },
                                  ].map((feat, idx) => (
                                    <div key={idx} className="p-3 border border-slate-800/80 bg-slate-950/40 rounded-xl">
                                      <h6 className="text-xs font-bold text-slate-200">{feat.title}</h6>
                                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{feat.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeTab === 'orders' && (
                              <div className="space-y-3">
                                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-center space-y-2">
                                  <Globe className="w-7 h-7 text-cyan-400 mx-auto animate-pulse" />
                                  <h5 className="text-xs font-semibold text-slate-200">Interactive Connectivity Online</h5>
                                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                                    Your custom server endpoints are bound to the dev pipeline. You can start hacking files directly in the active builder workspace!
                                  </p>
                                  <div className="flex justify-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-mono">PORT 3000 Active</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">DB Synchronized</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        </>
                        )}
                      </div>
                    </div>

                    {/* Clean real-world browser footer details (No AI slop logs) */}
                    <div className="border-t border-slate-900 pt-3.5 flex justify-between items-center text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        All checks passed • Secure TLS connection
                      </span>
                      <span className="font-mono">Auto-save active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons for Registering or Log In */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
                <button
                  onClick={() => {
                    setIsSignUpMode(true);
                    setStep(4);
                  }}
                  className="w-full sm:flex-1 interactive-chip group flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3.5 px-6 rounded-full font-sans font-semibold shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    setIsSignUpMode(false);
                    setStep(4);
                  }}
                  className="w-full sm:flex-1 interactive-chip flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 py-3.5 px-6 rounded-full font-sans font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  Log In
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* STEP 4: High-Fidelity Dual-Pane Sign Up and Login Experience */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-[#09090b] rounded-3xl border border-slate-800/80 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.6)] h-[620px] md:h-[540px]"
          >
            {/* LEFT SIDE: Deep Glowing Sapphire Blue & Midnight Black Sidebar with Moving Particles */}
            <div className="w-full md:w-[42%] p-8 bg-gradient-to-br from-[#071330] via-[#020512] to-[#000000] relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/60 overflow-hidden">
              {/* Moving Canvas Particles */}
              <MovingParticles />

              {/* Background abstract glowing orbs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/15 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />

              {/* Step indicator top logo/title */}
              <div className="z-10 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-950 font-display">
                  T
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-medium tracking-wider uppercase">
                  Tridop Secure
                </span>
              </div>

              {/* Heading and description */}
              <div className="my-auto z-10 py-6">
                <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight leading-none mb-2.5">
                  Get Started with Us
                </h3>
                <p className="text-[11px] text-cyan-400/85 font-sans leading-relaxed max-w-xs">
                  Complete these easy steps to register your account.
                </p>

                {/* Steps List (Active vs Inactive design as in reference image) */}
                <div className="flex flex-col gap-3 mt-6">
                  {/* Step 1 */}
                  <div className={`p-3 rounded-xl flex items-center gap-3 border transition-all duration-300 ${
                    isSignUpMode 
                      ? 'bg-white border-white text-slate-950 shadow-[0_4px_12px_rgba(255,255,255,0.08)]' 
                      : 'bg-blue-950/20 border-blue-500/15 text-slate-400'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isSignUpMode ? 'bg-slate-950 text-white' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      1
                    </div>
                    <span className="text-[11px] font-bold">Sign up your account</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3 rounded-xl flex items-center gap-3 border transition-all duration-300 ${
                    !isSignUpMode 
                      ? 'bg-white border-white text-slate-950 shadow-[0_4px_12px_rgba(255,255,255,0.08)]' 
                      : 'bg-blue-950/20 border-blue-500/15 text-slate-400'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      !isSignUpMode ? 'bg-slate-950 text-white' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      2
                    </div>
                    <span className="text-[11px] font-bold">Set up your workspace</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl flex items-center gap-3 bg-blue-950/20 border border-blue-500/15 text-slate-400">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-blue-500/10 text-blue-400">
                      3
                    </div>
                    <span className="text-[11px] font-bold">Set up your profile</span>
                  </div>
                </div>
              </div>

              {/* Bottom detail */}
              <div className="z-10 text-[9px] text-blue-500/60 font-mono">
                System status: Operational
              </div>
            </div>

            {/* RIGHT SIDE: Elegant Dark signup/login form */}
            <div className="w-full md:w-[58%] p-8 bg-[#09090b] flex flex-col justify-center overflow-y-auto">
              {/* Error Alert if any */}
              {authError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs space-y-2">
                  <div className="text-rose-400 font-medium leading-relaxed">
                    {authError}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError('');
                      onAuthSuccess?.('Okubor Chinonye', 'okuborchinonye@gmail.com');
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 font-bold transition-all text-xs text-center cursor-pointer shadow-[0_2px_8px_rgba(37,99,235,0.15)] mt-1"
                  >
                    Bypass & Sign In with Demo Account
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* Heading & description */}
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-100 tracking-tight">
                    {isSignUpMode ? 'Sign Up Account' : 'Welcome Back'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isSignUpMode 
                      ? 'Enter your personal data to create your account.' 
                      : 'Please input your credentials to log into your account.'
                    }
                  </p>
                </div>

                {/* Social Google/Github Buttons exactly like reference layout */}
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onMouseEnter={() => onFieldFocus?.('social')}
                    onFocus={() => onFieldFocus?.('social')}
                    onClick={() => {
                      setActiveAuthProvider('google');
                      setIsAuthPopupOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-xs font-semibold text-slate-200 transition-all hover:border-slate-700 hover:scale-[1.01]"
                  >
                    <Chrome className="w-3.5 h-3.5 text-rose-400" />
                    <span>Google</span>
                  </button>
                  <button 
                    type="button"
                    onMouseEnter={() => onFieldFocus?.('social')}
                    onFocus={() => onFieldFocus?.('social')}
                    onClick={() => {
                      setActiveAuthProvider('github');
                      setIsAuthPopupOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-xs font-semibold text-slate-200 transition-all hover:border-slate-700 hover:scale-[1.01]"
                  >
                    <Github className="w-3.5 h-3.5 text-purple-400" />
                    <span>Github</span>
                  </button>
                </div>

                {/* Or Divider */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-900"></div>
                  </div>
                  <span className="relative bg-[#09090b] px-3 text-[9px] font-mono text-slate-600 uppercase">Or</span>
                </div>

                {/* Form Fields with dynamic focus reporting */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthError('');
                    
                    const storedUsers = localStorage.getItem('tridop_registered_users');
                    const users = storedUsers ? JSON.parse(storedUsers) : [];

                    if (isSignUpMode) {
                      if (!authFirstName.trim() || !authLastName.trim() || !authEmail.trim() || !authPassword.trim()) {
                        setAuthError('Please fill in all fields.');
                        return;
                      }

                      const fullName = `${authFirstName.trim()} ${authLastName.trim()}`;
                      setIsAuthLoading(true);
                      try {
                        await client.auth.signup({
                          name: fullName,
                          email: authEmail.trim(),
                          password: authPassword,
                        });
                        onAuthSuccess?.(fullName, authEmail.trim());
                      } catch (err: any) {
                        const message = err.response?.data?.message || err.message || 'Signup failed.';
                        setAuthError(message);
                      } finally {
                        setIsAuthLoading(false);
                      }
                    } else {
                      if (!authEmail.trim() || !authPassword.trim()) {
                        setAuthError('Invalid email or password.');
                        return;
                      }

                      setIsAuthLoading(true);
                      try {
                        await client.auth.login({
                          email: authEmail.trim(),
                          password: authPassword,
                        });
                        onAuthSuccess?.(authEmail.trim().split('@')[0], authEmail.trim());
                      } catch (err: any) {
                        const message = err.response?.data?.message;
                        if (message === 'Account is suspended') {
                          setAuthError('Your account has been suspended. Contact support.');
                        } else {
                          setAuthError('Invalid email or password.');
                        }
                      } finally {
                        setIsAuthLoading(false);
                      }
                    }
                  }} 
                  className="space-y-3.5"
                >
                  {isSignUpMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          required
                          value={authFirstName}
                          onChange={(e) => setAuthFirstName(e.target.value)}
                          onFocus={() => onFieldFocus?.('name')}
                          onMouseEnter={() => onFieldFocus?.('name')}
                          placeholder="eg. John"
                          className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          required
                          value={authLastName}
                          onChange={(e) => setAuthLastName(e.target.value)}
                          onFocus={() => onFieldFocus?.('name')}
                          onMouseEnter={() => onFieldFocus?.('name')}
                          placeholder="eg. Francisco"
                          className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      onFocus={() => onFieldFocus?.('email')}
                      onMouseEnter={() => onFieldFocus?.('email')}
                      placeholder="eg. johnfrans@gmail.com"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        onFocus={() => onFieldFocus?.('password')}
                        onMouseEnter={() => onFieldFocus?.('password')}
                        placeholder="Enter your password"
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {isSignUpMode && (
                      <p className="text-[9px] text-slate-500 mt-1">Must be at least 8 characters.</p>
                    )}
                  </div>

                  {/* Sign Up / Log In Button (Solid white) */}
                  <button 
                    type="submit"
                    disabled={isAuthLoading}
                    onMouseEnter={() => onFieldFocus?.('submit')}
                    onFocus={() => onFieldFocus?.('submit')}
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-sans font-bold py-3 px-4 rounded-xl text-xs transition-all duration-300 hover:scale-[1.01] mt-2 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAuthLoading ? 'Logging in...' : (isSignUpMode ? 'Sign Up' : 'Log In')}
                  </button>
                </form>

                {/* Switcher link */}
                <div 
                  onMouseEnter={() => onFieldFocus?.('mode')}
                  onFocus={() => onFieldFocus?.('mode')}
                  className="text-center mt-3"
                >
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(!isSignUpMode);
                      setAuthError('');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors underline decoration-slate-600 hover:decoration-white font-medium"
                  >
                    {isSignUpMode ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AuthPopupModal
          isOpen={isAuthPopupOpen}
          provider={activeAuthProvider}
          onClose={() => {
            setIsAuthPopupOpen(false);
            setActiveAuthProvider(null);
          }}
          onSuccess={(name, email) => {
            onAuthSuccess?.(name, email);
          }}
        />
      </AnimatePresence>
    </div>
  );
}
