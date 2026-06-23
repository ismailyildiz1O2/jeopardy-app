import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../lib/api';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  onSuccess: () => void;
}

export default function PasswordPromptModal({
  isOpen,
  onClose,
  gameId,
  onSuccess,
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setIsChecking(true);
    try {
      const { success } = await api.verifyPassword(gameId, password);
      if (success) {
        toast.success('Password verified!');
        // Store verification in sessionStorage so it persists for this session
        sessionStorage.setItem(`jeopardy_auth_${gameId}`, 'true');
        onSuccess();
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      toast.error('Failed to verify password');
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-jeopardy-deep/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-jeopardy-purple/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-jeopardy-purple/30">
                <Lock className="w-6 h-6 text-jeopardy-purple" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Edit Mode Locked</h2>
              <p className="text-sm text-white/50 mb-6">
                The creator has protected this game. Enter the password to edit.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-jeopardy-purple/50 transition-colors text-center text-lg"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full btn-gold py-3 flex items-center justify-center gap-2 rounded-xl"
                >
                  {isChecking ? 'Verifying...' : (
                    <>
                      <span>Unlock to Edit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
