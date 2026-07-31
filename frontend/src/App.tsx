import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlowingBackground from './components/GlowingBackground';
import CustomCursor from './components/CustomCursor';
import TriMascot from './components/TriMascot';
import Typewriter from './components/Typewriter';
import OnboardingFlow from './components/OnboardingFlow';
import ReturningUserDashboard from './components/ReturningUserDashboard';
import AuthPopupModal from './components/AuthPopupModal';
import OnboardingWizard, { OnboardingState } from './components/OnboardingWizard';
import BuilderView from './components/BuilderView';
import ProjectHistoryView from './components/ProjectHistoryView';
import BillingView from './components/BillingView';
import OwnerAdminView from './components/OwnerAdminView';
import { PreviewView } from './components/PreviewView';
import { User, Project, Block } from './types';
import { ChevronDown, Sparkles, UserCheck, Play, Layers } from 'lucide-react';
import { client } from './lib/client';


function generateBlocksForProject(data: OnboardingState): Block[] {
  const roundedButtons = data.vibe === 'Playful' || data.vibe === 'Elegant';
  const primaryColor = data.primaryColor || '#06b6d4';
  const secondaryColor = data.secondaryColor || '#a855f7';
  const fontFamily = data.fontFamily || 'Inter, sans-serif';

  // Choose visual backgrounds based on vibe
  const isDark = data.vibe === 'Modern' || data.vibe === 'Bold' || data.vibe === 'Corporate';
  
  const navBg = isDark ? 'bg-slate-950 border-b border-slate-900' : 'bg-white border-b border-slate-100';
  const navText = isDark ? 'text-slate-100' : 'text-slate-800';
  
  const heroBg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const heroText = isDark ? 'text-slate-100' : 'text-slate-800';

  const bentoBg = isDark ? 'bg-slate-900/60' : 'bg-white';
  const bentoText = isDark ? 'text-slate-200' : 'text-slate-700';

  const ctaBg = isDark ? 'bg-slate-900' : 'bg-slate-100';
  const ctaText = isDark ? 'text-slate-100' : 'text-slate-800';

  const footerBg = isDark ? 'bg-slate-950 border-t border-slate-900' : 'bg-white border-t border-slate-100';
  const footerText = isDark ? 'text-slate-500' : 'text-slate-400';

  // Build comprehensive topic detection string
  const fullTopic = `${data.businessType || ''} ${data.customBusinessType || ''} ${data.businessName || ''} ${data.tagline || ''}`.toLowerCase();

  // Determine topic-matched hero image
  let heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=60';
  if (fullTopic.includes('feet') || fullTopic.includes('foot') || fullTopic.includes('podiatry') || fullTopic.includes('pedicure') || fullTopic.includes('shoe')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1519415510236-718bdfcd8960?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('salon') || fullTopic.includes('beauty') || fullTopic.includes('hair') || fullTopic.includes('barber') || fullTopic.includes('spa') || fullTopic.includes('massage')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('restaurant') || fullTopic.includes('pizza') || fullTopic.includes('food') || fullTopic.includes('dining') || fullTopic.includes('cafe')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('retail') || fullTopic.includes('store') || fullTopic.includes('shop') || fullTopic.includes('fashion') || fullTopic.includes('clothing')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('fitness') || fullTopic.includes('gym') || fullTopic.includes('workout') || fullTopic.includes('sports')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('health') || fullTopic.includes('clinic') || fullTopic.includes('doctor') || fullTopic.includes('medical') || fullTopic.includes('hospital') || fullTopic.includes('wellness')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60';
  } else if (fullTopic.includes('agency') || fullTopic.includes('marketing') || fullTopic.includes('design') || fullTopic.includes('media')) {
    heroImage = data.logoUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60';
  }

  // Generate tailored Bento items based on business profile topic
  let bentoItems = [
    { title: 'Tailored Service', desc: data.tagline || 'Custom designed solutions fitting your precise goals.' },
    { title: 'High Performance', desc: 'Optimized speed and responsive layouts for edge networks.' },
    { title: 'Modern Security', desc: 'Protected by virtual container isolation standards.' }
  ];

  if (fullTopic.includes('feet') || fullTopic.includes('foot') || fullTopic.includes('podiatry') || fullTopic.includes('pedicure')) {
    bentoItems = [
      { title: 'Specialized Foot Care', desc: 'Comprehensive podiatry assessments and customized care plans.' },
      { title: 'Therapeutic Pedicures & Spa', desc: 'Soothing foot treatments combining hygiene, comfort, and relaxation.' },
      { title: 'Custom Orthotics & Support', desc: 'Engineered arch and foot support solutions for pain-free mobility.' }
    ];
  } else if (fullTopic.includes('salon') || fullTopic.includes('beauty') || fullTopic.includes('spa')) {
    bentoItems = [
      { title: 'Luxury Styling & Cuts', desc: 'Custom hair and aesthetic treatments tailored to your personal look.' },
      { title: 'Organic Skin & Body Care', desc: 'Nourishing botanical formulas for healthy, glowing radiance.' },
      { title: 'VIP Appointment Booking', desc: 'Seamless online scheduling with zero wait times.' }
    ];
  } else if (fullTopic.includes('restaurant') || fullTopic.includes('food') || fullTopic.includes('pizza')) {
    bentoItems = [
      { title: 'Artisanal Fresh Ingredients', desc: 'Sourced daily from certified local organic farms.' },
      { title: 'Express Warm Delivery', desc: 'Insulated thermal transit ensuring oven-fresh arrival.' },
      { title: 'Chef Special Recipes', desc: 'Crafted with passion using secret family spice blends.' }
    ];
  }

  // Construct contact details subtitle
  const contactParts = [
    data.address && `📍 ${data.address}`,
    data.phone && `📞 ${data.phone}`,
    data.whatsApp && `💬 WhatsApp: ${data.whatsApp}`,
    data.contactEmail && `✉️ ${data.contactEmail}`
  ].filter(Boolean);

  const contactSubtitle = contactParts.length > 0
    ? contactParts.join(' • ')
    : (data.tagline || `Get in touch with ${data.businessName || 'our team'} today.`);

  const footerContactDetails = [data.address, data.phone, data.contactEmail].filter(Boolean).join(' | ');

  return [
    {
      id: 'b-nav',
      type: 'navigation',
      name: 'Custom Nav Header',
      data: {
        logo: data.logoUrl ? data.logoUrl : `⚡ ${data.businessName || 'Brand'}`,
        links: ['Services', 'About', 'Contact'],
        buttonText1: 'Get Started'
      },
      styles: {
        bg: navBg,
        text: navText,
        accent: primaryColor,
        primaryColor,
        secondaryColor,
        fontFamily,
        paddingY: 'py-4',
        roundedButtons
      }
    },
    {
      id: 'b-hero',
      type: 'hero',
      name: 'Synthesized Hero',
      data: {
        title: data.tagline || `Welcome to ${data.businessName || 'Our Business'}`,
        subtitle: `Curated meticulously for a ${data.vibe || 'Modern'} look & feel, serving clients in ${data.audienceLocation || 'your area'}.`,
        buttonText1: 'Get Started Today',
        buttonText2: 'Explore Services',
        placeholderImage: heroImage
      },
      styles: {
        bg: heroBg,
        text: heroText,
        accent: primaryColor,
        primaryColor,
        secondaryColor,
        fontFamily,
        paddingY: 'py-20',
        roundedButtons
      }
    },
    {
      id: 'b-features',
      type: 'content',
      name: 'Value Proposition Bento',
      data: {
        title: `Supercharged ${data.businessName || 'Brand'} Experience`,
        subtitle: data.tagline || `A comprehensive outline of why our custom services outperform standard options.`,
        items: bentoItems
      },
      styles: {
        bg: bentoBg,
        text: bentoText,
        accent: secondaryColor,
        primaryColor,
        secondaryColor,
        fontFamily,
        paddingY: 'py-16',
        roundedButtons
      }
    },
    {
      id: 'b-cta',
      type: 'cta',
      name: 'Onboard Capture Form',
      data: {
        title: `Connect with ${data.businessName || 'Us'}`,
        subtitle: contactSubtitle,
        buttonText1: 'Subscribe / Connect',
        formPlaceholder: data.contactEmail || 'enter your email address'
      },
      styles: {
        bg: ctaBg,
        text: ctaText,
        accent: primaryColor,
        primaryColor,
        secondaryColor,
        fontFamily,
        paddingY: 'py-14',
        roundedButtons
      }
    },
    {
      id: 'b-footer',
      type: 'footer',
      name: 'Simple Brand Footer',
      data: {
        copyright: `© 2026 ${data.businessName || 'Brand'}. ${footerContactDetails ? footerContactDetails + '.' : 'All rights reserved.'}`,
        logo: data.logoUrl ? data.logoUrl : `⚡ ${data.businessName || 'Brand'}`
      },
      styles: {
        bg: footerBg,
        text: footerText,
        accent: primaryColor,
        primaryColor,
        secondaryColor,
        fontFamily,
        paddingY: 'py-8',
        roundedButtons
      }
    }
  ];
}

