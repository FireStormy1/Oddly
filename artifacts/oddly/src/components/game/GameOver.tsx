import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

function Trophy() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
      className="text-7xl mb-4 select-none"
      style={{ filter: "drop-shadow(0 0 30px rgba(245,158,11,0.6))" }}
    >
      ★
    </motion.div>
  );
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
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: ["#7C3AED", "#A855F7", "#22C55E", "#F59E0B", "#EC4899", "#3B82F6"][Math.floor(Math.random() * 6)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      alpha: 1,
    }));
    let frame: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.alpha -= 0.003;
        if (p.alpha <= 0) { p.x = Math.random() * canvas!.width; p.y = -20; p.alpha = 1; }
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

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function GameOver() {
  const { socket, mySocketId, roomState } = useGame();
  if (!roomState) return null;

  const connectedPlayers = roomState.players.filter((p) => p.isConnected);
  const sortedPlayers = [...connectedPlayers].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isHost = roomState.hostId === mySocketId;

  function handlePlayAgain() {
    socket?.emit("game:playAgain");
  }

  function handleReturnHome() {
    socket?.emit("room:leave");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 relative">
      <Confetti />
      <div className="w-full max-w-lg relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
          <Trophy />
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#A855F7] mb-2">
            GAME OVER
          </h1>

          {/* Winner card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
            className="bg-gradient-to-br from-[#F59E0B]/15 to-[#7C3AED]/15 border border-[#F59E0B]/30 rounded-3xl p-6 mb-6 shadow-[0_0_60px_rgba(245,158,11,0.15)]"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] mb-2">Winner</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center font-black text-white text-lg">
                {getInitials(winner?.name ?? "?")}
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-white">{winner?.name}</p>
                <p className="text-[#F59E0B] font-bold">{winner?.score} points</p>
              </div>
            </div>
          </motion.div>

          {/* Final rankings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6 text-left"
          >
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#94A3B8] mb-3">Final Rankings</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className={`text-sm font-black w-6 ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#94A3B8]" : i === 2 ? "text-[#D97706]" : "text-white/40"}`}>
                    #{i + 1}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                    i === 0 ? "bg-gradient-to-br from-[#F59E0B] to-[#EF4444]" : "bg-white/10"
                  }`}>
                    {getInitials(player.name)}
                  </div>
                  <p className="flex-1 font-semibold text-white text-sm">
                    {player.name}
                    {player.id === mySocketId && <span className="text-[#94A3B8] font-normal"> (you)</span>}
                  </p>
                  <span className="font-bold text-white text-sm">{player.score} pts</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={handleReturnHome}
              data-testid="button-return-home"
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] font-semibold hover:bg-white/10 transition-all"
            >
              Return Home
            </button>
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlayAgain}
                data-testid="button-play-again"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
              >
                Play Again
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
