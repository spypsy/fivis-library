import { CookieOptions, Response } from 'express';

const AUTH_COOKIE = 'token';
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export function authCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: THIRTY_DAYS_MS,
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
    options.secure = process.env.COOKIE_SECURE !== 'false';
  }

  return options;
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, authCookieOptions());
}
