import type { Server, Socket } from "socket.io";
import {
  rooms,
  playerRooms,
  generateRoomCode,
  type Room,
  type Player,
  type RoomSettings,
  type RoundData,
} from "./gameState.js";
import { getRandomWordPair } from "./words.js";
import { logger } from "../lib/logger.js";

export function registerGameHandlers(io: Server, socket: Socket) {
  function getRoomForSocket(): Room | null {
    const roomCode = playerRooms.get(socket.id);
    if (!roomCode) return null;
    return rooms.get(roomCode) ?? null;
  }

  function emitRoomState(room: Room) {
    const state = buildPublicRoomState(room);
    io.to(room.code).emit("room:state", state);
  }

  function buildPublicRoomState(room: Room) {
    return {
      code: room.code,
      hostId: room.hostId,
      settings: room.settings,
      players: Object.values(room.players),
      phase: room.phase,
      currentRound: room.currentRound,
      hints:
        room.phase === "hint-reveal" ||
        room.phase === "voting" ||
        room.phase === "result" ||
        room.phase === "game-over"
          ? room.roundData?.hints ?? {}
          : {},
      votes:
        room.phase === "result" || room.phase === "game-over"
          ? room.roundData?.votes ?? {}
          : {},
      imposterId:
        room.phase === "result" || room.phase === "game-over"
          ? room.roundData?.imposterId ?? null
          : null,
      normalWord:
        room.phase === "result" || room.phase === "game-over"
          ? room.roundData?.normalWord ?? null
          : null,
      imposterWord:
        room.phase === "result" || room.phase === "game-over"
          ? room.roundData?.imposterWord ?? null
          : null,
      hintSubmitted: room.roundData
        ? Object.keys(room.roundData.hints)
        : [],
      votesSubmitted: room.roundData
        ? Object.keys(room.roundData.votes)
        : [],
      wordRevealReady: Object.keys(room.wordRevealReady),
    };
  }

  function getConnectedPlayerIds(room: Room): string[] {
    return Object.values(room.players)
      .filter((p) => p.isConnected)
      .map((p) => p.id);
  }

  socket.on(
    "room:create",
    (
      data: { playerName: string; settings: RoomSettings },
      callback: (res: { success: boolean; roomCode?: string; error?: string }) => void
    ) => {
      const { playerName, settings } = data;
      if (!playerName?.trim()) {
        return callback({ success: false, error: "Name required" });
      }
      const code = generateRoomCode();
      const player: Player = {
        id: socket.id,
        name: playerName.trim(),
        isHost: true,
        isReady: false,
        score: 0,
        isConnected: true,
      };
      const room: Room = {
        code,
        hostId: socket.id,
        settings,
        players: { [socket.id]: player },
        phase: "lobby",
        currentRound: 0,
        roundData: null,
        wordRevealReady: {},
        nextRoundCountdown: null,
      };
      rooms.set(code, room);
      playerRooms.set(socket.id, code);
      socket.join(code);
      logger.info({ code, playerName }, "Room created");
      callback({ success: true, roomCode: code });
      emitRoomState(room);
    }
  );

  socket.on(
    "room:join",
    (
      data: { playerName: string; roomCode: string },
      callback: (res: { success: boolean; error?: string }) => void
    ) => {
      const { playerName, roomCode } = data;
      const code = roomCode.trim().toUpperCase();
      if (!playerName?.trim()) {
        return callback({ success: false, error: "Name required" });
      }
      const room = rooms.get(code);
      if (!room) {
        return callback({ success: false, error: "Room not found" });
      }
      if (room.phase !== "lobby") {
        return callback({ success: false, error: "Game already in progress" });
      }
      const connectedPlayers = getConnectedPlayerIds(room).length;
      if (connectedPlayers >= room.settings.maxPlayers) {
        return callback({ success: false, error: "Room is full" });
      }
      const nameTaken = Object.values(room.players).some(
        (p) => p.name.toLowerCase() === playerName.trim().toLowerCase() && p.isConnected
      );
      if (nameTaken) {
        return callback({ success: false, error: "Name already taken" });
      }
      const player: Player = {
        id: socket.id,
        name: playerName.trim(),
        isHost: false,
        isReady: false,
        score: 0,
        isConnected: true,
      };
      room.players[socket.id] = player;
      playerRooms.set(socket.id, code);
      socket.join(code);
      logger.info({ code, playerName }, "Player joined room");
      callback({ success: true });
      emitRoomState(room);
    }
  );

  socket.on("player:ready", () => {
    const room = getRoomForSocket();
    if (!room || room.phase !== "lobby") return;
    const player = room.players[socket.id];
    if (!player) return;
    player.isReady = !player.isReady;
    emitRoomState(room);
  });

  socket.on(
    "game:start",
    (callback?: (res: { success: boolean; error?: string }) => void) => {
      const room = getRoomForSocket();
      if (!room) return callback?.({ success: false, error: "Room not found" });
      if (room.hostId !== socket.id)
        return callback?.({ success: false, error: "Only host can start" });
      const connected = getConnectedPlayerIds(room);
      if (connected.length < 2)
        return callback?.({ success: false, error: "Need at least 2 players" });
      startNewRound(io, room);
      callback?.({ success: true });
    }
  );

  socket.on("word:ready", () => {
    const room = getRoomForSocket();
    if (!room || room.phase !== "word-reveal") return;
    room.wordRevealReady[socket.id] = true;
    const connected = getConnectedPlayerIds(room);
    const allReady = connected.every((id) => room.wordRevealReady[id]);
    emitRoomState(room);
    if (allReady) {
      room.phase = "hint";
      room.wordRevealReady = {};
      emitRoomState(room);
    }
  });

  socket.on(
    "hint:submit",
    (
      data: { hint: string },
      callback?: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = getRoomForSocket();
      if (!room || room.phase !== "hint" || !room.roundData)
        return callback?.({ success: false, error: "Not in hint phase" });
      const hint = data.hint?.trim();
      if (!hint || hint.length > 20 || hint.includes(" "))
        return callback?.({
          success: false,
          error: "Hint must be a single word (max 20 chars)",
        });
      if (room.roundData.hints[socket.id])
        return callback?.({ success: false, error: "Already submitted" });
      room.roundData.hints[socket.id] = hint;
      const connected = getConnectedPlayerIds(room);
      const allDone = connected.every((id) => room.roundData!.hints[id]);
      emitRoomState(room);
      callback?.({ success: true });
      if (allDone) {
        room.phase = "hint-reveal";
        emitRoomState(room);
        setTimeout(() => {
          room.phase = "voting";
          emitRoomState(room);
        }, 5000);
      }
    }
  );

  socket.on(
    "vote:submit",
    (
      data: { targetId: string },
      callback?: (res: { success: boolean; error?: string }) => void
    ) => {
      const room = getRoomForSocket();
      if (!room || room.phase !== "voting" || !room.roundData)
        return callback?.({ success: false, error: "Not in voting phase" });
      if (data.targetId === socket.id)
        return callback?.({ success: false, error: "Cannot vote for yourself" });
      if (!room.players[data.targetId])
        return callback?.({ success: false, error: "Invalid target" });
      if (room.roundData.votes[socket.id])
        return callback?.({ success: false, error: "Already voted" });
      room.roundData.votes[socket.id] = data.targetId;
      const connected = getConnectedPlayerIds(room);
      const allVoted = connected.every((id) => room.roundData!.votes[id]);
      emitRoomState(room);
      callback?.({ success: true });
      if (allVoted) {
        resolveVotes(io, room);
      }
    }
  );

  socket.on("game:playAgain", () => {
    const room = getRoomForSocket();
    if (!room || room.phase !== "game-over") return;
    if (room.hostId !== socket.id) return;
    Object.values(room.players).forEach((p) => {
      p.score = 0;
      p.isReady = false;
    });
    room.currentRound = 0;
    room.roundData = null;
    room.phase = "lobby";
    emitRoomState(room);
  });

  socket.on("room:leave", () => {
    handleDisconnect(io, socket);
  });

  socket.on("disconnect", () => {
    handleDisconnect(io, socket);
  });
}

