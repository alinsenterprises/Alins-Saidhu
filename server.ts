import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import express, { type Request, type Response, type NextFunction } from 'express';
import {
  calculatePlanPrice,
  calculateCartTotals,
  validateCheckoutForm,
  computeExpiryDate,
  type BillingDuration,
  type AccessType,
  type Order,
  type OrderItem,
  type PaymentMethod,
  type SubscriptionCategory,
  type SubscriptionPlan,
} from './src/shared/pricing';
import {
  getDb,
  persistDb,
  sanitizeUser,
  generateActivationKey,
  type StoredUser,
} from './server/store';
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  extractTokenFromRequest,
  setSessionCookie,
  clearSessionCookie,
  type SessionPayload,
} from './server/auth';

declare global {
  namespace Express {
    interface Request {
      authUser?: SessionPayload | null;
    }
  }
}

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Attach decoded auth session if present
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const token = extractTokenFromRequest(req);
    req.authUser = verifySessionToken(token);
    next();
  });

  function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.authUser) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    next();
  }

  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.authUser) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (req.authUser.role !== 'admin') {
      res.status(403).json({ error: 'Administrator access required.' });
      return;
    }
    next();
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'mrinsane.in', timestamp: new Date().toISOString() });
  });

  // Catalog endpoints
  app.get('/api/subscriptions', (req, res) => {
    const db = getDb();
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

    const filtered = db.plans.filter((plan) => {
      if (category && category !== 'All' && plan.category !== category) {
        return false;
      }
      if (query) {
        const haystack =
          `${plan.name} ${plan.provider} ${plan.category} ${plan.tagline} ${plan.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    res.json({ plans: filtered, promos: db.promos.filter((p) => p.active) });
  });

  app.get('/api/subscriptions/:slug', (req, res) => {
    const db = getDb();
    const plan = db.plans.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
    if (!plan) {
      res.status(404).json({ error: 'Subscription plan not found.' });
      return;
    }
    res.json({ plan });
  });

  // Promo code validation
  app.post('/api/promos/validate', (req, res) => {
    const db = getDb();
    const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const subtotalInr = Number(req.body?.subtotalInr || 0);

    if (!rawCode) {
      res.status(400).json({ error: 'Enter a promo code.' });
      return;
    }

    const promo = db.promos.find((p) => p.code.toUpperCase() === rawCode && p.active);
    if (!promo) {
      res.status(404).json({ error: `Promo code "${rawCode}" is invalid or expired.` });
      return;
    }

    if (subtotalInr < promo.minOrderInr) {
      res.status(400).json({
        error: `${promo.code} requires a minimum bag subtotal of ₹${promo.minOrderInr}.`,
      });
      return;
    }

    const discountInr = calculateCartTotals([{ unitPriceInr: subtotalInr, quantity: 1 }], promo).discountInr;
    res.json({ promo, discountInr });
  });

  // Create Order (server-authoritative pricing + persistence)
  app.post('/api/orders', (req, res) => {
    const db = getDb();
    const customerName = String(req.body?.customerName || '').trim();
    const customerEmail = String(req.body?.customerEmail || '').trim().toLowerCase();
    const customerPhone = String(req.body?.customerPhone || '').trim();
    const paymentMethod = String(req.body?.paymentMethod || 'UPI') as PaymentMethod;
    const rawPromoCode = typeof req.body?.promoCode === 'string' ? req.body.promoCode.trim().toUpperCase() : '';
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];

    const formErrors = validateCheckoutForm({
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
    });
    if (Object.keys(formErrors).length > 0) {
      res.status(400).json({ error: 'Please correct the checkout details.', fieldErrors: formErrors });
      return;
    }

    if (rawItems.length === 0) {
      res.status(400).json({ error: 'Your subscription bag is empty.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const orderItems: OrderItem[] = [];

    for (const rawItem of rawItems) {
      const plan = db.plans.find((p) => p.id === rawItem?.planId);
      if (!plan) {
        res.status(400).json({ error: 'One or more selected plans are no longer available.' });
        return;
      }
      if (!plan.inStock) {
        res.status(400).json({ error: `${plan.name} is currently out of stock.` });
        return;
      }
      const duration = (['1m', '3m', '6m', '12m'].includes(rawItem?.duration)
        ? rawItem.duration
        : '1m') as BillingDuration;
      const accessType = (rawItem?.accessType === 'private' ? 'private' : 'shared') as AccessType;
      const quantity = Math.max(1, Math.min(10, Math.floor(Number(rawItem?.quantity || 1))));
      const unitPriceInr = calculatePlanPrice(plan, duration, accessType);
      const lineTotalInr = unitPriceInr * quantity;
      const activationKey = generateActivationKey(plan);

      orderItems.push({
        planId: plan.id,
        planName: plan.name,
        provider: plan.provider,
        duration,
        accessType,
        quantity,
        unitPriceInr,
        lineTotalInr,
        activationKey,
        deliveryInstructions:
          accessType === 'private'
            ? `Private activation dispatched to ${customerEmail}. Redeem key ${activationKey} inside your ${plan.provider} member portal.`
            : `Dedicated ${plan.provider} slot provisioned for ${customerEmail}. Use activation key ${activationKey} to claim your profile PIN.`,
        expiresAt: computeExpiryDate(nowIso, duration),
      });
    }

    const promo = rawPromoCode
      ? db.promos.find((p) => p.code.toUpperCase() === rawPromoCode && p.active) ?? null
      : null;

    const totals = calculateCartTotals(
      orderItems.map((i) => ({ unitPriceInr: i.unitPriceInr, quantity: i.quantity })),
      promo
    );

    const orderId = `MI-${db.nextOrderSeq}`;
    db.nextOrderSeq += 1;

    const order: Order = {
      id: orderId,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      promoCode: promo && totals.discountInr > 0 ? promo.code : null,
      subtotalInr: totals.subtotalInr,
      discountInr: totals.discountInr,
      totalInr: totals.totalInr,
      status: 'Active',
      items: orderItems,
      createdAt: nowIso,
    };

    db.orders.unshift(order);
    persistDb(db);

    res.status(201).json({ order });
  });

  // Track or list orders
  app.get('/api/orders', (req, res) => {
    const db = getDb();
    const orderId = typeof req.query.orderId === 'string' ? req.query.orderId.trim().toUpperCase() : '';
    const emailQuery = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

    if (orderId) {
      const normalizedId = orderId.startsWith('#') ? orderId.slice(1) : orderId;
      const order = db.orders.find((o) => o.id.toUpperCase() === normalizedId);
      if (!order) {
        res.status(404).json({ error: `No order found matching ${normalizedId}.` });
        return;
      }
      res.json({ orders: [order] });
      return;
    }

    if (req.authUser) {
      if (req.authUser.role === 'admin' && req.query.scope === 'all') {
        res.json({ orders: db.orders });
        return;
      }
      const userOrders = db.orders.filter(
        (o) => o.customerEmail.toLowerCase() === req.authUser!.email.toLowerCase()
      );
      res.json({ orders: userOrders });
      return;
    }

    if (emailQuery) {
      const matching = db.orders.filter((o) => o.customerEmail.toLowerCase() === emailQuery);
      res.json({ orders: matching });
      return;
    }

    res.json({ orders: [] });
  });

  // Renew an existing order item/order
  app.post('/api/orders/:id/renew', (req, res) => {
    const db = getDb();
    const existing = db.orders.find((o) => o.id.toUpperCase() === req.params.id.toUpperCase());
    if (!existing) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const duration = (['1m', '3m', '6m', '12m'].includes(req.body?.duration)
      ? req.body.duration
      : existing.items[0]?.duration || '1m') as BillingDuration;

    const nowIso = new Date().toISOString();
    const renewedItems: OrderItem[] = existing.items.map((item) => {
      const plan = db.plans.find((p) => p.id === item.planId);
      const unitPriceInr = plan
        ? calculatePlanPrice(plan, duration, item.accessType)
        : item.unitPriceInr;
      const currentExpiry = new Date(item.expiresAt).getTime() > Date.now() ? item.expiresAt : nowIso;
      return {
        ...item,
        duration,
        unitPriceInr,
        lineTotalInr: unitPriceInr * item.quantity,
        expiresAt: computeExpiryDate(currentExpiry, duration),
      };
    });

    const subtotalInr = renewedItems.reduce((acc, item) => acc + item.lineTotalInr, 0);
    const renewalOrderId = `MI-${db.nextOrderSeq}`;
    db.nextOrderSeq += 1;

    const renewedOrder: Order = {
      ...existing,
      id: renewalOrderId,
      promoCode: null,
      subtotalInr,
      discountInr: 0,
      totalInr: subtotalInr,
      status: 'Active',
      items: renewedItems,
      createdAt: nowIso,
    };

    db.orders.unshift(renewedOrder);
    persistDb(db);

    res.status(201).json({ order: renewedOrder });
  });

  // Support tickets
  app.get('/api/tickets', (req, res) => {
    const db = getDb();
    const email = req.authUser?.email || (typeof req.query.email === 'string' ? req.query.email.trim() : '');
    if (req.authUser?.role === 'admin') {
      res.json({ tickets: db.tickets });
      return;
    }
    if (!email) {
      res.json({ tickets: [] });
      return;
    }
    const matching = db.tickets.filter((t) => t.email.toLowerCase() === email.toLowerCase());
    res.json({ tickets: matching });
  });

  app.post('/api/tickets', (req, res) => {
    const db = getDb();
    const orderId = String(req.body?.orderId || '').trim().toUpperCase() || 'GENERAL';
    const email = String(req.body?.email || req.authUser?.email || '').trim().toLowerCase();
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (subject.length < 3 || message.length < 5) {
      res.status(400).json({ error: 'Provide a clear subject and description.' });
      return;
    }

    const ticket = {
      id: `TKT-${205 + db.tickets.length}`,
      orderId,
      email,
      subject,
      message,
      status: 'Open' as const,
      createdAt: new Date().toISOString(),
    };
    db.tickets.unshift(ticket);
    persistDb(db);

    res.status(201).json({ ticket });
  });

  // Auth endpoints
  app.get('/api/auth/me', (req, res) => {
    if (!req.authUser) {
      res.json({ user: null });
      return;
    }
    const db = getDb();
    const user = db.users.find((u) => u.id === req.authUser!.userId);
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const db = getDb();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signSessionToken({ userId: user.id, email: user.email, role: user.role });
    setSessionCookie(res, token);
    res.json({ user: sanitizeUser(user), token });
  });

  app.post('/api/auth/register', (req, res) => {
    const db = getDb();
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      res.status(400).json({ error: 'Enter your full name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: phone || '9876543210',
      role: 'customer',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    persistDb(db);

    const token = signSessionToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    setSessionCookie(res, token);
    res.status(201).json({ user: sanitizeUser(newUser), token });
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // Admin endpoints
  app.get('/api/admin/orders', requireAdmin, (_req, res) => {
    const db = getDb();
    res.json({ orders: db.orders, tickets: db.tickets });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    const status = req.body?.status;
    if (['Provisioning', 'Active', 'Expired', 'Refunded'].includes(status)) {
      order.status = status;
    }
    persistDb(db);
    res.json({ order });
  });

  app.post('/api/admin/subscriptions', requireAdmin, (req, res) => {
    const db = getDb();
    const name = String(req.body?.name || '').trim();
    const provider = String(req.body?.provider || '').trim();
    const category = String(req.body?.category || 'OTT & Video') as SubscriptionCategory;
    const tagline = String(req.body?.tagline || '').trim();
    const description = String(req.body?.description || '').trim();
    const sharedMonthlyInr = Math.max(1, Math.round(Number(req.body?.sharedMonthlyInr || 99)));
    const privateMonthlyInr = Math.max(1, Math.round(Number(req.body?.privateMonthlyInr || 249)));
    const retailMonthlyInr = Math.max(
      privateMonthlyInr,
      Math.round(Number(req.body?.retailMonthlyInr || 499))
    );

    if (name.length < 2 || provider.length < 2) {
      res.status(400).json({ error: 'Plan name and provider are required.' });
      return;
    }

    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `plan_${slugBase}_${Date.now().toString().slice(-4)}`;

    const newPlan: SubscriptionPlan = {
      id,
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      name,
      provider,
      category,
      tagline: tagline || 'Instant Activation · Full Warranty',
      description:
        description || `Verified ${provider} subscription provisioned directly through mrinsane.in.`,
      sharedMonthlyInr,
      privateMonthlyInr,
      retailMonthlyInr,
      deliverySpeed: 'Instant Delivery',
      qualitySpec: String(req.body?.qualitySpec || 'Full Access'),
      accentHex: '#188CE0',
      iconKey: 'spark',
      features: Array.isArray(req.body?.features) && req.body.features.length > 0
        ? req.body.features
        : ['Instant credential delivery', 'Full duration replacement warranty', '24/7 support'],
      inStock: true,
      featured: Boolean(req.body?.featured),
    };

    db.plans.unshift(newPlan);
    persistDb(db);
    res.status(201).json({ plan: newPlan });
  });

  app.patch('/api/admin/subscriptions/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const plan = db.plans.find((p) => p.id === req.params.id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found.' });
      return;
    }
    if (typeof req.body?.inStock === 'boolean') plan.inStock = req.body.inStock;
    if (typeof req.body?.featured === 'boolean') plan.featured = req.body.featured;
    if (typeof req.body?.sharedMonthlyInr === 'number' && req.body.sharedMonthlyInr > 0) {
      plan.sharedMonthlyInr = Math.round(req.body.sharedMonthlyInr);
    }
    if (typeof req.body?.privateMonthlyInr === 'number' && req.body.privateMonthlyInr > 0) {
      plan.privateMonthlyInr = Math.round(req.body.privateMonthlyInr);
    }
    persistDb(db);
    res.json({ plan });
  });

  app.delete('/api/admin/subscriptions/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.plans.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Plan not found.' });
      return;
    }
    db.plans.splice(idx, 1);
    persistDb(db);
    res.json({ ok: true });
  });

  // Require auth guard check used cleanly
  app.get('/api/account/summary', requireAuth, (req, res) => {
    const db = getDb();
    const orders = db.orders.filter(
      (o) => o.customerEmail.toLowerCase() === req.authUser!.email.toLowerCase()
    );
    const tickets = db.tickets.filter(
      (t) => t.email.toLowerCase() === req.authUser!.email.toLowerCase()
    );
    res.json({ orders, tickets });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mr. Insane server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
