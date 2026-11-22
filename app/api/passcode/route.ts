import { NextResponse } from 'next/server';
import { PASSCODE_COOKIE as COOKIE, passcodeToken } from '@/lib/passcode';

/** Checks the demo passcode and sets a 7-day cookie. Works without JavaScript (plain form post). */
export async function POST(req: Request) {
  const form = await req.formData();
  const entered = String(form.get('passcode') ?? '');
  const raw = String(form.get('next') ?? '/');
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const passcode = process.env.DEMO_PASSCODE;
  const base = new URL(req.url);
  if (!passcode || entered.trim() !== passcode) {
    return NextResponse.redirect(new URL(`/passcode?error=1&next=${encodeURIComponent(next)}`, base), 303);
  }
  const res = NextResponse.redirect(new URL(next, base), 303);
  res.cookies.set(COOKIE, await passcodeToken(passcode), {
    httpOnly: true, secure: base.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
