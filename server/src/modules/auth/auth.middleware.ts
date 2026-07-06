import { Request, Response, NextFunction } from "express";
import { verifySessionToken } from "./jwt";
import { SESSION_COOKIE_NAME } from "./cookie";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { userId } = verifySessionToken(token);

    req.userId = userId;

    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
