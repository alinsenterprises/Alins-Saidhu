import { useCallback, useEffect, useState } from 'react';
import {
  calculateCartTotals,
  calculatePlanPrice,
  type AccessType,
  type BillingDuration,
  type CartItem,
  type Order,
  type PublicUser,
  type SubscriptionCategory,
  type SubscriptionPlan,
} from './shared/pricing';
import { fetchCurrentUser, fetchSubscriptions } from './api/client';
import { Preloader } from './components/Preloader';
import { Header, type ActiveView } from './components/Header';
import { StorefrontView } from './components/StorefrontView';
import { PlanDetailModal } from './components/PlanDetailModal';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { TrackOrderPanel } from './components/TrackOrderPanel';
import { AccountAdminPanel } from './components/AccountAdminPanel';
import { MrInsaneLogo } from './components/MrInsaneLogo';

const CART_STORAGE_KEY = 'mrinsane_bag_v1';

function readInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const skipIntro =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [showPreloader, setShowPreloader] = useState(!skipIntro);
  const [activeView, setActiveView] = useState<ActiveView>('store');
  const [trackOrderId, setTrackOrderId] = useState('');

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SubscriptionCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDuration, setPreviewDuration] = useState<BillingDuration>('3m');
  const [previewAccess, setPreviewAccess] = useState<AccessType>('shared');

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(readInitialCart);
  const [cartOpen, setCartOpen] = useState(false);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  const loadCatalog = useCallback(async (category: 'All' | SubscriptionCategory, q: string) => {
    setCatalogLoading(true);
    setCatalogError('');
    try {
      const res = await fetchSubscriptions({ category, q });
      setPlans(res.plans);
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : 'Unable to load subscriptions.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, loadCatalog]);

  useEffect(() => {
    fetchCurrentUser()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartItems]);

  const handleNavigate = (view: ActiveView, anchor?: string) => {
    setActiveView(view);
    if (view === 'store' && anchor) {
      setTimeout(() => {
        if (anchor === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToBag = ({
    plan,
    duration,
    accessType,
    quantity,
  }: {
    plan: SubscriptionPlan;
    duration: BillingDuration;
    accessType: AccessType;
    quantity: number;
  }) => {
    const unitPriceInr = calculatePlanPrice(plan, duration, accessType);
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.planId === plan.id && i.duration === duration && i.accessType === accessType
      );
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          planId: plan.id,
          planName: plan.name,
          provider: plan.provider,
          category: plan.category,
          duration,
          accessType,
          quantity,
          unitPriceInr,
        },
      ];
    });
    setCartOpen(true);
  };

  const handleQuickAdd = (plan: SubscriptionPlan) => {
    handleAddToBag({
      plan,
      duration: previewDuration,
      accessType: previewAccess,
      quantity: 1,
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOrderCompleted = (_order: Order) => {
    setCartItems([]);
  };

  const handleNavigateToTrack = (orderId?: string) => {
    if (orderId) setTrackOrderId(orderId);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { itemCount } = calculateCartTotals(cartItems, null);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Preloader visible={showPreloader} onFinish={() => setShowPreloader(false)} />

      {bannerVisible && (
        <div className="bg-[#0F172A] text-slate-200 text-xs border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
            <p className="truncate">
              Save 10% on any subscription with code{' '}
              <span className="font-mono font-semibold text-sky-400">INSANE10</span>{' '}
              <span className="hidden sm:inline text-slate-400">
                · Instant key delivery &amp; full-term replacement warranty on mrinsane.in
              </span>
            </p>
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              aria-label="Dismiss announcement"
              className="text-slate-400 hover:text-white whitespace-nowrap shrink-0 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        cartCount={itemCount}
        onOpenCart={() => setCartOpen(true)}
        user={user}
      />

      <main className="flex-1">
        {activeView === 'store' && (
          <StorefrontView
            plans={plans}
            loading={catalogLoading}
            error={catalogError}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            previewDuration={previewDuration}
            previewAccess={previewAccess}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onPreviewDurationChange={setPreviewDuration}
            onPreviewAccessChange={setPreviewAccess}
            onSelectPlan={setSelectedPlan}
            onQuickAddPlan={handleQuickAdd}
            onNavigateToTrack={() => handleNavigateToTrack('MI-8402')}
          />
        )}

        {activeView === 'track' && (
          <TrackOrderPanel initialOrderId={trackOrderId} user={user} />
        )}

        {activeView === 'account' && (
          <AccountAdminPanel
            user={user}
            plans={plans}
            onAuthChange={setUser}
            onPlansChanged={() => loadCatalog(selectedCategory, searchQuery)}
            onNavigateToTrack={(orderId) => handleNavigateToTrack(orderId)}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <MrInsaneLogo size={32} mode="idle" interactive />
              <div>
                <div className="font-display text-sm font-bold text-slate-900">
                  Mr. Insane · mrinsane.in
                </div>
                <div className="text-xs text-slate-500">
                  Digital OTT, Music, AI &amp; Gaming Subscription Storefront
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => handleNavigate('store', 'catalog')}
                className="hover:text-slate-900 transition-colors"
              >
                Catalog
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('track')}
                className="hover:text-slate-900 transition-colors"
              >
                Track Order
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('account')}
                className="hover:text-slate-900 transition-colors"
              >
                Member Portal
              </button>
              <button
                type="button"
                onClick={() => setShowPreloader(true)}
                className="hover:text-[#188CE0] transition-colors"
              >
                Replay Logo Intro
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Support: <span className="font-medium text-slate-700">support@mrinsane.in</span>{' '}
              <span aria-hidden="true">·</span> © 2026 Mr. Insane
            </div>
            <div>Accepted: UPI · RuPay · Visa · Mastercard · NetBanking</div>
          </div>
        </div>
      </footer>

      <PlanDetailModal
        plan={selectedPlan}
        initialDuration={previewDuration}
        initialAccess={previewAccess}
        onClose={() => setSelectedPlan(null)}
        onAddToBag={handleAddToBag}
      />

      <CartCheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderCompleted={handleOrderCompleted}
        onNavigateToTrack={(id) => handleNavigateToTrack(id)}
        user={user}
      />
    </div>
  );
}
