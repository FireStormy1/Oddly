import { motion } from "framer-motion";
import { useGame } from "@/App";

export default function HomeSection() {
  const { setModal } = useGame();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, type: "spring", bounce: 0.4 }}
        className="relative"
      >
        {/* Glow behind logo */}
        <div className="absolute inset-0 blur-[80px] bg-primary/30 rounded-full scale-150" />
        <div
          className="relative bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-10 sm:p-16 shadow-[0_0_80px_rgba(124,58,237,0.15)] hover:shadow-[0_0_120px_rgba(124,58,237,0.25)] transition-all duration-500"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <motion.h1
            className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-[#A855F7] to-[#7C3AED] mb-3"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            ODDLY
          </motion.h1>
          <p className="text-[#94A3B8] text-lg sm:text-xl font-medium tracking-widest uppercase mb-10">
            Guess The Imposter
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModal("create")}
              data-testid="button-create-party"
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Create Party
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModal("join")}
              data-testid="button-join-party"
              className="px-10 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-primary/50"
            >
              Join Party
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
