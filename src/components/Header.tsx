import { useState } from 'react';
import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { MrInsaneLogo } from './MrInsaneLogo';
import type { PublicUser } from '../shared/pricing';

export type ActiveView = 'store' | 'track' | 'account';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, anchor?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: PublicUser | null;
}

type NavItem = { label: string; view: ActiveView; anchor?: string; activeOn?: ActiveView };

export function Header({ activeView, onNavigate, cartCount, onOpenCart, user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ActiveView, anchor?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, anchor);
  };

  const accountLabel = user ? (user.role === 'admin' ? 'Admin Console' : 'Account') : 'Sign In';

  const navItems: NavItem[] = [
    { label: 'Catalog', view: 'store', anchor: 'catalog', activeOn: 'store' },
    { label: 'How It Works', view: 'store', anchor: 'how-it-works' },
    { label: 'Track Order', view: 'track', activeOn: 'track' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#070B16]/85 backdrop-blur-xl border-b border-white/[0.07] text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNav('store', 'top');
          }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-lg"
        >
          <MrInsaneLogo size={32} mode="idle" interactive />
          <span className="font-display text-[17px] font-bold tracking-tight text-white">
            Mr. Insane
          </span>
          <span className="hidden sm:inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400">
            v2.6
          </span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-[13px] font-medium"
        >
          {navItems.map((item) => {
            const active = item.activeOn === activeView;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.view, item.anchor)}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                  active
                    ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('account')}
            className={`hidden md:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              activeView === 'account' ? 'text-white bg-white/[0.07]' : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {user ? (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-[#188CE0] text-[10px] font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserRound className="h-4 w-4" aria-hidden="true" />
            )}
            {accountLabel}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open subscription bag with ${cartCount} items`}
            className="group relative inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-8px_rgba(56,189,248,0.45)] transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>Bag</span>
            <span
              className={`min-w-5 rounded-full px-1.5 py-px text-center font-mono text-[11px] tabular-nums ${
                cartCount > 0 ? 'bg-[#188CE0] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.07] bg-[#070B16] px-4 py-3 flex flex-col gap-1">
          {[...navItems, { label: accountLabel, view: 'account' as ActiveView }].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNav(item.view, item.anchor)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
