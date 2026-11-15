import { useState } from 'react';
import { ArrowRight, Check, Search } from 'lucide-react';
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

import heroWorkspaceImg from '../assets/images/hero_mrinsane_setup_1794751169130.jpg';
import storySharedImg from '../assets/images/story_shared_access_1794751169539.jpg';

const CATEGORIES: Array<'All' | SubscriptionCategory> = [
  'All',
  'OTT & Video',
  'Music & Audio',
  'Productivity & AI',
  'Gaming & Bundles',
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
      {/* Section 1: High-Contrast Obsidian Storefront Hero Stage */}
      <section className="relative bg-[#080E1C] text-white overflow-hidden border-b border-slate-800/80">
        {/* Architectural grid & cobalt radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 72% 38%, rgba(24, 140, 224, 0.24) 0%, rgba(8, 14, 28, 0) 55%), linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between py-1">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-3">
                  <MrInsaneLogo size={42} mode="idle" halo interactive />
                  <span className="text-xs font-medium tracking-wide text-slate-300">
                    mrinsane.in <span aria-hidden="true">·</span> Shared &amp; Private Access Vault
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
                  Every flagship subscription at member-split pricing.
                </h1>

                <p className="text-base text-slate-300 leading-relaxed max-w-xl tracking-[0.01em]">
                  Unlock 4K OTT cinema, lossless audio, AI reasoning models, and cloud gaming with
                  instant activation keys, flexible terms, and full-duration warranty.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
                  >
                    Explore Subscriptions
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={onNavigateToTrack}
                    className="px-5 py-3 rounded-lg border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-100 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
                  >
                    Track Existing Order
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-800">
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                    &lt; 5 min
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Average activation</div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold font-mono tabular-nums text-sky-400">
                    Up to 70%
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Savings vs. retail</div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                    100%
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Term warranty</div>
                </div>
              </div>
            </div>

            {/* Right Column: Bespoke Studio Visual + Interactive Slot Exchange Showcase */}
            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[320px] lg:min-h-[430px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
                <img
                  src={heroWorkspaceImg}
                  alt="Laptop, tablet, and wireless headphones on a clean concrete desk for streaming and AI access"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080E1C] via-[#080E1C]/45 to-transparent" />

                {/* Bottom Dual-Node Exchange Summary Strip */}
                <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-[#0B1324]/92 border border-white/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <MrInsaneLogo size={46} mode="idle" halo interactive />
                    <div>
                      <div className="text-xs font-medium text-sky-400">
                        Instant Key Exchange <span aria-hidden="true">·</span> mrinsane.in
                      </div>
                      <div className="font-display text-base font-bold text-white mt-0.5">
                        Shared Slots &amp; Private Vaults
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-300 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                    <div>
                      <div className="text-slate-400 font-sans">Starts at</div>
                      <div className="text-sm font-bold text-white">₹59/mo</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-sans">Codes</div>
                      <div className="text-sm font-bold text-sky-400">INSANE10</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Subscription Catalog with Live Term & Access Matrix */}
      <section id="catalog" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col gap-6 mb-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-[#188CE0]">Live Inventory</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Subscription Catalog
              </h2>
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
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#188CE0]"
                />
              </div>

              {/* Category Filter Tabs */}
              <div
                role="tablist"
                aria-label="Subscription categories"
                className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
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
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
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
          <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
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
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Dark Brand Header Block */}
                    <div
                      className="p-5 text-white relative overflow-hidden"
                      style={{
                        backgroundColor: theme.bg,
                        backgroundImage: `radial-gradient(circle at 90% 10%, ${theme.accent}40 0%, transparent 62%)`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <PlanIcon iconKey={plan.iconKey} accentHex={plan.accentHex} />
                        <div className="text-right">
                          <span className="text-xs font-medium text-slate-300">
                            {plan.inStock ? plan.deliverySpeed : 'Out of Stock'}
                          </span>
                          {discountPct > 0 && (
                            <div className="text-xs font-semibold font-mono tabular-nums text-sky-400 mt-0.5">
                              Save {discountPct}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs font-medium text-slate-300">
                          {plan.provider} <span aria-hidden="true">·</span> {plan.qualitySpec}
                        </div>
                        <h3 className="font-display text-lg font-bold text-white mt-0.5 tracking-wide">
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
                  <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
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
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors"
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        disabled={!plan.inStock}
                        onClick={() => onQuickAddPlan(plan)}
                        className="px-3.5 py-2 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] disabled:bg-slate-300 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
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
      </section>

      {/* Section 3: Interactive Savings Estimator & How Shared Access Works */}
      <section
        id="how-it-works"
        className="bg-white border-t border-slate-200 py-14 sm:py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#188CE0]">Interactive Savings Estimator</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 [text-wrap:balance]">
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

            <div className="p-5 rounded-2xl bg-[#080E1C] text-white flex flex-wrap items-center justify-between gap-4">
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
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-sm">
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
                Trusted by 14,000+ active subscribers across India
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              4.9 / 5.0 average rating · Instant key delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <blockquote className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between gap-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                “Switched my 4K streaming and music plans to 6-month slots on mrinsane.in and saved
                over ₹4,800 this year. Activation key showed up in under two minutes.”
              </p>
              <footer className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Rohan Kulkarni</span>{' '}
                <span aria-hidden="true">·</span> Product Designer, Pune
              </footer>
            </blockquote>

            <blockquote className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between gap-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                “Used the Track Order portal when our smart TV asked for a household code. Support
                approved it in ten minutes flat with zero hassle.”
              </p>
              <footer className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Ananya Nair</span>{' '}
                <span aria-hidden="true">·</span> Software Engineer, Bengaluru
              </footer>
            </blockquote>

            <blockquote className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between gap-4">
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
