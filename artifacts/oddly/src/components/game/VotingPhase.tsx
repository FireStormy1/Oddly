import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/App";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "from-[#7C3AED] to-[#A855F7]",
    "from-[#2563EB] to-[#7C3AED]",
    "from-[#0891B2] to-[#2563EB]",
    "from-[#16A34A] to-[#0891B2]",
    "from-[#D97706] to-[#EF4444]",
    "from-[#DB2777] to-[#7C3AED]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

export default function VotingPhase() {
  const { socket, mySocketId, roomState } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!roomState) return;
    setTimeLeft(roomState.settings.votingTimer);
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState?.currentRound]);

  if (!roomState) return null;

  const connectedPlayers = roomState.players.filter((p) => p.isConnected);
  const myVoteSubmitted = roomState.votesSubmitted.includes(mySocketId);
  const votedCount = roomState.votesSubmitted.length;
  const totalCount = connectedPlayers.length;

  function handleVote() {
    if (!selectedId) { setError("Select a player to vote"); return; }
    setError("");
    socket?.emit("vote:submit", { targetId: selectedId }, (res: { success: boolean; error?: string }) => {
      if (!res.success) { setError(res.error || "Failed to vote"); return; }
      setVoted(true);
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-1">
            Round {roomState.currentRound} of {roomState.settings.totalRounds}
          </p>
          <h2 className="text-2xl font-black text-white">Who is the Imposter?</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Select the player you suspect</p>
        </motion.div>

        {/* Timer */}
        {timeLeft !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#94A3B8] mb-1">
              <span>Voting closes in</span>
              <span className={timeLeft <= 10 ? "text-[#EF4444] font-bold" : ""}>{timeLeft}s</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timeLeft <= 10 ? "bg-[#EF4444]" : "bg-gradient-to-r from-[#7C3AED] to-[#A855F7]"}`}
                animate={{ width: `${(timeLeft / roomState.settings.votingTimer) * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-[#94A3B8] mb-4">
          <span>Votes cast: <span className="text-white font-bold">{votedCount}/{totalCount}</span></span>
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {connectedPlayers.map((player, i) => {
            const isMe = player.id === mySocketId;
            const isSelected = selectedId === player.id;
            const hasVoted = roomState.votesSubmitted.includes(player.id);
            return (
              <motion.button
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={!isMe && !myVoteSubmitted && !voted ? { scale: 1.03 } : {}}
                whileTap={!isMe && !myVoteSubmitted && !voted ? { scale: 0.97 } : {}}
                onClick={() => !isMe && !myVoteSubmitted && !voted && setSelectedId(player.id)}
                disabled={isMe || myVoteSubmitted || voted}
                data-testid={`button-vote-${player.id}`}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                  isMe
                    ? "opacity-40 cursor-not-allowed bg-white/5 border-white/10"
                    : isSelected
                    ? "bg-primary/20 border-primary shadow-[0_0_25px_rgba(124,58,237,0.3)]"
                    : "bg-[#1E293B]/60 border-white/10 hover:border-white/20 cursor-pointer"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(player.name)} flex items-center justify-center font-bold text-white`}>
                  {getInitials(player.name)}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white text-sm">{player.name}</p>
                  {isMe && <p className="text-xs text-[#94A3B8]">You</p>}
                  {hasVoted && !isMe && (
                    <p className="text-xs text-[#22C55E] mt-0.5">Voted</p>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {error && <p className="text-[#EF4444] text-sm text-center mb-3">{error}</p>}

        {!myVoteSubmitted && !voted ? (
          <motion.button
            whileHover={selectedId ? { scale: 1.02 } : {}}
            whileTap={selectedId ? { scale: 0.98 } : {}}
            onClick={handleVote}
            disabled={!selectedId}
            data-testid="button-submit-vote"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-lg disabled:opacity-40 transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] disabled:shadow-none"
          >
            Cast Vote
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl"
          >
            <div className="text-[#22C55E] font-bold">Vote cast!</div>
            <p className="text-[#94A3B8] text-sm mt-1">Waiting for others... ({votedCount}/{totalCount})</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