function getDefaultProjects(email: string): Project[] {
  return [
    {
      id: 'p1',
      name: 'Zippy Food Delivery',
      status: 'active',
      lastUpdated: '2 hours ago',
      stack: ['React', 'Express', 'SQLite'],
      userEmail: email,
      blocks: [
        {
          id: 'b-nav',
          type: 'navigation',
          name: 'Minimal Header',
          data: {
            logo: '⚡ ZippyDelivery',
            links: ['Menu', 'Locations', 'About Us', 'Contact'],
            buttonText1: 'Order Now'
          },
          styles: { bg: 'bg-slate-950 border-b border-slate-900', text: 'text-slate-200', accent: '#06b6d4', paddingY: 'py-4', roundedButtons: true }
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
          styles: { bg: 'bg-slate-950', text: 'text-slate-100', accent: '#06b6d4', paddingY: 'py-20', roundedButtons: true }
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
          styles: { bg: 'bg-slate-950/80', text: 'text-slate-300', accent: '#06b6d4', paddingY: 'py-16', roundedButtons: true }
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
          styles: { bg: 'bg-slate-900', text: 'text-slate-100', accent: '#06b6d4', paddingY: 'py-14', roundedButtons: true }
        },
        {
          id: 'b-footer',
          type: 'footer',
          name: 'Simple Footer',
          data: {
            copyright: '© 2026 Zippy Food Labs Corp. Encrypted dispatch systems.',
            logo: '⚡ Zippy'
          },
          styles: { bg: 'bg-slate-950 border-t border-slate-900', text: 'text-slate-500', accent: '#06b6d4', paddingY: 'py-8', roundedButtons: true }
        }
      ]
    },
    {
      id: 'p2',
      name: 'Crypton Trade Dashboard',
      status: 'active',
      lastUpdated: 'Yesterday',
      stack: ['Next.js', 'PostgreSQL', 'D3.js'],
      userEmail: email,
      blocks: [
        {
          id: 'b-nav',
          type: 'navigation',
          name: 'Sleek Dashboard Header',
          data: {
            logo: '📊 Crypton',
            links: ['Dashboard', 'Markets', 'Wallets', 'Analytics'],
            buttonText1: 'Launch App'
          },
          styles: { bg: 'bg-slate-900 border-b border-slate-800', text: 'text-slate-100', accent: '#a855f7', paddingY: 'py-4', roundedButtons: false }
        },
        {
          id: 'b-hero',
          type: 'hero',
          name: 'Analytics Hero',
          data: {
            title: 'Decentralized High-Frequency Market Terminal',
            subtitle: 'Real-time telemetry feeds, predictive order books, and advanced portfolio statistics compiled instantly.',
            buttonText1: 'View Live Markets',
            buttonText2: 'Connect Wallet',
            placeholderImage: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=60'
          },
          styles: { bg: 'bg-slate-950', text: 'text-slate-100', accent: '#a855f7', paddingY: 'py-20', roundedButtons: false }
        },
        {
          id: 'b-features',
          type: 'content',
          name: 'Bento Stats Grid',
          data: {
            title: 'Real-Time Edge Computation',
            subtitle: 'Proprietary analytical tooling powered by decentralized validator clusters.',
            items: [
              { title: 'Sub-Millisecond Ingress', desc: 'Durable connection threads directly linked to global pool hooks.' },
              { title: 'Predictive Analytics', desc: 'Synthesizing historical volume metrics with AI telemetry engines.' },
              { title: 'Cold-Storage Guard', desc: 'Secure smart contracts keeping liquidity safe at key levels.' }
            ]
          },
          styles: { bg: 'bg-slate-900/40', text: 'text-slate-300', accent: '#a855f7', paddingY: 'py-16', roundedButtons: false }
        },
        {
          id: 'b-footer',
          type: 'footer',
          name: 'Compact Footer',
          data: {
            copyright: '© 2026 Crypton Labs Ltd. Trading carries risk.',
            logo: '📊 Crypton'
          },
          styles: { bg: 'bg-slate-950 border-t border-slate-900', text: 'text-slate-600', accent: '#a855f7', paddingY: 'py-8', roundedButtons: false }
        }
      ]
    },
    {
      id: 'p3',
      name: 'Cosmic Portfolio Studio',
      status: 'archived',
      lastUpdated: '3 days ago',
      stack: ['Vite', 'Tailwind', 'Framer Motion'],
      userEmail: email,
      blocks: [
        {
          id: 'b-nav',
          type: 'navigation',
          name: 'Artistic Header',
          data: {
            logo: '✨ CosmicStudio',
            links: ['Exhibits', 'About', 'Journal'],
            buttonText1: 'Inquire'
          },
          styles: { bg: 'bg-zinc-950 border-b border-zinc-900', text: 'text-zinc-200', accent: '#ec4899', paddingY: 'py-5', roundedButtons: true }
        },
        {
          id: 'b-hero',
          type: 'hero',
          name: 'Creative Hero',
          data: {
            title: 'Unlocking Celestial Aesthetics through Code',
            subtitle: 'A physical & digital experimental atelier focused on ambient interface structures and fluid motion.',
            buttonText1: 'View Projects',
            buttonText2: 'Read Manifesto',
            placeholderImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60'
          },
          styles: { bg: 'bg-zinc-950', text: 'text-zinc-100', accent: '#ec4899', paddingY: 'py-24', roundedButtons: true }
        },
        {
          id: 'b-footer',
          type: 'footer',
          name: 'Minimal Footer',
          data: {
            copyright: '© 2026 Cosmic Studio. Form follows starlight.',
            logo: '✨ Cosmic'
          },
          styles: { bg: 'bg-zinc-950 border-t border-zinc-900', text: 'text-zinc-500', accent: '#ec4899', paddingY: 'py-10', roundedButtons: true }
        }
      ]
    }
  ];
}

