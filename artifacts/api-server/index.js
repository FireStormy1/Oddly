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

// simple in-memory room store (IMPORTANT)
const rooms = {};

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // =========================
  // CREATE ROOM
  // =========================
  socket.on("room:create", (data, callback) => {
    try {
      const roomCode = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

      socket.join(roomCode);

      rooms[roomCode] = {
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
      };

      const roomState = {
        code: roomCode,
        hostId: socket.id,
        players: rooms[roomCode].players,
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
    } catch (err) {
      console.log(err);
      callback?.({ success: false, error: "Create room failed" });
    }
  });

  // =========================
  // LEAVE ROOM (FIXED)
  // =========================
  socket.on("room:leave", (roomCode, callback) => {
    console.log("leave room:", roomCode);

    socket.leave(roomCode);

    if (rooms[roomCode]) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (p) => p.id !== socket.id
      );
    }

    socket.emit("room:left");

    callback?.({ success: true });
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", (reason) => {
    console.log("disconnected:", socket.id, reason);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
