import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

export default function CreateRoomModal() {
  const { socket, setModal } = useGame();
  const [hostName, setHostName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [totalRounds, setTotalRounds] = useState(3);
  const [hintTimer, setHintTimer] = useState(20);
  const [votingTimer, setVotingTimer] = useState(90);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCreate() {
    if (!hostName.trim()) { setError("Please enter your name"); return; }
    setLoading(true);
    setError("");
    socket?.emit(
      "room:create",
      { playerName: hostName.trim(), settings: { maxPlayers, difficulty, totalRounds, hintTimer, votingTimer } },
      (res: { success: boolean; roomCode?: string; error?: string }) => {
        setLoading(false);
        if (!res.success) { setError(res.error || "Failed to create room"); return; }
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
        <h2 className="text-2xl font-black text-white mb-6">Create Party</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Host Name</label>
            <input
              data-testid="input-host-name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#94A3B8] outline-none focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.2)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Max Players</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                {[4, 6, 8, 10].map((n) => <option key={n} value={n} className="bg-[#1E293B]">{n} Players</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="easy" className="bg-[#1E293B]">Easy</option>
                <option value="medium" className="bg-[#1E293B]">Medium</option>
                <option value="hard" className="bg-[#1E293B]">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Rounds</label>
              <select
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value={3} className="bg-[#1E293B]">3</option>
                <option value={5} className="bg-[#1E293B]">5</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Hint Timer</label>
              <select
                value={hintTimer}
                onChange={(e) => setHintTimer(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value={15} className="bg-[#1E293B]">15s</option>
                <option value={20} className="bg-[#1E293B]">20s</option>
                <option value={30} className="bg-[#1E293B]">30s</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Vote Timer</label>
              <select
                value={votingTimer}
                onChange={(e) => setVotingTimer(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value={90} className="bg-[#1E293B]">90s</option>
                <option value={120} className="bg-[#1E293B]">120s</option>
              </select>
            </div>
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
            onClick={handleCreate}
            disabled={loading}
            data-testid="button-create-room"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            {loading ? "Creating..." : "Create Room"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
