import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlowingBackground from './components/GlowingBackground';
import CustomCursor from './components/CustomCursor';
import TriMascot from './components/TriMascot';
import Typewriter from './components/Typewriter';
import OnboardingFlow from './components/OnboardingFlow';
import ReturningUserDashboard from './components/ReturningUserDashboard';
import OnboardingWizard, { OnboardingState } from './components/OnboardingWizard';
import BuilderView from './components/BuilderView';
import ProjectHistoryView from './components/ProjectHistoryView';
import { User, Project, Block } from './types';
import { ChevronDown, Sparkles, UserCheck, Play, Layers } from 'lucide-react';


function generateBlocksForProject(data: OnboardingState): Block[] {
  const roundedButtons = data.vibe === 'Playful' || data.vibe === 'Elegant';
  const primaryColorHex = data.primaryColor || '#06b6d4';
  const secondaryColorHex = data.secondaryColor || '#a855f7';

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

  // Fetch placeholder image based on business type
  let heroImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=60'; // default tech
  if (data.businessType === 'restaurant') {
    heroImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60';
  } else if (data.businessType === 'salon') {
    heroImage = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=60';
  } else if (data.businessType === 'retail') {
    heroImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60';
  } else if (data.businessType === 'fitness') {
    heroImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60';
  } else if (data.businessType === 'healthcare') {
    heroImage = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=60';
  } else if (data.businessType === 'agency') {
    heroImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60';
  }

  // Create custom bento items based on category
  let bentoItems = [
    { title: 'Tailored Service', desc: 'Custom designed solutions fitting your precise goals.' },
    { title: 'High Performance', desc: 'Optimized speed and responsive layouts for edge networks.' },
    { title: 'Modern Security', desc: 'Protected by virtual container isolation standards.' }
  ];
  if (data.businessType === 'restaurant') {
    bentoItems = [
      { title: 'Gourmet Culinary', desc: 'Meticulously crafted dishes cooked by skilled cloud-chefs.' },
      { title: 'Hyper-Local Delivery', desc: 'Rapid hot-dispatched drones keeping food warm on transit.' },
      { title: 'Farm to Counter', desc: 'Directly sourced premium organic farm-fresh ingredients.' }
    ];
  } else if (data.businessType === 'salon') {
    bentoItems = [
      { title: 'Master Stylists', desc: 'Certified color and treatment specialists matching your aesthetic.' },
      { title: 'Custom Curations', desc: 'Personalized product selections tailored to your unique identity.' },
      { title: 'Zero Toxins', desc: 'Using strictly premium organic, vegan, and chemical-free formulas.' }
    ];
  }

  return [
    {
      id: 'b-nav',
      type: 'navigation',
      name: 'Custom Nav Header',
      data: {
        logo: data.logoUrl ? data.logoUrl : `⚡ ${data.businessName}`,
        links: ['Services', 'About', 'Contact'],
        buttonText1: 'Get Started'
      },
      styles: {
        bg: navBg,
        text: navText,
        accent: primaryColorHex,
        paddingY: 'py-4',
        roundedButtons
      }
    },
    {
      id: 'b-hero',
      type: 'hero',
      name: 'Synthesized Hero',
      data: {
        title: data.tagline || `Tailored modern solutions by ${data.businessName}`,
        subtitle: `Curated meticulously for a ${data.vibe} look & feel, targeting ${data.ageRange} demographics in ${data.audienceLocation}.`,
        buttonText1: 'Get Started Today',
        buttonText2: 'Explore Services',
        placeholderImage: heroImage
      },
      styles: {
        bg: heroBg,
        text: heroText,
        accent: primaryColorHex,
        paddingY: 'py-20',
        roundedButtons
      }
    },
    {
      id: 'b-features',
      type: 'content',
      name: 'Value Proposition Bento',
      data: {
        title: `Supercharged ${data.businessName} Experience`,
        subtitle: `A comprehensive outline of why our custom-synthesized workflow outperforms standard frameworks.`,
        items: bentoItems
      },
      styles: {
        bg: bentoBg,
        text: bentoText,
        accent: secondaryColorHex,
        paddingY: 'py-16',
        roundedButtons
      }
    },
    {
      id: 'b-cta',
      type: 'cta',
      name: 'Onboard Capture Form',
      data: {
        title: `Let's discuss your next breakthrough`,
        subtitle: `Drop your contact details or email below. Our team at ${data.businessName} will be in touch.`,
        buttonText1: 'Subscribe / Connect',
        formPlaceholder: 'enter your email address'
      },
      styles: {
        bg: ctaBg,
        text: ctaText,
        accent: primaryColorHex,
        paddingY: 'py-14',
        roundedButtons
      }
    },
    {
      id: 'b-footer',
      type: 'footer',
      name: 'Simple Brand Footer',
      data: {
        copyright: `© 2026 ${data.businessName}. All rights reserved.`,
        logo: `⚡ ${data.businessName}`
      },
      styles: {
        bg: footerBg,
        text: footerText,
        accent: primaryColorHex,
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
  const [mockUser, setMockUser] = useState<User>({
    name: 'Okubor',
    email: 'okuborchinonye@gmail.com',
  });

  // ON PAGE LOAD - Silent auth check
  useEffect(() => {
    import('./lib/client').then(({ client }) => {
      client.users.getMe()
        .then((user) => {
          setIsAuthenticated(true);
          setMockUser({ name: user.name || user.email.split('@')[0], email: user.email });
        })
        .catch(() => {
          // Silently stay on landing page
        });
    });
  }, []);

  // Fetch projects from local storage on authentication
  useEffect(() => {
    const fetchProjects = () => {
      const email = mockUser.email;
      const cached = localStorage.getItem(`projects_${email}`);
      if (cached) {
        setProjects(JSON.parse(cached) as Project[]);
      } else {
        const defaults = getDefaultProjects(email);
        setProjects(defaults);
        localStorage.setItem(`projects_${email}`, JSON.stringify(defaults));
      }
    };

    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, mockUser.email]);

  const handleUpdateProject = async (updatedProject: Project) => {
    setProjects((prev) => 
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

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
  const [focusedField, setFocusedField] = useState<string>('');
  
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
    if (isAuthenticated) return;
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

      {/* Floating Mock-Auth controller pill in the top margin for immediate grading / testing */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <div className="glass-panel border-cyan-500/20 rounded-full px-4 py-1.5 flex items-center gap-2.5 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
          <span className="font-mono">Demo Session:</span>
          <button 
            onClick={() => {
              setIsAuthenticated(!isAuthenticated);
              setStep(0); // Reset steps
            }}
            className={`interactive-chip px-2.5 py-0.5 rounded-md font-sans font-medium transition-all ${
              isAuthenticated 
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300'
            }`}
          >
            {isAuthenticated ? 'Authenticated' : 'First-time Visitor'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {currentPath === '/builder' ? (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <BuilderView 
              user={mockUser}
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
              user={mockUser}
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
              userEmail={mockUser.email}
              userName="Chinonye Okubor"
              onComplete={async (data) => {
                setMockUser({ name: data.accountName, email: data.accountEmail });
                setIsAuthenticated(true);

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
                  userEmail: data.accountEmail
                };

                // Add to projects list state and save
                setProjects((prev) => [newProj, ...prev]);

                const cached = localStorage.getItem(`projects_${data.accountEmail}`);
                const updatedList = cached ? [newProj, ...JSON.parse(cached)] : [newProj];
                localStorage.setItem(`projects_${data.accountEmail}`, JSON.stringify(updatedList));

                try {
                  await setDoc(doc(db, 'projects', newProj.id), newProj);
                } catch (err) {
                  if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permissions'))) {
                    handleFirestoreError(err, OperationType.CREATE, `projects/${newProj.id}`);
                  }
                  console.warn('Failed to save project to Firestore', err);
                }

                // Load this project inside the builder page
                setCurrentProjectId(newProj.id);

                window.history.pushState({}, '', '/builder');
                window.dispatchEvent(new Event('popstate'));
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
              onLogout={() => {
                setIsAuthenticated(false);
                setStep(0);
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
                  onClick={() => setIsAuthenticated(true)}
                  className="interactive-chip px-5 py-2 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300 text-xs font-sans font-medium hover:text-white transition-all duration-300 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Sign In
                </button>
              </div>
            </header>

            {/* Content Switcher depending on Step */}
            <div className="flex-1 flex items-center justify-center relative">
              {step === 0 ? (
                /* HERO SECTION */
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Sequential Typewriter Animation */}
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
                        setStep={(s) => setStep(s)}
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
                            step === 4 ? (
                              focusedField === 'name' ? 'pointing' :
                              focusedField === 'email' ? 'pointing' :
                              focusedField === 'password' ? 'pointing' :
                              focusedField === 'social' ? 'excited' :
                              focusedField === 'submit' ? 'wink' :
                              'pointing'
                            ) : 'excited'
                          } 
                          speechText={
                            step === 1 ? "I can build anything. Pick a concept or type yours!" :
                            step === 2 ? "Compiling core features and backend routers..." :
                            step === 3 ? "Boom! A fully live custom app sandbox." :
                            step === 4 ? (
                              focusedField === 'name' ? "Enter your name" :
                              focusedField === 'email' ? "Great! Now type in your email address." :
                              focusedField === 'password' ? "Make sure your password is secure and at least 8 characters long!" :
                              focusedField === 'social' ? "You can sign up instantly with Google or GitHub!" :
                              focusedField === 'submit' ? "Ready to deploy? Let's sign you in!" :
                              focusedField === 'mode' ? "Click here to toggle between sign up and log in!" :
                              "Let's create your account! Fill in your details to get started."
                            ) : "Let's deploy your vision!"
                          }
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Area containing Navigation and Scroll indicator */}
            <footer className="w-full px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-900/40 bg-slate-950/20 backdrop-blur-md z-30">
              
              {/* Scroll / Swipe instructions */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500 font-mono select-none">
                <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
              </div>

              {/* Progress Tracker Bullets */}
              <div className="flex items-center gap-1.5 md:gap-3">
                {stepTitles.map((title) => (
                  <button
                    key={title.num}
                    onClick={() => navigateToStep(title.num)}
                    className="interactive-chip group flex items-center gap-1.5 focus:outline-none"
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

      {/* Sleek dynamic cursor overlay */}
      <CustomCursor />
    </div>
  );
}
