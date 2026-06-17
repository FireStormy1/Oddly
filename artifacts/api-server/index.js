import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io",
});

const rooms = {};

/* ---------------- HELPERS ---------------- */

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

/* ---------------- SOCKET LOGIC ---------------- */

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  // CREATE ROOM
  socket.on("room:create", (data, cb) => {
    const code = generateCode();

    rooms[code] = {
      code,
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          name: data.playerName,
          isHost: true,
          isReady: false,
          score: 0,
          isConnected: true,
        },
      ],
      settings: data.settings,
      phase: "lobby",
    };

    socket.join(code);

    cb?.({ success: true, roomCode: code });

    io.to(code).emit("room:state", rooms[code]);
  });

  // JOIN ROOM
  socket.on("room:join", ({ roomCode, playerName }, cb) => {
    const room = rooms[roomCode];

    if (!room) {
      cb?.({ success: false, error: "Room not found" });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      isHost: false,
      isReady: false,
      score: 0,
      isConnected: true,
    };

    room.players.push(player);

    socket.join(roomCode);

    cb?.({ success: true });

    io.to(roomCode).emit("room:state", room);
  });

  // READY
  socket.on("player:ready", () => {
    for (const code in rooms) {
      const room = rooms[code];
      const p = room.players.find((x) => x.id === socket.id);
      if (p) {
        p.isReady = !p.isReady;
        io.to(code).emit("room:state", room);
      }
    }
  });

  // LEAVE ROOM
  socket.on("room:leave", () => {
    for (const code in rooms) {
      const room = rooms[code];

      room.players = room.players.filter((p) => p.id !== socket.id);

      io.to(code).emit("room:state", room);
    }
  });

  // START GAME
  socket.on("game:start", (cb) => {
    for (const code in rooms) {
      const room = rooms[code];

      if (room.hostId !== socket.id) continue;

      if (room.players.length < 2) {
        cb?.({ success: false, error: "Need at least 2 players" });
        return;
      }

      room.phase = "word-reveal";

      io.to(code).emit("room:state", room);

      cb?.({ success: true });
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ disconnected:", socket.id);

    for (const code in rooms) {
      const room = rooms[code];

      room.players = room.players.filter((p) => p.id !== socket.id);

      io.to(code).emit("room:state", room);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Oddly backend running");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
