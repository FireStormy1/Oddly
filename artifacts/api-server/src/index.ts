import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { registerGameHandlers } from "./game/gameLogic.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected");
  registerGameHandlers(io, socket);
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
