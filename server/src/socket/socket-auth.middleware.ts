import { Socket } from "socket.io";
import { verifySessionFromCookieHeader } from "../modules/auth/verify-cookie-header";

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const userId = verifySessionFromCookieHeader(socket.handshake.headers.cookie);

  if (!userId) {
    return next(new Error("Unauthorized"));
  }

  socket.data.userId = userId;

  next();
}
