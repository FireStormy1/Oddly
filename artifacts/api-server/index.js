import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

app.get("/", (req, res) => {
  res.send("Oddly backend running");
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("room:create", (data, callback) => {
    console.log("CREATE ROOM RECEIVED");

    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    socket.join(roomCode);

    const roomState = {
      code: roomCode,
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          name: data?.playerName || "Player",
          isHost: true,
          isReady: true,
          score: 0,
          isConnected: true,
        },
      ],
      phase: "lobby",
      settings: data?.settings || {
        maxPlayers: 8,
        difficulty: "medium",
        totalRounds: 3,
        hintTimer: 20,
        votingTimer: 90,
      },
    };

    socket.emit("room:state", roomState);

    callback?.({
      success: true,
      roomCode,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnected:", socket.id, reason);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
