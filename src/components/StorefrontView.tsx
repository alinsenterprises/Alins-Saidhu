import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Film,
  KeyRound,
  LayoutGrid,
  Lock,
  Music,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  DURATION_META,
  calculatePlanPrice,
  calculateRetailEquivalent,
  formatINR,
  type AccessType,
  type BillingDuration,
  type SubscriptionCategory,
  type SubscriptionPlan,
} from '../shared/pricing';
import { MrInsaneLogo } from './MrInsaneLogo';
import { PlanIcon, getPlanSurfaceTheme } from './PlanIcon';
import { CatalogSkeleton } from './CatalogSkeleton';

import storySharedImg from '../assets/images/story_shared_access_1794751169539.jpg';

const CATEGORIES: Array<'All' | SubscriptionCategory> = [
  'All',
  'OTT & Video',
  'Music & Audio',
  'Productivity & AI',
  'Gaming & Bundles',
];

const PROVIDER_STRIP = [
  'StreamFlix',
  'Prime Cinema',
  'VeloStream',
  'SoundWave',
  'TubeFree',
  'CreatorSuite',
  'PromptMind',
  'GameVault',
];

const DURATIONS: BillingDuration[] = ['1m', '3m', '6m', '12m'];

const CALCULATOR_SERVICES = [
  { id: 'streamflix', name: 'StreamFlix 4K', retailMonthly: 649, memberMonthly: 179 },
  { id: 'soundwave', name: 'SoundWave Hi-Fi', retailMonthly: 199, memberMonthly: 69 },
  { id: 'tubefree', name: 'TubeFree Premium', retailMonthly: 189, memberMonthly: 59 },
  { id: 'promptmind', name: 'PromptMind AI', retailMonthly: 1999, memberMonthly: 499 },
];

interface StorefrontViewProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string;
  selectedCategory: 'All' | SubscriptionCategory;
  searchQuery: string;
  previewDuration: BillingDuration;
  previewAccess: AccessType;
  onCategoryChange: (cat: 'All' | SubscriptionCategory) => void;
  onSearchChange: (q: string) => void;
  onPreviewDurationChange: (duration: BillingDuration) => void;
  onPreviewAccessChange: (access: AccessType) => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onQuickAddPlan: (plan: SubscriptionPlan) => void;
  onNavigateToTrack: () => void;
}

