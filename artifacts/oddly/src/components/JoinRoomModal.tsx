import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

export default function JoinRoomModal() {
  const { socket, setModal } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleJoin() {
    if (!playerName.trim()) { setError("Please enter your name"); return; }
    if (roomCode.trim().length !== 6) { setError("Room code must be 6 characters"); return; }
    setLoading(true);
    setError("");
    socket?.emit(
      "room:join",
      { playerName: playerName.trim(), roomCode: roomCode.trim().toUpperCase() },
      (res: { success: boolean; error?: string }) => {
        setLoading(false);
        if (!res.success) { setError(res.error || "Failed to join room"); return; }
        setModal("none");
      }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && setModal("none")}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-[0_0_80px_rgba(124,58,237,0.2)]"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}
      >
        <h2 className="text-2xl font-black text-white mb-6">Join Party</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Your Name</label>
            <input
              data-testid="input-player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] outline-none focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.2)] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Room Code</label>
            <input
              data-testid="input-room-code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] outline-none focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.2)] transition-all text-center text-xl font-bold tracking-[0.5em]"
            />
          </div>
        </div>

        {error && <p className="text-[#EF4444] text-sm mt-3 font-medium">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setModal("none")}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            disabled={loading}
            data-testid="button-join-room"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            {loading ? "Joining..." : "Join Room"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
