import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
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

export function Header({
  activeView,
  onNavigate,
  cartCount,
  onOpenCart,
  user,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: ActiveView, anchor?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, anchor);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand mark + single-line wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNav('store', 'top');
          }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0] rounded-lg"
        >
          <MrInsaneLogo size={34} mode="idle" interactive />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Mr. Insane
          </span>
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleNav('store', 'catalog')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0] ${
              activeView === 'store' ? 'text-slate-900 underline underline-offset-8 decoration-[#188CE0] decoration-2' : ''
            }`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => handleNav('store', 'how-it-works')}
            className="whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0]"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNav('track')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0] ${
              activeView === 'track' ? 'text-slate-900 underline underline-offset-8 decoration-[#188CE0] decoration-2' : ''
            }`}
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => handleNav('account')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0] ${
              activeView === 'account' ? 'text-slate-900 underline underline-offset-8 decoration-[#188CE0] decoration-2' : ''
            }`}
          >
            {user ? (user.role === 'admin' ? 'Admin Console' : 'Account') : 'Sign In'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open subscription bag with ${cartCount} items`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#188CE0] hover:bg-[#0E71B8] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188CE0]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleNav('store', 'catalog')}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => handleNav('store', 'how-it-works')}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNav('track')}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => handleNav('account')}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            {user ? (user.role === 'admin' ? 'Admin Console' : 'Account') : 'Sign In'}
          </button>
        </div>
      )}
    </header>
  );
}
