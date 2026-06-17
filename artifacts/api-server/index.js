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

const rooms: Record<string, any> = {};

/* ---------------- HELPERS ---------------- */

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function findRoomBySocket(socketId: string) {
  for (const code in rooms) {
    const room = rooms[code];
    const player = room.players.find((p: any) => p.id === socketId);
    if (player) return { room, code };
  }
  return null;
}

function cleanupRoom(code: string) {
  if (rooms[code] && rooms[code].players.length === 0) {
    delete rooms[code];
  }
}

/* ---------------- SOCKET LOGIC ---------------- */

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  /* ---------------- CREATE ROOM ---------------- */
  socket.on("room:create", (data, cb) => {
    const code = generateCode();

    rooms[code] = {
      code,
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          name: data.playerName || "Player",
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

  /* ---------------- JOIN ROOM ---------------- */
  socket.on("room:join", ({ roomCode, playerName }, cb) => {
    const room = rooms[roomCode];

    if (!room) {
      cb?.({ success: false, error: "Room not found" });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName || "Player",
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

  /* ---------------- READY ---------------- */
  socket.on("player:ready", () => {
    const found = findRoomBySocket(socket.id);
    if (!found) return;

    const { room, code } = found;

    const player = room.players.find((p: any) => p.id === socket.id);
    if (!player) return;

    player.isReady = !player.isReady;

    io.to(code).emit("room:state", room);
  });

  /* ---------------- LEAVE ROOM (FIXED) ---------------- */
  socket.on("room:leave", (_, cb) => {
    const found = findRoomBySocket(socket.id);

    if (!found) {
      cb?.({ success: true });
      return;
    }

    const { room, code } = found;

    room.players = room.players.filter((p: any) => p.id !== socket.id);

    socket.leave(code);

    // notify client FIRST
    socket.emit("room:left");

    io.to(code).emit("room:state", room);

    cleanupRoom(code);

    cb?.({ success: true });
  });

  /* ---------------- START GAME ---------------- */
  socket.on("game:start", (cb) => {
    const found = findRoomBySocket(socket.id);
    if (!found) return cb?.({ success: false });

    const { room, code } = found;

    if (room.hostId !== socket.id) {
      return cb?.({ success: false, error: "Not host" });
    }

    if (room.players.length < 2) {
      return cb?.({ success: false, error: "Need at least 2 players" });
    }

    room.phase = "word-reveal";

    io.to(code).emit("room:state", room);

    cb?.({ success: true });
  });

  /* ---------------- DISCONNECT ---------------- */
  socket.on("disconnect", () => {
    console.log("❌ disconnected:", socket.id);

    const found = findRoomBySocket(socket.id);

    if (!found) return;

    const { room, code } = found;

    room.players = room.players.filter((p: any) => p.id !== socket.id);

    io.to(code).emit("room:state", room);

    cleanupRoom(code);
  });
});

/* ---------------- SERVER ---------------- */

app.get("/", (req, res) => {
  res.send("Oddly backend running");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
