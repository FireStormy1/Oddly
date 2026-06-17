import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

export default function WordRevealScreen() {
  const { socket, myWord, mySocketId, roomState, wordRevealed, setWordRevealed } = useGame();
  const [countdown, setCountdown] = useState(10);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    if (wordRevealed) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          handleReady();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [wordRevealed]);

  function handleReady() {
    if (wordRevealed) return;
    setWordRevealed(true);
    setWordVisible(false);
    socket?.emit("word:ready");
  }

  if (!roomState) return null;

  const connectedCount = roomState.players.filter((p) => p.isConnected).length;
  const readyCount = roomState.wordRevealReady.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-6">
          Round {roomState.currentRound} of {roomState.settings.totalRounds}
        </p>

        <div
          className="relative bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-6 shadow-[0_0_80px_rgba(124,58,237,0.15)]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">Your Word</p>
          {wordVisible && !wordRevealed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A855F7] mb-2"
            >
              {myWord ?? "..."}
            </motion.div>
          ) : (
            <div className="text-4xl sm:text-5xl font-black text-[#1E293B] select-none blur-sm mb-2">
              ••••••••
            </div>
          )}

          {!wordRevealed && (
            <div className="mt-6">
              <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(countdown / 10) * 100}%` }}
                  transition={{ duration: 0.9, ease: "linear" }}
                />
              </div>
              <p className="text-[#94A3B8] text-sm">
                Word disappears in <span className="text-white font-bold">{countdown}s</span>
              </p>
            </div>
          )}
        </div>

        {!wordRevealed ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReady}
            data-testid="button-word-ready"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            I&apos;m Ready
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-[#22C55E] font-bold mb-2">Ready!</div>
            <p className="text-[#94A3B8] text-sm">
              Waiting for others... ({readyCount}/{connectedCount})
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {roomState.players.filter((p) => p.isConnected).map((player) => (
                <div
                  key={player.id}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    roomState.wordRevealReady.includes(player.id)
                      ? "bg-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
