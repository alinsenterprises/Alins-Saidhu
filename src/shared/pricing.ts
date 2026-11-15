export type SubscriptionCategory =
  | 'OTT & Video'
  | 'Music & Audio'
  | 'Productivity & AI'
  | 'Gaming & Bundles';

export type BillingDuration = '1m' | '3m' | '6m' | '12m';
export type AccessType = 'shared' | 'private';
export type OrderStatus = 'Provisioning' | 'Active' | 'Expired' | 'Refunded';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking';

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: SubscriptionCategory;
  tagline: string;
  description: string;
  sharedMonthlyInr: number;
  privateMonthlyInr: number;
  retailMonthlyInr: number;
  deliverySpeed: string;
  qualitySpec: string;
  accentHex: string;
  iconKey: 'cinema' | 'music' | 'spark' | 'gamepad' | 'shield' | 'tv' | 'video' | 'layers';
  features: string[];
  inStock: boolean;
  featured: boolean;
}

export interface CartItem {
  planId: string;
  planName: string;
  provider: string;
  category: SubscriptionCategory;
  duration: BillingDuration;
  accessType: AccessType;
  quantity: number;
  unitPriceInr: number;
}

export interface PromoCode {
  code: string;
  description: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrderInr: number;
  active: boolean;
}

export interface OrderItem {
  planId: string;
  planName: string;
  provider: string;
  duration: BillingDuration;
  accessType: AccessType;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
  activationKey: string;
  deliveryInstructions: string;
  expiresAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  promoCode: string | null;
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  orderId: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export const DURATION_META: Record<
  BillingDuration,
  { label: string; months: number; multiplier: number; savingsLabel: string }
> = {
  '1m': { label: '1 Month', months: 1, multiplier: 1, savingsLabel: 'Standard' },
  '3m': { label: '3 Months', months: 3, multiplier: 2.75, savingsLabel: 'Save 8%' },
  '6m': { label: '6 Months', months: 6, multiplier: 5.1, savingsLabel: 'Save 15%' },
  '12m': { label: '12 Months', months: 12, multiplier: 9.0, savingsLabel: 'Save 25%' },
};

export function calculatePlanPrice(
  plan: Pick<SubscriptionPlan, 'sharedMonthlyInr' | 'privateMonthlyInr'>,
  duration: BillingDuration,
  accessType: AccessType
): number {
  const baseMonthly = accessType === 'private' ? plan.privateMonthlyInr : plan.sharedMonthlyInr;
  const { multiplier } = DURATION_META[duration];
  return Math.max(1, Math.round(baseMonthly * multiplier));
}

export function calculateRetailEquivalent(
  plan: Pick<SubscriptionPlan, 'retailMonthlyInr'>,
  duration: BillingDuration
): number {
  const { months } = DURATION_META[duration];
  return Math.round(plan.retailMonthlyInr * months);
}

export function calculatePromoDiscount(subtotalInr: number, promo: PromoCode | null): number {
  if (!promo || !promo.active || subtotalInr <= 0) {
    return 0;
  }
  if (subtotalInr < promo.minOrderInr) {
    return 0;
  }
  const rawDiscount =
    promo.discountType === 'percent'
      ? Math.round((subtotalInr * promo.value) / 100)
      : promo.value;
  return Math.min(subtotalInr, Math.max(0, rawDiscount));
}

export function calculateCartTotals(
  items: Array<Pick<CartItem, 'unitPriceInr' | 'quantity'>>,
  promo: PromoCode | null
): {
  itemCount: number;
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
} {
  let itemCount = 0;
  let subtotalInr = 0;
  for (const item of items) {
    const qty = Math.max(0, Math.floor(item.quantity));
    itemCount += qty;
    subtotalInr += Math.max(0, Math.round(item.unitPriceInr)) * qty;
  }
  const discountInr = calculatePromoDiscount(subtotalInr, promo);
  const totalInr = Math.max(0, subtotalInr - discountInr);
  return { itemCount, subtotalInr, discountInr, totalInr };
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
}

export function validateCheckoutForm(input: CheckoutInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Enter your full name (at least 2 characters).';
  }
  const email = (input.customerEmail || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customerEmail = 'Enter a valid email address for activation delivery.';
  }
  const digits = (input.customerPhone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    errors.customerPhone = 'Enter a valid 10–15 digit WhatsApp or mobile number.';
  }
  if (!['UPI', 'Card', 'NetBanking'].includes(input.paymentMethod)) {
    errors.paymentMethod = 'Select a supported payment method.';
  }
  return errors;
}

export function computeExpiryDate(createdAtIso: string, duration: BillingDuration): string {
  const base = new Date(createdAtIso);
  const months = DURATION_META[duration].months;
  const expiry = new Date(base.getTime());
  expiry.setMonth(expiry.getMonth() + months);
  return expiry.toISOString();
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
