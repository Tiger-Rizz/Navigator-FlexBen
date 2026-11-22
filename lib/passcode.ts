/** Demo passcode cookie (CLAUDE.md §14). Web Crypto only, so it runs in the proxy and in routes. */
export const PASSCODE_COOKIE = 'demo_access';

export async function passcodeToken(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(`navigator-flex:${passcode}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
