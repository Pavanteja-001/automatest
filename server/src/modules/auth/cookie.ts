import { CookieOptions } from "express";

export const SESSION_COOKIE_NAME = "session";

const isProduction = process.env.NODE_ENV === "production";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