export default function App() {
  // Track location state for standard routing compatibility
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'github' | null>(null);
  const [pendingOnboardingProject, setPendingOnboardingProject] = useState<Project | null>(null);
  const [mockUser, setMockUser] = useState<User | null>({
    name: '',
    email: '',
  });

  // ON PAGE LOAD - Silent auth check
  useEffect(() => {
    if (!client.getTokens()?.accessToken) {
      setIsAuthenticated(false);
      return;
    }
    client.users.getMe()
      .then((user) => {
        setIsAuthenticated(true);
        setMockUser({ name: user.name || user.email?.split('@')[0] || 'User', email: user.email });
      })
      .catch(() => {
        setIsAuthenticated(false);
        client.setTokens('');
      });
  }, []);

  // Fetch projects from live API or cache on authentication
  useEffect(() => {
    const userEmail = mockUser?.email || 'visitor@tridop.ai';
    const fetchProjects = async () => {
      if (client.getTokens()?.accessToken) {
        try {
          const liveSites = await client.sites.list();
          if (Array.isArray(liveSites) && liveSites.length > 0) {
            const mapped: Project[] = liveSites.map((s: any) => ({
              id: s.id || s.siteId || String(Date.now()),
              name: s.name || s.config?.name || 'Untitled Site',
              status: s.status?.toLowerCase() === 'archived' ? 'archived' : 'active',
              lastUpdated: s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString() : 'Just now',
              stack: s.stack || ['Next.js', 'Tailwind', 'NestJS'],
              blocks: s.blocks || s.config?.blocks || [],
              userEmail,
            }));
            setProjects(mapped);
            localStorage.setItem(`projects_${userEmail}`, JSON.stringify(mapped));
            return;
          }
        } catch (err: any) {
          if (err?.statusCode === 401 || err?.status === 401) {
            setIsAuthenticated(false);
            client.setTokens('');
          } else {
            console.warn('Live API site listing offline/error, checking cache:', err);
          }
        }
      }

      const cached = localStorage.getItem(`projects_${userEmail}`);
      if (cached) {
        setProjects(JSON.parse(cached) as Project[]);
      } else {
        const defaults = getDefaultProjects(userEmail);
        setProjects(defaults);
        localStorage.setItem(`projects_${userEmail}`, JSON.stringify(defaults));
      }
    };

    if (isAuthenticated && mockUser?.email && client.getTokens()?.accessToken) {
      fetchProjects();
    }
  }, [isAuthenticated, mockUser?.email]);

  const handleUpdateProject = async (updatedProject: Project) => {
    setProjects((prev) => 
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

    try {
      await client.sites.update(updatedProject.id, {
        name: updatedProject.name,
        status: updatedProject.status,
        blocks: updatedProject.blocks
      });
    } catch (err) {
      console.warn('Failed updating project on backend API', err);
    }

    const email = mockUser.email;
    const cached = localStorage.getItem(`projects_${email}`);
    let updatedList: Project[] = [];
    if (cached) {
      const parsed = JSON.parse(cached) as Project[];
      updatedList = parsed.map((p) => (p.id === updatedProject.id ? updatedProject : p));
    } else {
      updatedList = [updatedProject];
    }
    localStorage.setItem(`projects_${email}`, JSON.stringify(updatedList));
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    try {
      await client.sites.delete(projectId);
    } catch (err) {
      console.warn('Failed deleting project on backend API', err);
    }

    const email = mockUser.email;
    const cached = localStorage.getItem(`projects_${email}`);
    if (cached) {
      const parsed = JSON.parse(cached) as Project[];
      const filtered = parsed.filter((p) => p.id !== projectId);
      localStorage.setItem(`projects_${email}`, JSON.stringify(filtered));
    }
  };

  // Steps: 0 = Hero, 1 = Tri Intro & Prompt, 2 = AI Planning, 3 = Completed Project, 4 = Ready to Build
  const [step, setStep] = useState<number>(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [heroPromptInput, setHeroPromptInput] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string>('');

  const handleInstantPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    setSelectedPrompt(promptText);

    const derivedName = promptText.length > 35 ? promptText.slice(0, 35) + '...' : promptText;
    const isRestaurant = promptText.toLowerCase().includes('restaurant') || promptText.toLowerCase().includes('food');
    const isSalon = promptText.toLowerCase().includes('salon') || promptText.toLowerCase().includes('beauty');
    const isShop = promptText.toLowerCase().includes('shop') || promptText.toLowerCase().includes('store');

    const newProj: Project = {
      id: `p-prompt-${Date.now()}`,
      name: derivedName,
      status: 'active',
      lastUpdated: 'Just now',
      stack: ['React', 'Tailwind', 'AI-Synthesized'],
      blocks: generateBlocksForProject({
        accountName: '',
        accountEmail: mockUser?.email || '',
        businessName: derivedName,
        tagline: promptText,
        businessType: isRestaurant ? 'restaurant' : isSalon ? 'salon' : isShop ? 'retail' : 'tech',
        logoUrl: null,
        primaryColor: '#06b6d4',
        secondaryColor: '#a855f7',
        fontFamily: 'Inter, sans-serif',
        language: 'English',
        phone: '',
        whatsApp: '',
        contactEmail: mockUser?.email || '',
        address: '',
        mapPin: '',
        socials: { instagram: '', facebook: '', x: '', tiktok: '', linkedin: '', youtube: '' },
        ageRange: 'All Ages',
        audienceLocation: 'Global',
        audienceLanguage: 'English',
        interests: [],
        vibe: 'Modern',
        buildMode: 'AI'
      }),
      tagline: promptText,
      vibe: 'Modern',
      buildMode: 'AI',
      userEmail: mockUser?.email || 'visitor@tridop.ai'
    };

    setProjects((prev) => [newProj, ...prev]);
    setCurrentProjectId(newProj.id);
    localStorage.setItem('activeSiteId', newProj.id);
    localStorage.setItem('initialPrompt', promptText);

    window.history.pushState({}, '', '/builder');
    window.dispatchEvent(new Event('popstate'));
  };
  
  const lastScrollTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Scroll handler for FIXED onboarding sequence
  const handleScroll = (deltaY: number) => {
    if (isAuthenticated) return; // Disallow scrolling in returning dashboard

    const now = Date.now();
    // 1.2 second scroll throttle for cinematically paced transitions
    if (now - lastScrollTime.current < 1100) return;

    if (deltaY > 30) {
      // Scroll Down
      if (step < 4) {
        setStep((prev) => prev + 1);
        lastScrollTime.current = now;
      }
    } else if (deltaY < -30) {
      // Scroll Up
      if (step > 0) {
        setStep((prev) => prev - 1);
        lastScrollTime.current = now;
      }
    }
  };

  // Wheel listener
  const onWheel = (e: React.WheelEvent) => {
    handleScroll(e.deltaY);
  };

  // Touch listener
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY; // Positive = Swiped up (Scroll down)
    handleScroll(deltaY);
  };

  // Skip step manually
  const navigateToStep = (targetStep: number) => {
    if (targetStep >= 4) {
      window.history.pushState({}, '', '/onboarding');
      window.dispatchEvent(new Event('popstate'));
      return;
    }
    setStep(targetStep);
  };

  // Helper mapping step title
  const stepTitles = [
    { num: 0, label: 'Welcome' },
    { num: 1, label: 'Archetypes' },
    { num: 2, label: 'Planner' },
    { num: 3, label: 'Completed build' },
    { num: 4, label: 'Get Started' },
  ];

  return (
    <div 
      className="relative w-full h-screen overflow-hidden select-none"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background with custom particle neural network */}
      <GlowingBackground />

      <AnimatePresence mode="wait">
        
        {currentPath.startsWith('/preview') ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <PreviewView 
              project={currentProject || (projects.length > 0 ? projects[0] : null)}
              onBackToEditor={() => {
                window.history.pushState({}, '', '/builder');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : currentPath === '/builder' ? (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <BuilderView 
              user={mockUser || { name: 'User', email: 'user@tridop.ai' }}
              selectedPrompt={selectedPrompt}
              project={currentProject || (projects.length > 0 ? projects[0] : null)}
              onUpdateProject={handleUpdateProject}
              onBackToDashboard={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : currentPath === '/history' ? (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <ProjectHistoryView 
              user={mockUser || { name: 'User', email: 'user@tridop.ai' }}
              projects={projects}
              onBackToDashboard={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              onSelectProject={(id) => {
                setCurrentProjectId(id);
                window.history.pushState({}, '', '/builder');
                window.dispatchEvent(new Event('popstate'));
              }}
              onDeleteProject={handleDeleteProject}
              onUpdateProject={handleUpdateProject}
              onNewProject={() => {
                window.history.pushState({}, '', '/onboarding');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : currentPath === '/billing' ? (
          <motion.div
            key="billing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <BillingView 
              user={mockUser || { name: 'User', email: 'user@tridop.ai' }}
              onBackToDashboard={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : currentPath === '/owner' ? (
          <motion.div
            key="owner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <OwnerAdminView 
              user={mockUser || { name: 'User', email: 'user@tridop.ai' }}
              onBackToDashboard={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : currentPath === '/onboarding' ? (
          <motion.div
            key="onboarding-wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <OnboardingWizard 
              userEmail={mockUser?.email}
              userName={mockUser?.name || "Chinonye Okubor"}
              onComplete={async (data) => {
                // Create the project
                const newProj: Project = {
                  id: `p-new-${Date.now()}`,
                  name: data.businessName,
                  status: 'active',
                  lastUpdated: 'Just now',
                  stack: ['React', 'Tailwind', data.buildMode || 'AI'],
                  blocks: generateBlocksForProject(data),
                  tagline: data.tagline,
                  logoUrl: data.logoUrl,
                  phone: data.phone,
                  whatsApp: data.whatsApp,
                  contactEmail: data.contactEmail,
                  address: data.address,
                  vibe: data.vibe,
                  buildMode: data.buildMode,
                  userEmail: data.accountEmail || mockUser?.email || ''
                };

                setProjects((prev) => [newProj, ...prev]);
                setCurrentProjectId(newProj.id);
                localStorage.setItem('activeSiteId', newProj.id);

                if (client.getTokens()?.accessToken) {
                  try {
                    const createdSite = await client.sites.create({
                      name: newProj.name,
                      blocks: newProj.blocks,
                      config: {
                        tagline: newProj.tagline,
                        vibe: newProj.vibe,
                        buildMode: newProj.buildMode
                      }
                    });
                    if (createdSite && (createdSite.id || (createdSite as any).siteId)) {
                      newProj.id = createdSite.id || (createdSite as any).siteId;
                      setCurrentProjectId(newProj.id);
                    }
                  } catch (err) {
                    console.warn('Failed creating site on backend API', err);
                  }

                  const cached = localStorage.getItem(`projects_${data.accountEmail}`);
                  const updatedList = cached ? [newProj, ...JSON.parse(cached)] : [newProj];
                  localStorage.setItem(`projects_${data.accountEmail}`, JSON.stringify(updatedList));

                  window.history.pushState({}, '', '/builder');
                  window.dispatchEvent(new Event('popstate'));
                } else {
                  // User is not authenticated -> Open Auth Modal / Pages!
                  setPendingOnboardingProject(newProj);
                  setAuthProvider(null);
                  setIsAuthModalOpen(true);
                }
              }}
              onExit={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : isAuthenticated ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
          >
            <ReturningUserDashboard 
              user={mockUser} 
              projects={projects}
              onLogout={async () => {
                try {
                  await client.auth.logout();
                } catch (e) {
                  console.warn('Logout API error:', e);
                }
                client.setTokens('');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user_profile');
                }
                setIsAuthenticated(false);
                setMockUser(null);
                setStep(0);
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              onSelectProject={(id) => {
                setCurrentProjectId(id);
                window.history.pushState({}, '', '/builder');
                window.dispatchEvent(new Event('popstate'));
              }}
              onDeleteProject={handleDeleteProject}
              onContinueProject={() => {
                const active = projects.filter(p => p.status === 'active');
                if (active.length > 0) {
                  setCurrentProjectId(active[0].id);
                } else if (projects.length > 0) {
                  setCurrentProjectId(projects[0].id);
                } else {
                  // seed defaults
                  const defaults = getDefaultProjects(mockUser.email);
                  setProjects(defaults);
                  setCurrentProjectId(defaults[0].id);
                }
                window.history.pushState({}, '', '/builder');
                window.dispatchEvent(new Event('popstate'));
              }}
              onNewProject={() => {
                window.history.pushState({}, '', '/onboarding');
                window.dispatchEvent(new Event('popstate'));
              }}
              onViewHistory={() => {
                window.history.pushState({}, '', '/history');
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </motion.div>
        ) : (
          
          /* SCENARIO 2: FIRST-TIME USER CINEMATIC SCROLL EXPERIENCE */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col justify-between"
          >
            {/* Minimal Header */}
            <header className="w-full px-6 md:px-12 py-5 flex justify-between items-center z-30 pointer-events-none select-none">
              <div className="flex items-center gap-2.5">
                {/* Custom Glowing Tri Logo */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <span className="text-sm font-display font-extrabold text-slate-950">T</span>
                </div>
                <span className="text-xl font-display font-bold text-slate-100 tracking-tight">
                  Tridop
                </span>
              </div>
              <div className="pointer-events-auto flex items-center gap-2.5">
                <button 
                  onClick={() => {
                    setAuthProvider(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="interactive-chip px-5 py-2 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300 text-xs font-sans font-medium hover:text-white transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Sign In / Register
                </button>
              </div>
            </header>

            {/* Content Switcher depending on Step */}
            <div className="flex-1 flex items-center justify-center relative">
              {step === 0 ? (
                /* HERO SECTION */
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Sequential Typewriter Animation + Instant Prompt Input */}
                  <div className="lg:col-span-7 flex flex-col justify-center min-h-[350px]">
                    <Typewriter
                      lines={[
                        'Welcome to Tridop',
                        'Build websites.',
                        'Build apps.',
                        'Build businesses.',
                        'All with ease.',
                      ]}
                      delayBetweenLines={700}
                      speed={45}
                    />


                  </div>

                  {/* Right Column: Tri Mascot with Floating Motion */}
                  <div className="lg:col-span-5 flex justify-center items-center">
                    <div className="relative">
                      {/* Ambient glows and rotating elements only visible in Hero */}
                      <div className="absolute inset-0 bg-blue-500/5 blur-[90px] rounded-full scale-125 pointer-events-none" />
                      <TriMascot expression="idle" speechText="Hey there! Let's build." />
                    </div>
                  </div>

                </div>
              ) : (
                /* MOVIE ONBOARDING TUTORIAL (STEPS 1 - 4) */
                <div className="w-full h-full flex items-center justify-center relative">
                  
                  {/* Holographic project beam coming from Tri's visor in step 1-2 */}
                  {(step === 1 || step === 2) && (
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden lg:block">
                      {/* Left-to-right neon laser scan cone */}
                      <svg viewBox="0 0 1000 600" className="w-full h-full opacity-20">
                        <polygon 
                          points="800,280 200,100 200,500" 
                          fill="url(#holoConeGrad)"
                          className="blur-[2px]"
                        />
                        <defs>
                          <linearGradient id="holoConeGrad" x1="100%" y1="50%" x2="0%" y2="50%">
                            <stop offset="0%" stopColor="rgba(34,211,238,0.3)" />
                            <stop offset="50%" stopColor="rgba(168,85,247,0.15)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}

                  {/* Split structure: Tri is fixed on the Right side of screen during tutorial */}
                  <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
                    
                    {/* Active Step Panel (Step 1-4) taking Left 8 columns */}
                    <div className="lg:col-span-8 flex justify-center items-center h-full z-10">
                      <OnboardingFlow 
                        currentStep={step}
                        onSelectPrompt={(text) => setSelectedPrompt(text)}
                        selectedPrompt={selectedPrompt}
                        setStep={(s) => navigateToStep(s)}
                        onFieldFocus={(field) => setFocusedField(field)}
                        onAuthSuccess={(name, email) => {
                          setMockUser({ name, email });
                          setIsAuthenticated(true);
                        }}
                      />
                    </div>

                    {/* Fixed companion Mascot Tri on the Right 4 columns */}
                    <div className="lg:col-span-4 flex justify-center items-center z-10">
                      <div className="relative">
                        <TriMascot 
                          expression={
                            step === 1 ? 'talking' : 
                            step === 2 ? 'thinking' : 
                            step === 3 ? 'wink' : 
                            step === 4 ? 'excited' : 'idle'
                          } 
                          speechText={
                            step === 1 ? "Choose a template concept or describe your app!" :
                            step === 2 ? "Compiling features, DB tables, and REST APIs..." :
                            step === 3 ? "Your interactive sandbox preview is live!" :
                            step === 4 ? "Let's personalize your workspace settings!" : "Welcome!"
                          }
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Footer Step Tracker */}
            <footer className="w-full px-6 md:px-12 py-5 flex justify-between items-center z-30 pointer-events-auto border-t border-slate-900/60 bg-slate-950/40 backdrop-blur-md">
              
              {/* Back / Restart Step Button */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="interactive-chip px-4 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 text-xs font-mono hover:text-slate-200 transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                )}
                {step === 0 && (
                  <button
                    onClick={() => setStep(1)}
                    className="interactive-chip px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" /> Start Building
                  </button>
                )}
              </div>

              {/* Step Navigation Dots */}
              <div className="flex items-center gap-3">
                {[
                  { num: 1, label: 'Ideation' },
                  { num: 2, label: 'Architecture' },
                  { num: 3, label: 'Preview' },
                  { num: 4, label: 'Brand Setup' }
                ].map((title) => (
                  <button
                    key={title.num}
                    onClick={() => setStep(title.num)}
                    className="group flex items-center gap-1.5 focus:outline-none cursor-pointer"
                  >
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === title.num 
                        ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' 
                        : 'w-1.5 bg-slate-700 group-hover:bg-slate-500'
                    }`} />
                    <span className={`text-[10px] font-mono tracking-wider transition-colors uppercase ${
                      step === title.num ? 'text-slate-200 font-medium' : 'text-slate-600 group-hover:text-slate-400'
                    }`}>
                      {title.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Copyright / Powered by badge */}
              <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 select-none">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500/60" />
                <span>Tridop OS v1.0</span>
              </div>

            </footer>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Auth Modal Trigger & Popup */}
      <AuthPopupModal
        isOpen={isAuthModalOpen}
        provider={authProvider}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (name, email, isAdmin) => {
          const userObj = { name, email, role: isAdmin || email.toLowerCase().includes('admin') ? 'admin' : 'user' };
          setMockUser(userObj);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);

          if (isAdmin || email.toLowerCase().includes('admin')) {
            window.history.pushState({}, '', '/owner');
            window.dispatchEvent(new Event('popstate'));
            return;
          }

          if (pendingOnboardingProject) {
            try {
              const createdSite = await client.sites.create({
                name: pendingOnboardingProject.name,
                blocks: pendingOnboardingProject.blocks,
                config: {
                  tagline: pendingOnboardingProject.tagline,
                  vibe: pendingOnboardingProject.vibe,
                  buildMode: pendingOnboardingProject.buildMode
                }
              });
              if (createdSite && (createdSite.id || (createdSite as any).siteId)) {
                pendingOnboardingProject.id = createdSite.id || (createdSite as any).siteId;
                setCurrentProjectId(pendingOnboardingProject.id);
              }
            } catch (err) {
              console.warn('Backend site creation error:', err);
            }
            setPendingOnboardingProject(null);
            window.history.pushState({}, '', '/builder');
            window.dispatchEvent(new Event('popstate'));
          } else {
            client.users.getMe().then(user => {
              if (user) {
                setMockUser({ name: user.name || user.email?.split('@')[0] || 'User', email: user.email, role: user.role });
              }
            }).catch(() => null);
          }
        }}
      />

      {/* Sleek dynamic cursor overlay */}
      <CustomCursor />
    </div>
  );
}
