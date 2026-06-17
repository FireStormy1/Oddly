import { motion } from "framer-motion";

const cards = [
  {
    icon: "◈",
    title: "What is Oddly?",
    body: "Oddly is a real-time multiplayer social deduction word game where deception meets strategy. Players receive secret words and must blend in — while one hidden Imposter tries not to get caught.",
  },
  {
    icon: "◉",
    title: "How Words Work",
    body: "Every round, the system picks a word pair — related but different. Most players get the same normal word. One unlucky player gets the Imposter word. Nobody knows who has which.",
  },
  {
    icon: "◎",
    title: "Give Hints",
    body: "Each player submits a single-word hint related to their word. Too obvious and the Imposter copies you. Too vague and nobody trusts you. Walk the line carefully.",
  },
  {
    icon: "◆",
    title: "Spot the Imposter",
    body: "All hints are revealed anonymously. Study them carefully — the Imposter's hint might be subtly off. Discuss, debate, and cast your vote wisely.",
  },
  {
    icon: "◈",
    title: "Scoring",
    body: "Innocents earn +10 points each when the Imposter is caught. The Imposter earns +15 if they survive. Scores accumulate across all rounds to determine the ultimate winner.",
  },
  {
    icon: "◉",
    title: "Why It's Fun",
    body: "Every round is different. Words are unpredictable, bluffing is an art, and the social dynamics create unforgettable moments. Fast, competitive, and endlessly replayable.",
  },
];

export default function AboutSection() {
  return (
    <div className="py-8">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"
      >
        About Oddly
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[#94A3B8] text-center mb-10"
      >
        Everything you need to know about the game
      </motion.p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(124,58,237,0.15)" }}
            className="bg-[#1E293B]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300"
          >
            <div className="text-3xl text-primary mb-3">{card.icon}</div>
            <h3 className="font-bold text-lg text-white mb-2">{card.title}</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">{card.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
