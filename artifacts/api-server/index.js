import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// =========================
// SOCKET SETUP
// =========================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
});

// =========================
// MEMORY STORE
// =========================
const rooms = {};

// =========================
// ROOM CODE GENERATOR
// =========================
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// =========================
// ROUTE CHECK
// =========================
app.get("/", (req, res) => {
  res.send("Oddly backend running");
});

// =========================
// SOCKET LOGIC
// =========================
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // -------------------------
  // CREATE ROOM
  // -------------------------
  socket.on("room:create", (data, callback) => {
    try {
      const roomCode = generateRoomCode();

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
      console.log("CREATE ERROR:", err);
      callback?.({ success: false });
    }
  });

  // -------------------------
  // JOIN ROOM (FIX FOR YOUR ISSUE)
  // -------------------------
  socket.on("room:join", (data, callback) => {
    try {
      const { roomCode, playerName } = data;

      const room = rooms[roomCode];

      if (!room) {
        return callback?.({
          success: false,
          error: "Room not found",
        });
      }

      socket.join(roomCode);

      const newPlayer = {
        id: socket.id,
        name: playerName || "Player",
        isHost: false,
        isReady: false,
        score: 0,
        isConnected: true,
      };

      room.players.push(newPlayer);

      const roomState = {
        code: roomCode,
        hostId: room.hostId,
        players: room.players,
        phase: "lobby",
        settings: room.settings || {},
      };

      io.to(roomCode).emit("room:state", roomState);

      callback?.({
        success: true,
        roomState,
      });
    } catch (err) {
      console.log("JOIN ERROR:", err);
      callback?.({ success: false, error: "Join failed" });
    }
  });

  // -------------------------
  // LEAVE ROOM
  // -------------------------
  socket.on("room:leave", (roomCode, callback) => {
    try {
      socket.leave(roomCode);

      if (rooms[roomCode]) {
        rooms[roomCode].players = rooms[roomCode].players.filter(
          (p) => p.id !== socket.id
        );

        if (rooms[roomCode].players.length === 0) {
          delete rooms[roomCode];
        } else {
          io.to(roomCode).emit("room:state", {
            code: roomCode,
            hostId: rooms[roomCode].hostId,
            players: rooms[roomCode].players,
            phase: "lobby",
          });
        }
      }

      socket.emit("room:left");

      callback?.({ success: true });
    } catch (err) {
      console.log("LEAVE ERROR:", err);
      callback?.({ success: false });
    }
  });

  // -------------------------
  // DISCONNECT
  // -------------------------
  socket.on("disconnect", (reason) => {
    console.log("disconnected:", socket.id, reason);

    for (const code in rooms) {
      rooms[code].players = rooms[code].players.filter(
        (p) => p.id !== socket.id
      );

      if (rooms[code].players.length === 0) {
        delete rooms[code];
      }
    }
  });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
