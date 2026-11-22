'use client';

/**
 * One plan state for every screen (CLAUDE.md §9). Persisted to sessionStorage.
 * Holds no money: screens price `selection` with the engine.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersona, type Dependant, type Selection } from '@/lib/data';
import { sameSelection, type Lever } from '@/lib/plan';
import type { ChatMessage, MessagePart, Proposal } from '@/lib/ai/types';

export type Status = 'editing' | 'kept' | 'confirmed';

export interface PlanState {
  personaId: string;
  addedPeople: Dependant[];
  selection: Selection;
  status: Status;
  /** Selection before "Keep my current cover" or an accepted proposal, for Undo. */
  undoSelection: Selection | null;
  confirmedSelection: Selection | null;

  proposal: Proposal | null;
  proposalStatus: 'pending' | 'accepted' | null;

  messages: ChatMessage[];
  mentions: string[];
  contextConfirmed: boolean;
  askOpen: boolean;
  /** A question waiting to be asked in the Ask AI panel. */
  askQuery: string | null;
  busy: boolean;
  /** Dates of birth entered on the review screen, by dependant id (ISO). */
  dobs: Record<string, string>;
  reviewAgreed: boolean;
  tourStep: number | null;
  tourId: 'flex' | 'pay' | 'claims';
  tourDismissed: boolean;
  /** Set while the guided tour runs: the AI is always scripted then. */
  tourActive: boolean;

  setLever: <L extends Lever>(lever: L, value: Selection[L]) => void;
  cover: (id: string) => void;
  uncover: (id: string) => void;
  addChild: (name: string, dob: string) => void;
  keepCurrent: () => void;
  undo: () => void;
  reset: () => void;
  confirm: () => void;

  setProposal: (p: Proposal) => void;
  acceptProposal: () => void;
  undoProposal: () => void;
  applySelection: (s: Selection) => void;

  addMessage: (m: ChatMessage) => void;
  appendToMessage: (id: string, part: MessagePart) => void;
  appendText: (id: string, delta: string) => void;
  addMention: (m: string) => void;
  setContextConfirmed: (v: boolean) => void;
  setAskOpen: (v: boolean) => void;
  openAsk: (question?: string) => void;
  takeAskQuery: () => string | null;
  setBusy: (v: boolean) => void;
  setDob: (id: string, iso: string) => void;
  setReviewAgreed: (v: boolean) => void;
  unconfirm: () => void;
  setTourStep: (n: number | null) => void;
  setTourId: (id: 'flex' | 'pay' | 'claims') => void;
  dismissTour: () => void;
  setTourActive: (v: boolean) => void;
  resetAll: () => void;
}

const persona = getPersona('priya');
const base = () => structuredClone(persona.currentSelection);

const initial = () => ({
  personaId: persona.id,
  addedPeople: [] as Dependant[],
  selection: base(),
  status: 'editing' as Status,
  undoSelection: null,
  confirmedSelection: null,
  proposal: null,
  proposalStatus: null,
  messages: [] as ChatMessage[],
  mentions: [] as string[],
  contextConfirmed: false,
  askOpen: false,
  askQuery: null as string | null,
  busy: false,
  dobs: {} as Record<string, string>,
  reviewAgreed: false,
  tourStep: null as number | null,
  tourId: 'flex' as 'flex' | 'pay' | 'claims',
  tourDismissed: false,
  tourActive: false,
});

