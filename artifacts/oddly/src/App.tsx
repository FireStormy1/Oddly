import { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { io, Socket } from "socket.io-client";
import GameApp from "@/components/GameApp";

const queryClient = new QueryClient();

export type RoomPhase =
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

export interface RoomState {
  code: string;
  hostId: string;
  settings: {
    maxPlayers: number;
    difficulty: string;
    totalRounds: number;
    hintTimer: number;
    votingTimer: number;
  };
  players: Player[];
  phase: RoomPhase;
  currentRound: number;
  hints: Record<string, string>;
  votes: Record<string, string>;
  imposterId: string | null;
  normalWord: string | null;
  imposterWord: string | null;
  hintSubmitted: string[];
  votesSubmitted: string[];
  wordRevealReady: string[];
  mostVotedId?: string;
  imposterCaught?: boolean;
  voteCounts?: Record<string, number>;
}

interface GameContextType {
  socket: Socket | null;
  mySocketId: string;
  myWord: string | null;
  roomState: RoomState | null;
  navTab: "home" | "about" | "rules" | "developer";
  setNavTab: (tab: "home" | "about" | "rules" | "developer") => void;
  modal: "none" | "create" | "join";
  setModal: (modal: "none" | "create" | "join") => void;
  wordRevealed: boolean;
  setWordRevealed: (revealed: boolean) => void;
  countdown: number | null;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mySocketId, setMySocketId] = useState<string>("");
  const [myWord, setMyWord] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [navTab, setNavTab] =
    useState<"home" | "about" | "rules" | "developer">("home");
  const [modal, setModal] = useState<"none" | "create" | "join">("none");
  const [wordRevealed, setWordRevealed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");

    // ✅ FIXED SOCKET CONNECTION (Railway backend)
    const newSocket = io(
      "https://https://oddly-production.up.railway.app",
      {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      }
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setMySocketId(newSocket.id || "");
    });

    newSocket.on("room:state", (state: RoomState) => {
      setRoomState(state);
      if (state.phase === "lobby") {
        setMyWord(null);
        setWordRevealed(false);
      }
    });

    newSocket.on("round:wordAssigned", (data: { word: string }) => {
      setMyWord(data.word);
      setWordRevealed(false);
    });

    newSocket.on("round:countdown", (data: { seconds: number }) => {
      setCountdown(data.seconds);
      if (data.seconds === 0) setCountdown(null);
    });

    newSocket.on("room:left", () => {
      setRoomState(null);
      setMyWord(null);
      setWordRevealed(false);
      setCountdown(null);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameContext.Provider
          value={{
            socket,
            mySocketId,
            myWord,
            roomState,
            navTab,
            setNavTab,
            modal,
            setModal,
            wordRevealed,
            setWordRevealed,
            countdown,
          }}
        >
          <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
            <GameApp />
          </div>
        </GameContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
