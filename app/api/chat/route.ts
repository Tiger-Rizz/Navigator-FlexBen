/**
 * AI endpoint (CLAUDE.md §11). Streams NDJSON StreamEvents.
 * Live: Anthropic via the Vercel AI SDK with deterministic tools.
 * Scripted: no API key, rate limit or message cap hit, or the live call fails before replying.
 */
import { createAnthropic } from '@ai-sdk/anthropic';
import type { ModelMessage } from 'ai';
import { z } from 'zod';
import { resolveContext, type ResolvedContext } from '@/lib/ai/context';
import { liveReply } from '@/lib/ai/live';
import { limitReached, paced, scriptedReply } from '@/lib/ai/scripted';
import { PlanContextSchema, type StreamEvent } from '@/lib/ai/types';

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
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5');
  return ndjson(liveReply({ model, messages, lastText, ctx }));
}
