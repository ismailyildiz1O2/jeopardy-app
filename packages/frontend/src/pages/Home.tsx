// =============================================
// Home Page – stunning landing with create/join options
// =============================================
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Sparkles, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../lib/api';

export default function Home() {
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  /** Create a new game and navigate to the editor */
  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      const data = await api.createGame({ title: 'New Jeopardy Game' });
      toast.success('Game created!');
      navigate(`/game/${data.game.id}/edit`);
    } catch (err) {
      console.error('Failed to create game:', err);
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [navigate]);

  /** Join a game by share code */
  const handleJoin = useCallback(async () => {
    const code = shareCode.trim();
    if (!code) {
      toast.error('Please enter a game code');
      return;
    }

    setIsJoining(true);
    try {
      const data = await api.getGameByCode(code);
      toast.success('Joined the game!');
      // Navigate to play or edit based on game mode
      const path =
        data.game.mode === 'play'
          ? `/game/${data.game.id}/play`
          : `/game/${data.game.id}/edit`;
      navigate(path);
    } catch {
      toast.error('Game not found. Check your code.');
    } finally {
      setIsJoining(false);
    }
  }, [shareCode, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center
                    px-4 py-12 sm:py-20">
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-auto text-center"
      >
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Interactive Quiz Game for Classrooms
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-3">
            <span className="text-gradient-gold">JEOPARDY</span>
          </h1>

          <p className="text-sm sm:text-base text-white/40 max-w-md mx-auto">
            Create your questions, invite students with a share code
            and play in real-time!
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Create Game Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 hover:bg-white/[0.09] transition-all
                       group cursor-pointer"
            onClick={handleCreate}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-jeopardy-royal to-jeopardy-bright
                              shadow-glow-sm group-hover:shadow-glow-md transition-all">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-base font-bold text-white group-hover:text-gold-300
                               transition-colors">
                  Create New Game
                </h2>
                <p className="text-xs text-white/40">
                  7 categories, 49 questions — build your own game
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50
                                       transition-colors" />
              </motion.div>
            </div>

            {isCreating && (
              <div className="mt-3 flex justify-center">
                <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue
                                rounded-full animate-spin" />
              </div>
            )}
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/20 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Join Game Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gold-500/10">
                <Gamepad2 className="w-5 h-5 text-gold-400" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-white">
                  Join Game
                </h2>
                <p className="text-xs text-white/40">
                  Enter a share code to join an existing game
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter game code..."
                maxLength={8}
                className="input-dark flex-1 text-center font-mono font-bold
                           tracking-[0.3em] uppercase text-lg placeholder:text-sm
                           placeholder:tracking-normal placeholder:font-normal"
              />
              <button
                onClick={handleJoin}
                disabled={isJoining || !shareCode.trim()}
                className="btn-gold px-5 flex items-center gap-1.5"
              >
                {isJoining ? (
                  <div className="w-4 h-4 border-2 border-jeopardy-navy/30
                                  border-t-jeopardy-navy rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span className="hidden sm:inline">Join</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-[10px] text-white/15"
        >
          Real-time • Collaborative • Fun
        </motion.p>
      </motion.div>
    </div>
  );
}
