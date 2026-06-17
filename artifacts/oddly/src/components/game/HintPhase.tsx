import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function HintPhase() {
  const { socket, mySocketId, roomState } = useGame();
  const [hint, setHint] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!roomState) return;
    setTimeLeft(roomState.settings.hintTimer);
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState?.currentRound]);

  if (!roomState) return null;

  const connectedPlayers = roomState.players.filter((p) => p.isConnected);
  const submittedCount = roomState.hintSubmitted.length;
  const totalCount = connectedPlayers.length;
  const myHintSubmitted = roomState.hintSubmitted.includes(mySocketId);

  function handleSubmit() {
    const trimmed = hint.trim();
    if (!trimmed) { setError("Hint cannot be empty"); return; }
    if (trimmed.includes(" ")) { setError("Single word only — no spaces"); return; }
    if (trimmed.length > 20) { setError("Max 20 characters"); return; }
    setError("");
    socket?.emit("hint:submit", { hint: trimmed }, (res: { success: boolean; error?: string }) => {
      if (!res.success) { setError(res.error || "Failed to submit"); return; }
      setSubmitted(true);
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-1">
            Round {roomState.currentRound} of {roomState.settings.totalRounds}
          </p>
          <h2 className="text-2xl font-black text-white">Submit Your Hint</h2>
          <p className="text-[#94A3B8] text-sm mt-1">One word only — make it count</p>
        </motion.div>

        {/* Timer bar */}
        {timeLeft !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
              <span>Time remaining</span>
              <span className={timeLeft <= 5 ? "text-[#EF4444] font-bold" : ""}>{timeLeft}s</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timeLeft <= 5 ? "bg-[#EF4444]" : "bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"}`}
                animate={{ width: `${(timeLeft / roomState.settings.hintTimer) * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {/* Hint progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#94A3B8] text-sm font-medium">Hints Submitted</span>
            <span className="text-white font-bold">{submittedCount}/{totalCount}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-[#22C55E] rounded-full"
              animate={{ width: totalCount > 0 ? `${(submittedCount / totalCount) * 100}%` : "0%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedPlayers.map((player) => {
              const done = roomState.hintSubmitted.includes(player.id);
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    done
                      ? "bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]"
                      : "bg-white/5 border border-white/10 text-[#94A3B8]"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${done ? "bg-[#22C55E]" : "bg-white/30"}`} />
                  {player.name}
                  {player.id === mySocketId && " (you)"}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Input */}
        {!myHintSubmitted && !submitted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="relative mb-3">
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value.replace(/\s/g, "").slice(0, 20))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter your hint..."
                data-testid="input-hint"
                className="w-full px-5 py-4 rounded-2xl bg-[#1E293B]/80 border border-white/10 text-white text-lg font-semibold text-center placeholder-[#94A3B8] outline-none focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(124,58,237,0.2)] transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">{hint.length}/20</span>
            </div>
            {error && <p className="text-[#EF4444] text-sm text-center mb-3">{error}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              data-testid="button-submit-hint"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all"
            >
              Submit Hint
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl"
          >
            <div className="text-[#22C55E] font-bold text-lg mb-1">Hint submitted!</div>
            <p className="text-[#94A3B8] text-sm">Waiting for everyone else...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
