export type GamePhase =
  | "lobby"
  | "word-reveal"
  | "hint"
  | "hint-reveal"
  | "voting"
  | "result"
  | "game-over";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  isConnected: boolean;
}

export interface RoundData {
  roundNumber: number;
  normalWord: string;
  imposterWord: string;
  imposterId: string;
  wordAssignments: Record<string, string>;
  hints: Record<string, string>;
  votes: Record<string, string>;
  phaseStartTime: number;
}

export interface RoomSettings {
  maxPlayers: number;
  difficulty: "easy" | "medium" | "hard";
  totalRounds: number;
  hintTimer: number;
  votingTimer: number;
}

export interface Room {
  code: string;
  hostId: string;
  settings: RoomSettings;
  players: Record<string, Player>;
  phase: GamePhase;
  currentRound: number;
  roundData: RoundData | null;
  wordRevealReady: Record<string, boolean>;
  nextRoundCountdown: number | null;
}

export const rooms: Map<string, Room> = new Map();
export const playerRooms: Map<string, string> = new Map();

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}
