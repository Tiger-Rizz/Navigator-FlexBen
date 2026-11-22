/**
 * Optional passcode gate (CLAUDE.md §14). Active only when DEMO_PASSCODE is set.
 * A correct passcode sets a cookie for 7 days; reviewers don't need a Vercel account.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { PASSCODE_COOKIE as COOKIE, passcodeToken } from '@/lib/passcode';

export async function proxy(req: NextRequest) {
  const passcode = process.env.DEMO_PASSCODE;
  if (!passcode) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  if (pathname === '/passcode' || pathname === '/api/passcode') return NextResponse.next();
  if (req.cookies.get(COOKIE)?.value === (await passcodeToken(passcode))) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Passcode required' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/passcode';
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt).*)'],
};
