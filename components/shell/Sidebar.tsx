'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge as BadgeIcon, Bookmark, CirclePlus, Heart, House, Menu, PartyPopper, Tag, X, type LucideIcon } from 'lucide-react';
import { PointsPill } from './PointsPill';
import { SearchOrAsk } from './SearchOrAsk';

const NAV: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: '/', label: 'Home', icon: House, match: (p) => p === '/' },
  { href: '/benefits', label: 'Benefits', icon: BadgeIcon, match: (p) => p.startsWith('/benefits') },
  { href: '/store', label: 'Store', icon: Tag, match: (p) => p.startsWith('/store') },
  { href: '/recognition', label: 'Recognition', icon: PartyPopper, match: (p) => p.startsWith('/recognition') },
  { href: '/my-choices', label: 'My choices', icon: Bookmark, match: (p) => p.startsWith('/my-choices') },
  { href: '/total-rewards', label: 'Total rewards', icon: CirclePlus, match: (p) => p.startsWith('/total-rewards') },
  { href: '/saved', label: 'Saved', icon: Heart, match: (p) => p.startsWith('/saved') },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-1.5 no-underline">
      <span aria-hidden className="flex size-[26px] items-center justify-center rounded-[7px] bg-brand text-[13px] font-semibold text-white">
        M
      </span>
      <span className="text-[15px] font-semibold">Meridian Benefits</span>
    </Link>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 py-2 no-underline ${
                active ? 'bg-nav-active font-medium' : 'hover:bg-surface-2'
              }`}
            >
              <Icon aria-hidden size={16} strokeWidth={1.8} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Footer() {
  return (
    <div className="mt-auto flex flex-col gap-2.5">
      <PointsPill />
      <Link href="/about" className="px-1.5 text-xs text-secondary-2 underline-offset-2 hover:underline">
        Notes for reviewers
      </Link>
      <div className="flex items-center gap-2 border-t border-line px-1.5 py-2">
        <span aria-hidden className="flex size-[26px] items-center justify-center rounded-full bg-avatar text-xs font-semibold text-avatar-text">
          PS
        </span>
        <span className="text-[13px] font-medium">Priya Shah</span>
      </div>
    </div>
  );
}

/** Navigator shell: left sidebar on desktop, top bar with a menu under 900px. */
export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Desktop */}
      <nav
        aria-label="Main"
        className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-[18px] border-r border-line bg-white px-3.5 py-5 min-[900px]:flex"
      >
        <Brand />
        <SearchOrAsk />
        <NavLinks />
        <Footer />
      </nav>

      {/* Narrow screens */}
      <header className="sticky top-0 z-30 border-b border-line bg-white min-[900px]:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <Brand />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-[10px] border border-line-control bg-white cursor-pointer"
          >
            {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="flex flex-col gap-4 border-t border-line px-4 pb-4 pt-3">
            <SearchOrAsk />
            <NavLinks />
            <Footer />
          </nav>
        )}
      </header>
    </>
  );
}
