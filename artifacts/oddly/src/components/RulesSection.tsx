import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Join a Room", desc: "Create a new party or enter a room code to join friends. Pick your name and wait in the lobby." },
  { step: "02", title: "Receive Your Word", desc: "Each player gets a secret word. Most get the same word — one player gets a related but different Imposter word." },
  { step: "03", title: "Submit a Hint", desc: "Give ONE single-word hint related to your word. Make it natural enough that you blend in, but not so obvious the Imposter copies it." },
  { step: "04", title: "Observe All Hints", desc: "All hints are revealed anonymously. Analyze every clue carefully — something might feel slightly off." },
  { step: "05", title: "Cast Your Vote", desc: "Select the player you think is the Imposter. You cannot vote for yourself. Everyone votes simultaneously." },
  { step: "06", title: "The Reveal", desc: "The most voted player is revealed. Then the true Imposter is unmasked. Was the group right?" },
  { step: "07", title: "Earn Points", desc: "Innocents get +10 each if the Imposter is caught. The Imposter earns +15 if they survive detection." },
  { step: "08", title: "Win the Match", desc: "Scores carry across all rounds. The player with the highest total score at the end wins the game." },
];

export default function RulesSection() {
  return (
    <div className="py-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
      >
        How to Play
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[#94A3B8] text-center mb-10"
      >
        Master the game in 8 simple steps
      </motion.p>
      <div className="relative max-w-2xl mx-auto">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/20 hidden sm:block" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 relative"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center font-black text-sm text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] z-10">
                {step.step}
              </div>
              <div className="bg-[#1E293B]/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1">
                <h3 className="font-bold text-white mb-1">{step.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
