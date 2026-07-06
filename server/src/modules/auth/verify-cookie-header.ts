import cookie from "cookie";
import { verifySessionToken } from "./jwt";
import { SESSION_COOKIE_NAME } from "./cookie";

export function verifySessionFromCookieHeader(rawCookieHeader: string | undefined): string | null {
  if (!rawCookieHeader) {
    return null;
  }

  const token = cookie.parse(rawCookieHeader)[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  try {
    return verifySessionToken(token).userId;
  } catch {
    return null;
  }
}
