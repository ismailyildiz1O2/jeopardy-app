import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Globe, Share2, Printer, Download, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  initialIsPublic: boolean;
  onUpdate: (isPublic: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  gameId,
  initialIsPublic,
  onUpdate,
}: SettingsModalProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await api.updateGame(gameId, {
        isPublic,
        editPassword: password || undefined,
      });
      toast.success('Settings saved successfully');
      onUpdate(isPublic);
      onClose();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Jeopardy Game',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
            className="relative w-full max-w-md bg-jeopardy-deep/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Game Settings
              </h2>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Visibility Toggle */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Game Visibility</label>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${isPublic ? 'bg-neon-blue text-white shadow-glow-sm' : 'text-white/50 hover:text-white'}`}
                  >
                    <Globe className="w-4 h-4" />
                    Public
                  </button>
                  <button
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${!isPublic ? 'bg-jeopardy-purple text-white shadow-glow-sm' : 'text-white/50 hover:text-white'}`}
                  >
                    <Lock className="w-4 h-4" />
                    Private
                  </button>
                </div>
              </div>

              {/* Edit Password */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Edit Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set password to protect editing..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-blue/50 transition-colors"
                  />
                </div>
                <p className="text-xs text-white/40">If set, users will need this password to enter edit mode.</p>
              </div>

              {/* Tools */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Tools</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePrint} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button onClick={() => toast('Download feature coming soon!')} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button onClick={() => toast('Embed feature coming soon!')} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                    <Code className="w-4 h-4" />
                    Embed
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 rounded-lg text-white/60 hover:text-white transition-colors text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-gold px-6 py-2 text-sm flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
