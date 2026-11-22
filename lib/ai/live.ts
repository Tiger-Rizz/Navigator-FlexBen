/**
 * Live AI path (CLAUDE.md §11): streamText with deterministic tools, mapped to the app's StreamEvents.
 * Guarantees an answer: the final step forbids tool calls, and a reply that still has no text falls
 * back to the scripted answer, so the member never sees an empty message.
 */
import { stepCountIs, streamText, tool, type LanguageModel, type ModelMessage } from 'ai';
import type { ResolvedContext } from './context';
import { isHealthDisclosure } from './health';
import { paced, scriptedReply } from './scripted';
import { systemPrompt } from './systemPrompt';
import { runTool, toolDescriptions, toolSchemas } from './tools';
import type { Proposal, StreamEvent } from './types';

/** Up to four rounds of tool calls, then one step that must answer in text. */
export const MAX_STEPS = 5;

export function buildTools(ctx: ResolvedContext) {
  const entries = (Object.keys(toolSchemas) as (keyof typeof toolSchemas)[]).map((name) => [
    name,
    tool({
      description: toolDescriptions[name],
      inputSchema: toolSchemas[name],
      execute: async (input: unknown) => {
        try {
          return runTool(name, input, ctx);
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'That option isn’t available.' };
        }
      },
    }),
  ]);
  return Object.fromEntries(entries);
}

export async function* liveReply(opts: {
  model: LanguageModel;
  messages: ModelMessage[];
  lastText: string;
  ctx: ResolvedContext;
  msPerWord?: number;
}): AsyncGenerator<StreamEvent> {
  const { model, messages, lastText, ctx, msPerWord } = opts;
  const result = streamText({
    model,
    system: systemPrompt(ctx),
    messages,
    tools: buildTools(ctx),
    stopWhen: stepCountIs(MAX_STEPS),
    prepareStep: ({ stepNumber }) => (stepNumber >= MAX_STEPS - 1 ? { toolChoice: 'none' as const } : undefined),
    temperature: 0.3,
    maxOutputTokens: 600,
  });

  let started = false;
  let textChars = 0;
  let proposalSent = false;
  const sources = new Set<string>();
  const start = (): StreamEvent[] => (started ? [] : ((started = true), [{ type: 'mode', mode: 'live' }]));

  try {
    for await (const p of result.fullStream) {
      if (p.type === 'error') throw p.error;
      if (p.type === 'text-delta' && p.text) {
        yield* start();
        textChars += p.text.length;
        yield { type: 'text', delta: p.text };
      } else if (p.type === 'tool-result') {
        const out = p.output as Record<string, unknown> | undefined;
        if (!out || 'error' in out) continue;
        yield* start();
        if (p.toolName === 'propose_plan_change') {
          proposalSent = true;
          yield { type: 'part', part: { type: 'proposal', proposal: out as unknown as Proposal } };
        } else if (p.toolName === 'search_policy') {
          for (const passage of (out as { passages: { title: string }[] }).passages) sources.add(passage.title);
        } else if (p.toolName === 'run_scenarios') {
          const rows = out as unknown as { scenarios: { youPay: string; note: string }[] }[];
          if (rows.length === 1 && rows[0].scenarios.length === 1) {
            const s = rows[0].scenarios[0];
            yield { type: 'part', part: { type: 'scenario', card: { label: 'You’d pay', amount: Number(s.youPay.replace(/[£,]/g, '')), note: s.note } } };
          }
        } else if (p.toolName === 'compare_plan_years') {
          sources.add('AXA’s 2026–27 and 2027–28 scheme documents for Meridian');
        }
      }
    }
  } catch (err) {
    console.error('[api/chat] live call failed:', err instanceof Error ? err.message : err);
  }

  if (textChars === 0) {
    // The model answered with nothing usable: use the scripted answer (or a plain line under its card).
    if (proposalSent) {
      yield { type: 'text', delta: 'I’ve put the suggested changes on your plan so you can check them.' };
    } else {
      if (!started) yield { type: 'mode', mode: 'scripted' };
      yield* paced(scriptedReply(lastText, ctx), msPerWord);
      yield { type: 'done' };
      return;
    }
  }
  if (isHealthDisclosure(lastText)) yield { type: 'part', part: { type: 'privacy' } };
  yield { type: 'part', part: { type: 'sources', items: [['Meridian scheme rules', ...sources, 'your current choices'].join(', ')] } };
  yield { type: 'done' };
}