const edit = (s: Selection) => ({ selection: s, status: 'editing' as Status, undoSelection: null });

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initial(),

      setLever: (lever, value) => set({ ...edit({ ...get().selection, [lever]: value }) }),
      cover: (id) => {
        const s = get().selection;
        if (!s.dependants.includes(id)) set({ ...edit({ ...s, dependants: [...s.dependants, id] }) });
      },
      uncover: (id) => {
        const s = get().selection;
        set({
          ...edit({ ...s, dependants: s.dependants.filter((d) => d !== id) }),
          // Children added by the member disappear when removed; people on record stay listed.
          addedPeople: get().addedPeople.filter((p) => p.id !== id),
        });
      },
      addChild: (name, dob) => {
        const id = `child-${Date.now().toString(36)}`;
        const child: Dependant = { id, name: name.trim(), relationship: 'child', source: 'added_by_member', dob };
        const s = get().selection;
        set({ addedPeople: [...get().addedPeople, child], ...edit({ ...s, dependants: [...s.dependants, id] }) });
      },
      keepCurrent: () => set({ undoSelection: get().selection, selection: base(), status: 'kept', confirmedSelection: base() }),
      undo: () => {
        const prev = get().undoSelection;
        if (prev) set({ selection: prev, undoSelection: null, status: 'editing', confirmedSelection: null });
      },
      reset: () => set({ ...edit(base()), proposal: null, proposalStatus: null }),
      confirm: () => set({ status: 'confirmed', confirmedSelection: get().selection }),

      setProposal: (p) => set({ proposal: p, proposalStatus: 'pending' }),
      acceptProposal: () => {
        const p = get().proposal;
        if (!p) return;
        set({ undoSelection: get().selection, selection: p.selection, status: 'editing', proposalStatus: 'accepted' });
      },
      undoProposal: () => {
        const prev = get().undoSelection;
        if (prev) set({ selection: prev, undoSelection: null, proposalStatus: 'pending' });
      },
      applySelection: (s) => {
        const { proposal, selection } = get();
        // Choosing the AI's suggestion from the comparison counts as accepting it, so the chat card agrees.
        if (proposal && sameSelection(proposal.selection, s)) set({ ...edit(s), proposalStatus: 'accepted', undoSelection: selection });
        else set({ ...edit(s) });
      },

      addMessage: (m) => set({ messages: [...get().messages, m] }),
      appendToMessage: (id, part) =>
        set({ messages: get().messages.map((m) => (m.id === id ? { ...m, parts: [...m.parts, part] } : m)) }),
      appendText: (id, delta) =>
        set({
          messages: get().messages.map((m) => {
            if (m.id !== id) return m;
            const last = m.parts[m.parts.length - 1];
            if (last?.type === 'text') return { ...m, parts: [...m.parts.slice(0, -1), { type: 'text', text: last.text + delta }] };
            return { ...m, parts: [...m.parts, { type: 'text', text: delta }] };
          }),
        }),
      addMention: (x) => {
        if (!get().mentions.includes(x)) set({ mentions: [...get().mentions, x] });
      },
      setContextConfirmed: (v) => set({ contextConfirmed: v }),
      setAskOpen: (v) => set({ askOpen: v }),
      setBusy: (v) => set({ busy: v }),
      setDob: (id, iso) => set({ dobs: { ...get().dobs, [id]: iso } }),
      setReviewAgreed: (v) => set({ reviewAgreed: v }),
      unconfirm: () => set({ status: 'editing', confirmedSelection: null }),
      setTourStep: (n) => set({ tourStep: n }),
      setTourId: (tourId) => set({ tourId }),
      dismissTour: () => set({ tourDismissed: true }),
      setTourActive: (v) => set({ tourActive: v }),
      openAsk: (question) => set({ askOpen: true, askQuery: question ?? null }),
      takeAskQuery: () => {
        const q = get().askQuery;
        if (q) set({ askQuery: null });
        return q;
      },
      resetAll: () => set({ ...initial(), tourDismissed: get().tourDismissed }),
    }),
    {
      name: 'navigator-flex-plan',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true, // rehydrated in <StoreHydrator/> after mount, to avoid SSR mismatches
      partialize: ({ askOpen, askQuery, busy, tourStep, tourActive, tourId, ...rest }) => rest,
    },
  ),
);

/** People the member can cover: on record plus anyone they added. */
export function usePeople(): Dependant[] {
  const added = usePlan((s) => s.addedPeople);
  return [...persona.peopleOnRecord, ...added];
}

export function usePersona() {
  return persona;
}

export const baseline = persona.currentSelection;
