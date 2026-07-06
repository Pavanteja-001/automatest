import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export interface SessionPayload {
  userId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  return decoded as unknown as SessionPayload;
}
