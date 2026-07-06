import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app";
import { initializeSocket } from "./socket/socket";
import { socketAuthMiddleware } from "./socket/socket-auth.middleware";
import { AuthService } from "./services/auth.service";
import { attachVncProxy } from "./vnc-proxy";

new AuthService().ensureConfigTemplate();

const server = http.createServer(app);

attachVncProxy(app, server);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

io.use(socketAuthMiddleware);

initializeSocket(io);

io.on("connection", (socket) => {

    console.log("Client Connected");

    socket.emit("connected", {
        message: "Connected Successfully"
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });

});

const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
    console.log(`Server Running on ${port}`);
});