export function StorefrontView({
  plans,
  loading,
  error,
  selectedCategory,
  searchQuery,
  previewDuration,
  previewAccess,
  onCategoryChange,
  onSearchChange,
  onPreviewDurationChange,
  onPreviewAccessChange,
  onSelectPlan,
  onQuickAddPlan,
  onNavigateToTrack,
}: StorefrontViewProps) {
  const [selectedCalcIds, setSelectedCalcIds] = useState<string[]>([
    'streamflix',
    'soundwave',
    'promptmind',
  ]);

  const toggleCalcService = (id: string) => {
    setSelectedCalcIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((item) => item !== id) : prev) : [...prev, id]
    );
  };

  const calcTotals = CALCULATOR_SERVICES.filter((s) => selectedCalcIds.includes(s.id)).reduce(
    (acc, s) => {
      acc.retailAnnual += s.retailMonthly * 12;
      acc.memberAnnual += Math.round(s.memberMonthly * 9.0);
      return acc;
    },
    { retailAnnual: 0, memberAnnual: 0 }
  );
  const annualSavings = Math.max(0, calcTotals.retailAnnual - calcTotals.memberAnnual);

  return (
    <div>
      {/* Section 1: Product hero with live app-window mockup */}
      <section className="grain relative bg-[#070B16] text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 50% at 78% 30%, rgba(24, 140, 224, 0.28) 0%, rgba(7, 11, 22, 0) 70%), radial-gradient(ellipse 40% 40% at 10% 90%, rgba(56, 189, 248, 0.10) 0%, rgba(7, 11, 22, 0) 70%), linear-gradient(to right, rgba(148, 163, 184, 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.045) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 100% 100%, 56px 56px, 56px 56px',
            maskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 sm:pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="rise-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-slate-300">
                <span className="rounded-full bg-[#188CE0]/20 px-2 py-0.5 font-medium text-sky-300">New</span>
                Private Vault accounts now on 12-month terms
              </div>

              <h1
                className="rise-in font-display text-[2.6rem] sm:text-6xl font-bold leading-[1.02] [text-wrap:balance]"
                style={{ animationDelay: '80ms' }}
              >
                Every premium subscription.{' '}
                <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-[#188CE0] bg-clip-text text-transparent">
                  One dashboard.
                </span>
              </h1>

              <p
                className="rise-in text-[15px] sm:text-base text-slate-400 leading-relaxed max-w-md"
                style={{ animationDelay: '160ms' }}
              >
                Streaming, lossless music, AI models and cloud gaming at member-split pricing.
                Keys arrive in your Order Vault in minutes, with replacement cover for the full term.
              </p>

              <div className="rise-in flex flex-wrap items-center gap-3 pt-1" style={{ animationDelay: '240ms' }}>
                <a
                  href="#catalog"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#188CE0] hover:bg-[#1B98F0] text-white text-sm font-semibold shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_30px_-10px_rgba(24,140,224,0.9)] transition-colors"
                >
                  Browse the catalog
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={onNavigateToTrack}
                  className="px-5 py-3 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-100 text-sm font-semibold transition-colors"
                >
                  Track an order
                </button>
              </div>

              <div
                className="rise-in flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs text-slate-400"
                style={{ animationDelay: '320ms' }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" /> Median delivery 3m 12s
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" /> Full-term warranty
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" aria-hidden="true" /> 4.8 from 2,318 reviews
                </span>
              </div>
            </div>

            {/* App window mockup */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, y: 24, rotateX: 8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformPerspective: 1400 }}
                className="ring-gradient relative rounded-2xl bg-[#0B1120]/90 shadow-[0_40px_120px_-30px_rgba(24,140,224,0.55)] overflow-hidden"
              >
                {/* Window chrome */}
                <div className="flex items-center gap-3 px-4 h-10 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]/80" />
                  </div>
                  <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-slate-400">
                    <Lock className="w-3 h-3" aria-hidden="true" /> mrinsane.in/vault
                  </div>
                  <div className="w-12" />
                </div>

                <div className="grid grid-cols-12">
                  {/* Sidebar */}
                  <aside className="hidden sm:flex col-span-3 flex-col gap-1 border-r border-white/[0.06] p-3 text-[12px] text-slate-400">
                    <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</div>
                    {[
                      { icon: LayoutGrid, label: 'Overview', active: true },
                      { icon: KeyRound, label: 'Order Vault' },
                      { icon: RefreshCw, label: 'Renewals' },
                      { icon: Receipt, label: 'Invoices' },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${active ? 'bg-white/[0.07] text-white' : ''}`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
                      </div>
                    ))}
                    <div className="mt-auto rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
                      <div className="text-[10px] text-slate-500">Saved this year</div>
                      <div className="font-mono text-sm font-semibold text-sky-300 tabular-nums">₹18,436</div>
                    </div>
                  </aside>

                  {/* Main panel */}
                  <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500">Good evening, Ishaan</div>
                        <div className="font-display text-lg font-semibold text-white">Active subscriptions</div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> 4 live
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { k: 'Monthly spend', v: '₹1,284', d: '−68% vs retail' },
                        { k: 'Next renewal', v: '9 days', d: 'StreamFlix 4K' },
                        { k: 'Open tickets', v: '0', d: 'All clear' },
                      ].map((s) => (
                        <div key={s.k} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-2.5">
                          <div className="text-[10px] text-slate-500">{s.k}</div>
                          <div className="font-mono text-[15px] font-semibold text-white tabular-nums mt-0.5">{s.v}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{s.d}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.06] overflow-hidden">
                      {[
                        { name: 'StreamFlix 4K Ultra', meta: 'Shared slot · 6 months', pct: 72, color: '#38BDF8', icon: Film },
                        { name: 'SoundWave Hi-Fi', meta: 'Private · 12 months', pct: 41, color: '#34D399', icon: Music },
                        { name: 'PromptMind AI Plus', meta: 'Shared slot · 3 months', pct: 18, color: '#A5B4FC', icon: Sparkles },
                      ].map((row, i) => (
                        <motion.div
                          key={row.name}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.015]"
                        >
                          <div
                            className="grid place-items-center w-8 h-8 rounded-lg shrink-0"
                            style={{ backgroundColor: `${row.color}1F`, color: row.color }}
                          >
                            <row.icon className="w-4 h-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium text-white truncate">{row.name}</div>
                            <div className="text-[10.5px] text-slate-500 truncate">{row.meta}</div>
                          </div>
                          <div className="hidden sm:block w-24">
                            <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: row.pct / 100 }}
                                transition={{ delay: 0.8 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full origin-left rounded-full"
                                style={{ backgroundColor: row.color }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono tabular-nums">{row.pct}% of term</div>
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 bg-white/[0.04] rounded px-1.5 py-0.5 shrink-0">
                            ••••-{['7QX2', 'K9MD', 'P4ZA'][i]}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating toast */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-5 left-4 sm:-left-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0E1628]/95 backdrop-blur px-3.5 py-2.5 shadow-2xl"
              >
                <div className="grid place-items-center w-8 h-8 rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white">Activation key delivered</div>
                  <div className="text-[10.5px] text-slate-400 font-mono">Order MI-8402 · 1m 47s</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Provider marquee */}
          <div className="mt-20 border-t border-white/[0.06] pt-7">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              One checkout for streaming, music, AI &amp; gaming
            </p>
            <div
              className="relative mt-5 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
              }}
            >
              <div className="animate-marquee flex w-max gap-12 pr-12 text-slate-500">
                {[...PROVIDER_STRIP, ...PROVIDER_STRIP].map((name, i) => (
                  <span key={i} className="font-display text-lg font-semibold whitespace-nowrap">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Subscription Catalog with Live Term & Access Matrix */}
      <section id="catalog" className="relative">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-80 bg-dot-grid [mask-image:linear-gradient(to_bottom,#000,transparent)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="flex flex-col gap-6 mb-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#188CE0]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" aria-hidden="true" />
                Live inventory · updated just now
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                Subscription catalog
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-md">
                Pick an access mode and term — every price below updates instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative min-w-[230px]">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <label htmlFor="catalog-search" className="sr-only">
                  Search subscriptions
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search OTT, music, AI..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 focus:outline-none focus:border-[#188CE0] focus:ring-4 focus:ring-[#188CE0]/10 transition"
                />
              </div>

              {/* Category Filter Tabs */}
              <div
                role="tablist"
                aria-label="Subscription categories"
                className="flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                {CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onCategoryChange(category)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Pricing Configurator Bar */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Access Mode:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => onPreviewAccessChange('shared')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    previewAccess === 'shared'
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shared Member Slot
                </button>
                <button
                  type="button"
                  onClick={() => onPreviewAccessChange('private')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    previewAccess === 'private'
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Private Full Account
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Term:</span>
              <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-lg gap-1">
                {DURATIONS.map((key) => {
                  const meta = DURATION_META[key];
                  const active = previewDuration === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onPreviewDurationChange(key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-[#188CE0] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {meta.label}
                      {key !== '1m' ? ` (${meta.savingsLabel})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <CatalogSkeleton count={6} />
        ) : plans.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <MrInsaneLogo size={52} mode="idle" interactive />
            <h3 className="font-display text-lg font-bold text-slate-900">
              No matching subscriptions
            </h3>
            <p className="text-sm text-slate-500">
              Try clearing your search filter or switching back to all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('All');
                onSearchChange('');
              }}
              className="mt-2 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan, idx) => {
              const theme = getPlanSurfaceTheme(plan.iconKey);
              const livePrice = calculatePlanPrice(plan, previewDuration, previewAccess);
              const retailEquiv = calculateRetailEquivalent(plan, previewDuration);
              const discountPct =
                retailEquiv > livePrice
                  ? Math.round(((retailEquiv - livePrice) / retailEquiv) * 100)
                  : 0;

              return (
                <motion.article
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.45, delay: Math.min(idx, 5) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.28)] transition-[box-shadow,border-color]"
                >
                  <div>
                    {/* Dark Brand Header Block */}
                    <div
                      className="p-5 text-white relative overflow-hidden"
                      style={{
                        backgroundColor: theme.bg,
                        backgroundImage: `radial-gradient(circle at 92% 0%, ${theme.accent}55 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                        backgroundSize: '100% 100%, 24px 24px, 24px 24px',
                      }}
                    >
                      {plan.featured && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-md bg-white/10 border border-t-0 border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200">
                          Popular
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <PlanIcon iconKey={plan.iconKey} accentHex={plan.accentHex} />
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${plan.inStock ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
                            {plan.inStock ? plan.deliverySpeed : 'Out of stock'}
                          </span>
                          {discountPct > 0 && (
                            <div className="text-xs font-semibold font-mono tabular-nums text-sky-300 mt-1.5">
                              −{discountPct}% vs retail
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs font-medium text-slate-300">
                          {plan.provider} <span aria-hidden="true">·</span> {plan.qualitySpec}
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mt-0.5">
                          {plan.name}
                        </h3>
                      </div>
                    </div>

                    {/* Clean Card Body */}
                    <div className="p-5 space-y-3">
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        {plan.tagline}
                      </p>
                      <ul className="space-y-1.5">
                        {plan.features.slice(0, 2).map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs text-slate-500">
                            <Check
                              className="w-3.5 h-3.5 text-[#188CE0] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-semibold font-mono tabular-nums tracking-tight text-slate-900">
                          {formatINR(livePrice)}
                        </span>
                        <span className="text-xs text-slate-500">
                          /{DURATION_META[previewDuration].months}mo
                        </span>
                      </div>
                      {retailEquiv > livePrice && (
                        <div className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
                          Retail {formatINR(retailEquiv)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectPlan(plan)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors"
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        disabled={!plan.inStock}
                        onClick={() => onQuickAddPlan(plan)}
                        className="px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#188CE0] disabled:bg-slate-300 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
                      >
                        {plan.inStock ? 'Add' : 'Paused'}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
        </div>
      </section>

      {/* Section 3: Interactive Savings Estimator & How Shared Access Works */}
      <section
        id="how-it-works"
        className="bg-white border-t border-slate-200 py-16 sm:py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#188CE0]">Savings estimator</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-2 [text-wrap:balance]">
                See how much your annual stack drops on mrinsane.in.
              </h2>
            </div>

            <div className="space-y-2.5">
              <span className="block text-xs font-semibold text-slate-600">
                Select subscriptions you use:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {CALCULATOR_SERVICES.map((svc) => {
                  const active = selectedCalcIds.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleCalcService(svc.id)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        active
                          ? 'border-[#188CE0] bg-[#EFF6FF] text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{svc.name}</div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                        {formatINR(svc.memberMonthly)}/mo vs {formatINR(svc.retailMonthly)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ring-gradient p-5 rounded-2xl bg-[#070B16] text-white flex flex-wrap items-center justify-between gap-4 shadow-[0_24px_60px_-28px_rgba(24,140,224,0.6)]">
              <div>
                <div className="text-xs text-slate-400">Your Annual Savings (12-Month Term)</div>
                <div className="font-display text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400 mt-0.5 whitespace-nowrap">
                  {formatINR(annualSavings)}{' '}
                  <span className="text-base font-sans font-semibold text-sky-300">saved/yr</span>
                </div>
              </div>
              <div className="text-right text-xs font-mono tabular-nums text-slate-300 whitespace-nowrap">
                <div>Member {formatINR(calcTotals.memberAnnual)}</div>
                <div className="text-slate-400 line-through mt-0.5">
                  Retail {formatINR(calcTotals.retailAnnual)}
                </div>
              </div>
            </div>

            <ol className="space-y-3 pt-2 border-t border-slate-100 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-900">01. Configure:</span> Choose shared
                member slot or private account across 1–12 month terms.
              </li>
              <li>
                <span className="font-semibold text-slate-900">02. Instant Delivery:</span>{' '}
                Activation keys and PINs appear immediately in your Order Vault.
              </li>
              <li>
                <span className="font-semibold text-slate-900">03. Term Protection:</span> Extend
                with one click or request a replacement code anytime.
              </li>
            </ol>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-[0_40px_80px_-40px_rgba(15,23,42,0.35)] rotate-[0.6deg]">
              <img
                src={storySharedImg}
                alt="Dual smartphones, media remote, and aluminum earbuds arranged on light stone surface"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Verified Buyer Reviews */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-7">
            <div>
              <p className="text-xs font-semibold text-[#188CE0]">Verified Members</p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Trusted by 14,270 active subscribers across India
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              4.8 / 5 from 2,318 verified reviews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <blockquote className="p-6 rounded-2xl bg-[#F6F8FB] border border-slate-200 flex flex-col justify-between gap-5 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] transition">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">{[0,1,2,3,4].map((n) => <Star key={n} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />)}</div>
              <p className="text-sm text-slate-700 leading-relaxed">
                “Switched my 4K streaming and music plans to 6-month slots on mrinsane.in and saved
                over ₹4,800 this year. Activation key showed up in under two minutes.”
              </p>
              <footer className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Rohan Kulkarni</span>{' '}
                <span aria-hidden="true">·</span> Product Designer, Pune
              </footer>
            </blockquote>

            <blockquote className="p-6 rounded-2xl bg-[#F6F8FB] border border-slate-200 flex flex-col justify-between gap-5 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] transition">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">{[0,1,2,3,4].map((n) => <Star key={n} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />)}</div>
              <p className="text-sm text-slate-700 leading-relaxed">
                “Used the Track Order portal when our smart TV asked for a household code. Support
                approved it in ten minutes flat with zero hassle.”
              </p>
              <footer className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Ananya Nair</span>{' '}
                <span aria-hidden="true">·</span> Software Engineer, Bengaluru
              </footer>
            </blockquote>

            <blockquote className="p-6 rounded-2xl bg-[#F6F8FB] border border-slate-200 flex flex-col justify-between gap-5 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] transition">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">{[0,1,2,3,4].map((n) => <Star key={n} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />)}</div>
              <p className="text-sm text-slate-700 leading-relaxed">
                “The All-Access Bundle gives me 4K OTT, lossless audio, and AI tools on one clean
                renewal date. Way simpler than juggling four separate invoices.”
              </p>
              <footer className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Kabir Verma</span>{' '}
                <span aria-hidden="true">·</span> Creative Producer, Mumbai
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
