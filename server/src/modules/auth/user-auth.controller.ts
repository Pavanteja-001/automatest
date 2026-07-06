import { Request, Response } from "express";
import { UserAuthService } from "./user-auth.service";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "./cookie";

const userAuth = new UserAuthService();

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "A valid email and a password of at least 8 characters are required.",
    });
  }

  try {
    const { user, token } = await userAuth.register(email, password);

    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(409).json({ success: false, message: (err as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const { user, token } = await userAuth.login(email, password);

    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: (err as Error).message });
  }
};

export const me = async (req: Request, res: Response) => {
  const user = await userAuth.getUserById(req.userId!);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.json({ success: true, user });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);

  res.json({ success: true });
};
