import { useEffect, useState } from 'react';
import { LogOut, Plus } from 'lucide-react';
import {
  formatINR,
  type Order,
  type OrderStatus,
  type PublicUser,
  type SubscriptionCategory,
  type SubscriptionPlan,
} from '../shared/pricing';
import {
  createAdminPlan,
  fetchAdminOrders,
  fetchOrders,
  loginUser,
  logoutUser,
  registerUser,
  updateAdminOrderStatus,
  updateAdminPlan,
} from '../api/client';
import { MrInsaneButtonLoader, MrInsaneLogo } from './MrInsaneLogo';

interface AccountAdminPanelProps {
  user: PublicUser | null;
  plans: SubscriptionPlan[];
  onAuthChange: (user: PublicUser | null) => void;
  onPlansChanged: () => void;
  onNavigateToTrack: (orderId: string) => void;
}

export function AccountAdminPanel({
  user,
  plans,
  onAuthChange,
  onPlansChanged,
  onNavigateToTrack,
}: AccountAdminPanelProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Admin new plan state
  const [adminTab, setAdminTab] = useState<'orders' | 'catalog'>('orders');
  const [newName, setNewName] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newCategory, setNewCategory] = useState<SubscriptionCategory>('OTT & Video');
  const [newSharedPrice, setNewSharedPrice] = useState('149');
  const [newPrivatePrice, setNewPrivatePrice] = useState('349');
  const [newRetailPrice, setNewRetailPrice] = useState('499');
  const [newTagline, setNewTagline] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const load = async () => {
      setOrdersLoading(true);
      try {
        if (user.role === 'admin') {
          const res = await fetchAdminOrders();
          setOrders(res.orders);
        } else {
          const res = await fetchOrders();
          setOrders(res.orders);
        }
      } catch {
        // ignore transient error
      } finally {
        setOrdersLoading(false);
      }
    };
    load();
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await loginUser(email.trim(), password);
        onAuthChange(res.user);
      } else {
        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });
        onAuthChange(res.user);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string, demoPassword: string) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginUser(demoEmail, demoPassword);
      onAuthChange(res.user);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Demo sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onAuthChange(null);
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setAdminFeedback('');
    try {
      const res = await updateAdminOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      setAdminFeedback(`Order #${orderId} updated to ${status}.`);
    } catch (err) {
      setAdminFeedback(err instanceof Error ? err.message : 'Failed to update order.');
    }
  };

  const handleToggleStock = async (plan: SubscriptionPlan) => {
    setAdminFeedback('');
    try {
      await updateAdminPlan(plan.id, { inStock: !plan.inStock });
      onPlansChanged();
      setAdminFeedback(`${plan.name} marked as ${!plan.inStock ? 'In Stock' : 'Out of Stock'}.`);
    } catch (err) {
      setAdminFeedback(err instanceof Error ? err.message : 'Failed to update plan.');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFeedback('');
    setCreatingPlan(true);
    try {
      const res = await createAdminPlan({
        name: newName.trim(),
        provider: newProvider.trim(),
        category: newCategory,
        tagline: newTagline.trim() || 'Instant Activation · Full Duration Warranty',
        description: `Verified ${newProvider.trim()} access managed on mrinsane.in.`,
        sharedMonthlyInr: Number(newSharedPrice) || 149,
        privateMonthlyInr: Number(newPrivatePrice) || 349,
        retailMonthlyInr: Number(newRetailPrice) || 499,
        qualitySpec: '4K / Full Access',
        featured: true,
      });
      setNewName('');
      setNewProvider('');
      setNewTagline('');
      onPlansChanged();
      setAdminFeedback(`Published "${res.plan.name}" to the live catalog.`);
    } catch (err) {
      setAdminFeedback(err instanceof Error ? err.message : 'Could not create plan.');
    } finally {
      setCreatingPlan(false);
    }
  };

  if (!user) {
    return (
      <section className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <MrInsaneLogo size={44} mode={authLoading ? 'loading' : 'idle'} interactive />
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                {authMode === 'login' ? 'Sign in to Mr. Insane' : 'Create Member Account'}
              </h1>
              <p className="text-xs text-slate-500">
                Access your active subscription keys, renewals, and mrinsane.in order history.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                  />
                </div>
                <div>
                  <label htmlFor="auth-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    id="auth-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mrinsane.in"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors"
            >
              {authLoading ? (
                <MrInsaneButtonLoader label="Signing in" />
              ) : authMode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs text-slate-500">Quick preview access:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={authLoading}
                onClick={() => handleDemoSignIn('arjun@mrinsane.in', 'InsaneUser123')}
                className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Demo Member Sign-In
              </button>
              <button
                type="button"
                disabled={authLoading}
                onClick={() => handleDemoSignIn('admin@mrinsane.in', 'MrInsaneAdmin!')}
                className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Demo Admin Sign-In
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Account Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#188CE0]">
            {user.role === 'admin' ? 'Store Owner Console' : 'Member Account'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.email} <span aria-hidden="true">·</span> {user.phone}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Sign Out
        </button>
      </div>

      {adminFeedback && (
        <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#188CE0]/25 text-xs font-medium text-[#0E71B8]">
          {adminFeedback}
        </div>
      )}

      {user.role === 'admin' ? (
        <div className="space-y-6">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAdminTab('orders')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                adminTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('catalog')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                adminTab === 'catalog' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Manage Catalog ({plans.length})
            </button>
          </div>

          {adminTab === 'orders' ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Plans</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                      <th className="py-3.5 px-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                          <button
                            type="button"
                            onClick={() => onNavigateToTrack(order.id)}
                            className="text-[#188CE0] hover:underline"
                          >
                            #{order.id}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">{order.customerName}</div>
                          <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {order.items.map((i) => `${i.planName} (${i.duration})`).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatINR(order.totalInr)}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            aria-label={`Order ${order.id} status`}
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#188CE0]"
                          >
                            <option value="Provisioning">Provisioning</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        {plan.provider} <span aria-hidden="true">·</span> {plan.category}
                      </div>
                      <div className="text-sm font-bold text-slate-900">{plan.name}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-600 mt-0.5">
                        Shared {formatINR(plan.sharedMonthlyInr)}/mo · Private{' '}
                        {formatINR(plan.privateMonthlyInr)}/mo
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStock(plan)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        plan.inStock
                          ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {plan.inStock ? 'In Stock (Pause)' : 'Paused (Enable)'}
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreatePlan}
                className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4"
              >
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Add Subscription Plan
                </h2>

                <div>
                  <label htmlFor="new-plan-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    id="new-plan-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. CloudDrive 2TB Family"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-plan-provider" className="block text-xs font-semibold text-slate-700 mb-1">
                      Provider
                    </label>
                    <input
                      id="new-plan-provider"
                      type="text"
                      required
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      placeholder="CloudDrive"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-plan-category" className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      id="new-plan-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as SubscriptionCategory)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#188CE0]"
                    >
                      <option value="OTT & Video">OTT & Video</option>
                      <option value="Music & Audio">Music & Audio</option>
                      <option value="Productivity & AI">Productivity & AI</option>
                      <option value="Gaming & Bundles">Gaming & Bundles</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="new-plan-tagline" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagline
                  </label>
                  <input
                    id="new-plan-tagline"
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    placeholder="2TB Encrypted Storage · Instant Invite"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="new-shared-price" className="block text-xs font-semibold text-slate-700 mb-1">
                      Shared ₹
                    </label>
                    <input
                      id="new-shared-price"
                      type="number"
                      min="1"
                      required
                      value={newSharedPrice}
                      onChange={(e) => setNewSharedPrice(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-private-price" className="block text-xs font-semibold text-slate-700 mb-1">
                      Private ₹
                    </label>
                    <input
                      id="new-private-price"
                      type="number"
                      min="1"
                      required
                      value={newPrivatePrice}
                      onChange={(e) => setNewPrivatePrice(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-retail-price" className="block text-xs font-semibold text-slate-700 mb-1">
                      Retail ₹
                    </label>
                    <input
                      id="new-retail-price"
                      type="number"
                      min="1"
                      required
                      value={newRetailPrice}
                      onChange={(e) => setNewRetailPrice(e.target.value)}
                      className="w-full px-2.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingPlan}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors"
                >
                  {creatingPlan ? (
                    <MrInsaneButtonLoader label="Publishing" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Publish Plan
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Customer Active Subscriptions */
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Your Active Orders ({orders.length})
          </h2>
          {ordersLoading ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <MrInsaneLogo size={32} mode="loading" interactive={false} />
              <span className="text-sm text-slate-600">Loading your subscriptions...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-sm text-slate-500">
              You have not placed an order under {user.email} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>#{order.id}</span>
                      <span className="font-sans font-semibold text-[#0E71B8]">{order.status}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900 mt-1">
                      {order.items.map((i) => i.planName).join(' + ')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Placed{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      <span aria-hidden="true">·</span> Paid {formatINR(order.totalInr)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToTrack(order.id)}
                    className="w-full py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    View Keys & Renew
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