function startNewRound(io: Server, room: Room) {
  room.currentRound += 1;
  const wordPair = getRandomWordPair(room.settings.difficulty);
  const connected = Object.values(room.players)
    .filter((p) => p.isConnected)
    .map((p) => p.id);

  const imposterIndex = Math.floor(Math.random() * connected.length);
  const imposterId = connected[imposterIndex];
  const wordAssignments: Record<string, string> = {};
  connected.forEach((id) => {
    wordAssignments[id] = id === imposterId ? wordPair.imposter : wordPair.normal;
  });

  room.roundData = {
    roundNumber: room.currentRound,
    normalWord: wordPair.normal,
    imposterWord: wordPair.imposter,
    imposterId,
    wordAssignments,
    hints: {},
    votes: {},
    phaseStartTime: Date.now(),
  };
  room.wordRevealReady = {};
  room.phase = "word-reveal";

  connected.forEach((id) => {
    const publicState = {
      code: room.code,
      hostId: room.hostId,
      settings: room.settings,
      players: Object.values(room.players),
      phase: room.phase,
      currentRound: room.currentRound,
      hints: {},
      votes: {},
      imposterId: null,
      normalWord: null,
      imposterWord: null,
      hintSubmitted: [],
      votesSubmitted: [],
      wordRevealReady: [],
    };
    io.to(id).emit("room:state", publicState);
    io.to(id).emit("round:wordAssigned", { word: wordAssignments[id] });
  });

  logger.info({ code: room.code, round: room.currentRound }, "Round started");
}

