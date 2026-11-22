// AI endpoint: tools, streaming and the scripted fallback arrive in build step 4 (CLAUDE.md §11).
export async function POST() {
  return Response.json({ error: 'The AI endpoint is not built yet.' }, { status: 501 });
}
