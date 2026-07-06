import { Express } from "express";
import http from "http";
import httpProxy from "http-proxy";
import { verifySessionFromCookieHeader } from "./modules/auth/verify-cookie-header";

const NOVNC_TARGET = "http://127.0.0.1:6080";

export function attachVncProxy(app: Express, server: http.Server) {
  const proxy = httpProxy.createProxyServer({ target: NOVNC_TARGET, ws: true });

  app.use("/vnc", (req, res) => {
    if (!verifySessionFromCookieHeader(req.headers.cookie)) {
      res.writeHead(401);
      return res.end("Unauthorized");
    }

    proxy.web(req, res, {}, (err) => {
      res.writeHead(502);
      res.end(`VNC proxy error: ${err.message}`);
    });
  });

  server.on("upgrade", (req, socket, head) => {
    if (!req.url?.startsWith("/vnc")) {
      return;
    }

    if (!verifySessionFromCookieHeader(req.headers.cookie)) {
      socket.destroy();
      return;
    }

    req.url = req.url.replace(/^\/vnc/, "") || "/";
    proxy.ws(req, socket, head);
  });
}
