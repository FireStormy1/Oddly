import { useGame } from "@/App";
import Navbar from "./Navbar";
import HomeSection from "./HomeSection";
import AboutSection from "./AboutSection";
import RulesSection from "./RulesSection";
import DeveloperSection from "./DeveloperSection";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";
import LobbyScreen from "./game/LobbyScreen";
import WordRevealScreen from "./game/WordRevealScreen";
import HintPhase from "./game/HintPhase";
import HintReveal from "./game/HintReveal";
import VotingPhase from "./game/VotingPhase";
import ResultPhase from "./game/ResultPhase";
import GameOver from "./game/GameOver";
import { AnimatePresence, motion } from "framer-motion";

export default function GameApp() {
  const { roomState, navTab, modal } = useGame();

  const renderNavContent = () => {
    switch (navTab) {
      case "home":
        return <HomeSection />;
      case "about":
        return <AboutSection />;
      case "rules":
        return <RulesSection />;
      case "developer":
        return <DeveloperSection />;
      default:
        return <HomeSection />;
    }
  };

  const renderGameState = () => {
    if (!roomState) return null;

    switch (roomState.phase) {
      case "lobby":
        return <LobbyScreen />;
      case "word-reveal":
        return <WordRevealScreen />;
      case "hint":
        return <HintPhase />;
      case "hint-reveal":
        return <HintReveal />;
      case "voting":
        return <VotingPhase />;
      case "result":
        return <ResultPhase />;
      case "game-over":
        return <GameOver />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Background elements */}
      <div className="fixed inset-0 z-[-1] bg-[#0F172A]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none" />
      </div>

      {!roomState ? (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 relative mt-16 flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={navTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
              >
                {renderNavContent()}
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border/50">
            A multiplayer social deduction word game.
          </footer>
        </div>
      ) : (
        <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={roomState.phase}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="w-full max-w-6xl"
            >
              {renderGameState()}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal === "create" && <CreateRoomModal />}
        {modal === "join" && <JoinRoomModal />}
      </AnimatePresence>
    </>
  );
}
