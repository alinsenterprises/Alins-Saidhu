import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, X } from 'lucide-react';
import {
  DURATION_META,
  calculatePlanPrice,
  calculateRetailEquivalent,
  formatINR,
  type AccessType,
  type BillingDuration,
  type SubscriptionPlan,
} from '../shared/pricing';
import { PlanIcon, getPlanSurfaceTheme } from './PlanIcon';

interface PlanDetailModalProps {
  plan: SubscriptionPlan | null;
  initialDuration?: BillingDuration;
  initialAccess?: AccessType;
  onClose: () => void;
  onAddToBag: (payload: {
    plan: SubscriptionPlan;
    duration: BillingDuration;
    accessType: AccessType;
    quantity: number;
  }) => void;
}

const DURATIONS: BillingDuration[] = ['1m', '3m', '6m', '12m'];

export function PlanDetailModal({
  plan,
  initialDuration = '3m',
  initialAccess = 'shared',
  onClose,
  onAddToBag,
}: PlanDetailModalProps) {
  const [duration, setDuration] = useState<BillingDuration>(initialDuration);
  const [accessType, setAccessType] = useState<AccessType>(initialAccess);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (plan) {
      setDuration(initialDuration);
      setAccessType(initialAccess);
      setQuantity(1);
    }
  }, [plan, initialDuration, initialAccess]);

  useEffect(() => {
    if (!plan) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [plan, onClose]);

  const unitPrice = plan ? calculatePlanPrice(plan, duration, accessType) : 0;
  const retailEquivalent = plan ? calculateRetailEquivalent(plan, duration) : 0;
  const totalSavings = Math.max(0, (retailEquivalent - unitPrice) * quantity);
  const effectiveMonthly = plan ? Math.round(unitPrice / DURATION_META[duration].months) : 0;
  const theme = plan ? getPlanSurfaceTheme(plan.iconKey) : { bg: '#0F172A', accent: '#38BDF8' };

  return (
    <AnimatePresence>
      {plan && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/55"
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Dark Obsidian Header */}
            <div
              className="px-6 py-5 text-white flex items-start justify-between gap-4"
              style={{
                backgroundColor: theme.bg,
                backgroundImage: `radial-gradient(circle at 85% 15%, ${theme.accent}40 0%, transparent 65%)`,
              }}
            >
              <div className="flex items-start gap-4">
                <PlanIcon iconKey={plan.iconKey} accentHex={plan.accentHex} />
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    {plan.provider} <span aria-hidden="true">·</span> {plan.category}{' '}
                    <span aria-hidden="true">·</span> {plan.deliverySpeed}
                  </p>
                  <h2
                    id="plan-modal-title"
                    className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-wide"
                  >
                    {plan.name}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${plan.name} configuration`}
                className="w-10 h-10 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-sm leading-relaxed text-slate-600">{plan.description}</p>

              {/* Access Type Segmented Control */}
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-slate-700">
                  Access Configuration
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccessType('shared')}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      accessType === 'shared'
                        ? 'border-[#188CE0] bg-[#EFF6FF] text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">Shared Member Slot</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                      From {formatINR(plan.sharedMonthlyInr)}/mo · Dedicated PIN
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccessType('private')}
                    className={`p-3.5 rounded-xl border text-left transition-colors ${
                      accessType === 'private'
                        ? 'border-[#188CE0] bg-[#EFF6FF] text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">Private Full Account</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                      From {formatINR(plan.privateMonthlyInr)}/mo · Full Control
                    </div>
                  </button>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold text-slate-700">
                  Billing Duration
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DURATIONS.map((key) => {
                    const meta = DURATION_META[key];
                    const price = calculatePlanPrice(plan, key, accessType);
                    const perMonth = Math.round(price / meta.months);
                    const active = duration === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDuration(key)}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          active
                            ? 'border-[#188CE0] bg-[#EFF6FF] text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-500">{meta.label}</div>
                        <div className="text-base font-bold font-mono tabular-nums mt-0.5 text-slate-900">
                          {formatINR(price)}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-[#0E71B8] mt-0.5">
                          {formatINR(perMonth)}/mo · {meta.savingsLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Included Features */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 mb-3">
                  Included with your activation
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check
                        className="w-4 h-4 text-[#188CE0] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contiguous Purchase Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {formatINR(unitPrice * quantity)}
                  </span>
                  {retailEquivalent > unitPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                      {formatINR(retailEquivalent * quantity)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-[#0E71B8]">
                  {formatINR(effectiveMonthly)}/mo effective
                  {totalSavings > 0 ? ` · Save ${formatINR(totalSavings)} vs. retail` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-300 bg-white rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    aria-label="Selected quantity"
                    className="w-9 text-center text-sm font-semibold font-mono tabular-nums text-slate-900"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!plan.inStock}
                  onClick={() => {
                    onAddToBag({ plan, duration, accessType, quantity });
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0]"
                >
                  {plan.inStock ? 'Add to Bag' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
