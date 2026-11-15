import type {
  AccessType,
  BillingDuration,
  Order,
  OrderStatus,
  PaymentMethod,
  PromoCode,
  PublicUser,
  SubscriptionCategory,
  SubscriptionPlan,
  SupportTicket,
} from '../shared/pricing';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string; fieldErrors?: Record<string, string> };
  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`) as Error & {
      fieldErrors?: Record<string, string>;
      status?: number;
    };
    err.fieldErrors = data.fieldErrors;
    err.status = response.status;
    throw err;
  }
  return data;
}

export function fetchSubscriptions(params?: { category?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params?.category && params.category !== 'All') {
    search.set('category', params.category);
  }
  if (params?.q && params.q.trim()) {
    search.set('q', params.q.trim());
  }
  const qs = search.toString();
  return requestJson<{ plans: SubscriptionPlan[]; promos: PromoCode[] }>(
    `/api/subscriptions${qs ? `?${qs}` : ''}`
  );
}

export function validatePromoCode(code: string, subtotalInr: number) {
  return requestJson<{ promo: PromoCode; discountInr: number }>('/api/promos/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotalInr }),
  });
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  promoCode: string | null;
  items: Array<{
    planId: string;
    duration: BillingDuration;
    accessType: AccessType;
    quantity: number;
  }>;
}

export function createOrder(payload: CreateOrderPayload) {
  return requestJson<{ order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchOrders(params?: { orderId?: string; email?: string; scope?: string }) {
  const search = new URLSearchParams();
  if (params?.orderId) search.set('orderId', params.orderId);
  if (params?.email) search.set('email', params.email);
  if (params?.scope) search.set('scope', params.scope);
  const qs = search.toString();
  return requestJson<{ orders: Order[] }>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export function renewOrder(orderId: string, duration: BillingDuration) {
  return requestJson<{ order: Order }>(`/api/orders/${encodeURIComponent(orderId)}/renew`, {
    method: 'POST',
    body: JSON.stringify({ duration }),
  });
}

export function fetchTickets(email?: string) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : '';
  return requestJson<{ tickets: SupportTicket[] }>(`/api/tickets${qs}`);
}

export function createTicket(payload: {
  orderId: string;
  email: string;
  subject: string;
  message: string;
}) {
  return requestJson<{ ticket: SupportTicket }>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return requestJson<{ user: PublicUser | null }>('/api/auth/me');
}

export function loginUser(email: string, password: string) {
  return requestJson<{ user: PublicUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return requestJson<{ user: PublicUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return requestJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function fetchAdminOrders() {
  return requestJson<{ orders: Order[]; tickets: SupportTicket[] }>('/api/admin/orders');
}

export function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  return requestJson<{ order: Order }>(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createAdminPlan(payload: {
  name: string;
  provider: string;
  category: SubscriptionCategory;
  tagline: string;
  description: string;
  sharedMonthlyInr: number;
  privateMonthlyInr: number;
  retailMonthlyInr: number;
  qualitySpec: string;
  featured: boolean;
}) {
  return requestJson<{ plan: SubscriptionPlan }>('/api/admin/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminPlan(
  planId: string,
  payload: Partial<Pick<SubscriptionPlan, 'inStock' | 'featured' | 'sharedMonthlyInr' | 'privateMonthlyInr'>>
) {
  return requestJson<{ plan: SubscriptionPlan }>(
    `/api/admin/subscriptions/${encodeURIComponent(planId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}
