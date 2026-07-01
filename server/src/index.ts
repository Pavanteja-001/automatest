import http from "http";
import { Server } from "socket.io";

import app from "./app";
import { initializeSocket } from "./socket/socket";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

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

server.listen(3000, () => {
    console.log("Server Running on 3000");
});