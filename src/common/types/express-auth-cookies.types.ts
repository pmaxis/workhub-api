import type { Request } from 'express';

export type RequestWithAuthCookies = Omit<Request, 'cookies' | 'signedCookies'> & {
  cookies?: Record<string, string | undefined>;
  signedCookies?: Record<string, string | undefined>;
};

export function requestWithAuthCookies(req: Request): RequestWithAuthCookies {
  return req as RequestWithAuthCookies;
}