function resolveVotes(io: Server, room: Room) {
  if (!room.roundData) return;

  const voteCounts: Record<string, number> = {};
  Object.values(room.roundData.votes).forEach((targetId) => {
    voteCounts[targetId] = (voteCounts[targetId] ?? 0) + 1;
  });

  let mostVotedId = "";
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedId = id;
    }
  });

  const imposterCaught = mostVotedId === room.roundData.imposterId;
  const connected = Object.values(room.players).filter((p) => p.isConnected);

  if (imposterCaught) {
    connected.forEach((p) => {
      if (p.id !== room.roundData!.imposterId) {
        p.score += 10;
      }
    });
  } else {
    const imposter = room.players[room.roundData.imposterId];
    if (imposter) imposter.score += 15;
  }

  room.phase = "result";
  const publicState = {
    code: room.code,
    hostId: room.hostId,
    settings: room.settings,
    players: Object.values(room.players),
    phase: room.phase,
    currentRound: room.currentRound,
    hints: room.roundData.hints,
    votes: room.roundData.votes,
    imposterId: room.roundData.imposterId,
    normalWord: room.roundData.normalWord,
    imposterWord: room.roundData.imposterWord,
    hintSubmitted: Object.keys(room.roundData.hints),
    votesSubmitted: Object.keys(room.roundData.votes),
    wordRevealReady: [],
    mostVotedId,
    imposterCaught,
    voteCounts,
  };
  io.to(room.code).emit("room:state", publicState);

  if (room.currentRound >= room.settings.totalRounds) {
    setTimeout(() => {
      room.phase = "game-over";
      io.to(room.code).emit("room:state", { ...publicState, phase: "game-over" });
    }, 8000);
  } else {
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      io.to(room.code).emit("round:countdown", { seconds: countdown });
      countdown--;
      if (countdown < 0) {
        clearInterval(countdownInterval);
        startNewRound(io, room);
      }
    }, 1000);
  }
}

function handleDisconnect(io: Server, socket: Socket) {
  const roomCode = playerRooms.get(socket.id);
  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (!room) return;

  const player = room.players[socket.id];
  if (player) {
    player.isConnected = false;
    logger.info({ roomCode, playerName: player.name }, "Player disconnected");
  }
  playerRooms.delete(socket.id);
  socket.leave(roomCode);

  const connected = getConnectedPlayerIds(room);
  if (connected.length === 0) {
    rooms.delete(roomCode);
    logger.info({ roomCode }, "Room deleted (empty)");
    return;
  }

  if (room.hostId === socket.id && connected.length > 0) {
    room.hostId = connected[0];
    room.players[connected[0]].isHost = true;
    logger.info({ roomCode, newHost: connected[0] }, "Host transferred");
  }

  const publicState = {
    code: room.code,
    hostId: room.hostId,
    settings: room.settings,
    players: Object.values(room.players),
    phase: room.phase,
    currentRound: room.currentRound,
    hints: room.roundData?.hints ?? {},
    votes: room.roundData?.votes ?? {},
    imposterId: null,
    normalWord: null,
    imposterWord: null,
    hintSubmitted: room.roundData ? Object.keys(room.roundData.hints) : [],
    votesSubmitted: room.roundData ? Object.keys(room.roundData.votes) : [],
    wordRevealReady: Object.keys(room.wordRevealReady),
  };
  io.to(roomCode).emit("room:state", publicState);
}

function getConnectedPlayerIds(room: Room): string[] {
  return Object.values(room.players)
    .filter((p) => p.isConnected)
    .map((p) => p.id);
}
