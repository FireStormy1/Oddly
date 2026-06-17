import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "from-[#7C3AED] to-[#A855F7]",
    "from-[#2563EB] to-[#7C3AED]",
    "from-[#0891B2] to-[#2563EB]",
    "from-[#16A34A] to-[#0891B2]",
    "from-[#D97706] to-[#EF4444]",
    "from-[#DB2777] to-[#7C3AED]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

export default function LobbyScreen() {
  const { socket, mySocketId, roomState } = useGame();
  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState("");

  if (!roomState) return null;

  const me = roomState.players.find((p) => p.id === mySocketId);
  const isHost = roomState.hostId === mySocketId;
  const connectedPlayers = roomState.players.filter((p) => p.isConnected);

  function copyCode() {
    navigator.clipboard.writeText(roomState!.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleReady() {
    socket?.emit("player:ready");
  }

  function startGame() {
    setStartError("");
    socket?.emit("game:start", (res: { success: boolean; error?: string }) => {
      if (!res.success) setStartError(res.error || "Cannot start game");
    });
  }

  function leaveRoom() {
    socket?.emit("room:leave");
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Room Code */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Room Code</p>
        <div className="inline-flex items-center gap-3">
          <span className="text-5xl sm:text-6xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]">
            {roomState.code}
          </span>
          <button
            onClick={copyCode}
            data-testid="button-copy-code"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[#94A3B8] hover:text-white"
          >
            {copied ? (
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[#94A3B8] text-sm mt-2">Share this code with your friends</p>
      </motion.div>

      {/* Settings row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 mb-6"
      >
        {[
          { label: roomState.settings.difficulty.toUpperCase(), color: "text-[#A855F7]" },
          { label: `${roomState.settings.totalRounds} Rounds`, color: "text-[#94A3B8]" },
          { label: `${roomState.settings.maxPlayers} Max`, color: "text-[#94A3B8]" },
          { label: `${roomState.settings.hintTimer}s Hints`, color: "text-[#94A3B8]" },
          { label: `${roomState.settings.votingTimer}s Vote`, color: "text-[#94A3B8]" },
        ].map((item) => (
          <span key={item.label} className={`px-3 py-1.5 text-xs font-bold rounded-full bg-white/5 border border-white/10 ${item.color}`}>
            {item.label}
          </span>
        ))}
      </motion.div>

      {/* Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Players</h3>
          <span className="text-[#94A3B8] text-sm">{connectedPlayers.length}/{roomState.settings.maxPlayers}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connectedPlayers.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(player.name)} flex items-center justify-center font-bold text-sm text-white flex-shrink-0`}>
                {getInitials(player.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{player.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {player.isHost && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Host</span>
                  )}
                  {player.id === mySocketId && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#94A3B8] font-medium">You</span>
                  )}
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${player.isReady ? "bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-white/20"}`} />
            </motion.div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, roomState.settings.maxPlayers - connectedPlayers.length) }).slice(0, 3).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-dashed border-white/10 opacity-40">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-[#94A3B8] text-lg">+</div>
              <p className="text-[#94A3B8] text-sm">Waiting...</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      {startError && <p className="text-[#EF4444] text-sm text-center mb-3 font-medium">{startError}</p>}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={leaveRoom}
          data-testid="button-leave-room"
          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] font-semibold hover:bg-white/10 transition-all"
        >
          Leave Room
        </button>
        <button
          onClick={toggleReady}
          data-testid="button-ready"
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            me?.isReady
              ? "bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E]"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
          }`}
        >
          {me?.isReady ? "Ready!" : "Ready Up"}
        </button>
        {isHost && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            disabled={connectedPlayers.length < 2}
            data-testid="button-start-game"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:shadow-none"
          >
            Start Game
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
