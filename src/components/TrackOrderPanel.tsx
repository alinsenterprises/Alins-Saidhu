import { useEffect, useState } from 'react';
import { Check, Copy, RefreshCw, Search } from 'lucide-react';
import {
  DURATION_META,
  formatINR,
  type BillingDuration,
  type Order,
  type PublicUser,
  type SupportTicket,
} from '../shared/pricing';
import { createTicket, fetchOrders, fetchTickets, renewOrder } from '../api/client';
import { MrInsaneButtonLoader, MrInsaneLogo } from './MrInsaneLogo';

interface TrackOrderPanelProps {
  initialOrderId?: string;
  user: PublicUser | null;
}

export function TrackOrderPanel({ initialOrderId = '', user }: TrackOrderPanelProps) {
  const [lookupInput, setLookupInput] = useState(initialOrderId || 'MI-8402');
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewMessage, setRenewMessage] = useState('');

  // Support ticket form state
  const [ticketOrderId, setTicketOrderId] = useState(initialOrderId || 'MI-8402');
  const [ticketEmail, setTicketEmail] = useState(user?.email || '');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketFeedback, setTicketFeedback] = useState('');

  useEffect(() => {
    if (user?.email && !ticketEmail) {
      setTicketEmail(user.email);
    }
  }, [user, ticketEmail]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError('');
      try {
        if (initialOrderId) {
          setLookupInput(initialOrderId);
          setTicketOrderId(initialOrderId);
          const res = await fetchOrders({ orderId: initialOrderId });
          setOrders(res.orders);
        } else if (user) {
          const [orderRes, ticketRes] = await Promise.all([
            fetchOrders(),
            fetchTickets(user.email),
          ]);
          setOrders(orderRes.orders);
          setTickets(ticketRes.tickets);
        } else {
          const res = await fetchOrders({ orderId: 'MI-8402' });
          setOrders(res.orders);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load order.');
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [initialOrderId, user]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = lookupInput.trim();
    if (!cleaned) {
      setError('Enter an Order ID (e.g. MI-8402) or email address.');
      return;
    }
    setLoading(true);
    setError('');
    setRenewMessage('');
    try {
      const isEmail = cleaned.includes('@');
      const res = await fetchOrders(isEmail ? { email: cleaned } : { orderId: cleaned });
      setOrders(res.orders);
      if (res.orders.length === 0) {
        setError(`No orders found for "${cleaned}".`);
      } else {
        setTicketOrderId(res.orders[0].id);
        const ticketRes = await fetchTickets(res.orders[0].customerEmail);
        setTickets(ticketRes.tickets);
      }
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : 'Order not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (order: Order, duration: BillingDuration) => {
    setRenewingId(order.id);
    setRenewMessage('');
    try {
      const res = await renewOrder(order.id, duration);
      setOrders((prev) => [res.order, ...prev]);
      setRenewMessage(`Renewed into new active order #${res.order.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Renewal failed.');
    } finally {
      setRenewingId(null);
    }
  };

  const handleCopy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(val);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketFeedback('');
    setTicketSubmitting(true);
    try {
      const res = await createTicket({
        orderId: ticketOrderId || 'GENERAL',
        email: ticketEmail.trim(),
        subject: ticketSubject.trim(),
        message: ticketBody.trim(),
      });
      setTickets((prev) => [res.ticket, ...prev]);
      setTicketSubject('');
      setTicketBody('');
      setTicketFeedback(`Ticket ${res.ticket.id} submitted. Average response is under 15 mins.`);
    } catch (err) {
      setTicketFeedback(err instanceof Error ? err.message : 'Unable to submit ticket.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="max-w-xl">
          <p className="text-xs font-semibold text-[#188CE0]">Order & Credential Lookup</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
            Track Order & Renewals
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Look up any mrinsane.in order by Order ID or email address to retrieve activation keys,
            extend validity, or contact support.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex w-full md:w-auto md:min-w-[380px] gap-2">
          <label htmlFor="order-lookup-input" className="sr-only">
            Order ID or email address
          </label>
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="order-lookup-input"
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order ID (e.g. MI-8402) or email"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#188CE0]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            {loading ? <MrInsaneButtonLoader label="Searching" /> : 'Lookup'}
          </button>
        </form>
      </div>

      {renewMessage && (
        <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#188CE0]/25 text-sm font-medium text-[#0E71B8]">
          {renewMessage}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Orders Column */}
        <div className="lg:col-span-2 space-y-5">
          {loading ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center gap-4">
              <MrInsaneLogo size={54} mode="loading" interactive={false} />
              <p className="text-sm font-medium text-slate-600">
                Fetching order records from mrinsane.in...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <h2 className="font-display text-lg font-bold text-slate-900">No orders loaded</h2>
              <p className="text-sm text-slate-500">
                Enter an Order ID like <span className="font-mono">MI-8402</span> or your email to
                view credentials.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                      ORDER #{order.id} <span aria-hidden="true">·</span>{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      <span aria-hidden="true">·</span> {order.paymentMethod}
                    </div>
                    <h2 className="font-display text-lg font-bold text-slate-900 mt-1">
                      {order.customerName} ({order.customerEmail})
                    </h2>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#0E71B8]">
                      Status: {order.status}
                    </div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                      {formatINR(order.totalInr)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${order.id}-${item.planId}-${idx}`}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{item.planName}</h3>
                          <p className="text-xs text-slate-500">
                            {DURATION_META[item.duration].label} <span aria-hidden="true">·</span>{' '}
                            {item.accessType === 'private' ? 'Private Account' : 'Shared Slot'}{' '}
                            <span aria-hidden="true">·</span> Valid until{' '}
                            <span className="font-mono tabular-nums">
                              {new Date(item.expiresAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </p>
                        </div>
                        <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                          {formatINR(item.lineTotalInr)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
                        <code className="text-xs font-mono font-semibold text-slate-800 truncate">
                          {item.activationKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.activationKey)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#188CE0] hover:text-[#0E71B8] shrink-0"
                        >
                          {copiedKey === item.activationKey ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600">{item.deliveryInstructions}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Need more time on this subscription?
                  </span>
                  <button
                    type="button"
                    disabled={renewingId === order.id}
                    onClick={() => handleRenew(order, order.items[0]?.duration || '1m')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    {renewingId === order.id ? (
                      <MrInsaneButtonLoader label="Renewing" />
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                        Extend{' '}
                        {DURATION_META[order.items[0]?.duration || '1m'].label}
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Support Column */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Slot & Activation Support
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Need a TV verification code or slot replacement? Open a ticket linked to your Order ID.
            </p>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="ticket-order" className="block text-xs font-semibold text-slate-700 mb-1">
                Order ID
              </label>
              <input
                id="ticket-order"
                type="text"
                value={ticketOrderId}
                onChange={(e) => setTicketOrderId(e.target.value)}
                placeholder="MI-8402"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            <div>
              <label htmlFor="ticket-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Your Email
              </label>
              <input
                id="ticket-email"
                type="email"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            <div>
              <label htmlFor="ticket-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <input
                id="ticket-subject"
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Need household OTP code"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            <div>
              <label htmlFor="ticket-message" className="block text-xs font-semibold text-slate-700 mb-1">
                Message
              </label>
              <textarea
                id="ticket-message"
                rows={3}
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
                placeholder="Describe your device or login issue..."
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#188CE0]"
              />
            </div>

            <button
              type="submit"
              disabled={ticketSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold transition-colors"
            >
              {ticketSubmitting ? <MrInsaneButtonLoader label="Sending" /> : 'Submit Support Request'}
            </button>

            {ticketFeedback && (
              <p className="text-xs font-medium text-[#0E71B8] pt-1">{ticketFeedback}</p>
            )}
          </form>

          {tickets.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-700">Recent Tickets</h3>
              {tickets.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>{t.id} · {t.orderId}</span>
                    <span className="font-sans font-semibold text-slate-700">{t.status}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">{t.subject}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
