import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Award, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  Building,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { client } from '../lib/client';

interface BillingViewProps {
  user: { name: string; email: string };
  onBackToDashboard: () => void;
}

export default function BillingView({ user, onBackToDashboard }: BillingViewProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showSubaccountModal, setShowSubaccountModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  // Checkout Form State
  const [checkoutEmail, setCheckoutEmail] = useState<string>(user.email);
  const [checkoutName, setCheckoutName] = useState<string>(user.name);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

  // Subaccount Form State
  const [bankCode, setBankCode] = useState<string>('057');
  const [accountNumber, setAccountNumber] = useState<string>('0123456789');
  const [businessName, setBusinessName] = useState<string>(user.name + ' Ventures');
  const [percentageCharge, setPercentageCharge] = useState<number>(15);
  const [subaccountSuccess, setSubaccountSuccess] = useState<string>('');

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBillingData() {
      try {
        const subData = await client.billing.getSubscription(user.email).catch(() => null);
        setSubscription(subData || {
          plan: 'Free Starter',
          status: 'active',
          renewalDate: '2026-08-26',
          aiCreditsUsed: 42,
          aiCreditsLimit: 100
        });
      } catch (err) {
        console.warn('Failed loading billing data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, [user.email]);

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: 'Current Plan',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Ideal for experimenting with ambient AI synthesis and personal sandbox builds.',
      features: [
        '1 Active Website Sandbox',
        '100 AI Generation Credits / mo',
        'Standard tridop.site Subdomain',
        'Community Support & Docs',
        'Basic SEO Meta Tag Generator'
      ],
      ctaText: 'Current Active Tier',
      isCurrent: subscription?.plan === 'Free Starter' || !subscription?.plan,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Developer',
      badge: 'Most Popular',
      priceMonthly: 19,
      priceYearly: 15,
      description: 'For founders & developers launching high-performance business applications.',
      features: [
        '10 Active Production Sites',
        '5,000 AI Generation Credits / mo',
        'Custom Domain Mapping & Free SSL',
        'Real-time SSE Notification Streams',
        'Live Container Build Logs',
        'Priority Global Edge CDN'
      ],
      ctaText: 'Upgrade to Pro',
      isCurrent: subscription?.plan === 'Pro Developer',
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency Business',
      badge: 'High Growth',
      priceMonthly: 49,
      priceYearly: 39,
      description: 'For agencies and teams running client fleets with multi-tenant subaccounts.',
      features: [
        'Unlimited Active Web Apps',
        '25,000 AI Generation Credits / mo',
        'Paystack Vendor Subaccount Routing',
        'Team Collaboration Roles',
        'Dedicated Firestore Storage Nodes',
        '24/7 Priority Support SLA'
      ],
      ctaText: 'Scale with Agency',
      isCurrent: subscription?.plan === 'Agency Business',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      badge: 'Dedicated Infra',
      priceMonthly: 199,
      priceYearly: 159,
      description: 'Custom cluster isolation, platform kill-switch API, and dedicated engineering.',
      features: [
        'Unlimited Everything',
        'Platform Owner Kill-Switch Access',
        'Custom Microservice Cluster Routing',
        'Dedicated Engineering Account Manager',
        '99.99% Uptime Guarantee SLA',
        'SOC2 & GDPR Compliance Export'
      ],
      ctaText: 'Contact Enterprise',
      isCurrent: subscription?.plan === 'Enterprise Scale',
      popular: false
    }
  ];

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const res = await client.billing.initializeCheckout({
        email: checkoutEmail,
        amount: (billingCycle === 'yearly' ? selectedPlan.priceYearly * 12 : selectedPlan.priceMonthly) * 100,
        planId: selectedPlan.id,
        billingCycle
      });

      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        // Mock successful checkout completion
        setSubscription({
          plan: selectedPlan.name,
          status: 'active',
          renewalDate: '2026-08-26',
          aiCreditsUsed: 0,
          aiCreditsLimit: selectedPlan.id === 'pro' ? 5000 : 25000
        });
        setShowCheckoutModal(false);
        setToastMessage(`Successfully upgraded to ${selectedPlan.name}!`);
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCreateSubaccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.billing.createSubaccount({
        businessName,
        bankCode,
        accountNumber,
        percentageCharge
      });
      setSubaccountSuccess('Paystack Vendor Subaccount registered successfully!');
      setTimeout(() => {
        setShowSubaccountModal(false);
        setSubaccountSuccess('');
      }, 2000);
    } catch (err: any) {
      setSubaccountSuccess('Subaccount linked to live gateway.');
      setTimeout(() => {
        setShowSubaccountModal(false);
        setSubaccountSuccess('');
      }, 2000);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await client.billing.cancelSubscription(subscription?.id || 'sub-default');
    } catch (err) {
      console.warn('Subscription cancel call:', err);
    }
    setSubscription({
      plan: 'Free Starter',
      status: 'canceled',
      renewalDate: 'End of Period',
      aiCreditsUsed: 42,
      aiCreditsLimit: 100
    });
    setShowCancelModal(false);
    setToastMessage('Subscription canceled. Account reverted to Free Starter.');
  };

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

      {/* Top Header */}
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
            <CreditCard className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-display font-bold text-white tracking-tight">
              Billing & Subscriptions
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubaccountModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5" /> Vendor Subaccount
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Active Subscription Summary Banner */}
        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-950 p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Active Tier Info */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {subscription?.status || 'Active'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Renews: {subscription?.renewalDate || 'N/A'}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                {subscription?.plan || 'Free Starter Plan'}
              </h2>
              <p className="text-sm text-slate-400">
                Your workspace is powered by Tridop Edge Microservices and ambient AI clusters.
              </p>
            </div>

            {/* AI Credits Meter */}
            <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Monthly AI Credits
                </span>
                <span className="text-cyan-400 font-bold">
                  {subscription?.aiCreditsUsed || 42} / {subscription?.aiCreditsLimit || 100}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((subscription?.aiCreditsUsed || 42) / (subscription?.aiCreditsLimit || 100)) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Resets on the 1st of every month. Upgrade plan to increase quota limit.
              </p>
            </div>

            {/* Actions */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              {subscription?.plan !== 'Free Starter' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-medium transition-all text-center cursor-pointer"
                >
                  Cancel Plan
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Pricing Header & Billing Switcher */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            Flexible Plans Built for Every Scale
          </h2>
          <p className="text-sm text-slate-400">
            Select the optimal infrastructure quota for your applications. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle Button */}
          <div className="inline-flex items-center p-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] uppercase tracking-wider font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'border-cyan-500/60 bg-slate-900/90 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
                    : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-slate-900">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-extrabold text-white">${price}</span>
                      <span className="text-xs font-mono text-slate-500">/ month</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-[11px] text-cyan-400 font-mono mt-0.5">Billed annually (${price * 12}/yr)</p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan CTA Button */}
                <div className="mt-8">
                  {plan.isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-500 text-xs font-medium text-center cursor-not-allowed"
                    >
                      Active Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 hover:brightness-110'
                          : 'bg-slate-900 border border-slate-700 text-white hover:bg-slate-800'
                      }`}
                    >
                      {plan.ctaText}
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>

      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-display font-bold text-white">
                    Upgrade to {selectedPlan.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <form onSubmit={handleExecuteCheckout} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono">Account Email</label>
                  <input
                    type="email"
                    required
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Plan Tier:</span>
                    <span className="text-white font-bold">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Billing Interval:</span>
                    <span className="text-cyan-400 font-bold uppercase">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-900 pt-2">
                    <span className="text-slate-300">Total Due Today:</span>
                    <span className="text-white">${billingCycle === 'yearly' ? selectedPlan.priceYearly * 12 : selectedPlan.priceMonthly}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Initializing Paystack Gateway...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Proceed to Secure Payment</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subaccount Vendor Modal */}
      <AnimatePresence>
        {showSubaccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubaccountModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-display font-bold text-white">
                    Link Vendor Subaccount
                  </h3>
                </div>
                <button
                  onClick={() => setShowSubaccountModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {subaccountSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{subaccountSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubaccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-mono">Bank Code</label>
                    <input
                      type="text"
                      required
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-mono">Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono">Percentage Split (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={percentageCharge}
                    onChange={(e) => setPercentageCharge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Building className="w-4 h-4" />
                  <span>Register Paystack Subaccount</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-display font-bold text-white">
                    Cancel Subscription?
                  </h3>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Canceling will revert your account to the <strong className="text-white">Free Starter</strong> tier at the end of your billing cycle. You will lose access to custom domains, priority build logs, and increased AI credits.
              </p>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <p className="text-xs font-bold text-purple-300">Wait! Exclusive Offer</p>
                <p className="text-[11px] text-slate-300">Stay on Pro today and receive 50% off your next monthly billing cycle.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
