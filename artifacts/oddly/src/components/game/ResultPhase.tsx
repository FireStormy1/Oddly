import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/App";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: ["#7C3AED", "#A855F7", "#22C55E", "#F59E0B", "#EC4899"][Math.floor(Math.random() * 5)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 5,
      alpha: 1,
    }));

    let frame: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.alpha -= 0.005;
        if (p.alpha <= 0) {
          p.x = Math.random() * canvas!.width;
          p.y = -20;
          p.alpha = 1;
        }
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rot * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

export default function ResultPhase() {
  const { mySocketId, roomState, countdown } = useGame();
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStep(1), 600),
      setTimeout(() => setRevealStep(2), 1500),
      setTimeout(() => setRevealStep(3), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!roomState) return null;

  const imposter = roomState.players.find((p) => p.id === roomState.imposterId);
  const mostVoted = roomState.players.find((p) => p.id === (roomState as any).mostVotedId);
  const imposterCaught = (roomState as any).imposterCaught as boolean | undefined;
  const connectedPlayers = roomState.players.filter((p) => p.isConnected);
  const sortedPlayers = [...connectedPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 relative">
      {imposterCaught && <Confetti />}

      <div className="w-full max-w-2xl relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-2">
            Round {roomState.currentRound} Results
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black ${imposterCaught ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {imposterCaught ? "Imposter Caught!" : "Imposter Survived!"}
          </h2>
          {countdown !== null && (
            <p className="text-[#94A3B8] text-sm mt-2">Next round in {countdown}...</p>
          )}
        </motion.div>

        <div className="space-y-4">
          {/* Most voted */}
          <AnimatePresence>
            {revealStep >= 1 && mostVoted && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {getInitials(mostVoted.name)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-0.5">Most Voted</p>
                  <p className="font-bold text-white text-lg">{mostVoted.name}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  mostVoted.id === roomState.imposterId
                    ? "bg-[#22C55E]/20 text-[#22C55E]"
                    : "bg-[#EF4444]/20 text-[#EF4444]"
                }`}>
                  {mostVoted.id === roomState.imposterId ? "Imposter!" : "Innocent"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real imposter */}
          <AnimatePresence>
            {revealStep >= 2 && imposter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="bg-gradient-to-br from-[#7C3AED]/20 to-[#A855F7]/10 backdrop-blur-xl border border-primary/30 rounded-2xl p-5 flex items-center gap-4 shadow-[0_0_40px_rgba(124,58,237,0.2)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center font-bold text-white flex-shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                  {getInitials(imposter.name)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">The Real Imposter</p>
                  <p className="font-bold text-white text-lg">{imposter.name}</p>
                  <p className="text-[#94A3B8] text-sm">
                    Their word: <span className="text-[#A855F7] font-semibold">{roomState.imposterWord}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Words reveal */}
          <AnimatePresence>
            {revealStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="bg-[#1E293B]/60 border border-[#22C55E]/20 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#22C55E] mb-1">Normal Word</p>
                  <p className="font-bold text-white text-xl">{roomState.normalWord}</p>
                </div>
                <div className="bg-[#1E293B]/60 border border-primary/20 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Imposter Word</p>
                  <p className="font-bold text-white text-xl">{roomState.imposterWord}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scoreboard */}
          <AnimatePresence>
            {revealStep >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E293B]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-widest">Scoreboard</h3>
                <div className="space-y-2">
                  {sortedPlayers.map((player, i) => {
                    const isImposter = player.id === roomState.imposterId;
                    const pointsThisRound = isImposter
                      ? imposterCaught ? 0 : 15
                      : imposterCaught ? 10 : 0;
                    return (
                      <div key={player.id} className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-5 ${i === 0 ? "text-[#F59E0B]" : "text-[#94A3B8]"}`}>#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{player.name}
                            {player.id === mySocketId && <span className="text-[#94A3B8] font-normal"> (you)</span>}
                            {isImposter && <span className="text-primary text-xs ml-1">[Imposter]</span>}
                          </p>
                        </div>
                        {pointsThisRound > 0 && (
                          <span className="text-xs text-[#22C55E] font-bold">+{pointsThisRound}</span>
                        )}
                        <span className="text-white font-bold text-sm w-12 text-right">{player.score} pts</span>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full"
                            style={{ width: `${Math.min(100, (player.score / Math.max(1, sortedPlayers[0].score)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
