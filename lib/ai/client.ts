'use client';

/** Sends a message to the AI and streams the reply into the shared store. Never throws to the UI. */
import { usePlan } from '@/lib/store';
import { resolveContext } from './context';
import { scenarioMentions } from './health';
import { paced, scriptedReply } from './scripted';
import type { ChatMessage, PlanContext, StreamEvent } from './types';

let seq = 0;
const newId = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

function planContext(): PlanContext {
  const s = usePlan.getState();
  return { personaId: s.personaId, selection: s.selection, addedPeople: s.addedPeople, mentions: s.mentions };
}

/** Text the model sees for each earlier message (cards summarised in words). */
function asText(m: ChatMessage): string {
  return m.parts
    .map((p) => {
      if (p.type === 'text') return p.text;
      if (p.type === 'proposal') return `[Proposal card shown: ${p.proposal.title}, ${p.proposal.lines.map((l) => l.text).join('; ')}]`;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

async function* fromServer(history: ChatMessage[]): AsyncGenerator<StreamEvent> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: history.slice(-20).map((m) => ({ role: m.role, text: asText(m) || '…' })),
      context: planContext(),
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Chat request failed: ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line) as StreamEvent;
    }
  }
}

function local(text: string): AsyncGenerator<StreamEvent> {
  const ctx = resolveContext(planContext());
  return paced([{ type: 'mode', mode: 'scripted' }, ...scriptedReply(text, ctx), { type: 'done' }]);
}

export async function sendMessage(text: string): Promise<void> {
  const store = usePlan.getState();
  const trimmed = text.trim();
  if (!trimmed || store.busy) return;
  for (const m of scenarioMentions(trimmed)) store.addMention(m);

  const user: ChatMessage = { id: newId('u'), role: 'user', parts: [{ type: 'text', text: trimmed }] };
  store.addMessage(user);
  const replyId = newId('a');
  store.addMessage({ id: replyId, role: 'assistant', parts: [] });
  store.setBusy(true);

  const apply = (ev: StreamEvent) => {
    const s = usePlan.getState();
    if (ev.type === 'text') s.appendText(replyId, ev.delta);
    else if (ev.type === 'part') {
      s.appendToMessage(replyId, ev.part);
      if (ev.part.type === 'proposal') s.setProposal(ev.part.proposal);
    }
  };

  let received = false;
  try {
    const stream = usePlan.getState().tourActive ? local(trimmed) : fromServer(usePlan.getState().messages.slice(0, -1));
    for await (const ev of stream) {
      received = true;
      apply(ev);
    }
  } catch {
    // Network or server failure: answer from the script so the demo never breaks.
    if (!received) for await (const ev of local(trimmed)) apply(ev);
  } finally {
    usePlan.getState().setBusy(false);
  }
}

/** Adds an assistant message without a network call (e.g. the follow-up after accepting a proposal). */
export function addAssistantMessage(parts: ChatMessage['parts']) {
  usePlan.getState().addMessage({ id: newId('a'), role: 'assistant', parts });
}

/** Accepts the pending proposal and adds the deterministic follow-up (same in live and scripted modes). */
export function acceptProposalWithFollowUp() {
  const s = usePlan.getState();
  if (!s.proposal || s.proposalStatus !== 'pending') return;
  s.acceptProposal();
  addAssistantMessage([
    { type: 'text', text: 'Done. Before you confirm, want to see how this plan would handle a few real situations, like a knee operation or a flare-up for Sam?' },
    { type: 'actions', items: [{ label: 'Show me scenarios', href: '/benefits/pmi/scenarios' }, { label: 'Go to review', href: '/benefits/pmi/review' }] },
  ]);
}
