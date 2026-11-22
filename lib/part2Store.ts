'use client';

/** Page state for Your pay and Claim it (PART2.md §3–4). Kept in memory so the tours can drive it. */
import { create } from 'zustand';
import { claims, type ReceiptId } from '@/lib/part2';

type Flag = 'closed' | 'open' | 'sent';
export interface RecentClaim { what: string; amount: number; route: string; status: string }

interface Part2State {
  month: 'march' | 'april';
  openRow: string | null;
  flag: Flag;
  flagLine: string;
  flagNote: string;
  flagTried: boolean;

  receipt: ReceiptId | null;
  reading: boolean;
  own: boolean;
  ownTried: boolean;
  submitted: boolean;
  leaving: boolean;
  toast: string | null;
  recent: RecentClaim[];

  setMonth: (m: 'march' | 'april') => void;
  toggleRow: (id: string) => void;
  openRowOnly: (id: string) => void;
  setFlag: (f: Flag) => void;
  setFlagLine: (v: string) => void;
  setFlagNote: (v: string) => void;
  sendFlag: () => boolean;

  pickReceipt: (id: ReceiptId) => Promise<void>;
  setOwn: (v: boolean) => void;
  submitClaim: () => boolean;
  setLeaving: (v: boolean) => void;
  handOff: () => void;
  showToast: (t: string) => void;
  restartClaim: () => void;
  resetPay: () => void;
  resetClaims: () => void;
}

const initialRecent = (): RecentClaim[] => claims.recent.map((c) => ({ what: c.what, amount: c.amount, route: claims.allowance.short, status: c.status }));
const payInitial = { month: 'april' as const, openRow: 'health' as string | null, flag: 'closed' as Flag, flagLine: '', flagNote: '', flagTried: false };
const claimInitial = { receipt: null as ReceiptId | null, reading: false, own: false, ownTried: false, submitted: false, leaving: false, toast: null as string | null };

export const READING_MS = 900;

export const usePart2 = create<Part2State>()((set, get) => ({
  ...payInitial,
  ...claimInitial,
  recent: initialRecent(),

  setMonth: (month) => set({ month }),
  toggleRow: (id) => set({ openRow: get().openRow === id ? null : id }),
  openRowOnly: (id) => set({ openRow: id }),
  setFlag: (flag) => set({ flag, flagTried: false, ...(flag === 'closed' ? { flagLine: '', flagNote: '' } : {}) }),
  setFlagLine: (flagLine) => set({ flagLine, flagTried: false }),
  setFlagNote: (flagNote) => set({ flagNote }),
  sendFlag: () => {
    if (!get().flagLine) { set({ flagTried: true }); return false; }
    set({ flag: 'sent' });
    return true;
  },

  pickReceipt: async (id) => {
    set({ ...claimInitial, receipt: id, reading: true });
    await new Promise((r) => setTimeout(r, READING_MS));
    if (get().receipt === id) set({ reading: false });
  },
  setOwn: (own) => set({ own, ownTried: false }),
  submitClaim: () => {
    const s = get();
    if (!s.own) { set({ ownTried: true }); return false; }
    const r = s.receipt ? claims.receipts[s.receipt] : null;
    set({ submitted: true, recent: r ? [{ what: r.what, amount: r.amount, route: claims.allowance.short, status: 'Approved' }, ...s.recent] : s.recent });
    return true;
  },
  setLeaving: (leaving) => set({ leaving }),
  handOff: () => set({ leaving: false, submitted: true }),
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => { if (get().toast === toast) set({ toast: null }); }, 2000);
  },
  restartClaim: () => set({ ...claimInitial }),
  resetPay: () => set({ ...payInitial }),
  resetClaims: () => set({ ...claimInitial, recent: initialRecent() }),
}));
