import { motion } from "framer-motion";
import { useGame } from "@/App";

export default function HintReveal() {
  const { roomState } = useGame();
  if (!roomState) return null;

  const hints = Object.values(roomState.hints);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">
          Round {roomState.currentRound} of {roomState.settings.totalRounds}
        </p>
        <h2 className="text-3xl font-black text-white mb-2">All Hints Revealed</h2>
        <p className="text-[#94A3B8] mb-8">Anonymous — study them carefully...</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {hints.map((hint, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", bounce: 0.4 }}
              className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:border-primary/30 transition-all"
            >
              <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A855F7]">
                {hint}
              </p>
            </motion.div>
          ))}
          {hints.length === 0 && (
            <div className="col-span-3 text-[#94A3B8]">No hints yet...</div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hints.length * 0.15 + 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
            Advancing to voting phase...
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
