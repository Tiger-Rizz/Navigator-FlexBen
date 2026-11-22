/**
 * AI endpoint (CLAUDE.md §11). Streams NDJSON StreamEvents.
 * Live: Anthropic via the Vercel AI SDK with deterministic tools.
 * Scripted: no API key, rate limit or message cap hit, or the live call fails before replying.
 */
import { createAnthropic } from '@ai-sdk/anthropic';
import { stepCountIs, streamText, tool, type ModelMessage } from 'ai';
import { z } from 'zod';
import { resolveContext, type ResolvedContext } from '@/lib/ai/context';
import { isHealthDisclosure } from '@/lib/ai/health';
import { limitReached, paced, scriptedReply } from '@/lib/ai/scripted';
import { systemPrompt } from '@/lib/ai/systemPrompt';
import { runTool, toolDescriptions, toolSchemas } from '@/lib/ai/tools';
import { PlanContextSchema, type Proposal, type StreamEvent } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MESSAGE_CAP = 40;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

const BodySchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) })).min(1).max(100),
  context: PlanContextSchema,
});

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

export async function GET() {
  return Response.json({ live: hasKey() });
}

function ndjson(gen: AsyncGenerator<StreamEvent>): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await gen.next();
      if (done) controller.close();
      else controller.enqueue(enc.encode(JSON.stringify(value) + '\n'));
    },
  });
  return new Response(stream, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } });
}

async function* scripted(text: string, ctx: ResolvedContext, events = scriptedReply(text, ctx)): AsyncGenerator<StreamEvent> {
  yield { type: 'mode', mode: 'scripted' };
  yield* paced(events);
  yield { type: 'done' };
}

function buildTools(ctx: ResolvedContext) {
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

async function* live(messages: ModelMessage[], lastText: string, ctx: ResolvedContext): AsyncGenerator<StreamEvent> {
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'),
    system: systemPrompt(ctx),
    messages,
    tools: buildTools(ctx),
    stopWhen: stepCountIs(4),
    temperature: 0.3,
    maxOutputTokens: 600,
  });

  let started = false;
  const sources = new Set<string>();
  try {
    for await (const p of result.fullStream) {
      if (p.type === 'error') throw p.error;
      if (p.type === 'text-delta' && p.text) {
        if (!started) { started = true; yield { type: 'mode', mode: 'live' }; }
        yield { type: 'text', delta: p.text };
      } else if (p.type === 'tool-result') {
        const out = p.output as Record<string, unknown> | undefined;
        if (!out || 'error' in out) continue;
        if (!started) { started = true; yield { type: 'mode', mode: 'live' }; }
        if (p.toolName === 'propose_plan_change') {
          yield { type: 'part', part: { type: 'proposal', proposal: out as unknown as Proposal } };
        } else if (p.toolName === 'search_policy') {
          for (const passage of (out as { passages: { title: string }[] }).passages) sources.add(passage.title);
        } else if (p.toolName === 'compare_plan_years') {
          sources.add('AXA’s 2026–27 and 2027–28 scheme documents for Meridian');
        }
      }
    }
  } catch (err) {
    console.error('[api/chat] live call failed, using the scripted reply:', err instanceof Error ? err.message : err);
    if (!started) {
      yield* scripted(lastText, ctx);
      return;
    }
    yield { type: 'text', delta: ' Sorry, I lost my connection there. The suggested questions still work.' };
  }
  if (isHealthDisclosure(lastText)) yield { type: 'part', part: { type: 'privacy' } };
  yield { type: 'part', part: { type: 'sources', items: [['Meridian scheme rules', ...sources, 'your current choices'].join(', ')] } };
  yield { type: 'done' };
}

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  const ctx = resolveContext(body.context);
  const lastText = [...body.messages].reverse().find((m) => m.role === 'user')?.text ?? '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';

  if (body.messages.length > MESSAGE_CAP || rateLimited(ip)) return ndjson(scripted(lastText, ctx, limitReached()));
  if (!hasKey()) return ndjson(scripted(lastText, ctx));

  const messages: ModelMessage[] = body.messages
    .filter((m) => m.text.trim())
    .map((m) => ({ role: m.role, content: m.text }));
  return ndjson(live(messages, lastText, ctx));
}
