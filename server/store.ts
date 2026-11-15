import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  type SubscriptionPlan,
  type PromoCode,
  type Order,
  type SupportTicket,
  type PublicUser,
  computeExpiryDate,
} from '../src/shared/pricing';
import { hashPassword } from './auth';

export interface StoredUser extends PublicUser {
  passwordHash: string;
}

export interface DatabaseState {
  plans: SubscriptionPlan[];
  promos: PromoCode[];
  orders: Order[];
  tickets: SupportTicket[];
  users: StoredUser[];
  nextOrderSeq: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function createSeedDatabase(): DatabaseState {
  const now = new Date().toISOString();
  const earlier1 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString();
  const earlier2 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString();

  const plans: SubscriptionPlan[] = [
    {
      id: 'plan_streamflix_4k',
      slug: 'streamflix-4k-ultra',
      name: 'StreamFlix 4K Ultra',
      provider: 'StreamFlix',
      category: 'OTT & Video',
      tagline: '4K Dolby Vision · Dedicated Profile PIN',
      description:
        'Full Ultra HD streaming with Dolby Atmos audio, offline downloads, and your own PIN-locked viewer profile.',
      sharedMonthlyInr: 179,
      privateMonthlyInr: 499,
      retailMonthlyInr: 649,
      deliverySpeed: 'Instant Delivery',
      qualitySpec: '4K HDR · 1 Screen',
      accentHex: '#188CE0',
      iconKey: 'cinema',
      features: [
        '4K Ultra HD + Dolby Vision & Atmos',
        'Dedicated PIN-protected profile',
        'Works on Smart TV, Phone & Web',
        'Full duration replacement warranty',
      ],
      inStock: true,
      featured: true,
    },
    {
      id: 'plan_prime_cinema',
      slug: 'prime-cinema-plus',
      name: 'Prime Cinema Plus',
      provider: 'Prime Video',
      category: 'OTT & Video',
      tagline: 'Ad-Free Originals · Multi-Device UHD',
      description:
        'Stream blockbuster premieres and series in 4K UHD without interruptions across your TV and mobile devices.',
      sharedMonthlyInr: 99,
      privateMonthlyInr: 249,
      retailMonthlyInr: 299,
      deliverySpeed: 'Under 5 Mins',
      qualitySpec: '4K UHD · Ad-Free',
      accentHex: '#0F172A',
      iconKey: 'tv',
      features: [
        '4K UHD & HDR10+ playback',
        'Zero pre-roll or mid-roll ads',
        'Offline mobile downloads included',
        '24/7 WhatsApp & ticket support',
      ],
      inStock: true,
      featured: true,
    },
    {
      id: 'plan_velostream_sports',
      slug: 'velostream-sports-live',
      name: 'VeloStream Sports & Live',
      provider: 'VeloStream',
      category: 'OTT & Video',
      tagline: 'Live Cricket & Football · 60fps 4K',
      description:
        'Watch live international cricket, Premier League, F1, and cinema premieres with zero buffering.',
      sharedMonthlyInr: 149,
      privateMonthlyInr: 349,
      retailMonthlyInr: 499,
      deliverySpeed: 'Instant Delivery',
      qualitySpec: '4K 60fps · Live',
      accentHex: '#188CE0',
      iconKey: 'video',
      features: [
        'Live sports in crisp 4K 60fps',
        'Simultaneous TV + mobile login',
        'Instant credential activation',
        'Zero-downtime slot guarantee',
      ],
      inStock: true,
      featured: false,
    },
    {
      id: 'plan_soundwave_hifi',
      slug: 'soundwave-hifi-family',
      name: 'SoundWave Hi-Fi',
      provider: 'SoundWave',
      category: 'Music & Audio',
      tagline: 'Lossless Audio · Activated on Your Email',
      description:
        'Upgrade your own personal music account with lossless streaming, zero ads, and unlimited offline skips.',
      sharedMonthlyInr: 69,
      privateMonthlyInr: 149,
      retailMonthlyInr: 199,
      deliverySpeed: 'Instant Invite',
      qualitySpec: 'Lossless · Personal Email',
      accentHex: '#0F172A',
      iconKey: 'music',
      features: [
        'Direct invite to your existing email',
        'Keep all your playlists & liked tracks',
        '320kbps & Lossless audio quality',
        'No password sharing required',
      ],
      inStock: true,
      featured: true,
    },
    {
      id: 'plan_tubefree_premium',
      slug: 'tubefree-premium',
      name: 'TubeFree Premium',
      provider: 'TubeFree',
      category: 'Music & Audio',
      tagline: 'Ad-Free Video · Background Play + Music',
      description:
        'Eliminate ads across every device with background playback, picture-in-picture, and full music streaming.',
      sharedMonthlyInr: 59,
      privateMonthlyInr: 129,
      retailMonthlyInr: 189,
      deliverySpeed: 'Instant Invite',
      qualitySpec: 'Ad-Free · Background',
      accentHex: '#188CE0',
      iconKey: 'music',
      features: [
        'Activated on your personal Google email',
        'Zero ads on TV, iOS, Android & Desktop',
        'Background play & offline video caching',
        'Includes TubeFree Music app access',
      ],
      inStock: true,
      featured: false,
    },
    {
      id: 'plan_creatorsuite_pro',
      slug: 'creatorsuite-cloud-pro',
      name: 'CreatorSuite Cloud Pro',
      provider: 'CreatorSuite',
      category: 'Productivity & AI',
      tagline: 'Full Creative Apps · 100GB Cloud Storage',
      description:
        'Complete creative studio suite for video editing, photo retouching, vector design, and cloud sync.',
      sharedMonthlyInr: 399,
      privateMonthlyInr: 899,
      retailMonthlyInr: 1675,
      deliverySpeed: 'Under 10 Mins',
      qualitySpec: 'All Apps · 2 Devices',
      accentHex: '#0F172A',
      iconKey: 'spark',
      features: [
        'Full desktop & tablet creative suite',
        '100GB private cloud project storage',
        'Generative fill & AI workflow tools',
        'Activated directly on your email',
      ],
      inStock: true,
      featured: false,
    },
    {
      id: 'plan_promptmind_ai',
      slug: 'promptmind-ai-plus',
      name: 'PromptMind AI Plus',
      provider: 'PromptMind',
      category: 'Productivity & AI',
      tagline: 'Priority Reasoning · Code & Vision Models',
      description:
        'Unrestricted priority access to flagship reasoning, coding, document analysis, and image generation models.',
      sharedMonthlyInr: 499,
      privateMonthlyInr: 1199,
      retailMonthlyInr: 1999,
      deliverySpeed: 'Instant Delivery',
      qualitySpec: 'Priority Models · Web & App',
      accentHex: '#188CE0',
      iconKey: 'spark',
      features: [
        'High message caps on flagship models',
        'Code interpreter, file upload & vision',
        'Fast response priority at peak hours',
        'Full warranty across billing term',
      ],
      inStock: true,
      featured: false,
    },
    {
      id: 'plan_gamepass_ultimate',
      slug: 'gamepass-ultimate',
      name: 'GameVault Ultimate',
      provider: 'GameVault',
      category: 'Gaming & Bundles',
      tagline: '300+ PC & Console Titles · Day-One Drops',
      description:
        'Play hundreds of AAA and indie releases across PC, console, and cloud with online multiplayer included.',
      sharedMonthlyInr: 249,
      privateMonthlyInr: 549,
      retailMonthlyInr: 829,
      deliverySpeed: 'Instant Code',
      qualitySpec: 'PC + Console + Cloud',
      accentHex: '#0F172A',
      iconKey: 'gamepad',
      features: [
        '300+ curated PC & console games',
        'Day-one blockbuster studio releases',
        'Online multiplayer & EA library access',
        'Redeemable code or instant slot',
      ],
      inStock: true,
      featured: false,
    },
    {
      id: 'plan_insane_bundle',
      slug: 'insane-all-access-bundle',
      name: 'Insane All-Access Bundle',
      provider: 'Mr. Insane',
      category: 'Gaming & Bundles',
      tagline: '4K OTT + Lossless Music + AI Copilot',
      description:
        'Our signature member-split pack bundling 4K streaming, ad-free music, and priority AI access in one invoice.',
      sharedMonthlyInr: 599,
      privateMonthlyInr: 1399,
      retailMonthlyInr: 2847,
      deliverySpeed: 'Instant Bundle',
      qualitySpec: '3-in-1 Access Pack',
      accentHex: '#188CE0',
      iconKey: 'layers',
      features: [
        'StreamFlix 4K Ultra + SoundWave Hi-Fi',
        'PromptMind AI Plus priority seat',
        'Single consolidated renewal date',
        'Priority replacement SLA (< 15 mins)',
      ],
      inStock: true,
      featured: true,
    },
  ];

  const promos: PromoCode[] = [
    {
      code: 'INSANE10',
      description: '10% instant member savings on any subscription',
      discountType: 'percent',
      value: 10,
      minOrderInr: 0,
      active: true,
    },
    {
      code: 'WELCOME50',
      description: 'Flat ₹50 off orders ₹299 and above',
      discountType: 'flat',
      value: 50,
      minOrderInr: 299,
      active: true,
    },
    {
      code: 'ANNUAL20',
      description: '20% off orders ₹999 and above',
      discountType: 'percent',
      value: 20,
      minOrderInr: 999,
      active: true,
    },
  ];

  const users: StoredUser[] = [
    {
      id: 'usr_customer_arjun',
      name: 'Arjun Mehta',
      email: 'arjun@mrinsane.in',
      phone: '9876543210',
      role: 'customer',
      passwordHash: hashPassword('InsaneUser123'),
      createdAt: earlier2,
    },
    {
      id: 'usr_admin_insane',
      name: 'Mr. Insane Ops',
      email: 'admin@mrinsane.in',
      phone: '9999988888',
      role: 'admin',
      passwordHash: hashPassword('MrInsaneAdmin!'),
      createdAt: earlier2,
    },
  ];

  const orders: Order[] = [
    {
      id: 'MI-8402',
      customerName: 'Arjun Mehta',
      customerEmail: 'arjun@mrinsane.in',
      customerPhone: '9876543210',
      paymentMethod: 'UPI',
      promoCode: 'INSANE10',
      subtotalInr: 492,
      discountInr: 49,
      totalInr: 443,
      status: 'Active',
      createdAt: earlier1,
      items: [
        {
          planId: 'plan_streamflix_4k',
          planName: 'StreamFlix 4K Ultra',
          provider: 'StreamFlix',
          duration: '3m',
          accessType: 'shared',
          quantity: 1,
          unitPriceInr: 492,
          lineTotalInr: 492,
          activationKey: 'SF4K-PIN-4821-MRIN',
          deliveryInstructions:
            'Sign in via mrinsane.in vault credentials sent to arjun@mrinsane.in · Profile 3 · PIN 4821.',
          expiresAt: computeExpiryDate(earlier1, '3m'),
        },
      ],
    },
    {
      id: 'MI-8391',
      customerName: 'Arjun Mehta',
      customerEmail: 'arjun@mrinsane.in',
      customerPhone: '9876543210',
      paymentMethod: 'Card',
      promoCode: null,
      subtotalInr: 352,
      discountInr: 0,
      totalInr: 352,
      status: 'Active',
      createdAt: earlier2,
      items: [
        {
          planId: 'plan_soundwave_hifi',
          planName: 'SoundWave Hi-Fi',
          provider: 'SoundWave',
          duration: '6m',
          accessType: 'shared',
          quantity: 1,
          unitPriceInr: 352,
          lineTotalInr: 352,
          activationKey: 'SW-INV-9942-LOSSLESS',
          deliveryInstructions:
            'Family invite link accepted on arjun@mrinsane.in · Lossless tier active.',
          expiresAt: computeExpiryDate(earlier2, '6m'),
        },
      ],
    },
  ];

  const tickets: SupportTicket[] = [
    {
      id: 'TKT-204',
      orderId: 'MI-8402',
      email: 'arjun@mrinsane.in',
      subject: 'TV login verification code',
      message: 'Need quick household verification approval for living room LG OLED.',
      status: 'Resolved',
      createdAt: earlier1,
    },
  ];

  return {
    plans,
    promos,
    orders,
    tickets,
    users,
    nextOrderSeq: 8403,
  };
}

let cachedDb: DatabaseState | null = null;

function ensureDbLoaded(): DatabaseState {
  if (cachedDb) return cachedDb;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      cachedDb = JSON.parse(raw) as DatabaseState;
      return cachedDb;
    } catch {
      // Fallback to fresh seed if file is corrupted
    }
  }
  cachedDb = createSeedDatabase();
  persistDb(cachedDb);
  return cachedDb;
}

export function persistDb(db: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function getDb(): DatabaseState {
  return ensureDbLoaded();
}

export function sanitizeUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function generateActivationKey(plan: SubscriptionPlan): string {
  const prefix = plan.provider.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase() || 'MRIN';
  const block1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const block2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${block1}-${block2}-MRIN`;
}
