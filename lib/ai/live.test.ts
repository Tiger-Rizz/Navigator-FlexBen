import { describe, expect, it } from 'vitest';
import { MockLanguageModelV4, convertArrayToReadableStream } from 'ai/test';
import { getPersona } from '@/lib/data';
import { formatMonthly } from '@/lib/engine/format';
import { resolveContext } from './context';
import { liveReply, MAX_STEPS } from './live';
import { CANONICAL_OPENING, COMMON_QUESTIONS } from './questions';
import type { Proposal, StreamEvent } from './types';

const priya = getPersona('priya');
const ctx = resolveContext({ personaId: 'priya', selection: priya.currentSelection, addedPeople: [], mentions: [] });
const usage = { inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 5, text: 5, reasoning: 0 } };
const finish = (unified: 'stop' | 'tool-calls') => ({ type: 'finish', usage, finishReason: { unified, raw: unified } });
const toolCall = (id: string, toolName: string, input: unknown) => ({ type: 'tool-call', toolCallId: id, toolName, input: JSON.stringify(input) });
const text = (t: string) => [{ type: 'text-start', id: 't' }, { type: 'text-delta', id: 't', delta: t }, { type: 'text-end', id: 't' }];

async function collect(gen: AsyncGenerator<StreamEvent>) {
  const out: StreamEvent[] = [];
  for await (const e of gen) out.push(e);
  return out;
}
const joined = (ev: StreamEvent[]) => ev.filter((e) => e.type === 'text').map((e) => (e as { delta: string }).delta).join('');

describe('live AI path', () => {
  it('a model that only ever calls tools is forced to stop, and the member still gets an answer', async () => {
    let call = 0;
    const model = new MockLanguageModelV4({
      doStream: async (options) => {
        call++;
        // Respect toolChoice "none" like a real provider: no tools offered → no tool calls possible.
        const noTools = options.toolChoice?.type === 'none';
        return { stream: convertArrayToReadableStream(noTools ? [finish('stop')] : [toolCall(`c${call}`, 'get_member_context', {}), finish('tool-calls')]) as never };
      },
    });
    const ev = await collect(liveReply({ model, messages: [{ role: 'user', content: COMMON_QUESTIONS[0] }], lastText: COMMON_QUESTIONS[0], ctx, msPerWord: 0 }));
    expect(model.doStreamCalls.length).toBe(MAX_STEPS);
    expect(model.doStreamCalls[MAX_STEPS - 1].toolChoice).toEqual({ type: 'none' });
    expect(joined(ev)).toContain('about £50.00 more a month'); // scripted answer, engine number
    expect(ev.at(-1)).toEqual({ type: 'done' });
  });

  it('streams text and the proposal card from a normal tool-using reply', async () => {
    const model = new MockLanguageModelV4({
      doStream: [
        { stream: convertArrayToReadableStream([toolCall('p1', 'propose_plan_change', {
          title: 'Add Sam, keep it lean', rationale: 'Lowest-cost way to add Sam.',
          changes: [{ field: 'add_dependant', value: 'sam' }, { field: 'excess', value: 250 }, { field: 'specialist', value: 'guided' }],
        }), finish('tool-calls')]) as never },
        { stream: convertArrayToReadableStream([...text('Here’s a lean way to add Sam.'), finish('stop')]) as never },
      ],
    });
    const ev = await collect(liveReply({ model, messages: [{ role: 'user', content: CANONICAL_OPENING }], lastText: CANONICAL_OPENING, ctx, msPerWord: 0 }));
    const proposal = (ev.find((e) => e.type === 'part' && e.part.type === 'proposal') as { part: { proposal: Proposal } }).part.proposal;
    expect(ev[0]).toEqual({ type: 'mode', mode: 'live' });
    expect(formatMonthly(proposal.monthly)).toBe('£51.50');
    expect(formatMonthly(proposal.alternative!.monthly)).toBe('£80.00');
    expect(joined(ev)).toBe('Here’s a lean way to add Sam.');
    expect(ev.some((e) => e.type === 'part' && e.part.type === 'privacy')).toBe(true); // asthma disclosed
  });

  it('a proposal with no text gets a plain line instead of an empty message', async () => {
    const model = new MockLanguageModelV4({
      doStream: async (options) => ({
        stream: convertArrayToReadableStream(options.toolChoice?.type === 'none' ? [finish('stop')] : [toolCall('p1', 'propose_plan_change', {
          title: 'Lean', rationale: 'x', changes: [{ field: 'excess', value: 250 }],
        }), finish('tool-calls')]) as never,
      }),
    });
    const ev = await collect(liveReply({ model, messages: [{ role: 'user', content: 'cheaper please' }], lastText: 'cheaper please', ctx, msPerWord: 0 }));
    expect(joined(ev)).toBe('I’ve put the suggested changes on your plan so you can check them.');
  });

  it('a provider error before any text falls back to the scripted answer', async () => {
    const model = new MockLanguageModelV4({ doStream: async () => { throw new Error('invalid x-api-key'); } });
    const ev = await collect(liveReply({ model, messages: [{ role: 'user', content: COMMON_QUESTIONS[1] }], lastText: COMMON_QUESTIONS[1], ctx, msPerWord: 0 }));
    expect(ev[0]).toEqual({ type: 'mode', mode: 'scripted' });
    expect(ev.some((e) => e.type === 'part' && e.part.type === 'scenario')).toBe(true);
  });
});
