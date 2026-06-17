import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: "/socket.io",
  transports: ["polling","websocket"]
});

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ disconnected:", socket.id, reason);
  });
});

app.get("/", (req, res) => {
  res.send("Oddly backend running");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
