import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Minus, Plus, Trash2, X } from 'lucide-react';
import {
  DURATION_META,
  calculateCartTotals,
  formatINR,
  validateCheckoutForm,
  type CartItem,
  type Order,
  type PaymentMethod,
  type PromoCode,
  type PublicUser,
} from '../shared/pricing';
import { createOrder, validatePromoCode } from '../api/client';
import { MrInsaneButtonLoader, MrInsaneLogo } from './MrInsaneLogo';

interface CartCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onOrderCompleted: (order: Order) => void;
  onNavigateToTrack: (orderId: string) => void;
  user: PublicUser | null;
}

const PROVISIONING_STEPS = [
  'Verifying payment authorization & promo code',
  'Reserving verified slot on mrinsane.in vault',
  'Generating instant activation key & PIN',
];

export function CartCheckoutDrawer({
  open,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOrderCompleted,
  onNavigateToTrack,
  user,
}: CartCheckoutDrawerProps) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const [provisioningStep, setProvisioningStep] = useState<number>(-1);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (user && !customerName && !customerEmail) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone || '');
    }
  }, [user, customerName, customerEmail]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const totals = calculateCartTotals(items, appliedPromo);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) {
      setPromoError('Enter a promo code such as INSANE10.');
      return;
    }
    setPromoLoading(true);
    try {
      const res = await validatePromoCode(promoInput.trim(), totals.subtotalInr);
      setAppliedPromo(res.promo);
      setPromoInput(res.promo.code);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err instanceof Error ? err.message : 'Unable to apply promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const errors = validateCheckoutForm({
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setProvisioningStep(0);
    try {
      // Animate multi-stage provisioning steps cleanly while submitting to backend
      const orderPromise = createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        promoCode: appliedPromo ? appliedPromo.code : null,
        items: items.map((item) => ({
          planId: item.planId,
          duration: item.duration,
          accessType: item.accessType,
          quantity: item.quantity,
        })),
      });

      await new Promise((r) => setTimeout(r, 380));
      setProvisioningStep(1);
      await new Promise((r) => setTimeout(r, 380));
      setProvisioningStep(2);

      const { order } = await orderPromise;
      await new Promise((r) => setTimeout(r, 260));

      setProvisioningStep(-1);
      setConfirmedOrder(order);
      setAppliedPromo(null);
      setPromoInput('');
      onOrderCompleted(order);
    } catch (err) {
      setProvisioningStep(-1);
      setSubmitError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(value);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Subscription bag and checkout"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-slate-900/50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {confirmedOrder
                    ? `Order ${confirmedOrder.id} Confirmed`
                    : `Your Subscription Bag (${totals.itemCount})`}
                </h2>
                <p className="text-xs text-slate-500">
                  {confirmedOrder
                    ? 'Instant activation provisioned on mrinsane.in'
                    : 'Direct delivery to your email & member portal'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                aria-label="Close bag drawer"
                className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provisioning Stepper Loader */}
            {provisioningStep >= 0 ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <MrInsaneLogo size={76} mode="loading" interactive={false} />
                <h3 className="font-display text-xl font-bold text-slate-900 mt-6">
                  Activating Your Subscriptions
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Please wait while we allocate your access keys.
                </p>

                <div className="mt-8 w-full max-w-sm space-y-3 text-left">
                  {PROVISIONING_STEPS.map((label, index) => {
                    const done = provisioningStep > index;
                    const current = provisioningStep === index;
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          current
                            ? 'border-[#188CE0] bg-[#EFF6FF] text-slate-900'
                            : done
                            ? 'border-slate-200 bg-slate-50 text-slate-700'
                            : 'border-slate-100 bg-white text-slate-400'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {done ? (
                            <Check className="w-4 h-4 text-[#188CE0]" />
                          ) : current ? (
                            <MrInsaneLogo size={18} mode="loading" interactive={false} />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          )}
                        </div>
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : confirmedOrder ? (
              /* Order Confirmed Receipt */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#188CE0]/25 flex items-start gap-4">
                  <MrInsaneLogo size={46} mode="success" interactive={false} />
                  <div>
                    <div className="text-xs font-semibold text-[#0E71B8] font-mono tabular-nums">
                      ORDER #{confirmedOrder.id} · ACTIVE
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                      Subscriptions Ready
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Receipt and access credentials dispatched to{' '}
                      <span className="font-semibold text-slate-900">
                        {confirmedOrder.customerEmail}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700">Provisioned Access Keys</h4>
                  {confirmedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.planId}-${idx}`}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.planName}</div>
                          <div className="text-xs text-slate-500">
                            {DURATION_META[item.duration].label} <span aria-hidden="true">·</span>{' '}
                            {item.accessType === 'private' ? 'Private Account' : 'Shared Slot'}
                          </div>
                        </div>
                        <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                          {formatINR(item.lineTotalInr)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <code className="text-xs font-mono font-semibold text-slate-900 truncate">
                          {item.activationKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.activationKey)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#188CE0] hover:text-[#0E71B8] shrink-0 px-2 py-1 rounded"
                        >
                          {copiedKey === item.activationKey ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Key
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.deliveryInstructions}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">
                      {formatINR(confirmedOrder.subtotalInr)}
                    </span>
                  </div>
                  {confirmedOrder.discountInr > 0 && (
                    <div className="flex justify-between text-[#0E71B8]">
                      <span>Promo ({confirmedOrder.promoCode})</span>
                      <span className="font-mono tabular-nums">
                        -{formatINR(confirmedOrder.discountInr)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 pt-1">
                    <span>Total Paid ({confirmedOrder.paymentMethod})</span>
                    <span className="font-mono tabular-nums">
                      {formatINR(confirmedOrder.totalInr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = confirmedOrder.id;
                      setConfirmedOrder(null);
                      onClose();
                      onNavigateToTrack(id);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors"
                  >
                    Open in Track Order
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty Bag State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MrInsaneLogo size={64} mode="idle" interactive />
                <h3 className="font-display text-lg font-bold text-slate-900 mt-5">
                  Your bag is empty
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Pick any OTT, music, AI, or gaming plan to configure your duration and add it here.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors"
                >
                  Browse Subscriptions
                </button>
              </div>
            ) : (
              /* Cart Items + Checkout Form */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.planId}-${item.duration}-${item.accessType}`}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {item.planName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {DURATION_META[item.duration].label} <span aria-hidden="true">·</span>{' '}
                          {item.accessType === 'private' ? 'Private Account' : 'Shared Slot'}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(idx, -1)}
                              aria-label={`Decrease quantity of ${item.planName}`}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold font-mono tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(idx, 1)}
                              aria-label={`Increase quantity of ${item.planName}`}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            aria-label={`Remove ${item.planName} from bag`}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                          {formatINR(item.unitPriceInr * item.quantity)}
                        </div>
                        <div className="text-xs text-slate-400 font-mono tabular-nums">
                          {formatINR(item.unitPriceInr)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label htmlFor="promo-code-input" className="block text-xs font-semibold text-slate-700">
                    Promo Code (try INSANE10 or WELCOME50)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0] font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-colors"
                    >
                      {promoLoading ? <MrInsaneButtonLoader label="Checking" /> : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-600">{promoError}</p>}
                  {appliedPromo && (
                    <p className="text-xs text-[#0E71B8] font-medium">
                      Applied {appliedPromo.code}: {appliedPromo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Available codes:</span>
                    {['INSANE10', 'WELCOME50', 'ANNUAL20'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setPromoInput(code)}
                        className="font-mono font-semibold text-[#188CE0] hover:underline"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Checkout Details Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-2 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Delivery & Payment Details</h3>

                  <div>
                    <label htmlFor="checkout-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Arjun Mehta"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                    />
                    {fieldErrors.customerName && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-email" className="block text-xs font-semibold text-slate-700 mb-1">
                        Delivery Email
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                      />
                      {fieldErrors.customerEmail && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.customerEmail}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Mobile
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                      />
                      {fieldErrors.customerPhone && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Payment Method
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['UPI', 'Card', 'NetBanking'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                            paymentMethod === method
                              ? 'border-[#188CE0] bg-[#EFF6FF] text-[#0E71B8]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {submitError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Footer Totals & Submit */}
            {!confirmedOrder && provisioningStep < 0 && items.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatINR(totals.subtotalInr)}</span>
                  </div>
                  {totals.discountInr > 0 && (
                    <div className="flex justify-between text-[#0E71B8] font-medium">
                      <span>Discount ({appliedPromo?.code})</span>
                      <span className="font-mono tabular-nums">-{formatINR(totals.discountInr)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Due</span>
                    <span className="font-mono tabular-nums">{formatINR(totals.totalInr)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3 px-5 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0]"
                >
                  Complete Order · {formatINR(totals.totalInr)}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
